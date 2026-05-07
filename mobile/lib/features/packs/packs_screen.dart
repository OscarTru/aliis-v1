import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../shared/models/pack.dart';
import 'packs_provider.dart';

const _packColors = [
  Color(0xFF14606E),
  Color(0xFF5B4FBE),
  Color(0xFFB45309),
  Color(0xFF0369A1),
  Color(0xFF9D174D),
];

enum _Filter { todas, sinLeer, enCurso, completadas }

enum _PackStatus { sinLeer, enCurso, completada }

class PacksScreen extends ConsumerStatefulWidget {
  const PacksScreen({super.key});

  @override
  ConsumerState<PacksScreen> createState() => _PacksScreenState();
}

class _PacksScreenState extends ConsumerState<PacksScreen> {
  _Filter _filter = _Filter.todas;
  final _searchController = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // Derive status from data: no chapter data = sin_leer, has chapters = en_curso.
  // "completada" is not yet trackable (no read-progress in Pack model).
  _PackStatus _deriveStatus(Pack pack) {
    if (pack.chapters.isEmpty) return _PackStatus.sinLeer;
    return _PackStatus.enCurso;
  }

  List<Pack> _filtered(List<Pack> packs) {
    var list = packs;
    if (_query.isNotEmpty) {
      list = list
          .where((p) => p.dx.toLowerCase().contains(_query.toLowerCase()))
          .toList();
    }
    if (_filter != _Filter.todas) {
      list = list.where((p) {
        final status = _deriveStatus(p);
        switch (_filter) {
          case _Filter.sinLeer:
            return status == _PackStatus.sinLeer;
          case _Filter.enCurso:
            return status == _PackStatus.enCurso;
          case _Filter.completadas:
            return status == _PackStatus.completada;
          case _Filter.todas:
            return true;
        }
      }).toList();
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final packsAsync = ref.watch(packsProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(packsProvider),
          child: packsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                const SizedBox(height: 200),
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Error cargando packs',
                          style: GoogleFonts.inter(color: AliisColors.mutedFg)),
                      const SizedBox(height: 12),
                      TextButton(
                        onPressed: () => ref.invalidate(packsProvider),
                        child: const Text('Reintentar'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            data: (packs) {
              final filtered = _filtered(packs);
              return CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Eyebrow
                          Text(
                            '· BIBLIOTECA · ${packs.length} EXPLICACIONES ·',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              letterSpacing: 1.5,
                              color: AliisColors.mutedFg,
                            ),
                          ),
                          const SizedBox(height: 4),
                          // Heading
                          RichText(
                            text: TextSpan(
                              style: GoogleFonts.playfairDisplay(
                                fontSize: 28,
                                fontWeight: FontWeight.w400,
                                color: AliisColors.foreground,
                                height: 1.15,
                              ),
                              children: [
                                const TextSpan(text: 'Lo que ya '),
                                TextSpan(
                                  text: 'te explicamos.',
                                  style: GoogleFonts.playfairDisplay(
                                    fontSize: 28,
                                    fontWeight: FontWeight.w400,
                                    fontStyle: FontStyle.italic,
                                    color: AliisColors.deepTeal,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Filter chips
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: _Filter.values.map((f) {
                                final active = _filter == f;
                                return Padding(
                                  padding: const EdgeInsets.only(right: 8),
                                  child: GestureDetector(
                                    onTap: () => setState(() => _filter = f),
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 150),
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 14, vertical: 7),
                                      decoration: BoxDecoration(
                                        color: active
                                            ? AliisColors.foreground
                                            : const Color(0xFFF3F4F6),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        _filterLabel(f),
                                        style: GoogleFonts.inter(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w500,
                                          color: active
                                              ? Colors.white
                                              : const Color(0xFF6B7280),
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Search bar
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8F8F8),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.search,
                                    size: 16, color: Color(0xFF9CA3AF)),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: TextField(
                                    controller: _searchController,
                                    onChanged: (v) =>
                                        setState(() => _query = v),
                                    style: GoogleFonts.inter(fontSize: 13),
                                    decoration: InputDecoration(
                                      hintText: 'Buscar diagnóstico...',
                                      hintStyle: GoogleFonts.inter(
                                        fontSize: 13,
                                        color: const Color(0xFF9CA3AF),
                                      ),
                                      border: InputBorder.none,
                                      isDense: true,
                                      contentPadding: EdgeInsets.zero,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 8),
                        ],
                      ),
                    ),
                  ),

                  // Pack list
                  if (filtered.isEmpty)
                    SliverFillRemaining(
                      child: Center(
                        child: Text(
                          _query.isNotEmpty
                              ? 'No encontramos packs para "$_query"'
                              : 'Sin packs en esta categoría',
                          style: GoogleFonts.inter(
                              fontSize: 14, color: AliisColors.mutedFg),
                        ),
                      ),
                    )
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, i) {
                          final pack = filtered[i];
                          final color = _packColors[i % _packColors.length];
                          final isLast = i == filtered.length - 1;
                          final status = _deriveStatus(pack);
                          // No read-progress tracking yet; done=0 always.
                          const done = 0;
                          final chapCount = pack.chapters.length;
                          final progress =
                              chapCount > 0 ? done / chapCount : 0.0;
                          final dateStr = DateFormat('d MMM yyyy', 'es')
                              .format(pack.createdAt);

                          return _PackRow(
                            pack: pack,
                            color: color,
                            status: status,
                            progress: progress,
                            done: done,
                            chapCount: chapCount,
                            dateStr: dateStr,
                            isLast: isLast,
                            onTap: () => context.push('/packs/${pack.id}'),
                          );
                        },
                        childCount: filtered.length,
                      ),
                    ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  String _filterLabel(_Filter f) {
    switch (f) {
      case _Filter.todas:
        return 'Todas';
      case _Filter.sinLeer:
        return 'Sin leer';
      case _Filter.enCurso:
        return 'En curso';
      case _Filter.completadas:
        return 'Completadas';
    }
  }
}

class _StatusBadge extends StatelessWidget {
  final _PackStatus status;
  final int done;
  final int chapCount;

  const _StatusBadge({
    required this.status,
    required this.done,
    required this.chapCount,
  });

  @override
  Widget build(BuildContext context) {
    final Color bgColor;
    final Color textColor;
    final String label;

    switch (status) {
      case _PackStatus.sinLeer:
        bgColor = const Color(0xFFF3F4F6);
        textColor = const Color(0xFF6B7280);
        label = 'SIN LEER';
      case _PackStatus.enCurso:
        bgColor = const Color(0xFFE8F5EF);
        textColor = AliisColors.deepTeal;
        label = '$done de $chapCount cap.';
      case _PackStatus.completada:
        bgColor = AliisColors.deepTeal;
        textColor = Colors.white;
        label = 'COMPLETADA';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: textColor,
        ),
      ),
    );
  }
}

class _PackRow extends StatelessWidget {
  final Pack pack;
  final Color color;
  final _PackStatus status;
  final double progress;
  final int done;
  final int chapCount;
  final String dateStr;
  final bool isLast;
  final VoidCallback onTap;

  const _PackRow({
    required this.pack,
    required this.color,
    required this.status,
    required this.progress,
    required this.done,
    required this.chapCount,
    required this.dateStr,
    required this.isLast,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
        decoration: BoxDecoration(
          border: isLast
              ? null
              : const Border(
                  bottom: BorderSide(color: Color(0xFFF9FAFB))),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text(
                  pack.dx.isNotEmpty ? pack.dx[0].toUpperCase() : 'P',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: color,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    pack.dx,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: AliisColors.foreground,
                    ),
                  ),
                  if (pack.summary != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      pack.summary!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AliisColors.mutedFg,
                        height: 1.4,
                      ),
                    ),
                  ],
                  const SizedBox(height: 8),

                  // Badge + date
                  Row(
                    children: [
                      _StatusBadge(
                        status: status,
                        done: done,
                        chapCount: chapCount,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        dateStr,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: const Color(0xFFD1D5DB),
                        ),
                      ),
                    ],
                  ),

                  // Progress bar — only if en_curso and done > 0
                  if (status != _PackStatus.completada && done > 0) ...[
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: progress,
                        minHeight: 4,
                        backgroundColor: const Color(0xFFF3F4F6),
                        valueColor: AlwaysStoppedAnimation<Color>(color),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
