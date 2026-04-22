/// Core logging utilities for SyncStuff CLI
class Logger {
  static bool verbose = false;

  static void info(String message) => _log('INFO', message, '\x1B[36m');
  static void success(String message) => _log('OK', message, '\x1B[32m');
  static void warn(String message) => _log('WARN', message, '\x1B[33m');
  static void error(String message) => _log('ERROR', message, '\x1B[31m');
  static void debug(String message) {
    if (verbose) _log('DEBUG', message, '\x1B[90m');
  }

  static void _log(String level, String message, String color) {
    final reset = '\x1B[0m';
    final timestamp = DateTime.now().toIso8601String().substring(11, 19);
    print('$color[$timestamp] $level:$reset $message');
  }

  static void header(String text) {
    final cyan = '\x1B[36m';
    final reset = '\x1B[0m';
    print('\n$cyan═══════════════════════════════════════════$reset');
    print('$cyan  $text$reset');
    print('$cyan═══════════════════════════════════════════$reset\n');
  }

  static void table(List<List<String>> rows) {
    if (rows.isEmpty) {
      warn('No data to display');
      return;
    }

    // Calculate column widths
    final colWidths = <int>[];
    for (var i = 0; i < rows[0].length; i++) {
      var width = 0;
      for (final row in rows) {
        if (i < row.length && row[i].length > width) {
          width = row[i].length;
        }
      }
      colWidths.add(width + 2);
    }

    // Print header
    final header = rows[0];
    var headerRow = '';
    for (var i = 0; i < header.length; i++) {
      headerRow += header[i].padRight(colWidths[i]);
    }
    print('\x1B[1;37m$headerRow\x1B[0m');
    print('\x1B[90m${'-' * colWidths.reduce((a, b) => a + b)}\x1B[0m');

    // Print rows
    for (var r = 1; r < rows.length; r++) {
      var rowStr = '';
      for (var i = 0; i < rows[r].length; i++) {
        rowStr += rows[r][i].padRight(colWidths[i]);
      }
      print(rowStr);
    }
  }
}
