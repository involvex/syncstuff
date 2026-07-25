import 'package:flutter/services.dart';

/// Helper to copy files from private app storage to public Downloads
class FileHelper {
  static const _channel = MethodChannel('com.syncstuff/file_helper');

  /// Copy a file from private app storage to the public Downloads directory.
  /// [relativePath] is optional subdirectory under Downloads (e.g. 'Browser').
  /// Returns the public path or URI string.
  static Future<String> copyToDownloads({
    required String filePath,
    required String fileName,
    String? relativePath,
  }) async {
    final result = await _channel.invokeMethod<String>(
      'copyToDownloads',
      {
        'filePath': filePath,
        'fileName': fileName,
        'relativePath': relativePath,
      },
    );
    return result ?? filePath;
  }

  /// Get the public Downloads directory path.
  static Future<String> getDownloadsPath() async {
    final result = await _channel.invokeMethod<String>('getDownloadsPath');
    return result ?? '/storage/emulated/0/Download';
  }
}
