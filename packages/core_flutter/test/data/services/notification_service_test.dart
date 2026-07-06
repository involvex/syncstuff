import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:syncstuff_core_flutter/syncstuff_core_flutter.dart';

class FakeFlutterLocalNotificationsPlugin
    implements FlutterLocalNotificationsPlugin {
  final List<Map<String, dynamic>> shownNotifications = [];
  final List<int> cancelledIds = [];
  bool cancelAllCalled = false;
  bool initializeCalled = false;

  @override
  Future<bool?> initialize(
    InitializationSettings? initializationSettings, {
    DidReceiveNotificationResponseCallback? onDidReceiveNotificationResponse,
    DidReceiveBackgroundNotificationResponseCallback?
    onDidReceiveBackgroundNotificationResponse,
  }) async {
    initializeCalled = true;
    return true;
  }

  @override
  Future<void> show(
    int id,
    String? title,
    String? body,
    NotificationDetails? notificationDetails, {
    String? payload,
  }) async {
    shownNotifications.add({'id': id, 'title': title, 'body': body});
  }

  @override
  Future<void> cancel(int id, {String? tag}) async {
    cancelledIds.add(id);
  }

  @override
  Future<void> cancelAll() async {
    cancelAllCalled = true;
  }

  @override
  dynamic noSuchMethod(Invocation invocation) {
    // Return sensible defaults for any unimplemented method
    if (invocation.memberName == #pendingNotificationRequests) {
      return <PendingNotificationRequest>[];
    }
    if (invocation.memberName == #pendingNotificationRequestsCount) {
      return Future.value(0);
    }
    return null;
  }
}

void main() {
  late FakeFlutterLocalNotificationsPlugin fakePlugin;
  late NotificationService service;

  setUp(() {
    fakePlugin = FakeFlutterLocalNotificationsPlugin();
    service = NotificationService(plugin: fakePlugin);
  });

  FileTransfer _makeTransfer(
    String id, {
    TransferDirection direction = TransferDirection.sent,
    TransferStatus status = TransferStatus.completed,
    double progress = 1.0,
    String? error,
    int fileSize = 1024,
  }) {
    return FileTransfer(
      id: id,
      fileName: 'test_file.txt',
      fileSize: fileSize,
      type: TransferType.file,
      status: status,
      direction: direction,
      progress: progress,
      createdAt: DateTime.now(),
      error: error,
    );
  }

  group('NotificationService', () {
    test('starts uninitialized', () {
      expect(service.isInitialized, isFalse);
    });

    test('init initializes the plugin', () async {
      await service.init();

      expect(service.isInitialized, isTrue);
      expect(fakePlugin.initializeCalled, isTrue);
    });

    test('init is idempotent', () async {
      await service.init();
      await service.init();

      expect(fakePlugin.initializeCalled, isTrue);
    });

    test('showTransferComplete shows notification for sent transfer', () async {
      await service.showTransferComplete(_makeTransfer('1'));

      expect(fakePlugin.shownNotifications.length, 1);
      final notification = fakePlugin.shownNotifications.first;
      expect(notification['title'], 'Transfer Sent');
      expect(notification['body'], 'test_file.txt (1.0 KB)');
    });

    test(
      'showTransferComplete shows notification for received transfer',
      () async {
        await service.showTransferComplete(
          _makeTransfer('2', direction: TransferDirection.received),
        );

        expect(fakePlugin.shownNotifications.length, 1);
        final notification = fakePlugin.shownNotifications.first;
        expect(notification['title'], 'Transfer Received');
      },
    );

    test('showTransferFailed shows notification with error message', () async {
      await service.showTransferFailed(
        _makeTransfer('3', status: TransferStatus.failed, error: 'Timeout'),
      );

      expect(fakePlugin.shownNotifications.length, 1);
      final notification = fakePlugin.shownNotifications.first;
      expect(notification['title'], 'Transfer Failed');
      expect(notification['body'], 'test_file.txt: Timeout');
    });

    test('showTransferFailed shows unknown error when error is null', () async {
      await service.showTransferFailed(
        _makeTransfer('4', status: TransferStatus.failed, error: null),
      );

      expect(fakePlugin.shownNotifications.length, 1);
      final notification = fakePlugin.shownNotifications.first;
      expect(notification['body'], 'test_file.txt: Unknown error');
    });

    test('showTransferProgress shows progress notification', () async {
      await service.showTransferProgress(
        _makeTransfer('5', status: TransferStatus.inProgress, progress: 0.75),
      );

      expect(fakePlugin.shownNotifications.length, 1);
      final notification = fakePlugin.shownNotifications.first;
      expect(notification['title'], 'Transferring test_file.txt');
      expect(notification['body'], '75% complete');
    });

    test('cancelNotification cancels specific notification', () async {
      await service.cancelNotification(42);

      expect(fakePlugin.cancelledIds, [42]);
    });

    test('cancelAll cancels all notifications', () async {
      await service.cancelAll();

      expect(fakePlugin.cancelAllCalled, isTrue);
    });

    test(
      'auto-initializes on showTransferComplete if not initialized',
      () async {
        final transfer = _makeTransfer('6');
        await service.showTransferComplete(transfer);

        expect(service.isInitialized, isTrue);
        expect(fakePlugin.initializeCalled, isTrue);
        expect(fakePlugin.shownNotifications.length, 1);
      },
    );

    test('auto-initializes on showTransferFailed if not initialized', () async {
      await service.showTransferFailed(
        _makeTransfer('7', status: TransferStatus.failed),
      );

      expect(service.isInitialized, isTrue);
      expect(fakePlugin.shownNotifications.length, 1);
    });

    test(
      'auto-initializes on showTransferProgress if not initialized',
      () async {
        await service.showTransferProgress(
          _makeTransfer('8', status: TransferStatus.inProgress, progress: 0.5),
        );

        expect(service.isInitialized, isTrue);
        expect(fakePlugin.shownNotifications.length, 1);
      },
    );

    test('notification id is consistent for same transfer', () async {
      final transfer = _makeTransfer('consistent-id');
      await service.showTransferComplete(transfer);

      final id1 = fakePlugin.shownNotifications.first['id'] as int;
      fakePlugin.shownNotifications.clear();

      await service.showTransferFailed(transfer);
      final id2 = fakePlugin.shownNotifications.first['id'] as int;

      expect(id1, equals(id2));
    });
  });
}
