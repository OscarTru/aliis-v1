import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/alertas/alertas_provider.dart';
import 'glass_bottom_nav.dart';

class ShellScaffold extends ConsumerWidget {
  final Widget child;
  final int currentIndex;
  final ValueChanged<int> onTabSelected;

  const ShellScaffold({
    super.key,
    required this.child,
    required this.currentIndex,
    required this.onTabSelected,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alertCount = ref.watch(alertasProvider).valueOrNull
            ?.where((n) => !n.read)
            .length ??
        0;

    return Scaffold(
      body: child,
      bottomNavigationBar: GlassBottomNav(
        currentIndex: currentIndex,
        onTabSelected: onTabSelected,
        onCenterPressed: () => context.push('/expediente/registro'),
        alertCount: alertCount,
      ),
    );
  }
}
