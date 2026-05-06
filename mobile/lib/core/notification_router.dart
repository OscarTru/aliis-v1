// mobile/lib/core/notification_router.dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class NotificationRouter {
  NotificationRouter._();

  // Mapea el campo 'type' del payload a una ruta GoRouter
  static String _routeFor(String? type) {
    switch (type) {
      case 'medication':
        return '/inicio';
      case 'insight':
        return '/alertas';
      case 'red_flag':
        return '/diario/registro';
      default:
        return '/inicio';
    }
  }

  // Llama en app.dart tras inicializar la UI.
  // navigatorKey se usa para acceder al contexto cuando el app arranca desde killed.
  static Future<void> setup(GlobalKey<NavigatorState> navigatorKey) async {
    // 1. App killed → usuario toca el push → app abre
    final initial = await FirebaseMessaging.instance.getInitialMessage();
    if (initial != null) {
      final route = _routeFor(initial.data['type']);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        navigatorKey.currentContext?.go(route);
      });
    }

    // 2. App en background → usuario toca el push
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      final route = _routeFor(message.data['type']);
      navigatorKey.currentContext?.go(route);
    });

    // 3. App en foreground → mostrar snackbar + navegar
    FirebaseMessaging.onMessage.listen((message) {
      final title = message.notification?.title ?? 'Aliis';
      final body = message.notification?.body ?? '';
      final route = _routeFor(message.data['type']);

      final context = navigatorKey.currentContext;
      if (context == null) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('$title\n$body'),
          action: SnackBarAction(
            label: 'Ver',
            onPressed: () => context.go(route),
          ),
          duration: const Duration(seconds: 5),
        ),
      );
    });
  }
}
