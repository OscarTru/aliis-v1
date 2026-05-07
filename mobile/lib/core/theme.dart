import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AliisColors {
  const AliisColors._();

  static const background   = Color(0xFFFFFFFF);
  static const foreground   = Color(0xFF272730);
  static const primary      = Color(0xFF1F8A9B);
  static const deepTeal     = Color(0xFF14606E);
  static const mutedFg      = Color(0xFF999999);
  static const border       = Color(0xFFF0F0F0);
  static const amber        = Color(0xFFF59E0B);
  static const emerald      = Color(0xFF10B981);
  static const destructive  = Color(0xFFDC2626);

  // dark mode — diferido, mantener para no romper referencias
  static const backgroundDark  = Color(0xFF0F1117);
  static const foregroundDark  = Color(0xFFF4F4F6);
  static const borderDark      = Color(0xFF2E3040);
  static const mutedForeground = mutedFg; // alias compat
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
      displayLarge: GoogleFonts.playfairDisplay(
        fontSize: 30, fontStyle: FontStyle.italic, fontWeight: FontWeight.w300,
        color: AliisColors.foreground,
      ),
      displayMedium: GoogleFonts.playfairDisplay(
        fontSize: 22, fontStyle: FontStyle.italic, fontWeight: FontWeight.w300,
        color: AliisColors.foreground,
      ),
      titleLarge: GoogleFonts.playfairDisplay(
        fontSize: 20, fontStyle: FontStyle.italic,
        color: AliisColors.foreground,
      ),
    ),
    cardTheme: CardThemeData(
      color: AliisColors.background,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(0),
        side: BorderSide.none,
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
      displayLarge: GoogleFonts.playfairDisplay(
        fontSize: 30, fontStyle: FontStyle.italic, fontWeight: FontWeight.w300,
        color: AliisColors.foregroundDark,
      ),
      displayMedium: GoogleFonts.playfairDisplay(
        fontSize: 22, fontStyle: FontStyle.italic, fontWeight: FontWeight.w300,
        color: AliisColors.foregroundDark,
      ),
      titleLarge: GoogleFonts.playfairDisplay(
        fontSize: 20, fontStyle: FontStyle.italic,
        color: AliisColors.foregroundDark,
      ),
    ),
    cardTheme: CardThemeData(
      color: AliisColors.backgroundDark,
      elevation: 0,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
    ),
    dividerColor: AliisColors.borderDark,
    appBarTheme: const AppBarTheme(
      backgroundColor: AliisColors.backgroundDark,
      foregroundColor: AliisColors.foregroundDark,
      elevation: 0,
    ),
  );
}
