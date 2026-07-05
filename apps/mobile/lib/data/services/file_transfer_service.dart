import 'dart:async';
import 'dart:convert';
import 'dart:developer' as developer;
import 'dart:io';

import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';

import '../../domain/entities/transfer.dart';
import 'p2p_service.dart';

typedef TransferProgressCallback = void Function(double progress);

class FileTransferService {
  static const int _chunkSize = 16384;
  static const Duration _chunkDelay = Duration(milliseconds: 10);

  final P2PService _p2pService;
  final _uuid = const Uuid();

  final Map<String, _IncomingTransfer> _incomingTransfers = {};
  final Map<String, _OutgoingTransfer> _outgoingTransfers = {};

  final _progressController = StreamController<FileTransfer>.broadcast();

  Stream<FileTransfer> get progressStream => _progressController.stream;

  String downloadPath = 'default';

  FileTransferService(this._p2pService) {
    _p2pService.fileChunks.listen(_handleFileChunk);
  }

  /// Send a file to connected peer
  Future<String> sendFile({
    required String filePath,
    required String peerId,
    TransferProgressCallback? onProgress,
  }) async {
    final file = File(filePath);
    if (!await file.exists()) {
      throw Exception('File not found: $filePath');
    }

    final fileSize = await file.length();
    final fileName = filePath.split(Platform.pathSeparator).last;
    final transferId = _uuid.v4();

    // Create transfer record
    final transfer = FileTransfer(
      id: transferId,
      fileName: fileName,
      fileSize: fileSize,
      filePath: filePath,
      type: fileName.contains('.') ? TransferType.file : TransferType.folder,
      status: TransferStatus.inProgress,
      direction: TransferDirection.sent,
      deviceId: peerId,
      progress: 0,
      createdAt: DateTime.now(),
    );

    _outgoingTransfers[transferId] = _OutgoingTransfer(
      transfer: transfer,
      onProgress: onProgress,
    );

    // Send file metadata first
    await _p2pService.sendFileMeta(transferId, fileName, fileSize);

    // Send file in chunks
    final stream = file.openRead();
    int chunkIndex = 0;
    int bytesSent = 0;

    await for (final chunk in stream) {
      await _p2pService.sendFileChunk(transferId, chunkIndex, chunk);
      bytesSent += chunk.length;
      chunkIndex++;

      // Update progress
      final progress = bytesSent / fileSize;
      final updatedTransfer = transfer.copyWith(progress: progress);
      _outgoingTransfers[transferId] = _OutgoingTransfer(
        transfer: updatedTransfer,
        onProgress: onProgress,
      );
      _progressController.add(updatedTransfer);

      // Small delay to prevent overwhelming the data channel
      await Future<void>.delayed(_chunkDelay);
    }

    // Mark as completed
    final completedTransfer = transfer.copyWith(
      status: TransferStatus.completed,
      progress: 1.0,
      completedAt: DateTime.now(),
    );
    _outgoingTransfers[transferId] = _OutgoingTransfer(
      transfer: completedTransfer,
      onProgress: onProgress,
    );
    _progressController.add(completedTransfer);

    return transferId;
  }

  /// Send file via HTTP (alternative to WebRTC)
  Future<String> sendFileHttp({
    required String filePath,
    required String peerIp,
    TransferProgressCallback? onProgress,
  }) async {
    final file = File(filePath);
    if (!await file.exists()) {
      throw Exception('File not found: $filePath');
    }

    final fileSize = await file.length();
    final fileName = filePath.split('/').last;
    final transferId = _uuid.v4();

    // Create transfer record
    final transfer = FileTransfer(
      id: transferId,
      fileName: fileName,
      fileSize: fileSize,
      filePath: filePath,
      type: fileName.contains('.') ? TransferType.file : TransferType.folder,
      status: TransferStatus.inProgress,
      direction: TransferDirection.sent,
      deviceId: peerIp,
      progress: 0,
      createdAt: DateTime.now(),
    );

    _outgoingTransfers[transferId] = _OutgoingTransfer(
      transfer: transfer,
      onProgress: onProgress,
    );

    // Send via HTTP POST to /api/upload
    try {
      developer.log(
        'Sending file $fileName to $peerIp via HTTP',
        name: 'FileTransfer',
      );

      // Read file bytes
      final bytes = await file.readAsBytes();

      // Create HTTP client and request with filename in query
      final client = HttpClient();
      final uri = Uri.parse('http://$peerIp:8766/api/upload?name=$fileName');
      final request = await client.postUrl(uri);
      request.headers.contentType = ContentType('application', 'octet-stream');
      request.write(bytes);

      final response = await request.close();

      if (response.statusCode == 200) {
        // Mark as completed
        final completedTransfer = transfer.copyWith(
          status: TransferStatus.completed,
          progress: 1.0,
          completedAt: DateTime.now(),
        );
        _progressController.add(completedTransfer);
        return transferId;
      } else {
        throw Exception('Upload failed: ${response.statusCode}');
      }
    } catch (e) {
      final failedTransfer = transfer.copyWith(status: TransferStatus.failed);
      _progressController.add(failedTransfer);
      rethrow;
    }
  }

