import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Dark Mode Colors
  static const Color darkBackground = Color(0xFF0D0D0D);
  static const Color darkSurface = Color(0xFF1A1A1A);
  static const Color darkSurfaceVariant = Color(0xFF252525);
  static const Color darkBorder = Color(0xFF2E2E2E);

  // Light Mode Colors
  static const Color lightBackground = Color(0xFFFAFAFA);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceVariant = Color(0xFFF4F4F5);
  static const Color lightBorder = Color(0xFFE4E4E7);

  // Primary Colors (Indigo)
  static const Color primaryDark = Color(0xFF6366F1);
  static const Color primaryDarkHover = Color(0xFF818CF8);
  static const Color primaryLight = Color(0xFF4F46E5);
  static const Color primaryLightHover = Color(0xFF4338CA);

  // Semantic Colors
  static const Color success = Color(0xFF22C55E);
  static const Color successLight = Color(0xFF4ADE80);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFBBF24);
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFF87171);

  // Text Colors - Dark Mode
  static const Color textPrimaryDark = Color(0xFFFAFAFA);
  static const Color textSecondaryDark = Color(0xFFA1A1AA);
  static const Color textMutedDark = Color(0xFF71717A);

  // Text Colors - Light Mode
  static const Color textPrimaryLight = Color(0xFF18181B);
  static const Color textSecondaryLight = Color(0xFF52525B);
  static const Color textMutedLight = Color(0xFF71717A);

  // Device Status Colors
  static const Color connected = success;
  static const Color disconnected = textMutedDark;
  static const Color connecting = warning;
}
