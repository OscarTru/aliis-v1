import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class AliisSignalCard extends StatelessWidget {
  final String eyebrow;
  final String body;
  final List<String> pills;

  const AliisSignalCard({
    super.key,
    required this.body,
    this.eyebrow = 'SEÑAL ALIIS DEL DÍA',
    this.pills = const [],
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AliisColors.deepTeal,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            eyebrow,
            style: GoogleFonts.robotoMono(
              fontSize: 9,
              color: Colors.white.withValues(alpha: 0.7),
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: Colors.white,
              height: 1.5,
            ),
          ),
          if (pills.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: pills.map((p) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                ),
                child: Text(p,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  )),
              )).toList(),
            ),
          ],
        ],
      ),
    );
  }
}
