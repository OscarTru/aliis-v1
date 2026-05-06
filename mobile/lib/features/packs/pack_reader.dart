import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import 'packs_provider.dart';
import 'widgets/chapter_tab.dart';

class PackReader extends ConsumerWidget {
  final String packId;
  const PackReader({super.key, required this.packId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final packAsync = ref.watch(packDetailProvider(packId));

    return packAsync.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('Error cargando pack'))),
      data: (pack) => DefaultTabController(
        length: pack.chapters.length,
        child: Scaffold(
          appBar: AppBar(
            title: Text(pack.dx,
              style: GoogleFonts.inter(
                fontSize: 15, fontWeight: FontWeight.w600)),
            bottom: pack.chapters.length > 1
              ? TabBar(
                  isScrollable: true,
                  labelColor: AliisColors.primary,
                  unselectedLabelColor: AliisColors.mutedForeground,
                  indicatorColor: AliisColors.primary,
                  tabs: pack.chapters.map((c) =>
                    Tab(text: c.n)).toList(),
                )
              : null,
          ),
          body: pack.chapters.isEmpty
            ? Center(
                child: Text('Sin capítulos',
                  style: GoogleFonts.inter(
                    color: AliisColors.mutedForeground)))
            : TabBarView(
                children: pack.chapters
                  .map((c) => ChapterTab(chapter: c))
                  .toList(),
              ),
        ),
      ),
    );
  }
}
