// mobile/lib/app.dart
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/notification_router.dart';
import 'core/router.dart';
import 'core/theme.dart';

class AliisApp extends ConsumerStatefulWidget {
  const AliisApp({super.key});

  @override
  ConsumerState<AliisApp> createState() => _AliisAppState();
}

class _AliisAppState extends ConsumerState<AliisApp> {
  @override
  void initState() {
    super.initState();
    final router = ref.read(routerProvider);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      NotificationRouter.setup(router.routerDelegate.navigatorKey);
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Aliis',
      theme: aliisLightTheme(),
      darkTheme: aliisDarkTheme(),
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('es')],
    );
  }
}
