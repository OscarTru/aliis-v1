import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/supabase_client.dart';
import '../../../core/theme.dart';
import '../../../shared/models/app_notification.dart';
import '../../aliis/aliis_sheet.dart';
import '../alertas_provider.dart';

class AlertaTile extends ConsumerWidget {
  final AppNotification notification;

  const AlertaTile({super.key, required this.notification});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final fecha = DateFormat('d MMM', 'es').format(notification.createdAt);

    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        color: AliisColors.primary,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.check, color: Colors.white),
      ),
      onDismissed: (_) => marcarLeida(notification.id),
      child: GestureDetector(
        onTap: () => marcarLeida(notification.id),
        child: Container(
          padding: const EdgeInsets.all(14),
          margin: const EdgeInsets.only(bottom: 8),
          decoration: BoxDecoration(
            color: notification.read ? AliisColors.muted : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AliisColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  if (!notification.read)
                    Container(
                      width: 8, height: 8,
                      margin: const EdgeInsets.only(right: 8),
                      decoration: const BoxDecoration(
                        color: AliisColors.primary,
                        shape: BoxShape.circle),
                    ),
                  Expanded(
                    child: Text(notification.title,
                      style: GoogleFonts.inter(
                        fontSize: 13, fontWeight: FontWeight.w600,
                        color: AliisColors.foreground)),
                  ),
                  Text(fecha,
                    style: GoogleFonts.inter(
                      fontSize: 11, color: AliisColors.mutedForeground)),
                ],
              ),
              const SizedBox(height: 4),
              Text(notification.body,
                style: GoogleFonts.inter(
                  fontSize: 12, color: AliisColors.mutedForeground)),
              const SizedBox(height: 10),
              _AccionButton(notification: notification),
            ],
          ),
        ),
      ),
    );
  }
}

class _AccionButton extends ConsumerWidget {
  final AppNotification notification;
  const _AccionButton({required this.notification});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    switch (notification.type) {
      case 'reminder':
        return OutlinedButton(
          onPressed: () async {
            final today = DateTime.now().toIso8601String().substring(0, 10);
            final userId = supabase.auth.currentUser!.id;
            await supabase.from('adherence_logs').upsert({
              'user_id': userId,
              'medication': notification.title,
              'taken_date': today,
              'taken_at': DateTime.now().toIso8601String(),
              'status': 'taken',
            }, onConflict: 'user_id,medication,taken_date');
            marcarLeida(notification.id);
          },
          child: Text('Marcar como tomado',
            style: GoogleFonts.inter(fontSize: 12)),
        );
      case 'red_flag':
      case 'insight':
        return OutlinedButton(
          onPressed: () {
            marcarLeida(notification.id);
            context.push('/diario/registro');
          },
          child: Text('Registrar en diario',
            style: GoogleFonts.inter(fontSize: 12)),
        );
      default:
        return OutlinedButton(
          onPressed: () {
            marcarLeida(notification.id);
            AliisSheet.show(context);
          },
          child: Text('Preguntarle a Aliis',
            style: GoogleFonts.inter(fontSize: 12)),
        );
    }
  }
}
