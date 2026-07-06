import 'package:shared_preferences/shared_preferences.dart';
import 'package:syncstuff_core/src/domain/entities/clipboard.dart';
import 'dart:convert';

class ClipboardLocalDataSource {
  static const String _historyKey = 'clipboard_history';
  static const int _maxHistoryItems = 100;

  Future<List<ClipboardItem>> getClipboardHistory({int limit = 100}) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_historyKey);
    if (jsonString == null || jsonString.isEmpty) return [];

    final List<dynamic> jsonList = jsonDecode(jsonString) as List<dynamic>;
    final items = jsonList
        .map((json) => ClipboardItem.fromJson(json as Map<String, dynamic>))
        .toList();

    items.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return items.take(limit).toList();
  }

  Future<void> insertClipboardItem(ClipboardItem item) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_historyKey);
    final List<dynamic> jsonList = jsonString != null && jsonString.isNotEmpty
        ? jsonDecode(jsonString) as List<dynamic>
        : [];

    final items = jsonList
        .map((json) => ClipboardItem.fromJson(json as Map<String, dynamic>))
        .toList();

    final existingIndex = items.indexWhere((i) => i.content == item.content);
    if (existingIndex != -1) {
      items.removeAt(existingIndex);
    }

    items.insert(0, item);

    if (items.length > _maxHistoryItems) {
      items.removeRange(_maxHistoryItems, items.length);
    }

    final updatedJson = items.map((i) => i.toJson()).toList();
    await prefs.setString(_historyKey, jsonEncode(updatedJson));
  }

  Future<void> deleteClipboardItem(String id) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_historyKey);
    if (jsonString == null || jsonString.isEmpty) return;

    final List<dynamic> jsonList = jsonDecode(jsonString) as List<dynamic>;
    final items = jsonList
        .map((json) => ClipboardItem.fromJson(json as Map<String, dynamic>))
        .toList();

    items.removeWhere((item) => item.id == id);

    final updatedJson = items.map((i) => i.toJson()).toList();
    await prefs.setString(_historyKey, jsonEncode(updatedJson));
  }

  Future<void> clearHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_historyKey);
  }

  Future<ClipboardItem?> getLastClipboardItem() async {
    final items = await getClipboardHistory(limit: 1);
    return items.isNotEmpty ? items.first : null;
  }
}
