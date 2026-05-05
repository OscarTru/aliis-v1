import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AliisColors {
  const AliisColors._();

  static const background = Color(0xFFFAFAF7);
  static const foreground = Color(0xFF272730);
  static const primary = Color(0xFF1F8A9B);
  static const muted = Color(0xFFF4F4F6);
  static const mutedForeground = Color(0xFF57575F);
  static const border = Color(0xFFE4E4EB);
  static const card = Color(0xFFF4F4F6);
  static const amber = Color(0xFFF59E0B);
  static const emerald = Color(0xFF10B981);
  static const destructive = Color(0xFFDC2626);

  // Dark mode
  static const backgroundDark = Color(0xFF0F1117);
  static const foregroundDark = Color(0xFFF4F4F6);
  static const mutedDark = Color(0xFF1A1D26);
  static const borderDark = Color(0xFF2E3040);
  static const cardDark = Color(0xFF161923);
}

ThemeData aliisLightTheme() {
  final base = ThemeData.light(useMaterial3: true);
  return base.copyWith(
    scaffoldBackgroundColor: AliisColors.background,
    colorScheme: base.colorScheme.copyWith(
      primary: AliisColors.primary,
      surface: AliisColors.background,
      onSurface: AliisColors.foreground,
      outline: AliisColors.border,
    ),
    textTheme: GoogleFonts.interTextTheme(base.textTheme).copyWith(
      displayLarge: GoogleFonts.instrumentSerif(
        fontSize: 32, fontStyle: FontStyle.italic,
      ),
      displayMedium: GoogleFonts.instrumentSerif(fontSize: 24),
      titleLarge: GoogleFonts.instrumentSerif(fontSize: 20),
    ),
    cardTheme: CardThemeData(
      color: AliisColors.card,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AliisColors.border),
      ),
    ),
    dividerColor: AliisColors.border,
    appBarTheme: const AppBarTheme(
      backgroundColor: AliisColors.background,
      foregroundColor: AliisColors.foreground,
      elevation: 0,
      centerTitle: false,
    ),
  );
}

ThemeData aliisDarkTheme() {
  final base = ThemeData.dark(useMaterial3: true);
  return base.copyWith(
    scaffoldBackgroundColor: AliisColors.backgroundDark,
    colorScheme: base.colorScheme.copyWith(
      primary: AliisColors.primary,
      surface: AliisColors.backgroundDark,
      onSurface: AliisColors.foregroundDark,
      outline: AliisColors.borderDark,
    ),
    textTheme: GoogleFonts.interTextTheme(base.textTheme).copyWith(
      displayLarge: GoogleFonts.instrumentSerif(
        fontSize: 32, fontStyle: FontStyle.italic,
      ),
      displayMedium: GoogleFonts.instrumentSerif(fontSize: 24),
      titleLarge: GoogleFonts.instrumentSerif(fontSize: 20),
    ),
    cardTheme: CardThemeData(
      color: AliisColors.cardDark,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AliisColors.borderDark),
      ),
    ),
    dividerColor: AliisColors.borderDark,
    appBarTheme: const AppBarTheme(
      backgroundColor: AliisColors.backgroundDark,
      foregroundColor: AliisColors.foregroundDark,
      elevation: 0,
      centerTitle: false,
    ),
  );
}
