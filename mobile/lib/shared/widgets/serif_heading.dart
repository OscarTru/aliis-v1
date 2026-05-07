import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class SerifHeading extends StatelessWidget {
  final String eyebrow;
  final String heading;
  final double headingSize;
  final bool showAccentLine;

  const SerifHeading({
    super.key,
    required this.heading,
    this.eyebrow = '',
    this.headingSize = 30,
    this.showAccentLine = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (eyebrow.isNotEmpty) ...[
          Text(
            eyebrow.toUpperCase(),
            style: GoogleFonts.robotoMono(
              fontSize: 10,
              color: AliisColors.mutedFg,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 4),
        ],
        Text(
          heading,
          style: GoogleFonts.playfairDisplay(
            fontSize: headingSize,
            fontStyle: FontStyle.italic,
            fontWeight: FontWeight.w300,
            color: AliisColors.foreground,
          ),
        ),
        if (showAccentLine) ...[
          const SizedBox(height: 6),
          Container(
            width: 24,
            height: 2,
            color: AliisColors.primary,
          ),
        ],
      ],
    );
  }
}
