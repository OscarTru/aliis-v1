import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class AlertRow extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Color accentColor;

  const AlertRow({
    super.key,
    required this.title,
    this.subtitle,
    this.accentColor = AliisColors.primary,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 2,
            height: subtitle != null ? 38 : 20,
            color: accentColor,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AliisColors.foreground,
                  )),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(subtitle!,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AliisColors.mutedFg,
                    )),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
