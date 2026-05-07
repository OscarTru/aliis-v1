// mobile/lib/core/notification_service.dart
import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import '../firebase_options.dart';
import 'supabase_client.dart';

// Top-level function requerida por Firebase para background messages
@pragma('vm:entry-point')
Future<void> _backgroundHandler(RemoteMessage message) async {
  // Firebase ya inicializado en este isolate — solo logueamos
  debugPrint('FCM background: ${message.messageId}');
}

class NotificationService {
  NotificationService._();

  static Future<void> init() async {
    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );

      FirebaseMessaging.onBackgroundMessage(_backgroundHandler);

      final settings = await FirebaseMessaging.instance.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional) {
        await _uploadToken();
        FirebaseMessaging.instance.onTokenRefresh.listen(_saveToken);
      }
    } catch (e) {
      debugPrint('NotificationService init failed (non-fatal): $e');
    }
  }

  static Future<void> _uploadToken() async {
    try {
      // El simulador de iOS no soporta APNS — getToken() lanza excepción
      if (Platform.isIOS) {
        final apns = await FirebaseMessaging.instance.getAPNSToken();
        if (apns == null) return; // simulador o APNS no configurado
      }
      final token = await FirebaseMessaging.instance.getToken();
      if (token != null) await _saveToken(token);
    } catch (e) {
      debugPrint('FCM token unavailable: $e');
    }
  }

  static Future<void> _saveToken(String token) async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;

    final platform = Platform.isIOS ? 'ios' : 'android';

    await supabase.from('device_tokens').upsert(
      {
        'user_id': userId,
        'token': token,
        'platform': platform,
        'updated_at': DateTime.now().toIso8601String(),
      },
      onConflict: 'token',
    );
  }
}
