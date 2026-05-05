import 'package:flutter/material.dart';
import '../../core/theme.dart';
import 'package:google_fonts/google_fonts.dart';

class PacksScreen extends StatelessWidget {
  const PacksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Tus\npacks.', style: Theme.of(context).textTheme.displayLarge),
              const SizedBox(height: 8),
              Text('Próximamente', style: GoogleFonts.inter(
                color: AliisColors.mutedForeground, fontSize: 14)),
            ],
          ),
        ),
      ),
    );
  }
}
