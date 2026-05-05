import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../auth/auth_provider.dart';

class PerfilScreen extends ConsumerWidget {
  const PerfilScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Tu perfil.', style: Theme.of(context).textTheme.displayLarge),
              const SizedBox(height: 32),
              OutlinedButton(
                onPressed: () => ref.read(authProvider).signOut(),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AliisColors.border),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text('Cerrar sesión',
                  style: GoogleFonts.inter(color: AliisColors.foreground, fontSize: 14)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
