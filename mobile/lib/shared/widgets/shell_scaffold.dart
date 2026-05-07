import 'package:flutter/material.dart';
import '../../features/aliis/aliis_sheet.dart';
import 'glass_bottom_nav.dart';

class ShellScaffold extends StatelessWidget {
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
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Positioned.fill(
            bottom: 78,
            child: child,
          ),
          GlassBottomNav(
            currentIndex: currentIndex,
            onTabSelected: onTabSelected,
            onAliisPressed: () => AliisSheet.show(context),
          ),
        ],
      ),
    );
  }
}
