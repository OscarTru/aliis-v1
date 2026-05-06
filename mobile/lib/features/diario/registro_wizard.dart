import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/supabase_client.dart';
import '../../core/theme.dart';
import 'diario_provider.dart';
import 'diario_steps.dart';
import 'widgets/step_boolean.dart';
import 'widgets/step_mood.dart';
import 'widgets/step_slider.dart';
import 'widgets/step_text.dart';
import 'widgets/step_vitals.dart';

class RegistroWizard extends ConsumerStatefulWidget {
  const RegistroWizard({super.key});

  @override
  ConsumerState<RegistroWizard> createState() => _RegistroWizardState();
}

class _RegistroWizardState extends ConsumerState<RegistroWizard> {
  int _currentStep = 0;
  final Map<String, dynamic> _values = {};
  bool _saving = false;

  Widget _buildStep(DiarioStep step) {
    switch (step.type) {
      case StepType.mood:
        return StepMood(step: step, values: _values,
          onChanged: (v) => setState(() => _values.addAll(v)));
      case StepType.slider:
        return StepSlider(step: step, values: _values,
          onChanged: (v) => setState(() => _values.addAll(v)));
      case StepType.vitals:
        return StepVitals(step: step, values: _values,
          onChanged: (v) => setState(() => _values.addAll(v)));
      case StepType.boolean:
        return StepBoolean(step: step, values: _values,
          onChanged: (v) => setState(() => _values.addAll(v)));
      case StepType.text:
        return StepText(step: step, values: _values,
          onChanged: (v) => setState(() => _values.addAll(v)));
    }
  }

  Future<void> _guardar(List<DiarioStep> steps) async {
    setState(() => _saving = true);
    try {
      final userId = supabase.auth.currentUser!.id;
      await guardarRegistro(userId, _values);
      if (mounted) {
        ref.invalidate(diarioHistorialProvider);
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error guardando. Intenta de nuevo.',
            style: GoogleFonts.inter())));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final stepsAsync = ref.watch(diarioStepsProvider);

    return stepsAsync.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator())),
      error: (e, _) => const Scaffold(
        body: Center(child: Text('Error cargando pasos'))),
      data: (steps) {
        final step = steps[_currentStep];
        final isLast = _currentStep == steps.length - 1;
        final progress = (_currentStep + 1) / steps.length;

        return Scaffold(
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.close),
              onPressed: () => context.pop(),
            ),
            title: Text('Registro de hoy',
              style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(4),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: AliisColors.border,
                valueColor: const AlwaysStoppedAnimation(AliisColors.primary),
              ),
            ),
          ),
          body: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${_currentStep + 1} de ${steps.length}',
                    style: GoogleFonts.inter(
                      fontSize: 12, color: AliisColors.mutedForeground)),
                  const SizedBox(height: 24),
                  Expanded(child: _buildStep(step)),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      if (_currentStep > 0)
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => setState(() => _currentStep--),
                            child: Text('Atrás',
                              style: GoogleFonts.inter()),
                          ),
                        ),
                      if (_currentStep > 0) const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: FilledButton(
                          onPressed: _saving ? null : () {
                            if (isLast) {
                              _guardar(steps);
                            } else {
                              setState(() => _currentStep++);
                            }
                          },
                          style: FilledButton.styleFrom(
                            backgroundColor: AliisColors.primary,
                            minimumSize: const Size(double.infinity, 48),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12))),
                          child: _saving
                            ? const SizedBox(width: 20, height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white))
                            : Text(isLast ? 'Guardar' : 'Siguiente',
                                style: GoogleFonts.inter(
                                  fontWeight: FontWeight.w600)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
