import 'dart:async';
import 'dart:developer' as developer;
import 'dart:io';

class DesktopFileTransferService {
  final _progressController =
      StreamController<Map<String, dynamic>>.broadcast();

  String _downloadPath = 'downloads';

  DesktopFileTransferService();

  Stream<Map<String, dynamic>> get progressStream => _progressController.stream;
  String get downloadPath => _downloadPath;

  void setDownloadPath(String path) {
    _downloadPath = path;
  }

  Future<void> sendFile({
    required String filePath,
    required String peerIp,
    String? transferId,
    Function(double)? onProgress,
  }) async {
    developer.log(
      'sendFile called: peerIp=$peerIp, filePath=$filePath',
      name: 'FileTransfer',
    );
    try {
      final file = File(filePath);
      if (!await file.exists()) {
        developer.log('File not found: $filePath', name: 'FileTransfer');
        throw Exception('File not found: $filePath');
      }

      final fileName = file.uri.pathSegments.isNotEmpty
          ? file.uri.pathSegments.last
          : filePath.split(Platform.pathSeparator).last;
      final fileSize = await file.length();
      developer.log(
        'sendFile: name=$fileName, size=$fileSize bytes, to=$peerIp:8766',
        name: 'FileTransfer',
      );

      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 60);
      client.idleTimeout = const Duration(minutes: 30);

      try {
        final uri = Uri.http('$peerIp:8766', '/api/upload', {'name': fileName});
        developer.log('sendFile: POST to $uri', name: 'FileTransfer');
        final request = await client.postUrl(uri);
        developer.log(
          'sendFile: HTTP POST opened, setting headers',
          name: 'FileTransfer',
        );
        request.headers.contentType = ContentType(
          'application',
          'octet-stream',
        );
        request.contentLength = fileSize;

        final raf = await file.open(mode: FileMode.read);
        const chunkSize = 65536;
        var sent = 0;

        developer.log('Starting file upload loop...', name: 'FileTransfer');
        while (sent < fileSize) {
          final remaining = fileSize - sent;
          final toRead = remaining > chunkSize ? chunkSize : remaining;
          final chunk = await raf.read(toRead);
          request.add(chunk);
          sent += chunk.length;

          final progress = fileSize > 0 ? sent / fileSize : 0.0;
          onProgress?.call(progress);

          _progressController.add({
            'transferId': transferId,
            'status': 'inProgress',
            'fileName': fileName,
            'progress': progress,
          });
        }

        developer.log(
          'File upload loop complete, closing request...',
          name: 'FileTransfer',
        );
        await raf.close();
        developer.log(
          'Calling request.close() and waiting for response...',
          name: 'FileTransfer',
        );
        final response = await request.close();
        developer.log(
          'Response received: statusCode=${response.statusCode}',
          name: 'FileTransfer',
        );

        if (response.statusCode == 200) {
          _progressController.add({
            'transferId': transferId,
            'status': 'completed',
            'fileName': fileName,
            'progress': 1.0,
          });
        } else {
          developer.log(
            'Upload failed with status: ${response.statusCode}',
            name: 'FileTransfer',
          );
          throw Exception('Upload failed: ${response.statusCode}');
        }
      } finally {
        client.close();
      }
    } catch (e, stack) {
      developer.log('sendFile exception: $e\n$stack', name: 'FileTransfer');
      rethrow;
    }
  }

  Future<List<String>> getDownloadedFiles() async {
    final dir = Directory(_downloadPath);
    if (!await dir.exists()) return [];
    final files = await dir.list().toList();
    return files.whereType<File>().map((f) => f.path).toList();
  }

  void dispose() {
    _progressController.close();
  }
}
