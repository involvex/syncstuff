import 'dart:async';
import 'package:syncstuff_core/syncstuff_core.dart';

class TransferQueue {
  final int maxConcurrent;
  final List<FileTransfer> _queue = [];
  final List<FileTransfer> _active = [];

  final _queueController = StreamController<List<FileTransfer>>.broadcast();
  final _activeController = StreamController<List<FileTransfer>>.broadcast();

  TransferQueue({this.maxConcurrent = 3});

  Stream<List<FileTransfer>> get queueStream => _queueController.stream;
  Stream<List<FileTransfer>> get activeStream => _activeController.stream;
  List<FileTransfer> get pendingQueue => List.unmodifiable(_queue);
  List<FileTransfer> get activeTransfers => List.unmodifiable(_active);

  void enqueue(FileTransfer transfer) {
    _queue.add(transfer);
    _sort();
    _emit();
    _processQueue();
  }

  void _sort() {
    _queue.sort((a, b) => b.priority.index.compareTo(a.priority.index));
  }

  void _processQueue() {
    while (_active.length < maxConcurrent && _queue.isNotEmpty) {
      _active.add(_queue.removeAt(0));
    }
    _emit();
  }

  void _emit() {
    _queueController.add(_queue);
    _activeController.add(_active);
  }

  void onComplete(String transferId) {
    _active.removeWhere((t) => t.id == transferId);
    _processQueue();
  }

  void onCancel(String transferId) {
    _queue.removeWhere((t) => t.id == transferId);
    _active.removeWhere((t) => t.id == transferId);
    _processQueue();
  }

  void dispose() {
    _queueController.close();
    _activeController.close();
  }
}
