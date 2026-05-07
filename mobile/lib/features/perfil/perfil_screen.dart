import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';
import '../auth/auth_provider.dart';
import 'perfil_provider.dart';

// Border and divider color from Figma spec — distinct from AliisColors.border (#F0F0F0)
const _kBorderColor = Color(0xFFF3F4F6);
const _kDangerColor = Color(0xFFE55A36);
const _kProBadgeColor = Color(0xFF1B6B54);

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
            error: (e, _) => ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                const SizedBox(height: 200),
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Error cargando perfil',
                        style: GoogleFonts.inter(color: AliisColors.mutedFg),
                      ),
                      const SizedBox(height: 12),
                      TextButton(
                        onPressed: () => ref.invalidate(perfilProvider),
                        child: const Text('Reintentar'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            data: (data) => _PerfilContent(data: data),
          ),
        ),
      ),
    );
  }
}

class _PerfilContent extends ConsumerWidget {
  final PerfilData data;
  const _PerfilContent({required this.data});

  String get _heading {
    if (data.name != null && data.name!.isNotEmpty) {
      return '${data.name}.';
    }
    return 'Mi perfil.';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      children: [
        // Eyebrow label
        Text(
          '· Tu cuenta ·',
          style: GoogleFonts.inter(
            fontSize: 10,
            letterSpacing: 1.5,
            color: AliisColors.mutedFg,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),

        // Heading — Playfair Display
        Text(
          _heading,
          style: GoogleFonts.playfairDisplay(
            fontSize: 28,
            fontWeight: FontWeight.w400,
            color: AliisColors.foreground,
            height: 1.15,
          ),
        ),
        const SizedBox(height: 20),

        // Plan card
        _PlanCard(plan: data.plan),
        const SizedBox(height: 20),

        // Información médica section
        _SectionLabel('Información médica'),
        const SizedBox(height: 6),
        _Section(children: [
          _SectionRow(
            label: 'Diagnósticos activos',
            value: '—',
            onTap: () {},
          ),
          _SectionRow(
            label: 'Alergias',
            value: '—',
            onTap: () {},
          ),
          _SectionRow(
            label: 'Próxima cita',
            value: data.nextAppointment ?? '—',
            isLast: true,
            onTap: () {},
          ),
        ]),
        const SizedBox(height: 20),

        // Privacidad section
        _SectionLabel('Privacidad'),
        const SizedBox(height: 6),
        _Section(children: [
          _SectionRow(
            label: 'Anonimizar nombres en fotos',
            value: 'Activado',
            onTap: () {},
          ),
          _SectionRow(
            label: 'Borrar cuenta y datos',
            danger: true,
            isLast: true,
            onTap: () => _showDeleteAccountDialog(context),
          ),
        ]),
        const SizedBox(height: 20),

        // Aliis settings section
        _SectionLabel('Aliis'),
        const SizedBox(height: 6),
        _Section(children: [
          _SectionRow(
            label: 'Idioma',
            value: 'Español',
            onTap: () {},
          ),
          _SectionRow(
            label: 'Recordatorios',
            value: 'Activos',
            onTap: () {},
          ),
          _SectionRow(
            label: 'Modo oscuro',
            value: 'Sistema',
            onTap: () {},
          ),
          _SectionRow(
            label: 'Glosario médico',
            isLast: true,
            onTap: () {},
          ),
        ]),
        const SizedBox(height: 28),

        // Cerrar sesión
        GestureDetector(
          onTap: () async {
            await ref.read(authProvider).signOut();
            if (context.mounted) context.go('/login');
          },
          child: Center(
            child: Text(
              'Cerrar sesión',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: AliisColors.mutedFg,
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Footer
        Center(
          child: Text(
            'Aliis · No somos médicos. Somos el puente.',
            style: GoogleFonts.inter(
              fontSize: 11,
              color: _kBorderColor,
            ),
          ),
        ),
      ],
    );
  }

  void _showDeleteAccountDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          'Borrar cuenta',
          style: GoogleFonts.playfairDisplay(fontSize: 20),
        ),
        content: Text(
          'Esta acción es irreversible. Se eliminarán todos tus datos médicos, registros y tratamientos.',
          style: GoogleFonts.inter(fontSize: 13, color: AliisColors.mutedFg),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Borrar',
              style: GoogleFonts.inter(color: _kDangerColor),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Plan card ──────────────────────────────────────────────────────────────

class _PlanCard extends StatelessWidget {
  final String plan;
  const _PlanCard({required this.plan});

  @override
  Widget build(BuildContext context) {
    final isPro = plan == 'pro';
    return GestureDetector(
      onTap: () async {
        final url = Uri.parse('https://aliis.app/portal');
        await launchUrl(url, mode: LaunchMode.externalApplication);
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AliisColors.foreground, // #272730
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: _kProBadgeColor,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    isPro ? 'ALIIS PRO' : 'PLAN GRATUITO',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      letterSpacing: 1.5,
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const Icon(Icons.chevron_right, color: Colors.white54, size: 18),
              ],
            ),
            const SizedBox(height: 10),
            if (isPro) ...[
              Text(
                '€9.99',
                style: GoogleFonts.inter(
                  fontSize: 22,
                  fontWeight: FontWeight.w500,
                  color: Colors.white,
                ),
              ),
              Text(
                'al mes',
                style: GoogleFonts.inter(fontSize: 12, color: Colors.white54),
              ),
              const SizedBox(height: 8),
              Text(
                'Próxima factura: —',
                style: GoogleFonts.inter(fontSize: 11, color: Colors.white38),
              ),
            ] else ...[
              Text(
                'Actualiza a Pro',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Chat con IA, análisis avanzado y más →',
                style: GoogleFonts.inter(fontSize: 12, color: Colors.white54),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── Section components ──────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text.toUpperCase(),
      style: GoogleFonts.inter(
        fontSize: 10,
        letterSpacing: 1.5,
        color: AliisColors.mutedFg,
        fontWeight: FontWeight.w500,
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final List<Widget> children;
  const _Section({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: _kBorderColor),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(children: children),
      ),
    );
  }
}

/// Unified row widget for all section rows.
/// - [value]: optional right-side label (muted). Omitted for danger rows.
/// - [danger]: renders [label] in danger red, no chevron, no value.
/// - [isLast]: suppresses the bottom divider.
/// - [onTap]: callback for the entire row.
class _SectionRow extends StatelessWidget {
  final String label;
  final String? value;
  final bool danger;
  final bool isLast;
  final VoidCallback? onTap;

  const _SectionRow({
    required this.label,
    this.value,
    this.danger = false,
    this.isLast = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  label,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: danger ? _kDangerColor : AliisColors.foreground,
                  ),
                ),
                if (!danger)
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (value != null)
                        Text(
                          value!,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AliisColors.mutedFg,
                          ),
                        ),
                      const SizedBox(width: 4),
                      const Icon(
                        Icons.chevron_right,
                        size: 16,
                        color: _kBorderColor,
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ),
        if (!isLast)
          const Divider(height: 1, thickness: 1, color: _kBorderColor),
      ],
    );
  }
}
