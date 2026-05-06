import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';

class MetricasGrid extends StatelessWidget {
  final int adherencia14d;
  final int diasRegistrados30d;

  const MetricasGrid({
    super.key,
    required this.adherencia14d,
    required this.diasRegistrados30d,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _MetricaTile(
          valor: '$adherencia14d%',
          label: 'Adherencia',
          color: AliisColors.primary,
        ),
        const SizedBox(width: 10),
        _MetricaTile(
          valor: '$diasRegistrados30d',
          label: 'Días registrados',
          color: AliisColors.foreground,
        ),
      ],
    );
  }
}

class _MetricaTile extends StatelessWidget {
  final String valor;
  final String label;
  final Color color;

  const _MetricaTile({
    required this.valor,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AliisColors.muted,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AliisColors.border),
        ),
        child: Column(
          children: [
            Text(valor,
              style: GoogleFonts.inter(
                fontSize: 22, fontWeight: FontWeight.w700, color: color)),
            const SizedBox(height: 2),
            Text(label,
              style: GoogleFonts.inter(
                fontSize: 10, color: AliisColors.mutedForeground)),
          ],
        ),
      ),
    );
  }
}
