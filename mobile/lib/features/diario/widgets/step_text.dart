import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../diario_steps.dart';

class StepText extends StatefulWidget {
  final DiarioStep step;
  final Map<String, dynamic> values;
  final ValueChanged<Map<String, dynamic>> onChanged;

  const StepText({
    super.key,
    required this.step,
    required this.values,
    required this.onChanged,
  });

  @override
  State<StepText> createState() => _StepTextState();
}

class _StepTextState extends State<StepText> {
  late final TextEditingController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(
      text: widget.values[widget.step.key] as String? ?? '');
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.step.label,
          style: GoogleFonts.instrumentSerif(fontSize: 22)),
        const SizedBox(height: 8),
        if (widget.step.hint != null)
          Text(widget.step.hint!,
            style: GoogleFonts.inter(
              fontSize: 13, color: AliisColors.mutedForeground)),
        const SizedBox(height: 24),
        TextField(
          controller: _ctrl,
          maxLines: 5,
          onChanged: (v) => widget.onChanged(
            {...widget.values, widget.step.key: v}),
          decoration: InputDecoration(
            hintText: widget.step.hint ?? '',
            hintStyle: GoogleFonts.inter(color: AliisColors.mutedForeground),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AliisColors.border)),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AliisColors.primary, width: 2)),
          ),
        ),
      ],
    );
  }
}
