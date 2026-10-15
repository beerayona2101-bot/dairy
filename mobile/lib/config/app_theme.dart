import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Color Palette (Derived from Natural Milk Dairy Logo)
  static const Color brandGreen = Color(0xFF075C2A); // 🟢 Deep Forest Green - Primary brand
  static const Color brandLeaf = Color(0xFF3F9E18);  // 🟩 Fresh Leaf Green - Secondary / highlights
  static const Color dairyBlue = Color(0xFF0756B5);  // 🔵 Dairy Blue - Buttons / CTAs
  static const Color skyBlue = Color(0xFF35A8E8);    // 🟦 Sky Blue - Background accents
  static const Color premiumGold = Color(0xFFD5A62A);// 🟡 Premium Gold - Borders / rating stars
  static const Color milkWhite = Color(0xFFFFFDF7);  // 🤍 Milk White - Main background
  static const Color creamBg = Color(0xFFF5E9D0);    // 🥛 Cream - Cards / soft surfaces
  static const Color darkGreenText = Color(0xFF063B22); // 🌑 Deep Green Black - Text / headings

  static const Color primary = dairyBlue;
  static const Color secondary = brandGreen;
  static const Color accent = skyBlue;
  static const Color darkBg = Color(0xFF0F172A);
  static const Color darkCard = Color(0xFF1E293B);
  static const Color lightBg = milkWhite;
  static const Color textDark = darkGreenText;
  static const Color textMuted = Color(0xFF526B5C);

  // Brand Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF0756B5), Color(0xFF054593)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient ctaGradient = LinearGradient(
    colors: [Color(0xFF075C2A), Color(0xFF063B22)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [Color(0xFF35A8E8), Color(0xFF0756B5)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Light Theme
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: milkWhite,
      cardColor: creamBg,
      primaryColor: primary,
      colorScheme: const ColorScheme.light(
        primary: primary,
        secondary: secondary,
        surface: creamBg,
      ),
      textTheme: GoogleFonts.outfitTextTheme(),
      appBarTheme: AppBarTheme(
        backgroundColor: milkWhite,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: textDark),
        titleTextStyle: GoogleFonts.outfit(
          color: textDark,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: brandGreen,
          foregroundColor: Colors.white,
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: GoogleFonts.outfit(
            fontSize: 15,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  // Dark Theme
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: darkBg,
      primaryColor: primary,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: secondary,
        surface: darkCard,
      ),
      textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
      appBarTheme: AppBarTheme(
        backgroundColor: darkCard,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        titleTextStyle: GoogleFonts.outfit(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