  /// Handle incoming file chunk
  void _handleFileChunk(Map<String, dynamic> data) async {
    final type = data['type'];

    if (type == P2PMessageType.fileMeta) {
      _handleFileMeta(data);
    } else if (type == P2PMessageType.fileChunk) {
      _handleIncomingChunk(data);
    } else if (type == P2PMessageType.fileComplete) {
      _handleFileComplete(data);
    }
  }

  void _handleFileMeta(Map<String, dynamic> data) {
    final transferId = data['transferId'] as String;
    final fileName = data['fileName'] as String;
    final fileSize = data['fileSize'] as int;

    // Create incoming transfer record
    final transfer = FileTransfer(
      id: transferId,
      fileName: fileName,
      fileSize: fileSize,
      type: TransferType.file,
      status: TransferStatus.inProgress,
      direction: TransferDirection.received,
      progress: 0,
      createdAt: DateTime.now(),
    );

    _incomingTransfers[transferId] = _IncomingTransfer(
      transfer: transfer,
      chunks: {},
      expectedChunks: (fileSize / _chunkSize).ceil(),
      fileData: [],
    );

    _progressController.add(transfer);
  }

  void _handleIncomingChunk(Map<String, dynamic> data) {
    final transferId = data['transferId'] as String;
    final chunkIndex = data['chunkIndex'] as int;
    final chunkData = base64Decode(data['data'] as String);

    final incoming = _incomingTransfers[transferId];
    if (incoming == null) return;

    // Store chunk
    incoming.chunks[chunkIndex] = chunkData;
    incoming.fileData.addAll(chunkData);

    // Calculate progress
    final progress = incoming.fileData.length / incoming.transfer.fileSize;
    final updatedTransfer = incoming.transfer.copyWith(progress: progress);
    incoming.transfer = updatedTransfer;

    _progressController.add(updatedTransfer);
  }

  void _handleFileComplete(Map<String, dynamic> data) async {
    final transferId = data['transferId'] as String;
    final incoming = _incomingTransfers[transferId];
    if (incoming == null) return;

    try {
      Directory downloadsDir;
      if (downloadPath == 'default') {
        final directory = await getApplicationDocumentsDirectory();
        downloadsDir = Directory('${directory.path}/downloads');
      } else {
        downloadsDir = Directory(downloadPath);
      }

      if (!await downloadsDir.exists()) {
        await downloadsDir.create(recursive: true);
      }

      final filePath = '${downloadsDir.path}/${incoming.transfer.fileName}';
      final file = File(filePath);
      await file.writeAsBytes(incoming.fileData);

      final completedTransfer = incoming.transfer.copyWith(
        status: TransferStatus.completed,
        progress: 1.0,
        completedAt: DateTime.now(),
        filePath: filePath,
      );

      incoming.transfer = completedTransfer;
      _progressController.add(completedTransfer);
    } catch (e) {
      final failedTransfer = incoming.transfer.copyWith(
        status: TransferStatus.failed,
        error: e.toString(),
      );
      incoming.transfer = failedTransfer;
      _progressController.add(failedTransfer);
    }
  }

  /// Cancel an incoming transfer
  void cancelIncoming(String transferId) {
    final incoming = _incomingTransfers[transferId];
    if (incoming != null) {
      final cancelledTransfer = incoming.transfer.copyWith(
        status: TransferStatus.cancelled,
      );
      _progressController.add(cancelledTransfer);
      _incomingTransfers.remove(transferId);
    }
  }

  /// Cancel an outgoing transfer
  void cancelOutgoing(String transferId) {
    _outgoingTransfers.remove(transferId);
  }

  /// Get active transfers
  List<FileTransfer> getActiveTransfers() {
    return [
      ..._incomingTransfers.values.map((t) => t.transfer),
      ..._outgoingTransfers.values.map((t) => t.transfer),
    ].where((t) => t.status == TransferStatus.inProgress).toList();
  }

  /// Get transfer history
  List<FileTransfer> getTransferHistory() {
    return [
      ..._incomingTransfers.values.map((t) => t.transfer),
      ..._outgoingTransfers.values.map((t) => t.transfer),
    ].where((t) => t.status != TransferStatus.inProgress).toList();
  }

  void dispose() {
    unawaited(_progressController.close());
  }
}

class _IncomingTransfer {
  FileTransfer transfer;
  final Map<int, List<int>> chunks;
  final int expectedChunks;
  final List<int> fileData;

  _IncomingTransfer({
    required this.transfer,
    required this.chunks,
    required this.expectedChunks,
    required this.fileData,
  });
}

class _OutgoingTransfer {
  FileTransfer transfer;
  TransferProgressCallback? onProgress;

  _OutgoingTransfer({required this.transfer, this.onProgress});
}
