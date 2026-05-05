import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/auth_provider.dart';
import '../features/auth/login_screen.dart';
import '../features/home/home_screen.dart';
import '../features/packs/packs_screen.dart';
import '../features/alertas/alertas_screen.dart';
import '../features/perfil/perfil_screen.dart';
import '../shared/widgets/shell_scaffold.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final sessionAsync = ref.watch(sessionProvider);

  return GoRouter(
    initialLocation: '/inicio',
    redirect: (context, state) {
      final session = sessionAsync.valueOrNull;
      final isAuth = session != null;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isAuth && !isLoginRoute) return '/login';
      if (isAuth && isLoginRoute) return '/inicio';
      return null;
    },
    refreshListenable: _SessionListenable(ref),
    routes: [
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => ShellScaffold(
          currentIndex: shell.currentIndex,
          onTabSelected: shell.goBranch,
          child: shell,
        ),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(path: '/inicio', builder: (_, __) => const HomeScreen()),
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

// Notifica a GoRouter cuando cambia la sesión
class _SessionListenable extends ChangeNotifier {
  _SessionListenable(Ref ref) {
    ref.listen(sessionProvider, (_, __) => notifyListeners());
  }
}
