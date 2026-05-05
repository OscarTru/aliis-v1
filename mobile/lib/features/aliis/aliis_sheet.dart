import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class AliisSheet extends StatelessWidget {
  const AliisSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AliisSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, controller) => Container(
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          border: Border.all(color: AliisColors.border),
        ),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(width: 40, height: 4,
              decoration: BoxDecoration(
                color: AliisColors.border,
                borderRadius: BorderRadius.circular(2),
              )),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Text('· Aliis ·', style: GoogleFonts.inter(
                    fontSize: 11, letterSpacing: 2,
                    color: AliisColors.mutedForeground)),
                ],
              ),
            ),
            Expanded(
              child: Center(
                child: Text('Chat próximamente',
                  style: GoogleFonts.inter(color: AliisColors.mutedForeground)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
