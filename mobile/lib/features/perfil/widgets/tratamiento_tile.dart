import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../../../shared/models/treatment.dart';
import '../perfil_provider.dart';

class TratamientoTile extends ConsumerWidget {
  final Treatment treatment;

  const TratamientoTile({super.key, required this.treatment});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Dismissible(
      key: Key(treatment.id),
      direction: DismissDirection.endToStart,
      background: Container(
        color: AliisColors.destructive,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.archive_outlined, color: Colors.white),
      ),
      confirmDismiss: (_) async {
        return await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: Text('Archivar tratamiento',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
            content: Text('¿Archivar ${treatment.name}?',
              style: GoogleFonts.inter()),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: Text('Cancelar', style: GoogleFonts.inter())),
              TextButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: Text('Archivar',
                  style: GoogleFonts.inter(color: AliisColors.destructive))),
            ],
          ),
        ) ?? false;
      },
      onDismissed: (_) => archivarTratamiento(treatment.id, ref),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AliisColors.border,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AliisColors.border),
        ),
        child: Row(
          children: [
            const Icon(Icons.medication_outlined,
              color: AliisColors.primary, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(treatment.displayName,
                    style: GoogleFonts.inter(
                      fontSize: 14, fontWeight: FontWeight.w600,
                      color: AliisColors.foreground)),
                  if (treatment.frequencyLabel != null)
                    Text(treatment.frequencyLabel!,
                      style: GoogleFonts.inter(
                        fontSize: 12, color: AliisColors.mutedForeground)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
