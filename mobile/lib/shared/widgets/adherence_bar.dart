import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class AdherenceBar extends StatelessWidget {
  final String label;
  final int percent;
  final String? sublabel;

  const AdherenceBar({
    super.key,
    required this.label,
    required this.percent,
    this.sublabel,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(label,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AliisColors.foreground,
              )),
            const Spacer(),
            Text('$percent%',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AliisColors.primary,
              )),
          ],
        ),
        const SizedBox(height: 6),
        TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: percent / 100),
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeOut,
          builder: (_, value, __) => ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: value,
              backgroundColor: AliisColors.border,
              valueColor: const AlwaysStoppedAnimation(AliisColors.primary),
              minHeight: 4,
            ),
          ),
        ),
        if (sublabel != null) ...[
          const SizedBox(height: 4),
          Text(sublabel!,
            style: GoogleFonts.inter(
              fontSize: 10,
              color: AliisColors.mutedFg,
            )),
        ],
      ],
    );
  }
}
