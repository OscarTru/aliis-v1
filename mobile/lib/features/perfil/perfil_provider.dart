import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/supabase_client.dart';
import '../../shared/models/treatment.dart';
import '../auth/auth_provider.dart';

class PerfilData {
  final String? name;
  final String plan;
  final String? nextAppointment;
  final List<Treatment> treatments;

  const PerfilData({
    this.name,
    required this.plan,
    this.nextAppointment,
    required this.treatments,
  });
}

final perfilProvider = FutureProvider.autoDispose<PerfilData>((ref) async {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return PerfilData(plan: 'free', treatments: []);

  final userId = session.user.id;
  final results = await Future.wait([
    supabase.from('profiles')
      .select('name, plan, next_appointment')
      .eq('id', userId)
      .maybeSingle(),
    supabase.from('treatments')
      .select()
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', ascending: true),
  ]);

  final profile = results[0] as Map<String, dynamic>?;
  final treatments = (results[1] as List)
    .map((r) => Treatment.fromJson(r as Map<String, dynamic>))
    .toList();

  return PerfilData(
    name: profile?['name'] as String?,
    plan: profile?['plan'] as String? ?? 'free',
    nextAppointment: profile?['next_appointment'] as String?,
    treatments: treatments,
  );
});

Future<void> archivarTratamiento(String treatmentId, WidgetRef ref) async {
  await supabase.from('treatments')
    .update({'active': false, 'updated_at': DateTime.now().toIso8601String()})
    .eq('id', treatmentId);
  ref.invalidate(perfilProvider);
}
