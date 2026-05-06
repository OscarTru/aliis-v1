import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';
import '../auth/auth_provider.dart';
import 'perfil_provider.dart';
import 'widgets/tratamiento_form.dart';
import 'widgets/tratamiento_tile.dart';

class PerfilScreen extends ConsumerWidget {
  const PerfilScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final perfilAsync = ref.watch(perfilProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(perfilProvider),
          child: perfilAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(
              child: Text('Error cargando perfil',
                style: GoogleFonts.inter(color: AliisColors.mutedForeground))),
            data: (data) => ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text('Tu perfil.',
                  style: Theme.of(context).textTheme.displayLarge),
                const SizedBox(height: 24),

                _SectionHeader('Mi cuenta'),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AliisColors.muted,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AliisColors.border),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(data.name ?? 'Usuario',
                              style: GoogleFonts.inter(
                                fontSize: 16, fontWeight: FontWeight.w600)),
                            const SizedBox(height: 2),
                            Text(data.plan == 'pro' ? 'Plan Pro' : 'Plan Free',
                              style: GoogleFonts.inter(
                                fontSize: 12, color: AliisColors.mutedForeground)),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: data.plan == 'pro'
                            ? AliisColors.primary.withValues(alpha: 0.1)
                            : AliisColors.border,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          data.plan == 'pro' ? 'Pro' : 'Free',
                          style: GoogleFonts.inter(
                            fontSize: 11, fontWeight: FontWeight.w600,
                            color: data.plan == 'pro'
                              ? AliisColors.primary
                              : AliisColors.mutedForeground)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const _SectionHeader('Tratamientos'),
                    IconButton(
                      icon: const Icon(Icons.add, color: AliisColors.primary),
                      onPressed: () => showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                        shape: const RoundedRectangleBorder(
                          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
                        builder: (_) => const TratamientoForm(),
                      ),
                    ),
                  ],
                ),
                if (data.treatments.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Text('Sin tratamientos activos',
                      style: GoogleFonts.inter(
                        color: AliisColors.mutedForeground, fontSize: 13)),
                  )
                else
                  ...data.treatments.map((t) => TratamientoTile(treatment: t)),
                const SizedBox(height: 24),

                if (data.plan == 'pro') ...[
                  _SectionHeader('Suscripción'),
                  OutlinedButton(
                    onPressed: () => launchUrl(
                      Uri.parse('https://aliis.app/portal'),
                      mode: LaunchMode.externalApplication),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                      side: const BorderSide(color: AliisColors.border),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12))),
                    child: Text('Gestionar suscripción',
                      style: GoogleFonts.inter(color: AliisColors.foreground)),
                  ),
                  const SizedBox(height: 24),
                ],

                OutlinedButton(
                  onPressed: () => ref.read(authProvider).signOut(),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 48),
                    side: const BorderSide(color: AliisColors.border),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12))),
                  child: Text('Cerrar sesión',
                    style: GoogleFonts.inter(color: AliisColors.foreground)),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader(this.title);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Text(title,
      style: GoogleFonts.inter(
        fontSize: 11, fontWeight: FontWeight.w600,
        color: AliisColors.mutedForeground,
        letterSpacing: 0.5,
        decoration: TextDecoration.none)),
  );
}
