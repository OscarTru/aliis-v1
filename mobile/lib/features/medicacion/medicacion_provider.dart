import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/supabase_client.dart';
import '../../shared/models/treatment.dart';
import '../auth/auth_provider.dart';

enum Turno { manana, tarde, noche }

extension TurnoLabel on Turno {
  String get label {
    switch (this) {
      case Turno.manana: return 'Mañana';
      case Turno.tarde:  return 'Tarde';
      case Turno.noche:  return 'Noche';
    }
  }

  int get hora {
    switch (this) {
      case Turno.manana: return 6;
      case Turno.tarde:  return 13;
      case Turno.noche:  return 20;
    }
  }

  // Fix 3 — single source of truth for display hours
  String get displayHora {
    switch (this) {
      case Turno.manana: return '8:00';
      case Turno.tarde:  return '14:00';
      case Turno.noche:  return '21:00';
    }
  }
}

class MedItem {
  final Treatment treatment;
  final Turno turno;
  final bool tomado;
  final DateTime? horaRegistro;

  const MedItem({
    required this.treatment,
    required this.turno,
    required this.tomado,
    this.horaRegistro,
  });
}

class MedicacionData {
  final List<MedItem> items;

  const MedicacionData({required this.items});

  int get totalHoy => items.length;
  int get tomadosHoy => items.where((i) => i.tomado).length;
  int get percent => totalHoy > 0 ? ((tomadosHoy / totalHoy) * 100).round() : 0;

  List<MedItem> get manana => items.where((i) => i.turno == Turno.manana).toList();
  List<MedItem> get tarde  => items.where((i) => i.turno == Turno.tarde).toList();
  List<MedItem> get noche  => items.where((i) => i.turno == Turno.noche).toList();
}

final medicacionProvider = FutureProvider.autoDispose<MedicacionData>((ref) async {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return const MedicacionData(items: []);

  final userId = session.user.id;
  final today = DateTime.now().toIso8601String().substring(0, 10);

  final results = await Future.wait<dynamic>([
    supabase.from('treatments')
        .select('id, user_id, name, dose, frequency_label, active, updated_at')
        .eq('user_id', userId)
        .eq('active', true) as Future<dynamic>,
    supabase.from('adherence_logs')
        .select('medication, status, taken_date, created_at')
        .eq('user_id', userId)
        .eq('taken_date', today) as Future<dynamic>,
  ]);

  final treatments = (results[0] as List)
      .map((r) => Treatment.fromJson(r as Map<String, dynamic>))
      .toList();
  final logs = results[1] as List<dynamic>;

  final takenMap = <String, DateTime?>{};
  for (final log in logs) {
    final l = log as Map<String, dynamic>;
    if (l['status'] == 'taken') {
      final raw = l['created_at'] as String?;
      takenMap[l['medication'] as String] =
          raw != null ? DateTime.tryParse(raw) : null;
    }
  }

  final items = <MedItem>[];
  for (final t in treatments) {
    final turno = _parseTurno(t.frequencyLabel);
    final tomado = takenMap.containsKey(t.name);
    items.add(MedItem(
      treatment: t,
      turno: turno,
      tomado: tomado,
      horaRegistro: tomado ? takenMap[t.name] : null,
    ));
  }

  return MedicacionData(items: items);
});

// Fix 2 — noche checked before tarde; 'pm' removed from tarde branch
Turno _parseTurno(String? frequencyLabel) {
  final lower = (frequencyLabel ?? '').toLowerCase();
  if (lower.contains('mañana') || lower.contains('manana') ||
      lower.contains('matutino') || lower.contains('8')) {
    return Turno.manana;
  }
  if (lower.contains('noche') || lower.contains('21') ||
      lower.contains('20') || lower.contains('9 pm')) {
    return Turno.noche;
  }
  if (lower.contains('tarde') || lower.contains('14') ||
      lower.contains('vespertino')) {
    return Turno.tarde;
  }
  return Turno.manana; // default
}

// Fix 4 — try/catch + rethrow; Fix 5 — null-guard currentUser
Future<void> toggleMedicacion(String medicationName, bool tomado, WidgetRef ref) async {
  final userId = supabase.auth.currentUser?.id;
  if (userId == null) return;

  final today = DateTime.now().toIso8601String().substring(0, 10);
  try {
    if (tomado) {
      await supabase.from('adherence_logs').upsert({
        'user_id': userId,
        'medication': medicationName,
        'taken_date': today,
        'status': 'taken',
        'created_at': DateTime.now().toIso8601String(),
      }, onConflict: 'user_id,medication,taken_date');
    } else {
      await supabase.from('adherence_logs')
          .delete()
          .eq('user_id', userId)
          .eq('medication', medicationName)
          .eq('taken_date', today);
    }
    ref.invalidate(medicacionProvider);
  } catch (e) {
    rethrow;
  }
}
