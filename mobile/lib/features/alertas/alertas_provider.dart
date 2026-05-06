import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/supabase_client.dart';
import '../../shared/models/app_notification.dart';
import '../auth/auth_provider.dart';

final alertasProvider = StreamProvider.autoDispose<List<AppNotification>>((ref) {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return Stream.value([]);

  return supabase
    .from('app_notifications')
    .stream(primaryKey: ['id'])
    .eq('user_id', session.user.id)
    .order('created_at', ascending: false)
    .map((rows) => rows
      .map((r) => AppNotification.fromJson(r))
      .toList());
});

Future<void> marcarLeida(String notificationId) async {
  await supabase
    .from('app_notifications')
    .update({'read': true, 'read_at': DateTime.now().toIso8601String()})
    .eq('id', notificationId);
}
