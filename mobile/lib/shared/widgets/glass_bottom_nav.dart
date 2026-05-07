import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// iOS 26 "liquid" pill nav — frosted glass container, animated dark pill
// slides under the active tab. Center button is a raised capsule.

class GlassBottomNav extends StatefulWidget {
  final int currentIndex;
  final ValueChanged<int> onTabSelected;
  final VoidCallback onCenterPressed;
  final int alertCount;

  const GlassBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTabSelected,
    required this.onCenterPressed,
    this.alertCount = 0,
  });

  @override
  State<GlassBottomNav> createState() => _GlassBottomNavState();
}

class _GlassBottomNavState extends State<GlassBottomNav>
    with SingleTickerProviderStateMixin {
  late AnimationController _pillCtrl;
  late Animation<double> _pillAnim;

  // Logical tab indices (skipping center slot 2)
  // Positions: 0=Inicio, 1=Biblioteca, [center], 2=Alertas, 3=Perfil
  // Pill slot positions mapped: index 0→0, 1→1, 2→3, 3→4 (out of 5 slots)
  static const _tabCount = 5; // 4 real + 1 center

  double _pillPosition(int logicalIndex) {
    // logicalIndex: 0,1,2,3 → slot: 0,1,3,4
    final slot = logicalIndex < 2 ? logicalIndex : logicalIndex + 1;
    return slot.toDouble();
  }

  @override
  void initState() {
    super.initState();
    _pillCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 380),
    );
    _pillAnim = Tween<double>(
      begin: _pillPosition(widget.currentIndex),
      end: _pillPosition(widget.currentIndex),
    ).animate(CurvedAnimation(
      parent: _pillCtrl,
      curve: Curves.easeInOutCubicEmphasized,
    ));
  }

  @override
  void didUpdateWidget(GlassBottomNav old) {
    super.didUpdateWidget(old);
    if (old.currentIndex != widget.currentIndex) {
      final from = _pillAnim.value;
      final to = _pillPosition(widget.currentIndex);
      _pillAnim = Tween<double>(begin: from, end: to).animate(
        CurvedAnimation(parent: _pillCtrl, curve: Curves.easeInOutCubicEmphasized),
      );
      _pillCtrl.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _pillCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomPad = MediaQuery.of(context).padding.bottom;
    final navHeight = 60.0;
    final totalHeight = navHeight + (bottomPad > 0 ? bottomPad : 20);

    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
        child: Container(
          height: totalHeight,
          decoration: BoxDecoration(
            // Frosted white — matches iOS 26 liquid glass
            color: Colors.white.withValues(alpha: 0.82),
            border: const Border(
              top: BorderSide(color: Color(0x18000000), width: 0.5),
            ),
          ),
          child: Padding(
            padding: EdgeInsets.only(
              bottom: bottomPad > 0 ? bottomPad : 20,
              left: 6,
              right: 6,
              top: 4,
            ),
            child: SizedBox(
              height: navHeight - 4,
              child: AnimatedBuilder(
                animation: _pillAnim,
                builder: (context, _) {
                  return LayoutBuilder(
                    builder: (context, constraints) {
                      final slotW = constraints.maxWidth / _tabCount;
                      final pillW = slotW * 0.88;
                      final pillLeft = _pillAnim.value * slotW + (slotW - pillW) / 2;

                      return Stack(
                        clipBehavior: Clip.none,
                        children: [
                          // Sliding pill background
                          Positioned(
                            left: pillLeft,
                            top: 0,
                            bottom: 0,
                            width: pillW,
                            child: Container(
                              decoration: BoxDecoration(
                                color: const Color(0xFF1A1A1A),
                                borderRadius: BorderRadius.circular(18),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.18),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                            ),
                          ),

                          // Tabs row
                          Row(
                            children: [
                              _NavTab(
                                icon: Icons.home_outlined,
                                activeIcon: Icons.home_rounded,
                                label: 'Inicio',
                                index: 0,
                                currentIndex: widget.currentIndex,
                                onTap: () => widget.onTabSelected(0),
                              ),
                              _NavTab(
                                icon: Icons.book_outlined,
                                activeIcon: Icons.book_rounded,
                                label: 'Biblioteca',
                                index: 1,
                                currentIndex: widget.currentIndex,
                                onTap: () => widget.onTabSelected(1),
                              ),
                              // Center + button
                              Expanded(
                                child: _CenterButton(onPressed: widget.onCenterPressed),
                              ),
                              _NavTab(
                                icon: Icons.notifications_none_rounded,
                                activeIcon: Icons.notifications_rounded,
                                label: 'Alertas',
                                index: 2,
                                currentIndex: widget.currentIndex,
                                onTap: () => widget.onTabSelected(2),
                                badge: widget.alertCount,
                              ),
                              _NavTab(
                                icon: Icons.person_outline,
                                activeIcon: Icons.person_rounded,
                                label: 'Perfil',
                                index: 3,
                                currentIndex: widget.currentIndex,
                                onTap: () => widget.onTabSelected(3),
                              ),
                            ],
                          ),
                        ],
                      );
                    },
                  );
                },
              ),
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
  final int badge;

  const _NavTab({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.index,
    required this.currentIndex,
    required this.onTap,
    this.badge = 0,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = index == currentIndex;

    return Expanded(
      child: Semantics(
        label: label,
        button: true,
        selected: isActive,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: onTap,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 200),
                    transitionBuilder: (child, anim) => ScaleTransition(
                      scale: anim,
                      child: FadeTransition(opacity: anim, child: child),
                    ),
                    child: Icon(
                      isActive ? activeIcon : icon,
                      key: ValueKey(isActive),
                      size: 21,
                      color: isActive ? Colors.white : const Color(0xFF9CA3AF),
                    ),
                  ),
                  if (badge > 0)
                    Positioned(
                      right: -5,
                      top: -3,
                      child: Container(
                        width: 7,
                        height: 7,
                        decoration: const BoxDecoration(
                          color: Color(0xFFE55A36),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 3),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: GoogleFonts.inter(
                  fontSize: 9.5,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                  color: isActive ? Colors.white : const Color(0xFF9CA3AF),
                ),
                child: Text(label),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CenterButton extends StatelessWidget {
  final VoidCallback onPressed;
  const _CenterButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Nueva entrada',
      button: true,
      child: GestureDetector(
        onTap: onPressed,
        behavior: HitTestBehavior.opaque,
        child: Center(
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A1A),
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.22),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(
              Icons.add_rounded,
              size: 22,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}
