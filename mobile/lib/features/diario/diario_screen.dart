import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../shared/models/symptom_log.dart';
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Tu diario.',
                        style: Theme.of(context).textTheme.displayLarge),
                      const SizedBox(height: 16),
                      FilledButton.icon(
                        onPressed: () => context.push('/diario/registro'),
                        icon: const Icon(Icons.add, size: 18),
                        label: Text('Registrar hoy',
                          style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                        style: FilledButton.styleFrom(
                          backgroundColor: AliisColors.primary,
                          minimumSize: const Size(double.infinity, 48),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12))),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
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
                            color: AliisColors.mutedForeground))))
                  : SliverPadding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (ctx, i) => _RegistroCard(log: logs[i]),
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

class _RegistroCard extends StatelessWidget {
  final SymptomLog log;
  const _RegistroCard({required this.log});

  @override
  Widget build(BuildContext context) {
    final fecha = DateFormat('EEE d MMM · HH:mm', 'es').format(log.loggedAt);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AliisColors.muted,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AliisColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(fecha,
            style: GoogleFonts.inter(
              fontSize: 11, color: AliisColors.mutedForeground)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8, runSpacing: 4,
            children: [
              if (log.glucose != null) _chip('Glucosa: ${log.glucose} mg/dL'),
              if (log.bpSystolic != null)
                _chip('TA: ${log.bpSystolic}/${log.bpDiastolic} mmHg'),
              if (log.heartRate != null) _chip('FC: ${log.heartRate} lpm'),
              if (log.temperature != null) _chip('Temp: ${log.temperature}°C'),
            ],
          ),
          if (log.note != null && log.note!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(log.note!,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.inter(
                fontSize: 12, color: AliisColors.foreground)),
          ],
        ],
      ),
    );
  }

  Widget _chip(String label) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: AliisColors.border,
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(label,
      style: GoogleFonts.inter(fontSize: 10, color: AliisColors.foreground)),
  );
}
