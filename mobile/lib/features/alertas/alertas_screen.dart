import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import 'alertas_provider.dart';
import 'widgets/alerta_tile.dart';

class AlertasScreen extends ConsumerWidget {
  const AlertasScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alertasAsync = ref.watch(alertasProvider);

    return Scaffold(
      body: SafeArea(
        child: alertasAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(
            child: Text('Error cargando alertas',
              style: GoogleFonts.inter(color: AliisColors.mutedForeground))),
          data: (notifications) => notifications.isEmpty
            ? Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.notifications_none_rounded,
                      size: 48, color: AliisColors.border),
                    const SizedBox(height: 12),
                    Text('Sin alertas por ahora',
                      style: GoogleFonts.inter(
                        color: AliisColors.mutedForeground)),
                  ],
                ))
            : ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Text('Alertas.',
                    style: Theme.of(context).textTheme.displayLarge),
                  const SizedBox(height: 20),
                  ...notifications.map((n) => AlertaTile(notification: n)),
                ],
              ),
        ),
      ),
    );
  }
}
