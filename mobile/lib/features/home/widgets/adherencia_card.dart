import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/supabase_client.dart';
import '../../../core/theme.dart';
import '../../../shared/models/treatment.dart';
import '../home_provider.dart';

class AdherenciaCard extends ConsumerWidget {
  final List<Treatment> treatments;
  final Set<String> takenToday;

  const AdherenciaCard({
    super.key,
    required this.treatments,
    required this.takenToday,
  });

  Future<void> _marcarTomado(WidgetRef ref, Treatment t) async {
    final today = DateTime.now().toIso8601String().substring(0, 10);
    await supabase.from('adherence_logs').upsert({
      'user_id': t.userId,
      'medication': t.name,
      'taken_date': today,
      'taken_at': DateTime.now().toIso8601String(),
      'status': 'taken',
    }, onConflict: 'user_id,medication,taken_date');
    ref.invalidate(homeProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AliisColors.muted,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AliisColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Medicamentos hoy',
            style: GoogleFonts.inter(
              fontSize: 10, fontWeight: FontWeight.w600,
              color: AliisColors.mutedForeground,
              letterSpacing: 0.5)),
          const SizedBox(height: 10),
          ...treatments.map((t) {
            final taken = takenToday.contains(t.name);
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: taken ? null : () => _marcarTomado(ref, t),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 22, height: 22,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: taken ? AliisColors.primary : Colors.transparent,
                        border: Border.all(
                          color: taken ? AliisColors.primary : AliisColors.border,
                          width: 2),
                      ),
                      child: taken
                          ? const Icon(Icons.check, size: 12, color: Colors.white)
                          : null,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(t.displayName,
                      style: GoogleFonts.inter(
                        fontSize: 13, color: AliisColors.foreground)),
                  ),
                  Text(
                    taken ? 'Tomado' : 'Pendiente',
                    style: GoogleFonts.inter(
                      fontSize: 11, fontWeight: FontWeight.w600,
                      color: taken ? AliisColors.emerald : AliisColors.amber),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
