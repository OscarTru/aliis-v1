import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../../../shared/models/pack.dart';

class ChapterTab extends StatelessWidget {
  final Chapter chapter;

  const ChapterTab({super.key, required this.chapter});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(chapter.n,
            style: GoogleFonts.inter(
              fontSize: 11, color: AliisColors.primary,
              fontWeight: FontWeight.w600, letterSpacing: 0.5)),
          const SizedBox(height: 8),
          Text(chapter.kicker,
            style: GoogleFonts.instrumentSerif(
              fontSize: 26, color: AliisColors.foreground)),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AliisColors.muted,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AliisColors.border),
            ),
            child: Text(chapter.tldr,
              style: GoogleFonts.inter(
                fontSize: 13, color: AliisColors.foreground,
                fontStyle: FontStyle.italic)),
          ),
          const SizedBox(height: 24),
          ...chapter.paragraphs.map((p) => Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Text(p,
              style: GoogleFonts.inter(
                fontSize: 15, height: 1.7,
                color: AliisColors.foreground)),
          )),
        ],
      ),
    );
  }
}
