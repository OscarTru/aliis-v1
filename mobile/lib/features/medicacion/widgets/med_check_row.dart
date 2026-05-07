import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/theme.dart';
import '../medicacion_provider.dart';

class MedCheckRow extends StatefulWidget {
  final MedItem item;
  // Fix 1 — properly typed async callback
  final Future<void> Function() onToggle;

  const MedCheckRow({super.key, required this.item, required this.onToggle});

  @override
  State<MedCheckRow> createState() => _MedCheckRowState();
}

class _MedCheckRowState extends State<MedCheckRow> {
  bool _loading = false;

  bool get _isFuturo => !widget.item.tomado && DateTime.now().hour < widget.item.turno.hora;

  @override
  Widget build(BuildContext context) {
    final tomado = widget.item.tomado;
    final futuro = _isFuturo;

    return Opacity(
      opacity: futuro ? 0.4 : 1.0,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AliisColors.border)),
        ),
        child: Row(
          children: [
            // Fix 7 — Semantics + expanded tap target
            Semantics(
              label: widget.item.treatment.name,
              checked: tomado,
              enabled: !futuro,
              child: Padding(
                padding: const EdgeInsets.all(11),
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: futuro || _loading ? null : () async {
                    // Fix 4 — try/catch with snackbar feedback
                    try {
                      setState(() => _loading = true);
                      // Fix 1 — await the Future directly
                      await widget.onToggle();
                    } catch (e) {
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Error al guardar. Intenta de nuevo.'),
                          ),
                        );
                      }
                    } finally {
                      if (mounted) setState(() => _loading = false);
                    }
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeOut,
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: tomado ? AliisColors.deepTeal : Colors.transparent,
                      borderRadius: BorderRadius.circular(5),
                      border: Border.all(
                        color: tomado
                            ? AliisColors.deepTeal
                            : futuro
                                ? AliisColors.mutedFg
                                : const Color(0xFFE0E0E0),
                        width: futuro ? 1 : 1.5,
                        strokeAlign: BorderSide.strokeAlignCenter,
                      ),
                    ),
                    child: tomado
                        ? const Icon(Icons.check, color: Colors.white, size: 14)
                            .animate().fadeIn(duration: 200.ms)
                        : null,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.item.treatment.name,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AliisColors.foreground,
                    ),
                  ),
                  if (widget.item.treatment.dose != null &&
                      widget.item.treatment.dose!.isNotEmpty)
                    Text(
                      widget.item.treatment.dose!,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AliisColors.mutedFg,
                      ),
                    ),
                ],
              ),
            ),
            if (tomado && widget.item.horaRegistro != null)
              Text(
                DateFormat('HH:mm').format(widget.item.horaRegistro!.toLocal()),
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: AliisColors.primary,
                  fontWeight: FontWeight.w500,
                ),
              )
            else if (!tomado && !futuro)
              Text('Pendiente',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: AliisColors.mutedFg,
                )),
          ],
        ),
      ),
    );
  }
}
