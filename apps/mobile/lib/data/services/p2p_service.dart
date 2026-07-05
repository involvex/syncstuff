import 'dart:async';
import 'dart:convert';
import 'dart:developer' as developer;
import 'dart:io';

import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:uuid/uuid.dart';

import '../../domain/entities/device.dart';

/// Callback types for WebRTC events
typedef OnDataReceived = void Function(Map<String, dynamic> data);
typedef OnFileChunkReceived =
    void Function(String transferId, int chunkIndex, List<int> data);
typedef OnConnectionStateChanged = void Function(String peerId, bool connected);

/// Message types for P2P communication
class P2PMessageType {
  static const String offer = 'offer';
  static const String answer = 'answer';
  static const String ice = 'ice';
  static const String fileMeta = 'file-meta';
  static const String fileChunk = 'file-chunk';
  static const String fileComplete = 'file-complete';
  static const String clipboard = 'clipboard';
  static const String ping = 'ping';
  static const String pong = 'pong';
}

/// Service for P2P connections using WebRTC
class P2PService {
  static const int _signalingPort = 8767;

  RTCPeerConnection? _peerConnection;
  RTCDataChannel? _dataChannel;
  RTCDataChannel? _fileChannel;

  Socket? _signalingSocket;
  final String _localDeviceId = const Uuid().v4();

  String? _connectedPeerId;
  bool _isConnected = false;

  final _connectionController = StreamController<bool>.broadcast();
  final _messageController = StreamController<Map<String, dynamic>>.broadcast();
  final _fileChunkController =
      StreamController<Map<String, dynamic>>.broadcast();

  // Callbacks
  OnConnectionStateChanged? onConnectionStateChanged;
  OnDataReceived? onDataReceived;
  OnFileChunkReceived? onFileChunkReceived;

  /// Stream of connection state changes
  Stream<bool> get connectionState => _connectionController.stream;

  /// Stream of received messages
  Stream<Map<String, dynamic>> get messages => _messageController.stream;

  /// Stream of file chunks
  Stream<Map<String, dynamic>> get fileChunks => _fileChunkController.stream;

  /// Whether connected to a peer
  bool get isConnected => _isConnected;

  /// Connected peer ID
  String? get connectedPeerId => _connectedPeerId;

  /// Local device ID
  String get localDeviceId => _localDeviceId;

