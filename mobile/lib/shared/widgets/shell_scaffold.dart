import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';
import '../../features/aliis/aliis_sheet.dart';

class ShellScaffold extends StatefulWidget {
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
  State<ShellScaffold> createState() => _ShellScaffoldState();
}

class _ShellScaffoldState extends State<ShellScaffold> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: _AliisBottomNav(
        currentIndex: widget.currentIndex,
        onTabSelected: widget.onTabSelected,
        onAliisPressed: () => AliisSheet.show(context),
      ),
    );
  }
}

class _AliisBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTabSelected;
  final VoidCallback onAliisPressed;

  const _AliisBottomNav({
    required this.currentIndex,
    required this.onTabSelected,
    required this.onAliisPressed,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AliisColors.backgroundDark : AliisColors.background;
    final borderColor = isDark ? AliisColors.borderDark : AliisColors.border;
    final activeColor = AliisColors.primary;
    final inactiveColor = AliisColors.mutedForeground;

    return Container(
      decoration: BoxDecoration(
        color: bg,
        border: Border(top: BorderSide(color: borderColor)),
      ),
      child: SafeArea(
        child: SizedBox(
          height: 60,
          child: Row(
            children: [
              // Tab 0: Inicio
              _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home_rounded,
                label: 'Inicio', index: 0, currentIndex: currentIndex,
                activeColor: activeColor, inactiveColor: inactiveColor,
                onTap: () => onTabSelected(0)),
              // Tab 1: Packs
              _NavItem(icon: Icons.menu_book_outlined, activeIcon: Icons.menu_book_rounded,
                label: 'Packs', index: 1, currentIndex: currentIndex,
                activeColor: activeColor, inactiveColor: inactiveColor,
                onTap: () => onTabSelected(1)),
              // FAB central: Aliis
              Expanded(
                child: Center(
                  child: GestureDetector(
                    onTap: onAliisPressed,
                    child: Container(
                      width: 52, height: 52,
                      decoration: BoxDecoration(
                        color: AliisColors.foreground,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: AliisColors.primary.withOpacity(0.25),
                            blurRadius: 12, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: const Icon(Icons.add, color: Colors.white, size: 24),
                    ),
                  ).animate(onPlay: (c) => c.repeat(reverse: true))
                    .scaleXY(begin: 1, end: 1.04, duration: 2000.ms, curve: Curves.easeInOut),
                ),
              ),
              // Tab 2: Alertas
              _NavItem(icon: Icons.notifications_outlined, activeIcon: Icons.notifications_rounded,
                label: 'Alertas', index: 2, currentIndex: currentIndex,
                activeColor: activeColor, inactiveColor: inactiveColor,
                onTap: () => onTabSelected(2)),
              // Tab 3: Perfil
              _NavItem(icon: Icons.person_outline, activeIcon: Icons.person_rounded,
                label: 'Perfil', index: 3, currentIndex: currentIndex,
                activeColor: activeColor, inactiveColor: inactiveColor,
                onTap: () => onTabSelected(3)),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final int index;
  final int currentIndex;
  final Color activeColor;
  final Color inactiveColor;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon, required this.activeIcon, required this.label,
    required this.index, required this.currentIndex,
    required this.activeColor, required this.inactiveColor, required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = index == currentIndex;
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(isActive ? activeIcon : icon,
              color: isActive ? activeColor : inactiveColor, size: 22)
              .animate(target: isActive ? 1 : 0)
              .scaleXY(begin: 1, end: 1.15, duration: 200.ms),
            const SizedBox(height: 2),
            Text(label, style: TextStyle(
              fontSize: 10,
              color: isActive ? activeColor : inactiveColor,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
            )),
          ],
        ),
      ),
    );
  }
}
