import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';

class CelebracionCard extends StatelessWidget {
  final int adherencia14d;

  const CelebracionCard({super.key, required this.adherencia14d});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFBBF7D0)),
      ),
      child: Column(
        children: [
          Text('¡Todo al día hoy! 🎉',
            style: GoogleFonts.instrumentSerif(
              fontSize: 18, color: const Color(0xFF166534))),
          const SizedBox(height: 4),
          Text('Adherencia esta semana: $adherencia14d%',
            style: GoogleFonts.inter(
              fontSize: 12, color: const Color(0xFF166534))),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).scaleXY(begin: 0.95, end: 1);
  }
}
