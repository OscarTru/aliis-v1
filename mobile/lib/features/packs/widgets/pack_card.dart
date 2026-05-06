import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/theme.dart';
import '../../../shared/models/pack.dart';

class PackCard extends StatelessWidget {
  final Pack pack;
  final VoidCallback onTap;

  const PackCard({super.key, required this.pack, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fecha = DateFormat('d MMM yyyy', 'es').format(pack.createdAt);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AliisColors.muted,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AliisColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(pack.dx,
              style: GoogleFonts.instrumentSerif(
                fontSize: 18, color: AliisColors.foreground)),
            const SizedBox(height: 4),
            Text(fecha,
              style: GoogleFonts.inter(
                fontSize: 11, color: AliisColors.mutedForeground)),
            if (pack.summary != null) ...[
              const SizedBox(height: 8),
              Text(pack.summary!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.inter(
                  fontSize: 12, color: AliisColors.mutedForeground)),
            ],
            const SizedBox(height: 10),
            Text('${pack.chapters.length} capítulos',
              style: GoogleFonts.inter(
                fontSize: 11, color: AliisColors.primary,
                fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
