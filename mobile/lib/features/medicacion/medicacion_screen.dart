import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import 'medicacion_provider.dart';

class MedicacionScreen extends ConsumerWidget {
  const MedicacionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final medAsync = ref.watch(medicacionProvider);
    final fecha = DateFormat("EEEE d MMM", 'es').format(DateTime.now()).toUpperCase();

    return Scaffold(
      body: SafeArea(
        child: medAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Error al cargar medicamentos',
                  style: GoogleFonts.inter(color: AliisColors.mutedFg)),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => ref.invalidate(medicacionProvider),
                  child: const Text('Reintentar'),
                ),
              ],
            ),
          ),
          data: (data) => RefreshIndicator(
            onRefresh: () async => ref.invalidate(medicacionProvider),
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: _Header(fecha: fecha, data: data, ref: ref),
                ),
                if (data.items.isEmpty)
                  SliverToBoxAdapter(child: _EmptyState())
                else
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          // Group items by treatment name
                          final grouped = _groupByTreatment(data.items);
                          final entries = grouped.entries.toList();
                          if (index >= entries.length) return null;
                          final entry = entries[index];
                          final isLast = index == entries.length - 1;
                          return _MedCard(
                            treatmentName: entry.key,
                            items: entry.value,
                            ref: ref,
                            showDivider: !isLast,
                          );
                        },
                        childCount: _groupByTreatment(data.items).length,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Map<String, List<MedItem>> _groupByTreatment(List<MedItem> items) {
    final map = <String, List<MedItem>>{};
    for (final item in items) {
      map.putIfAbsent(item.treatment.name, () => []).add(item);
    }
    return map;
  }
}

class _Header extends StatelessWidget {
  final String fecha;
  final MedicacionData data;
  final WidgetRef ref;

  const _Header({required this.fecha, required this.data, required this.ref});

  @override
  Widget build(BuildContext context) {
    final total = data.totalHoy;
    final tomados = data.tomadosHoy;
    final allDone = total > 0 && tomados == total;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Top nav bar
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: AliisColors.border)),
          ),
          child: Row(
            children: [
              GestureDetector(
                onTap: () => context.go('/inicio'),
                child: const Icon(Icons.chevron_left, size: 24, color: AliisColors.foreground),
              ),
              const Expanded(
                child: Center(
                  child: Text('MEDICACIÓN',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 10,
                      letterSpacing: 1.5,
                      color: AliisColors.mutedFg,
                    )),
                ),
              ),
              GestureDetector(
                onTap: () => context.go('/perfil'),
                child: const Icon(Icons.add, size: 22, color: AliisColors.foreground),
              ),
            ],
          ),
        ),

        Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Fecha
              Text(fecha,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  letterSpacing: 1.2,
                  color: AliisColors.mutedFg,
                )),
              const SizedBox(height: 4),

              // Heading Playfair
              if (total > 0) ...[
                RichText(
                  text: TextSpan(
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 26,
                      fontWeight: FontWeight.w400,
                      color: AliisColors.foreground,
                      height: 1.2,
                    ),
                    children: [
                      const TextSpan(text: 'Hoy llevas '),
                      TextSpan(
                        text: '$tomados',
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 26,
                          fontWeight: FontWeight.w400,
                          color: AliisColors.deepTeal,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                      TextSpan(text: ' de $total tomas.'),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Progress bar — one segment per take
                Row(
                  children: List.generate(total, (i) => Expanded(
                    child: Container(
                      height: 6,
                      margin: EdgeInsets.only(right: i < total - 1 ? 4 : 0),
                      decoration: BoxDecoration(
                        color: i < tomados ? AliisColors.deepTeal : const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(99),
                      ),
                    ),
                  )),
                ),
                const SizedBox(height: 8),

                // Progress label
                Text(
                  allDone
                    ? 'Todas las tomas del día, ¡bien hecho!'
                    : 'Quedan ${total - tomados} toma${total - tomados == 1 ? "" : "s"}',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: allDone ? AliisColors.deepTeal : AliisColors.mutedFg,
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _MedCard extends StatelessWidget {
  final String treatmentName;
  final List<MedItem> items;
  final WidgetRef ref;
  final bool showDivider;

  const _MedCard({
    required this.treatmentName,
    required this.items,
    required this.ref,
    required this.showDivider,
  });

  @override
  Widget build(BuildContext context) {
    final dose = items.first.treatment.dose ?? '';
    return Padding(
      padding: const EdgeInsets.only(top: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Med name + dose
          RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: treatmentName,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: AliisColors.foreground,
                  ),
                ),
                if (dose.isNotEmpty)
                  TextSpan(
                    text: '  $dose',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w400,
                      color: AliisColors.mutedFg,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Toma rows
          ...items.map((item) => _TomaRow(item: item, ref: ref)),

          if (showDivider) ...[
            const SizedBox(height: 20),
            const Divider(height: 1, color: Color(0xFFF3F4F6)),
          ],
        ],
      ),
    );
  }
}

class _TomaRow extends StatefulWidget {
  final MedItem item;
  final WidgetRef ref;
  const _TomaRow({required this.item, required this.ref});

  @override
  State<_TomaRow> createState() => _TomaRowState();
}

class _TomaRowState extends State<_TomaRow> {
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    final tomado = widget.item.tomado;
    final turno = widget.item.turno;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: tomado ? const Color(0xFFF0FAF5) : const Color(0xFFF8F8F8),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: tomado ? const Color(0xFFD1E8DF) : Colors.transparent,
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    turno.displayHora,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AliisColors.foreground,
                    ),
                  ),
                  Text(
                    turno.label,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AliisColors.mutedFg,
                    ),
                  ),
                ],
              ),
            ),
            GestureDetector(
              onTap: _loading ? null : () async {
                setState(() => _loading = true);
                try {
                  await toggleMedicacion(
                    widget.item.treatment.name,
                    !tomado,
                    widget.ref,
                  );
                } catch (_) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Error al guardar. Intenta de nuevo.')),
                    );
                  }
                } finally {
                  if (mounted) setState(() => _loading = false);
                }
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: tomado ? AliisColors.deepTeal : const Color(0xFFE5E7EB),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: _loading
                  ? const Center(
                      child: SizedBox(
                        width: 16, height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      ),
                    )
                  : Icon(
                      tomado ? Icons.check : Icons.check,
                      size: 16,
                      color: tomado ? Colors.white : AliisColors.mutedFg,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 32, 20, 40),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          border: Border.all(color: AliisColors.border),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            const Icon(Icons.medication_outlined, size: 36, color: AliisColors.mutedFg),
            const SizedBox(height: 12),
            Text('Sin medicamentos registrados',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AliisColors.foreground,
              )),
            const SizedBox(height: 6),
            Text(
              'Agrega tus tratamientos en Perfil para hacer seguimiento de tus tomas.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AliisColors.mutedFg,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            GestureDetector(
              onTap: () => context.go('/perfil'),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: AliisColors.foreground,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('Agregar medicamento',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  )),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
