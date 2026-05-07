import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/supabase_client.dart';
import '../../shared/models/treatment.dart';
import '../auth/auth_provider.dart';

class HomeData {
  final String? userName;
  final String? nextAppointment;
  final List<Treatment> treatments;
  final Set<String> takenToday;
  final bool hasActiveAlert;
  final String? alertBody;
  final List<String> insights;
  final int adherencia14d;
  final int diasRegistrados30d;

  const HomeData({
    this.userName,
    this.nextAppointment,
    required this.treatments,
    required this.takenToday,
    required this.hasActiveAlert,
    this.alertBody,
    required this.insights,
    required this.adherencia14d,
    required this.diasRegistrados30d,
  });

  bool get allTakenToday =>
      treatments.isNotEmpty &&
      treatments.every((t) => takenToday.contains(t.name));
}

final homeProvider = FutureProvider.autoDispose<HomeData>((ref) async {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return const HomeData(
    treatments: [], takenToday: {}, hasActiveAlert: false,
    insights: [], adherencia14d: 0, diasRegistrados30d: 0,
  );

  final userId = session.user.id;
  final today = DateTime.now().toIso8601String().substring(0, 10);
  final since14 = DateTime.now().subtract(const Duration(days: 14))
      .toIso8601String().substring(0, 10);
  final since30 = DateTime.now().subtract(const Duration(days: 30))
      .toIso8601String();

  final results = await Future.wait<dynamic>([
    supabase.from('profiles')
        .select('name, next_appointment')
        .eq('id', userId)
        .maybeSingle() as Future<dynamic>,
    supabase.from('treatments')
        .select('id, user_id, name, dose, frequency_label, active, updated_at')
        .eq('user_id', userId)
        .eq('active', true) as Future<dynamic>,
    supabase.from('adherence_logs')
        .select('medication, status')
        .eq('user_id', userId)
        .eq('taken_date', today) as Future<dynamic>,
    supabase.from('adherence_logs')
        .select('status')
        .eq('user_id', userId)
        .gte('taken_date', since14) as Future<dynamic>,
    supabase.from('symptom_logs')
        .select('logged_at')
        .eq('user_id', userId)
        .gte('logged_at', since30) as Future<dynamic>,
    supabase.from('aliis_insights')
        .select('content')
        .eq('user_id', userId)
        .eq('type', 'patient_summary')
        .order('generated_at', ascending: false)
        .limit(1)
        .maybeSingle() as Future<dynamic>,
  ]);

  final profile = results[0] as Map<String, dynamic>?;
  final treatments = (results[1] as List)
      .map((r) => Treatment.fromJson(r as Map<String, dynamic>))
      .toList();
  final todayLogs = results[2] as List;
  final logs14 = results[3] as List;
  final logs30 = results[4] as List;
  final insight = results[5] as Map<String, dynamic>?;

  final takenToday = todayLogs
      .where((l) => (l as Map<String, dynamic>)['status'] == 'taken')
      .map((l) => (l as Map<String, dynamic>)['medication'] as String)
      .toSet();

  final total14 = logs14.length;
  final taken14 = logs14
      .where((l) => (l as Map<String, dynamic>)['status'] == 'taken').length;
  final adherencia14d = total14 > 0
      ? ((taken14 / total14) * 100).round()
      : 0;

  final dias = logs30
      .map((l) => (l as Map<String, dynamic>)['logged_at'].toString().substring(0, 10))
      .toSet()
      .length;

  String? alertBody;
  bool hasActiveAlert = false;
  final insights = <String>[];

  if (insight != null) {
    final content = insight['content'];
    final parsed = content is String
        ? jsonDecode(content) as Map<String, dynamic>
        : content as Map<String, dynamic>;
    final patron = parsed['patron_reciente'] as String?;
    if (patron != null) {
      hasActiveAlert = true;
      alertBody = patron;
      insights.add(patron);
    }
    final recomendacion = parsed['recomendacion'] as String?;
    if (recomendacion != null) insights.add(recomendacion);
  }

  return HomeData(
    userName: profile?['name'] as String?,
    nextAppointment: profile?['next_appointment'] as String?,
    treatments: treatments,
    takenToday: takenToday,
    hasActiveAlert: hasActiveAlert,
    alertBody: alertBody,
    insights: insights,
    adherencia14d: adherencia14d,
    diasRegistrados30d: dias,
  );
});
