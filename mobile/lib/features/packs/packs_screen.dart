import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import 'packs_provider.dart';
import 'widgets/pack_card.dart';

class PacksScreen extends ConsumerWidget {
  const PacksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final packsAsync = ref.watch(packsProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(packsProvider),
          child: packsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(
              child: Text('Error cargando packs',
                style: GoogleFonts.inter(color: AliisColors.mutedForeground))),
            data: (packs) => packs.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.menu_book_outlined,
                        size: 48, color: AliisColors.border),
                      const SizedBox(height: 12),
                      Text('Aún no tienes packs',
                        style: GoogleFonts.inter(
                          color: AliisColors.mutedForeground)),
                    ],
                  ))
              : ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    Text('Tus\npacks.',
                      style: Theme.of(context).textTheme.displayLarge),
                    const SizedBox(height: 20),
                    ...packs.map((p) => PackCard(
                      pack: p,
                      onTap: () => context.push('/packs/${p.id}'),
                    )),
                  ],
                ),
          ),
        ),
      ),
    );
  }
}
