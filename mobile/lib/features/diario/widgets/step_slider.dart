import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../diario_steps.dart';

class StepSlider extends StatelessWidget {
  final DiarioStep step;
  final Map<String, dynamic> values;
  final ValueChanged<Map<String, dynamic>> onChanged;

  const StepSlider({
    super.key,
    required this.step,
    required this.values,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final val = (values[step.key] as num?)?.toDouble() ?? (step.min ?? 0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(step.label, style: GoogleFonts.instrumentSerif(fontSize: 22)),
        const SizedBox(height: 32),
        Center(
          child: Text(val.toInt().toString(),
            style: GoogleFonts.inter(
              fontSize: 56, fontWeight: FontWeight.w700,
              color: AliisColors.primary)),
        ),
        Slider(
          value: val,
          min: step.min ?? 0,
          max: step.max ?? 10,
          divisions: ((step.max ?? 10) - (step.min ?? 0)).toInt(),
          activeColor: AliisColors.primary,
          onChanged: (v) => onChanged({...values, step.key: v.toInt()}),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('${(step.min ?? 0).toInt()}',
              style: GoogleFonts.inter(fontSize: 11, color: AliisColors.mutedForeground)),
            Text('${(step.max ?? 10).toInt()}',
              style: GoogleFonts.inter(fontSize: 11, color: AliisColors.mutedForeground)),
          ],
        ),
      ],
    );
  }
}
