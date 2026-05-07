import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../alertas/alertas_provider.dart';
import 'home_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeAsync = ref.watch(homeProvider);
    final alertasAsync = ref.watch(alertasProvider);
    final now = DateTime.now();
    final greeting = _greeting(now.hour);
    final alertCount = alertasAsync.valueOrNull?.where((n) => !n.read).length ?? 0;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(homeProvider);
            ref.invalidate(alertasProvider);
          },
          child: homeAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                const SizedBox(height: 200),
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Error cargando datos',
                          style: GoogleFonts.inter(color: AliisColors.mutedFg)),
                      const SizedBox(height: 12),
                      TextButton(
                        onPressed: () => ref.invalidate(homeProvider),
                        child: const Text('Reintentar'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            data: (data) => ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
              children: [
                // ── Greeting row ──────────────────────────────────────────
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(greeting.toUpperCase(),
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                color: AliisColors.mutedFg,
                                letterSpacing: 1.8,
                                fontWeight: FontWeight.w500,
                              )),
                          const SizedBox(height: 2),
                          Text(
                            data.userName ?? 'Bienvenido',
                            style: GoogleFonts.playfairDisplay(
                              fontSize: 26,
                              fontWeight: FontWeight.w400,
                              fontStyle: FontStyle.italic,
                              color: AliisColors.foreground,
                              height: 1.15,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Bell + Avatar row
                    Row(
                      children: [
                        if (alertCount > 0)
                          GestureDetector(
                            onTap: () => context.go('/alertas'),
                            child: Stack(
                              children: [
                                Icon(Icons.notifications_none_rounded,
                                    size: 24, color: AliisColors.foreground),
                                Positioned(
                                  right: 0,
                                  top: 0,
                                  child: Container(
                                    width: 8,
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      color: AliisColors.primary,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        if (alertCount > 0) const SizedBox(width: 12),
                        _Avatar(name: data.userName),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // ── Cita próxima ──────────────────────────────────────────
                if (data.nextAppointment != null) ...[
                  _AppointmentCard(appointment: data.nextAppointment!),
                  const SizedBox(height: 16),
                ],

                // ── Señal Aliis del día ───────────────────────────────────
                if (data.alertBody != null) ...[
                  _AliisSignalCard(body: data.alertBody!),
                  const SizedBox(height: 16),
                ],

                // ── Continuar leyendo (placeholder) ──────────────────────
                if (data.treatments.isNotEmpty) ...[
                  _SectionLabel('CONTINUAR LEYENDO'),
                  const SizedBox(height: 10),
                  _PackContinueCard(userName: data.userName),
                  const SizedBox(height: 20),
                ],

                // ── Quick actions ─────────────────────────────────────────
                _SectionLabel('EMPEZAR ALGO NUEVO'),
                const SizedBox(height: 10),
                _QuickActionsGrid(),
                const SizedBox(height: 20),

                // ── Esta semana ───────────────────────────────────────────
                _SectionLabel('ESTA SEMANA'),
                const SizedBox(height: 10),
                _WeekShortcut(
                  emoji: '📝',
                  emojiBackground: const Color(0xFFF0FAF6),
                  title: 'Diario de hoy',
                  subtitle: '¿Cómo te sientes?',
                  onTap: () => context.push('/expediente/registro'),
                ),
                const SizedBox(height: 8),
                _WeekShortcut(
                  emoji: '💊',
                  emojiBackground: const Color(0xFFFFF8F0),
                  title: 'Medicación',
                  subtitle: data.treatments.isEmpty
                      ? 'Sin tratamientos registrados'
                      : '${data.takenToday.length} de ${data.treatments.length} tomas hoy',
                  onTap: () => context.go('/medicacion'),
                ),

                // ── Stats strip ───────────────────────────────────────────
                const SizedBox(height: 24),
                _StatsStrip(data: data),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _greeting(int hour) {
    if (hour < 12) return 'Buenos días,';
    if (hour < 19) return 'Buenas tardes,';
    return 'Buenas noches,';
  }
}

// ── Avatar ────────────────────────────────────────────────────────────────────

class _Avatar extends StatelessWidget {
  final String? name;
  const _Avatar({this.name});

  @override
  Widget build(BuildContext context) {
    final initial = (name?.isNotEmpty == true) ? name![0].toUpperCase() : 'A';
    return Container(
      width: 40,
      height: 40,
      decoration: const BoxDecoration(
        color: AliisColors.deepTeal,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(initial,
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            )),
      ),
    );
  }
}

// ── Section label ─────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(text,
        style: GoogleFonts.inter(
          fontSize: 10,
          color: AliisColors.mutedFg,
          letterSpacing: 1.8,
          fontWeight: FontWeight.w500,
        ));
  }
}

// ── Appointment card ──────────────────────────────────────────────────────────

class _AppointmentCard extends StatelessWidget {
  final String appointment;
  const _AppointmentCard({required this.appointment});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FBF9),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFD1E8DF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('CITA PRÓXIMA',
              style: GoogleFonts.inter(
                fontSize: 10,
                color: AliisColors.deepTeal,
                letterSpacing: 1.8,
                fontWeight: FontWeight.w500,
              )),
          const SizedBox(height: 6),
          RichText(
            text: TextSpan(
              style: GoogleFonts.playfairDisplay(
                fontSize: 18,
                fontWeight: FontWeight.w400,
                color: AliisColors.foreground,
                height: 1.3,
              ),
              children: [
                const TextSpan(text: 'Tu próxima cita: '),
                TextSpan(
                  text: appointment,
                  style: TextStyle(
                    fontStyle: FontStyle.italic,
                    color: AliisColors.deepTeal,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Container(
            height: 1,
            color: const Color(0xFFD1E8DF),
          ),
          const SizedBox(height: 10),
          Text('Aliis preparará preguntas para llevarte.',
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AliisColors.mutedFg,
                height: 1.4,
              )),
        ],
      ),
    );
  }
}

// ── Aliis signal card ─────────────────────────────────────────────────────────

class _AliisSignalCard extends StatelessWidget {
  final String body;
  const _AliisSignalCard({required this.body});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AliisColors.foreground,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('✦',
                  style: GoogleFonts.inter(
                      fontSize: 12, color: AliisColors.primary)),
              const SizedBox(width: 6),
              Text('SEÑAL ALIIS',
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    color: AliisColors.primary,
                    letterSpacing: 1.8,
                    fontWeight: FontWeight.w500,
                  )),
            ],
          ),
          const SizedBox(height: 8),
          Text(body,
              style: GoogleFonts.inter(
                fontSize: 13,
                color: Colors.white,
                height: 1.5,
              )),
        ],
      ),
    );
  }
}

