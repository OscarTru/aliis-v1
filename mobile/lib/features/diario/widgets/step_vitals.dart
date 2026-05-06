import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../diario_steps.dart';

class StepVitals extends StatefulWidget {
  final DiarioStep step;
  final Map<String, dynamic> values;
  final ValueChanged<Map<String, dynamic>> onChanged;

  const StepVitals({
    super.key,
    required this.step,
    required this.values,
    required this.onChanged,
  });

  @override
  State<StepVitals> createState() => _StepVitalsState();
}

class _StepVitalsState extends State<StepVitals> {
  late final TextEditingController _ctrl;
  late final TextEditingController _ctrl2;

  @override
  void initState() {
    super.initState();
    if (widget.step.key == 'bp') {
      final bp = widget.values['bp'] as Map?;
      _ctrl = TextEditingController(text: bp?['systolic']?.toString() ?? '');
      _ctrl2 = TextEditingController(text: bp?['diastolic']?.toString() ?? '');
    } else {
      _ctrl = TextEditingController(
        text: widget.values[widget.step.key]?.toString() ?? '');
      _ctrl2 = TextEditingController();
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _ctrl2.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isBp = widget.step.key == 'bp';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.step.label,
          style: GoogleFonts.instrumentSerif(fontSize: 22)),
        const SizedBox(height: 32),
        if (isBp)
          Row(
            children: [
              Expanded(child: _field(_ctrl, 'Sistólica', (v) {
                final bp = Map<String, dynamic>.from(
                  widget.values['bp'] as Map? ?? {});
                bp['systolic'] = int.tryParse(v);
                widget.onChanged({...widget.values, 'bp': bp});
              })),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Text('/',
                  style: GoogleFonts.inter(fontSize: 32,
                    color: AliisColors.mutedForeground)),
              ),
              Expanded(child: _field(_ctrl2, 'Diastólica', (v) {
                final bp = Map<String, dynamic>.from(
                  widget.values['bp'] as Map? ?? {});
                bp['diastolic'] = int.tryParse(v);
                widget.onChanged({...widget.values, 'bp': bp});
              })),
            ],
          )
        else
          _field(_ctrl, widget.step.unit ?? '', (v) {
            final num? parsed = widget.step.key == 'temperature' || widget.step.key == 'glucose'
              ? double.tryParse(v)
              : int.tryParse(v);
            widget.onChanged({...widget.values, widget.step.key: parsed});
          }),
        if (widget.step.unit != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(widget.step.unit!,
              style: GoogleFonts.inter(
                fontSize: 13, color: AliisColors.mutedForeground)),
          ),
      ],
    );
  }

  Widget _field(TextEditingController c, String label, ValueChanged<String> onChange) {
    return TextField(
      controller: c,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[\d.]'))],
      textAlign: TextAlign.center,
      style: GoogleFonts.inter(fontSize: 36, fontWeight: FontWeight.w700,
        color: AliisColors.primary),
      decoration: InputDecoration(
        hintText: label,
        hintStyle: GoogleFonts.inter(
          fontSize: 14, color: AliisColors.mutedForeground),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AliisColors.border)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AliisColors.primary, width: 2)),
      ),
      onChanged: onChange,
    );
  }
}
