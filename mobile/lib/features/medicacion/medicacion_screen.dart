import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../shared/widgets/serif_heading.dart';
import '../../shared/widgets/adherence_bar.dart';
import 'medicacion_provider.dart';
import 'widgets/med_check_row.dart';

class MedicacionScreen extends ConsumerWidget {
  const MedicacionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final medAsync = ref.watch(medicacionProvider);
    final fecha = DateFormat("d 'de' MMMM", 'es').format(DateTime.now()).toUpperCase();

    return Scaffold(
      body: SafeArea(
        // Fix 6 — when() restructured so RefreshIndicator only wraps scrollable data
        child: medAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          // Fix 6 — error state with retry button (not wrapped in RefreshIndicator)
          error: (e, _) => Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Error al cargar medicamentos'),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => ref.invalidate(medicacionProvider),
                  child: const Text('Reintentar'),
                ),
              ],
            ),
          ),
          // Fix 6 — RefreshIndicator moved inside data branch
          data: (data) => RefreshIndicator(
            onRefresh: () async => ref.invalidate(medicacionProvider),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
              children: [
                SerifHeading(
                  eyebrow: fecha,
                  heading: 'Medicación',
                ),
                const SizedBox(height: 20),
                AdherenceBar(
                  label: 'Adherencia de hoy',
                  percent: data.percent,
                  sublabel: '${data.tomadosHoy} de ${data.totalHoy} tomas registradas',
                ),
                const SizedBox(height: 24),
                if (data.manana.isNotEmpty) ...[
                  // Fix 3 — hora comes from Turno.displayHora (single source of truth)
                  _TurnoHeader(label: 'Mañana', hora: Turno.manana.displayHora),
                  ...data.manana.map((item) => MedCheckRow(
                    item: item,
                    // Fix 1 — lambda returns Future<void> directly
                    onToggle: () => toggleMedicacion(item.treatment.name, !item.tomado, ref),
                  )),
                  const SizedBox(height: 20),
                ],
                if (data.tarde.isNotEmpty) ...[
                  _TurnoHeader(label: 'Tarde', hora: Turno.tarde.displayHora),
                  ...data.tarde.map((item) => MedCheckRow(
                    item: item,
                    onToggle: () => toggleMedicacion(item.treatment.name, !item.tomado, ref),
                  )),
                  const SizedBox(height: 20),
                ],
                if (data.noche.isNotEmpty) ...[
                  _TurnoHeader(label: 'Noche', hora: Turno.noche.displayHora),
                  ...data.noche.map((item) => MedCheckRow(
                    item: item,
                    onToggle: () => toggleMedicacion(item.treatment.name, !item.tomado, ref),
                  )),
                  const SizedBox(height: 20),
                ],
                if (data.items.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 40),
                      child: Text('Sin tratamientos activos',
                        style: GoogleFonts.inter(color: AliisColors.mutedFg)),
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

class _TurnoHeader extends StatelessWidget {
  final String label;
  final String hora;
  const _TurnoHeader({required this.label, required this.hora});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text('${label.toUpperCase()} · $hora',
        style: GoogleFonts.robotoMono(
          fontSize: 9,
          color: AliisColors.mutedFg,
          letterSpacing: 1.5,
        )),
    );
  }
}
