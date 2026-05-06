import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AlertaBanner extends StatelessWidget {
  final String body;
  final VoidCallback? onTap;

  const AlertaBanner({super.key, required this.body, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFFFF7ED),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFFED7AA)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('⚠', style: TextStyle(fontSize: 14)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(body,
                style: GoogleFonts.inter(
                  fontSize: 13, color: const Color(0xFF92400E))),
            ),
          ],
        ),
      ),
    );
  }
}