// ── Pack continue card ────────────────────────────────────────────────────────

class _PackContinueCard extends StatelessWidget {
  final String? userName;
  const _PackContinueCard({this.userName});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go('/packs'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AliisColors.foreground,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('TU BIBLIOTECA · PACKS',
                style: GoogleFonts.inter(
                  fontSize: 10,
                  color: const Color(0xFF888888),
                  letterSpacing: 1.8,
                )),
            const SizedBox(height: 8),
            RichText(
              text: TextSpan(
                style: GoogleFonts.playfairDisplay(
                  fontSize: 17,
                  fontWeight: FontWeight.w400,
                  color: Colors.white,
                  height: 1.3,
                ),
                children: [
                  const TextSpan(text: 'Explora tus diagnósticos, '),
                  TextSpan(
                    text: userName != null ? 'para ${userName!.split(' ').first}' : 'para ti',
                    style: TextStyle(
                      fontStyle: FontStyle.italic,
                      color: AliisColors.primary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: 0.36,
                      backgroundColor: const Color(0xFF3A3A45),
                      valueColor: AlwaysStoppedAnimation<Color>(AliisColors.primary),
                      minHeight: 4,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text('Ver packs →',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: const Color(0xFF888888),
                    )),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Quick actions grid ────────────────────────────────────────────────────────

class _QuickActionsGrid extends StatelessWidget {
  const _QuickActionsGrid();

  @override
  Widget build(BuildContext context) {
    final actions = [
      (Icons.camera_alt_outlined, 'Foto de receta', '/expediente/registro'),
      (Icons.edit_note_outlined, 'Registrar síntomas', '/expediente/registro'),
      (Icons.medication_outlined, 'Ver medicación', '/medicacion'),
      (Icons.library_books_outlined, 'Ver packs', '/packs'),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.4,
      children: actions.map((a) {
        final (icon, label, route) = a;
        return GestureDetector(
          onTap: () => context.go(route),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, size: 20, color: AliisColors.foreground),
                Text(label,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AliisColors.foreground,
                    )),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ── Week shortcut ─────────────────────────────────────────────────────────────

class _WeekShortcut extends StatelessWidget {
  final String emoji;
  final Color emojiBackground;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _WeekShortcut({
    required this.emoji,
    required this.emojiBackground,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border.all(color: AliisColors.border),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: emojiBackground,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(emoji, style: const TextStyle(fontSize: 16)),
              ),
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
                  Text(subtitle,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AliisColors.mutedFg,
                      )),
                ],
              ),
            ),
            const Icon(Icons.chevron_right,
                size: 18, color: AliisColors.border),
          ],
        ),
      ),
    );
  }
}

// ── Stats strip ───────────────────────────────────────────────────────────────

class _StatsStrip extends StatelessWidget {
  final HomeData data;
  const _StatsStrip({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AliisColors.border)),
      ),
      child: Row(
        children: [
          _StatCell(
            label: 'Días registrados',
            value: '${data.diasRegistrados30d}',
            unit: '/30d',
          ),
          Container(width: 1, height: 40, color: AliisColors.border),
          _StatCell(
            label: 'Adherencia 14d',
            value: '${data.adherencia14d}',
            unit: '%',
          ),
        ],
      ),
    );
  }
}

class _StatCell extends StatelessWidget {
  final String label;
  final String value;
  final String unit;
  const _StatCell(
      {required this.label, required this.value, required this.unit});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: GoogleFonts.inter(
                    fontSize: 10, color: AliisColors.mutedFg)),
            const SizedBox(height: 4),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(value,
                    style: GoogleFonts.inter(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AliisColors.foreground,
                    )),
                const SizedBox(width: 2),
                Text(unit,
                    style: GoogleFonts.inter(
                        fontSize: 11, color: AliisColors.mutedFg)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
