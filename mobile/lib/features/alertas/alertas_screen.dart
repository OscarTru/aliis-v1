import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../shared/widgets/serif_heading.dart';
import '../../shared/widgets/alert_row.dart';
import 'alertas_provider.dart';

class AlertasScreen extends ConsumerWidget {
  const AlertasScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alertasAsync = ref.watch(alertasProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: Row(
                children: [
                  const Expanded(
                    child: SerifHeading(
                      eyebrow: 'NOTIFICACIONES',
                      heading: 'Alertas',
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AliisColors.foreground),
                    onPressed: () => context.pop(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: alertasAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(
                  child: Text('Error cargando alertas',
                    style: GoogleFonts.inter(color: AliisColors.mutedFg))),
                data: (notifications) => notifications.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.notifications_none_rounded,
                            size: 40, color: AliisColors.border),
                          const SizedBox(height: 12),
                          Text('Sin alertas por ahora',
                            style: GoogleFonts.inter(
                              color: AliisColors.mutedFg)),
                        ],
                      ))
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: notifications.length,
                      itemBuilder: (ctx, i) {
                        final n = notifications[i];
                        return AlertRow(
                          title: n.title,
                          subtitle: n.body,
                          accentColor: n.type == 'alert'
                              ? AliisColors.destructive
                              : AliisColors.primary,
                        );
                      },
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
