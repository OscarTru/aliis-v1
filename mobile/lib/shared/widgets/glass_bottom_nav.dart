import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';

class GlassBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTabSelected;
  final VoidCallback onAliisPressed;
  final int alertCount;

  const GlassBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTabSelected,
    required this.onAliisPressed,
    this.alertCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      bottom: 14,
      left: 14,
      right: 14,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(36),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 28, sigmaY: 28),
          child: Container(
            height: 64,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.88),
              borderRadius: BorderRadius.circular(36),
              border: Border.all(
                color: Colors.black.withValues(alpha: 0.08),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.12),
                  blurRadius: 32,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavTab(
                  icon: Icons.home_outlined,
                  activeIcon: Icons.home_rounded,
                  label: 'Inicio',
                  index: 0,
                  currentIndex: currentIndex,
                  onTap: () => onTabSelected(0),
                ),
                _NavTab(
                  icon: Icons.folder_outlined,
                  activeIcon: Icons.folder_rounded,
                  label: 'Expediente',
                  index: 1,
                  currentIndex: currentIndex,
                  onTap: () => onTabSelected(1),
                ),
                _FabButton(onPressed: onAliisPressed),
                _NavTab(
                  icon: Icons.medication_outlined,
                  activeIcon: Icons.medication_rounded,
                  label: 'Medicación',
                  index: 2,
                  currentIndex: currentIndex,
                  onTap: () => onTabSelected(2),
                ),
                _NavTab(
                  icon: Icons.person_outline,
                  activeIcon: Icons.person_rounded,
                  label: 'Perfil',
                  index: 3,
                  currentIndex: currentIndex,
                  onTap: () => onTabSelected(3),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavTab extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final int index;
  final int currentIndex;
  final VoidCallback onTap;

  const _NavTab({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.index,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = index == currentIndex;
    final color = isActive ? AliisColors.primary : const Color(0xFFBBBBBB);

    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(isActive ? activeIcon : icon, color: color, size: 22)
              .animate(target: isActive ? 1 : 0)
              .scaleXY(begin: 1, end: 1.12, duration: 150.ms),
            const SizedBox(height: 4),
            if (isActive)
              Container(
                width: 4,
                height: 4,
                decoration: const BoxDecoration(
                  color: AliisColors.primary,
                  shape: BoxShape.circle,
                ),
              )
            else
              const SizedBox(height: 4),
          ],
        ),
      ),
    );
  }
}

class _FabButton extends StatelessWidget {
  final VoidCallback onPressed;
  const _FabButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Transform.translate(
        offset: const Offset(0, -8),
        child: Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: AliisColors.foreground,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 14,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Center(
            child: Text('✦',
              style: TextStyle(color: Colors.white, fontSize: 16)),
          ),
        ).animate(onPlay: (c) => c.repeat(reverse: true))
          .scaleXY(begin: 1, end: 1.04, duration: 2000.ms, curve: Curves.easeInOut),
      ),
    );
  }
}