  /// Initialize WebRTC
  Future<void> initialize() async {
    final config = {
      'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'},
        {'urls': 'stun:stun1.l.google.com:19302'},
      ],
      'sdpSemantics': 'unified-plan',
    };

    _peerConnection = await createPeerConnection(
      config as Map<String, dynamic>,
    );

    // Handle ICE candidates
    _peerConnection!.onIceCandidate = (candidate) {
      unawaited(
        _sendSignalingMessage({
          'type': P2PMessageType.ice,
          'candidate': candidate.toMap(),
        }),
      );
    };

    // Handle connection state changes
    _peerConnection!.onConnectionState = (state) {
      _isConnected =
          state == RTCPeerConnectionState.RTCPeerConnectionStateConnected;
      _connectionController.add(_isConnected);

      if (onConnectionStateChanged != null) {
        onConnectionStateChanged!(_connectedPeerId ?? '', _isConnected);
      }
    };

    // Create data channel for messaging
    _dataChannel = await _createDataChannel(
      'messages',
      RTCDataChannelInit()
        ..ordered = true
        ..maxRetransmits = 30,
    );

    // Create separate channel for file transfer
    _fileChannel = await _createDataChannel(
      'files',
      RTCDataChannelInit()
        ..ordered = false
        ..maxRetransmits = 0,
    ); // No retransmission for file chunks
  }

  Future<RTCDataChannel> _createDataChannel(
    String label,
    RTCDataChannelInit init,
  ) async {
    final channel = await _peerConnection!.createDataChannel(label, init);

    channel.onMessage = (message) {
      _handleDataChannelMessage(message.text, message.binary);
    };

    return channel;
  }

  /// Connect to a signaling server
  Future<bool> connectToSignalingServer(String serverIp) async {
    try {
      _signalingSocket = await Socket.connect(
        serverIp,
        _signalingPort,
        timeout: const Duration(seconds: 5),
      );

      // Send join message
      _signalingSocket!.write(
        jsonEncode({'type': 'join', 'deviceId': _localDeviceId}),
      );

      // Listen for signaling messages
      _signalingSocket!.listen(
        (data) => _handleSignalingMessage(utf8.decode(data)),
        onError: (Object e) =>
            developer.log('Signaling error: $e', name: 'P2PService'),
        onDone: () {
          _isConnected = false;
          _connectionController.add(false);
        },
      );

      return true;
    } catch (e) {
      developer.log(
        'Failed to connect to signaling server: $e',
        name: 'P2PService',
      );
      return false;
    }
  }

  /// Connect to a peer device
  Future<bool> connectToPeer(SyncDevice device) async {
    if (_peerConnection == null) {
      await initialize();
    }

    _connectedPeerId = device.id;

    // Create offer
    final offer = await _peerConnection!.createOffer();
    await _peerConnection!.setLocalDescription(offer);

    // Send offer via signaling
    await _sendSignalingMessage({
      'type': P2PMessageType.offer,
      'sdp': offer.toMap(),
      'targetId': device.id,
    });

    return true;
  }

  /// Handle incoming offer
  Future<void> handleOffer(String sdp, String peerId) async {
    if (_peerConnection == null) {
      await initialize();
    }

    _connectedPeerId = peerId;

    await _peerConnection!.setRemoteDescription(
      RTCSessionDescription(sdp, 'offer'),
    );
    final answer = await _peerConnection!.createAnswer();
    await _peerConnection!.setLocalDescription(answer);

    await _sendSignalingMessage({
      'type': P2PMessageType.answer,
      'sdp': answer.toMap(),
      'targetId': peerId,
    });
  }

  /// Handle incoming answer
  Future<void> handleAnswer(String sdp) async {
    await _peerConnection!.setRemoteDescription(
      RTCSessionDescription(sdp, 'answer'),
    );
  }

  /// Handle incoming ICE candidate
  Future<void> handleIceCandidate(Map<String, dynamic> candidate) async {
    final cand = candidate['candidate'] as String? ?? '';
    final sdpMid = candidate['sdpMid'] as String?;
    final sdpMLineIndex = candidate['sdpMLineIndex'] as int? ?? 0;
    await _peerConnection!.addCandidate(
      RTCIceCandidate(cand, sdpMid, sdpMLineIndex),
    );
  }

  /// Send data to connected peer
  Future<void> sendData(Map<String, dynamic> data) async {
    if (_dataChannel != null &&
        _dataChannel!.state == RTCDataChannelState.RTCDataChannelOpen) {
      _dataChannel!.send(RTCDataChannelMessage(jsonEncode(data)));
    }
  }

  /// Send file metadata before transfer
  Future<void> sendFileMeta(
    String transferId,
    String fileName,
    int fileSize,
  ) async {
    await sendData({
      'type': P2PMessageType.fileMeta,
      'transferId': transferId,
      'fileName': fileName,
      'fileSize': fileSize,
    });
  }

  /// Send file chunk
  Future<void> sendFileChunk(
    String transferId,
    int chunkIndex,
    List<int> data,
  ) async {
    if (_fileChannel != null &&
        _fileChannel!.state == RTCDataChannelState.RTCDataChannelOpen) {
      final message = {
        'type': P2PMessageType.fileChunk,
        'transferId': transferId,
        'chunkIndex': chunkIndex,
        'data': base64Encode(data),
      };
      _fileChannel!.send(RTCDataChannelMessage(jsonEncode(message)));
    }
  }

  /// Send clipboard content
  Future<void> sendClipboard(String content) async {
    await sendData({
      'type': P2PMessageType.clipboard,
      'content': content,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  /// Disconnect from peer
  Future<void> disconnect() async {
    _dataChannel?.close();
    _fileChannel?.close();
    await _peerConnection?.close();

    _peerConnection = null;
    _dataChannel = null;
    _fileChannel = null;
    _connectedPeerId = null;
    _isConnected = false;

    _connectionController.add(false);
  }

  void _handleDataChannelMessage(String text, List<int>? binary) {
    try {
      final data = jsonDecode(text) as Map<String, dynamic>;

      switch (data['type']) {
        case P2PMessageType.fileMeta:
        case P2PMessageType.fileChunk:
        case P2PMessageType.fileComplete:
          _fileChunkController.add(data);
          break;
        default:
          _messageController.add(data);
          if (onDataReceived != null) {
            onDataReceived!(data);
          }
      }
    } catch (e) {
      developer.log('Failed to parse message: $e', name: 'P2PService');
    }
  }

  void _handleSignalingMessage(String message) {
    try {
      final data = jsonDecode(message) as Map<String, dynamic>;
      final type = data['type'] as String?;

      switch (type) {
        case P2PMessageType.offer:
          final sdpMap = data['sdp'] as Map<String, dynamic>?;
          final from = data['from'] as String?;
          if (sdpMap != null && from != null) {
            final sdpString = jsonEncode(sdpMap);
            unawaited(handleOffer(sdpString, from));
          }
          break;
        case P2PMessageType.answer:
          final sdpMap = data['sdp'] as Map<String, dynamic>?;
          if (sdpMap != null) {
            final sdpString = jsonEncode(sdpMap);
            unawaited(handleAnswer(sdpString));
          }
          break;
        case P2PMessageType.ice:
          final candidate = data['candidate'] as Map<String, dynamic>?;
          if (candidate != null) {
            unawaited(handleIceCandidate(candidate));
          }
          break;
      }
    } catch (e) {
      developer.log(
        'Failed to handle signaling message: $e',
        name: 'P2PService',
      );
    }
  }

  Future<void> _sendSignalingMessage(Map<String, dynamic> message) async {
    if (_signalingSocket != null) {
      message['from'] = _localDeviceId;
      _signalingSocket!.write(jsonEncode(message));
    }
  }

  void dispose() {
    unawaited(disconnect());
    _signalingSocket?.destroy();
    unawaited(_connectionController.close());
    unawaited(_messageController.close());
    unawaited(_fileChunkController.close());
  }
}
