import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../diario_steps.dart';

const _moods = [
  ('😄', 'Muy bien', 5),
  ('🙂', 'Bien', 4),
  ('😐', 'Regular', 3),
  ('😕', 'Mal', 2),
  ('😞', 'Muy mal', 1),
];

class StepMood extends StatelessWidget {
  final DiarioStep step;
  final Map<String, dynamic> values;
  final ValueChanged<Map<String, dynamic>> onChanged;

  const StepMood({
    super.key,
    required this.step,
    required this.values,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final current = values[step.key] as int?;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(step.label, style: GoogleFonts.instrumentSerif(fontSize: 22)),
        const SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: _moods.map((m) {
            final selected = current == m.$3;
            return GestureDetector(
              onTap: () => onChanged({...values, step.key: m.$3}),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: selected ? AliisColors.primary.withValues(alpha: 0.1) : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: selected ? AliisColors.primary : Colors.transparent,
                    width: 2),
                ),
                child: Column(
                  children: [
                    Text(m.$1, style: const TextStyle(fontSize: 28)),
                    const SizedBox(height: 4),
                    Text(m.$2,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        color: selected ? AliisColors.primary : AliisColors.mutedForeground,
                        fontWeight: selected ? FontWeight.w600 : FontWeight.normal)),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
