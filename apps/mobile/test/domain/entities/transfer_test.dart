import 'package:flutter_test/flutter_test.dart';
import 'package:syncstuff_mobile/domain/entities/transfer.dart';

void main() {
  group('FileTransfer', () {
    test('should create transfer with required fields', () {
      final transfer = FileTransfer(
        id: 'transfer-1',
        fileName: 'test.txt',
        fileSize: 1024,
        type: TransferType.file,
        status: TransferStatus.pending,
        direction: TransferDirection.sent,
        createdAt: DateTime(2024, 1, 1),
      );

      expect(transfer.id, 'transfer-1');
      expect(transfer.fileName, 'test.txt');
      expect(transfer.fileSize, 1024);
      expect(transfer.status, TransferStatus.pending);
      expect(transfer.direction, TransferDirection.sent);
    });

    test('should format file size correctly', () {
      // Bytes
      final bytesTransfer = FileTransfer(
        id: '1',
        fileName: 'test.txt',
        fileSize: 512,
        type: TransferType.file,
        status: TransferStatus.pending,
        direction: TransferDirection.sent,
        createdAt: DateTime.now(),
      );
      expect(bytesTransfer.formattedSize, '512 B');

      // Kilobytes
      final kbTransfer = FileTransfer(
        id: '2',
        fileName: 'test.txt',
        fileSize: 2048,
        type: TransferType.file,
        status: TransferStatus.pending,
        direction: TransferDirection.sent,
        createdAt: DateTime.now(),
      );
      expect(kbTransfer.formattedSize, '2.0 KB');

      // Megabytes
      final mbTransfer = FileTransfer(
        id: '3',
        fileName: 'test.txt',
        fileSize: 5 * 1024 * 1024,
        type: TransferType.file,
        status: TransferStatus.pending,
        direction: TransferDirection.sent,
        createdAt: DateTime.now(),
      );
      expect(mbTransfer.formattedSize, '5.0 MB');

      // Gigabytes
      final gbTransfer = FileTransfer(
        id: '4',
        fileName: 'test.txt',
        fileSize: 2 * 1024 * 1024 * 1024,
        type: TransferType.file,
        status: TransferStatus.pending,
        direction: TransferDirection.sent,
        createdAt: DateTime.now(),
      );
      expect(gbTransfer.formattedSize, '2.00 GB');
    });

    test('should copy with new values', () {
      final transfer = FileTransfer(
        id: 'transfer-1',
        fileName: 'test.txt',
        fileSize: 1024,
        type: TransferType.file,
        status: TransferStatus.pending,
        direction: TransferDirection.sent,
        createdAt: DateTime(2024, 1, 1),
      );

      final updated = transfer.copyWith(
        status: TransferStatus.inProgress,
        progress: 0.5,
      );

      expect(updated.status, TransferStatus.inProgress);
      expect(updated.progress, 0.5);
      expect(updated.fileName, 'test.txt'); // unchanged
    });

    test('should support equality', () {
      final now = DateTime(2024, 1, 1);
      final transfer1 = FileTransfer(
        id: 'transfer-1',
        fileName: 'test.txt',
        fileSize: 1024,
        type: TransferType.file,
        status: TransferStatus.pending,
        direction: TransferDirection.sent,
        createdAt: now,
      );

      final transfer2 = FileTransfer(
        id: 'transfer-1',
        fileName: 'test.txt',
        fileSize: 1024,
        type: TransferType.file,
        status: TransferStatus.pending,
        direction: TransferDirection.sent,
        createdAt: now,
      );

      expect(transfer1, equals(transfer2));
    });

    test('should have all transfer types', () {
      expect(TransferType.values.length, 2);
      expect(TransferType.values.contains(TransferType.file), true);
      expect(TransferType.values.contains(TransferType.folder), true);
    });

    test('should have all status types', () {
      expect(TransferStatus.values.length, 5);
      expect(TransferStatus.values.contains(TransferStatus.pending), true);
      expect(TransferStatus.values.contains(TransferStatus.inProgress), true);
      expect(TransferStatus.values.contains(TransferStatus.completed), true);
      expect(TransferStatus.values.contains(TransferStatus.failed), true);
      expect(TransferStatus.values.contains(TransferStatus.cancelled), true);
    });

    test('should have all direction types', () {
      expect(TransferDirection.values.length, 2);
      expect(TransferDirection.values.contains(TransferDirection.sent), true);
      expect(
        TransferDirection.values.contains(TransferDirection.received),
        true,
      );
    });
  });
}
