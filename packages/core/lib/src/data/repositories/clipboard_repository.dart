import 'package:syncstuff_core/src/data/datasources/clipboard_local_datasource.dart';
import 'package:syncstuff_core/src/domain/entities/clipboard.dart';

class ClipboardRepository {
  final ClipboardLocalDataSource _localDataSource;

  ClipboardRepository({ClipboardLocalDataSource? localDataSource})
    : _localDataSource = localDataSource ?? ClipboardLocalDataSource();

  Future<List<ClipboardItem>> getHistory({int limit = 100}) async {
    return await _localDataSource.getClipboardHistory(limit: limit);
  }

  Future<void> addItem(ClipboardItem item) async {
    await _localDataSource.insertClipboardItem(item);
  }

  Future<void> deleteItem(String id) async {
    await _localDataSource.deleteClipboardItem(id);
  }

  Future<void> clearHistory() async {
    await _localDataSource.clearHistory();
  }

  Future<ClipboardItem?> getLastClipboardItem() async {
    return await _localDataSource.getLastClipboardItem();
  }
}
