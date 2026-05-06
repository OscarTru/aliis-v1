import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/supabase_client.dart';
import '../../shared/models/symptom_log.dart';
import '../auth/auth_provider.dart';
import 'diario_steps.dart';

final diarioStepsProvider = FutureProvider.autoDispose<List<DiarioStep>>((ref) async {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return buildStepsForConditions([]);

  final res = await supabase
    .from('medical_profiles')
    .select('condiciones_previas')
    .eq('user_id', session.user.id)
    .maybeSingle();

  final condiciones = res != null
    ? List<String>.from(res['condiciones_previas'] as List? ?? [])
    : <String>[];

  return buildStepsForConditions(condiciones);
});

final diarioHistorialProvider = FutureProvider.autoDispose<List<SymptomLog>>((ref) async {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return [];

  final since30 = DateTime.now()
    .subtract(const Duration(days: 30))
    .toIso8601String();

  final rows = await supabase
    .from('symptom_logs')
    .select()
    .eq('user_id', session.user.id)
    .gte('logged_at', since30)
    .order('logged_at', ascending: false)
    .limit(30);

  return (rows as List)
    .map((r) => SymptomLog.fromJson(r as Map<String, dynamic>))
    .toList();
});

Future<void> guardarRegistro(String userId, Map<String, dynamic> values) async {
  final bp = values['bp'] as Map?;
  await supabase.from('symptom_logs').insert({
    'user_id': userId,
    'logged_at': DateTime.now().toIso8601String(),
    'glucose': values['glucose'],
    'bp_systolic': bp?['systolic'],
    'bp_diastolic': bp?['diastolic'],
    'heart_rate': values['heart_rate'],
    'temperature': values['temperature'],
    'note': values['nota'] as String?,
    'free_text': _buildFreeText(values),
  });
}

Map<String, dynamic> _buildFreeText(Map<String, dynamic> values) {
  const skip = {'glucose', 'bp', 'heart_rate', 'temperature', 'nota'};
  return Map.fromEntries(
    values.entries.where((e) => !skip.contains(e.key) && e.value != null));
}
