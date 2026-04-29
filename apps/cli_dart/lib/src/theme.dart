import 'dart:io';
import 'package:nocterm/nocterm.dart';

/// Theme constants for SyncStuff CLI TUI
class SyncStuffTheme {
  // Primary colors matching the existing CLI banner style
  static final Color primary = Color.fromRGB(
    102,
    217,
    239,
  ); // Cyan/blue like in banner
  static final Color secondary = Color.fromRGB(118, 175, 255); // Lighter blue
  static final Color accent = Color.fromRGB(255, 184, 108); // Orange accent

  // Status colors
  static final Color success = Color.fromRGB(166, 227, 161); // Green
  static final Color warning = Color.fromRGB(229, 192, 123); // Yellow
  static final Color error = Color.fromRGB(224, 108, 117); // Red
  static final Color info = Color.fromRGB(137, 180, 250); // Blue

  // Neutral colors
  static final Color foreground = Color.fromRGB(229, 233, 240); // Light gray
  static final Color background = Color.fromRGB(30, 30, 46); // Dark background
  static final Color muted = Color.fromRGB(116, 127, 141); // Medium gray

  // Text styles
  static final TextStyle titleStyle = TextStyle(
    color: primary,
    fontWeight: FontWeight.bold,
  );

  static final TextStyle subtitleStyle = TextStyle(
    color: secondary,
    fontWeight: FontWeight.normal,
  );

  static final TextStyle bodyStyle = TextStyle(color: foreground);

  static final TextStyle mutedStyle = TextStyle(color: muted);

  static final TextStyle successStyle = TextStyle(color: success);

  static final TextStyle warningStyle = TextStyle(color: warning);

  static final TextStyle errorStyle = TextStyle(color: error);

  static final TextStyle infoStyle = TextStyle(color: info);

  // Container decorations
  static final BoxDecoration cardDecoration = BoxDecoration(
    color: background.withOpacity(0.8),
    border: Border.all(color: muted, width: 1),
    borderRadius: BorderRadius.all(Radius.circular(4)),
  );

  static final BoxDecoration inputDecoration = BoxDecoration(
    color: background.withOpacity(0.6),
    border: Border.all(color: muted, width: 1),
  );

  // Get terminal dimensions for responsive design
  static Size getTerminalSize() {
    // In a real implementation, we'd get this from Nocterm's context
    // For now, return reasonable defaults
    return const Size(80, 24);
  }

  // Check if we're in a Windows environment for path handling
  static bool get isWindows => Platform.isWindows;

  // Get appropriate line ending
  static String get lineEnding => Platform.isWindows ? '\r\n' : '\n';
}
