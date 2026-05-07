import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../shared/widgets/serif_heading.dart';
import '../../shared/widgets/bell_badge.dart';
import '../../shared/widgets/aliis_signal_card.dart';
import '../../shared/widgets/alert_row.dart';
import '../../shared/widgets/adherence_bar.dart';
import '../../shared/widgets/list_item.dart';
import '../alertas/alertas_provider.dart';
import 'home_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeAsync = ref.watch(homeProvider);
    final alertasAsync = ref.watch(alertasProvider);
    final now = DateTime.now();
    final fecha = DateFormat("EEEE d 'de' MMMM", 'es').format(now).toUpperCase();
    final greeting = _greeting(now.hour);

    final alertCount = alertasAsync.valueOrNull
        ?.where((n) => !n.read).length ?? 0;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(homeProvider);
            ref.invalidate(alertasProvider);
          },
          child: homeAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(
              child: Text('Error cargando datos',
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
                        eyebrow: fecha,
                        heading: data.userName != null
                            ? '$greeting, ${data.userName}'
                            : greeting,
                      ),
                    ),
                    const SizedBox(width: 12),
                    BellBadge(
                      count: alertCount,
                      onTap: () => context.push('/alertas'),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // 1. Señal Aliis del día
                if (data.alertBody != null) ...[
                  AliisSignalCard(body: data.alertBody!),
                  const SizedBox(height: 20),
                ],

                // 2. Adherencia hoy
                if (data.treatments.isNotEmpty) ...[
                  AdherenceBar(
                    label: 'Adherencia hoy',
                    percent: data.adherencia14d,
                    sublabel: data.treatments
                            .where((t) => !data.takenToday.contains(t.name))
                            .map((t) => t.name)
                            .take(1)
                            .map((n) => 'Pendiente: $n')
                            .firstOrNull,
                  ),
                  const SizedBox(height: 20),
                ],

                // 3. Alertas/insights de Aliis
                if (data.insights.length > 1) ...[
                  Container(
                    decoration: const BoxDecoration(
                      border: Border(top: BorderSide(color: AliisColors.border)),
                    ),
                    child: Column(
                      children: data.insights.skip(1).map((ins) =>
                        AlertRow(title: ins, accentColor: AliisColors.primary)
                      ).toList(),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // 4. Vitales recientes — grid 2x2
                _VitalesSection(data: data),
                const SizedBox(height: 20),

                // 5. Próxima cita
                if (data.nextAppointment != null)
                  ListItem(
                    title: 'Próxima cita',
                    subtitle: data.nextAppointment,
                    trailing: Text('Preparar preguntas →',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AliisColors.primary,
                      )),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _greeting(int hour) {
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}

class _VitalesSection extends StatelessWidget {
  final HomeData data;
  const _VitalesSection({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AliisColors.border)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Text('VITALES RECIENTES',
              style: GoogleFonts.robotoMono(
                fontSize: 9,
                color: AliisColors.mutedFg,
                letterSpacing: 1.5,
              )),
          ),
          Row(
            children: [
              _VitalCell(
                label: 'Días registrados',
                value: '${data.diasRegistrados30d}',
                unit: '/30d',
              ),
              Container(width: 1, height: 48, color: AliisColors.border),
              _VitalCell(
                label: 'Adherencia 14d',
                value: '${data.adherencia14d}',
                unit: '%',
              ),
            ],
          ),
          const Divider(height: 1, color: AliisColors.border),
        ],
      ),
    );
  }
}

class _VitalCell extends StatelessWidget {
  final String label;
  final String value;
  final String unit;
  const _VitalCell({required this.label, required this.value, required this.unit});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
              style: GoogleFonts.inter(
                fontSize: 10,
                color: AliisColors.mutedFg,
              )),
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
                    fontSize: 11,
                    color: AliisColors.mutedFg,
                  )),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
