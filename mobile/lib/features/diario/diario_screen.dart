import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../shared/models/symptom_log.dart';
import '../../shared/widgets/serif_heading.dart';
import '../../shared/widgets/list_item.dart';
import 'diario_provider.dart';

class DiarioScreen extends ConsumerWidget {
  const DiarioScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historialAsync = ref.watch(diarioHistorialProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(diarioHistorialProvider),
          child: CustomScrollView(
            slivers: [
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                sliver: SliverToBoxAdapter(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Expanded(
                        child: SerifHeading(
                          eyebrow: 'MI DIARIO',
                          heading: 'Registros',
                        ),
                      ),
                      GestureDetector(
                        onTap: () => context.push('/expediente/registro'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: AliisColors.foreground,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text('+ Nuevo',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            )),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
              historialAsync.when(
                loading: () => const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator())),
                error: (e, _) => const SliverFillRemaining(
                  child: Center(child: Text('Error cargando historial'))),
                data: (logs) => logs.isEmpty
                  ? SliverFillRemaining(
                      child: Center(
                        child: Text('Sin registros aún',
                          style: GoogleFonts.inter(
                            color: AliisColors.mutedFg))))
                  : SliverPadding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (ctx, i) => _RegistroItem(log: logs[i]),
                          childCount: logs.length,
                        ),
                      ),
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RegistroItem extends StatelessWidget {
  final SymptomLog log;
  const _RegistroItem({required this.log});

  @override
  Widget build(BuildContext context) {
    final fecha = DateFormat('EEE d MMM · HH:mm', 'es').format(log.loggedAt);
    final vitalesStr = [
      if (log.glucose != null) 'Glucosa: ${log.glucose} mg/dL',
      if (log.bpSystolic != null) 'TA: ${log.bpSystolic}/${log.bpDiastolic}',
      if (log.heartRate != null) 'FC: ${log.heartRate} lpm',
    ].join(' · ');

    return ListItem(
      title: fecha,
      subtitle: vitalesStr.isNotEmpty ? vitalesStr : log.note,
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: AliisColors.border,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          log.note != null && log.note!.isNotEmpty ? 'Completo' : 'Parcial',
          style: GoogleFonts.inter(
            fontSize: 9,
            color: AliisColors.mutedFg,
            fontWeight: FontWeight.w600,
          )),
      ),
    );
  }
}
