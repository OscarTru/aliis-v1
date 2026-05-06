import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/supabase_client.dart';
import '../../../core/theme.dart';
import '../perfil_provider.dart';

class TratamientoForm extends ConsumerStatefulWidget {
  const TratamientoForm({super.key});

  @override
  ConsumerState<TratamientoForm> createState() => _TratamientoFormState();
}

class _TratamientoFormState extends ConsumerState<TratamientoForm> {
  final _nameCtrl = TextEditingController();
  final _doseCtrl = TextEditingController();
  final _freqCtrl = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _doseCtrl.dispose();
    _freqCtrl.dispose();
    super.dispose();
  }

  Future<void> _guardar() async {
    if (_nameCtrl.text.trim().isEmpty) return;
    setState(() => _saving = true);
    try {
      final userId = supabase.auth.currentUser!.id;
      await supabase.from('treatments').insert({
        'user_id': userId,
        'name': _nameCtrl.text.trim(),
        'dose': _doseCtrl.text.trim().isEmpty ? null : _doseCtrl.text.trim(),
        'frequency_label': _freqCtrl.text.trim().isEmpty ? null : _freqCtrl.text.trim(),
        'frequency': 'other',
        'indefinite': true,
        'active': true,
        'created_at': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      });
      ref.invalidate(perfilProvider);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error guardando', style: GoogleFonts.inter())));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20,
        MediaQuery.of(context).viewInsets.bottom + 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Nuevo tratamiento',
            style: GoogleFonts.instrumentSerif(fontSize: 20)),
          const SizedBox(height: 20),
          TextField(
            controller: _nameCtrl,
            decoration: _inputDeco('Nombre del medicamento *'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _doseCtrl,
            decoration: _inputDeco('Dosis (ej. 50mg)'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _freqCtrl,
            decoration: _inputDeco('Frecuencia (ej. Una vez al día)'),
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _saving ? null : _guardar,
            style: FilledButton.styleFrom(
              backgroundColor: AliisColors.primary,
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12))),
            child: _saving
              ? const SizedBox(width: 20, height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : Text('Guardar', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDeco(String hint) => InputDecoration(
    hintText: hint,
    hintStyle: GoogleFonts.inter(color: AliisColors.mutedForeground, fontSize: 13),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AliisColors.border)),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AliisColors.primary, width: 2)),
  );
}
