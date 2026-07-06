import 'package:flutter_test/flutter_test.dart';
import 'package:syncstuff_core_flutter/syncstuff_core_flutter.dart';

FileTransfer _makeTransfer(
  String id, {
  TransferPriority priority = TransferPriority.normal,
}) {
  return FileTransfer(
    id: id,
    fileName: 'file_$id.txt',
    fileSize: 1024,
    type: TransferType.file,
    status: TransferStatus.pending,
    direction: TransferDirection.sent,
    progress: 0,
    createdAt: DateTime.now(),
    priority: priority,
  );
}

void main() {
  group('TransferQueue', () {
    late TransferQueue queue;

    setUp(() {
      queue = TransferQueue(maxConcurrent: 2);
    });

    tearDown(() {
      queue.dispose();
    });

    test('starts with empty queues', () {
      expect(queue.pendingQueue, isEmpty);
      expect(queue.activeTransfers, isEmpty);
    });

    test('enqueue adds transfer to active when slots available', () {
      final transfer = _makeTransfer('1');
      queue.enqueue(transfer);

      expect(queue.activeTransfers.length, 1);
      expect(queue.activeTransfers.first.id, '1');
      expect(queue.pendingQueue, isEmpty);
    });

    test('enqueue respects maxConcurrent limit', () {
      queue.enqueue(_makeTransfer('1'));
      queue.enqueue(_makeTransfer('2'));
      queue.enqueue(_makeTransfer('3'));

      expect(queue.activeTransfers.length, 2);
      expect(queue.pendingQueue.length, 1);
      expect(queue.pendingQueue.first.id, '3');
    });

    test('onComplete frees slot and promotes next from queue', () {
      queue.enqueue(_makeTransfer('1'));
      queue.enqueue(_makeTransfer('2'));
      queue.enqueue(_makeTransfer('3'));

      expect(queue.activeTransfers.length, 2);
      expect(queue.pendingQueue.length, 1);

      queue.onComplete('1');

      expect(queue.activeTransfers.length, 2);
      expect(queue.pendingQueue.length, 0);
      expect(queue.activeTransfers.map((t) => t.id), contains('3'));
    });

    test('onComplete with unknown id has no effect', () {
      queue.enqueue(_makeTransfer('1'));

      queue.onComplete('nonexistent');

      expect(queue.activeTransfers.length, 1);
    });

    test('onCancel removes from pending queue', () {
      queue.enqueue(_makeTransfer('1'));
      queue.enqueue(_makeTransfer('2'));
      queue.enqueue(_makeTransfer('3'));

      expect(queue.pendingQueue.length, 1);

      queue.onCancel('3');

      expect(queue.pendingQueue.length, 0);
      expect(queue.pendingQueue, isEmpty);
    });

    test('onCancel removes from active transfers', () {
      queue.enqueue(_makeTransfer('1'));
      queue.enqueue(_makeTransfer('2'));

      expect(queue.activeTransfers.length, 2);

      queue.onCancel('1');

      expect(queue.activeTransfers.length, 1);
      expect(queue.activeTransfers.first.id, '2');
    });

    test('onCancel promotes next from queue', () {
      queue.enqueue(_makeTransfer('1'));
      queue.enqueue(_makeTransfer('2'));
      queue.enqueue(_makeTransfer('3'));

      queue.onCancel('1');

      expect(queue.activeTransfers.length, 2);
      expect(queue.activeTransfers.map((t) => t.id), contains('3'));
      expect(queue.pendingQueue, isEmpty);
    });

    test('queues are sorted by priority descending', () {
      queue.enqueue(_makeTransfer('low', priority: TransferPriority.low));
      queue.enqueue(_makeTransfer('urgent', priority: TransferPriority.urgent));
      queue.enqueue(_makeTransfer('normal', priority: TransferPriority.normal));
      queue.enqueue(_makeTransfer('high', priority: TransferPriority.high));

      expect(queue.activeTransfers.length, 2);
      expect(queue.pendingQueue.length, 2);

      expect(queue.pendingQueue[0].id, 'high');
      expect(queue.pendingQueue[1].id, 'normal');
    });

    test('default maxConcurrent is 3', () {
      final defaultQueue = TransferQueue();
      expect(defaultQueue.maxConcurrent, 3);
      defaultQueue.dispose();
    });

    test('stream emits on enqueue', () async {
      final events = <List<FileTransfer>>[];
      queue.queueStream.listen(events.add);

      queue.enqueue(_makeTransfer('1'));
      await Future<void>.delayed(Duration.zero);

      expect(events, isNotEmpty);
      expect(events.last, isEmpty);
    });

    test('stream emits on active changes', () async {
      final events = <List<FileTransfer>>[];
      queue.activeStream.listen(events.add);

      queue.enqueue(_makeTransfer('1'));
      await Future<void>.delayed(Duration.zero);

      expect(events, isNotEmpty);
      expect(events.last.length, 1);
    });

    test('dispose closes streams', () {
      final q = TransferQueue();
      q.dispose();

      expect(() => q.queueStream.listen((_) {}), isNot(throwsA(anything)));
      expect(() => q.activeStream.listen((_) {}), isNot(throwsA(anything)));
    });

    test('all priority levels can be enqueued', () {
      final q = TransferQueue(maxConcurrent: 10);
      q.enqueue(_makeTransfer('low', priority: TransferPriority.low));
      q.enqueue(_makeTransfer('normal', priority: TransferPriority.normal));
      q.enqueue(_makeTransfer('high', priority: TransferPriority.high));
      q.enqueue(_makeTransfer('urgent', priority: TransferPriority.urgent));

      expect(q.activeTransfers.length, 4);
      expect(q.pendingQueue, isEmpty);
      q.dispose();
    });
  });
}
