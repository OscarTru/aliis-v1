import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/auth_provider.dart';
import '../features/auth/login_screen.dart';
import '../features/diario/diario_screen.dart';
import '../features/diario/registro_wizard.dart';
import '../features/home/home_screen.dart';
import '../features/packs/packs_screen.dart';
import '../features/alertas/alertas_screen.dart';
import '../features/perfil/perfil_screen.dart';
import '../shared/widgets/shell_scaffold.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final listenable = _SessionListenable(ref);

  return GoRouter(
    initialLocation: '/inicio',
    refreshListenable: listenable,
    redirect: (context, state) {
      final sessionAsync = ref.read(sessionProvider);
      if (sessionAsync.isLoading) return null;

      final isAuth = sessionAsync.valueOrNull != null;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isAuth && !isLoginRoute) return '/login';
      if (isAuth && isLoginRoute) return '/inicio';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: '/diario',
        builder: (_, __) => const DiarioScreen(),
        routes: [
          GoRoute(
            path: 'registro',
            builder: (_, __) => const RegistroWizard(),
          ),
        ],
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => ShellScaffold(
          currentIndex: shell.currentIndex,
          onTabSelected: shell.goBranch,
          child: shell,
        ),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/inicio',
              builder: (_, __) => const HomeScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/packs', builder: (_, __) => const PacksScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/alertas', builder: (_, __) => const AlertasScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/perfil', builder: (_, __) => const PerfilScreen()),
          ]),
        ],
      ),
    ],
  );
});

// Notifica a GoRouter cuando cambia la sesión sin recrear el router
class _SessionListenable extends ChangeNotifier {
  _SessionListenable(Ref ref) {
    ref.listen(sessionProvider, (_, __) => notifyListeners());
  }
}
