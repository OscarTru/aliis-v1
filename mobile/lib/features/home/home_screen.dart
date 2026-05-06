import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import 'home_provider.dart';
import 'widgets/adherencia_card.dart';
import 'widgets/alerta_banner.dart';
import 'widgets/celebracion_card.dart';
import 'widgets/metricas_grid.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeAsync = ref.watch(homeProvider);
    final now = DateTime.now();
    final fecha = DateFormat("EEEE d 'de' MMMM", 'es').format(now);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(homeProvider),
          child: homeAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(
              child: Text('Error cargando datos',
                style: GoogleFonts.inter(color: AliisColors.mutedForeground))),
            data: (data) => ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text(fecha,
                  style: GoogleFonts.inter(
                    fontSize: 12, color: AliisColors.mutedForeground)),
                const SizedBox(height: 4),
                Text(
                  data.userName != null
                    ? 'Buenos días, ${data.userName}.'
                    : 'Lo que te toca hoy.',
                  style: Theme.of(context).textTheme.displayLarge),
                const SizedBox(height: 20),
                if (data.hasActiveAlert && data.alertBody != null) ...[
                  AlertaBanner(
                    body: data.alertBody!,
                    onTap: () => context.go('/alertas'),
                  ),
                  const SizedBox(height: 12),
                ],
                if (data.allTakenToday)
                  CelebracionCard(adherencia14d: data.adherencia14d)
                else if (data.treatments.isNotEmpty)
                  AdherenciaCard(
                    treatments: data.treatments,
                    takenToday: data.takenToday,
                  ),
                const SizedBox(height: 12),
                MetricasGrid(
                  adherencia14d: data.adherencia14d,
                  diasRegistrados30d: data.diasRegistrados30d,
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () => context.push('/diario/registro'),
                  icon: const Icon(Icons.add, size: 18),
                  label: Text('Registrar síntomas',
                    style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                  style: FilledButton.styleFrom(
                    backgroundColor: AliisColors.primary,
                    minimumSize: const Size(double.infinity, 48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
