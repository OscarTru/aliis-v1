import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../diario_steps.dart';

class StepBoolean extends StatelessWidget {
  final DiarioStep step;
  final Map<String, dynamic> values;
  final ValueChanged<Map<String, dynamic>> onChanged;

  const StepBoolean({
    super.key,
    required this.step,
    required this.values,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final val = values[step.key] as bool?;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(step.label, style: GoogleFonts.instrumentSerif(fontSize: 22)),
        const SizedBox(height: 32),
        Row(
          children: [
            Expanded(child: _OptionBtn(
              label: 'Sí', selected: val == true,
              onTap: () => onChanged({...values, step.key: true}))),
            const SizedBox(width: 12),
            Expanded(child: _OptionBtn(
              label: 'No', selected: val == false,
              onTap: () => onChanged({...values, step.key: false}))),
          ],
        ),
      ],
    );
  }
}

class _OptionBtn extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _OptionBtn({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: selected ? AliisColors.primary : AliisColors.muted,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? AliisColors.primary : AliisColors.border,
            width: 2),
        ),
        child: Center(
          child: Text(label,
            style: GoogleFonts.inter(
              fontSize: 18, fontWeight: FontWeight.w600,
              color: selected ? Colors.white : AliisColors.foreground)),
        ),
      ),
    );
  }
}
