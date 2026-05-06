import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/supabase_client.dart';

// Expone la sesión actual — null si no autenticado
final sessionProvider = StreamProvider<Session?>((ref) {
  return supabase.auth.onAuthStateChange.map((event) => event.session);
});

final authProvider = Provider<AuthNotifier>((ref) => AuthNotifier());

class AuthNotifier {
  // Email + password
  Future<void> signInWithEmail(String email, String password) async {
    await supabase.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signUpWithEmail(String email, String password) async {
    await supabase.auth.signUp(email: email, password: password);
  }

  // Google OAuth vía Supabase — sin Firebase, sin google_sign_in SDK
  // Abre browser del sistema, redirige a com.example.aliisMobile://login-callback
  Future<void> signInWithGoogle() async {
    await supabase.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: 'com.example.aliisMobile://login-callback',
    );
  }

  Future<void> signOut() async {
    await supabase.auth.signOut();
  }
}
