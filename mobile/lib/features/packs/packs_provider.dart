import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/supabase_client.dart';
import '../../shared/models/pack.dart';
import '../auth/auth_provider.dart';

final packsProvider = FutureProvider.autoDispose<List<Pack>>((ref) async {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return [];

  final rows = await supabase
    .from('packs')
    .select('id, dx, summary, created_at, chapters')
    .eq('user_id', session.user.id)
    .order('created_at', ascending: false)
    .limit(20);

  return (rows as List)
    .map((r) => Pack.fromJson(r as Map<String, dynamic>))
    .toList();
});

final packDetailProvider = FutureProvider.autoDispose.family<Pack, String>((ref, packId) async {
  final row = await supabase
    .from('packs')
    .select('id, dx, summary, created_at, chapters')
    .eq('id', packId)
    .single();

  return Pack.fromJson(row);
});
