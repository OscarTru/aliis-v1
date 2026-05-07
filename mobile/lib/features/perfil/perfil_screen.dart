import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';
import '../../shared/widgets/serif_heading.dart';
import '../../shared/widgets/list_item.dart';
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
                style: GoogleFonts.inter(color: AliisColors.mutedFg))),
            data: (data) => ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
              children: [
                // Header
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: SerifHeading(
                        eyebrow: 'MI CUENTA',
                        heading: data.name ?? 'Tu perfil',
                      ),
                    ),
                    if (data.plan == 'pro')
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AliisColors.deepTeal,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text('PRO',
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            letterSpacing: 1,
                          )),
                      ),
                  ],
                ),
                const SizedBox(height: 24),

                // Tratamientos
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('TRATAMIENTOS ACTIVOS',
                      style: GoogleFonts.robotoMono(
                        fontSize: 9,
                        color: AliisColors.mutedFg,
                        letterSpacing: 1.5,
                      )),
                    GestureDetector(
                      onTap: () => showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor:
                            Theme.of(context).scaffoldBackgroundColor,
                        shape: const RoundedRectangleBorder(
                          borderRadius: BorderRadius.vertical(
                            top: Radius.circular(20))),
                        builder: (_) => const TratamientoForm(),
                      ),
                      child: Text('+ Añadir',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AliisColors.primary,
                          fontWeight: FontWeight.w500,
                        )),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (data.treatments.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Text('Sin tratamientos activos',
                      style: GoogleFonts.inter(
                        color: AliisColors.mutedFg, fontSize: 13)),
                  )
                else
                  ...data.treatments.map((t) => TratamientoTile(treatment: t)),
                const SizedBox(height: 24),

                // Cuenta
                Text('CUENTA',
                  style: GoogleFonts.robotoMono(
                    fontSize: 9,
                    color: AliisColors.mutedFg,
                    letterSpacing: 1.5,
                  )),
                const SizedBox(height: 8),

                if (data.plan == 'pro')
                  ListItem(
                    title: 'Plan Pro',
                    subtitle: 'Gestionar suscripción',
                    trailing: const Icon(Icons.chevron_right,
                      color: AliisColors.mutedFg, size: 18),
                    onTap: () => launchUrl(
                      Uri.parse('https://aliis.app/portal'),
                      mode: LaunchMode.externalApplication),
                  ),

                ListItem(
                  title: 'Exportar datos',
                  subtitle: 'Descargar historial (GDPR)',
                  trailing: const Icon(Icons.download_outlined,
                    color: AliisColors.mutedFg, size: 18),
                  onTap: () {},
                ),

                ListItem(
                  title: 'Cerrar sesión',
                  trailing: const Icon(Icons.logout,
                    color: AliisColors.destructive, size: 18),
                  onTap: () => ref.read(authProvider).signOut(),
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
