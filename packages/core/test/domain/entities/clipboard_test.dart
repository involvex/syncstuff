import 'package:test/test.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

void main() {
  group('ClipboardItem', () {
    test('should create clipboard item with required fields', () {
      final item = ClipboardItem(
        id: 'clip-1',
        content: 'Test content',
        contentType: 'text',
        createdAt: DateTime(2024, 1, 1),
      );

      expect(item.id, 'clip-1');
      expect(item.content, 'Test content');
      expect(item.contentType, 'text');
      expect(item.synced, false);
    });

    test('should copy with new values', () {
      final item = ClipboardItem(
        id: 'clip-1',
        content: 'Test content',
        contentType: 'text',
        createdAt: DateTime(2024, 1, 1),
      );

      final updated = item.copyWith(synced: true, deviceId: 'device-1');

      expect(updated.synced, true);
      expect(updated.deviceId, 'device-1');
      expect(updated.content, 'Test content'); // unchanged
    });

    test('should support equality', () {
      final now = DateTime(2024, 1, 1);
      final item1 = ClipboardItem(
        id: 'clip-1',
        content: 'Test content',
        contentType: 'text',
        createdAt: now,
      );

      final item2 = ClipboardItem(
        id: 'clip-1',
        content: 'Test content',
        contentType: 'text',
        createdAt: now,
      );

      expect(item1, equals(item2));
    });
  });
}
