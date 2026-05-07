import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/supabase_client.dart';
import '../../core/theme.dart';
import 'diario_provider.dart';

const _symptoms = [
  'Aura visual', 'Náuseas', 'Sensible a la luz', 'Sensible al ruido',
  'Hormigueo', 'Dificultad al hablar', 'Dolor pulsátil', 'Fatiga',
  'Presión arterial alta', 'Glucosa alta',
];

const _intensityColors = [
  Color(0xFFF3F4F6), Color(0xFFD1FAE5), Color(0xFF6EE7B7),
  Color(0xFFFEF3C7), Color(0xFFFED7AA), Color(0xFFFECACA),
];

const _intensityLabels = [
  'sin dolor', 'mínimo', 'leve', 'moderado', 'intenso', 'muy intenso',
];

class RegistroWizard extends ConsumerStatefulWidget {
  const RegistroWizard({super.key});

  @override
  ConsumerState<RegistroWizard> createState() => _RegistroWizardState();
}

class _RegistroWizardState extends ConsumerState<RegistroWizard> {
  int _intensity = 0;
  final Set<String> _selected = {};
  final _notesCtrl = TextEditingController();
  bool _saving = false;
  bool _saved = false;

  // Days with entries this week — fetched from provider history
  Set<int> _daysWithEntry = {};

  @override
  void initState() {
    super.initState();
    _loadWeekEntries();
  }

  @override
  void dispose() {
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadWeekEntries() async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;
    final weekStart = DateTime.now().subtract(Duration(days: DateTime.now().weekday - 1));
    final rows = await supabase
        .from('symptom_logs')
        .select('logged_at')
        .eq('user_id', userId)
        .gte('logged_at', weekStart.toIso8601String().substring(0, 10));
    if (!mounted) return;
    final days = <int>{};
    for (final r in rows as List) {
      final dt = DateTime.parse(r['logged_at'] as String);
      days.add(dt.weekday - 1); // 0=Mon … 6=Sun
    }
    setState(() => _daysWithEntry = days);
  }

  Future<void> _save() async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;
    setState(() => _saving = true);
    try {
      await supabase.from('symptom_logs').insert({
        'user_id': userId,
        'logged_at': DateTime.now().toIso8601String(),
        'free_text': jsonEncode({
          'intensidad': _intensity,
          'sintomas': _selected.toList(),
          'nota': _notesCtrl.text.trim(),
        }),
      });
      setState(() => _saved = true);
      ref.invalidate(diarioHistorialProvider);
      await Future.delayed(const Duration(milliseconds: 900));
      if (mounted) Navigator.of(context).pop();
    } catch (_) {
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
    final now = DateTime.now();
    final fecha = DateFormat("d 'de' MMMM", 'es').format(now).toUpperCase();
    // weekday: 1=Mon…7=Sun → index 0…6
    final todayIdx = now.weekday - 1;
    const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AliisColors.border)),
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: const Icon(Icons.chevron_left, size: 26, color: Color(0xFF6B7280)),
                  ),
                  const Expanded(
                    child: Center(
                      child: Text('DIARIO',
                        style: TextStyle(
                          fontSize: 10,
                          color: Color(0xFF9CA3AF),
                          letterSpacing: 1.8,
                          fontWeight: FontWeight.w500,
                        )),
                    ),
                  ),
                  const SizedBox(width: 26),
                ],
              ),
            ),

            // Scrollable body
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Date label
                    Text(fecha,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: const Color(0xFF9CA3AF),
                        letterSpacing: 1.5,
                        fontWeight: FontWeight.w500,
                      )),
                    const SizedBox(height: 4),

                    // Heading
                    RichText(
                      text: TextSpan(
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 26,
                          fontWeight: FontWeight.w400,
                          color: const Color(0xFF0F0F0F),
                          height: 1.2,
                        ),
                        children: [
                          const TextSpan(text: '¿Cómo va '),
                          TextSpan(
                            text: 'el día hoy?',
                            style: GoogleFonts.playfairDisplay(
                              fontSize: 26,
                              fontWeight: FontWeight.w400,
                              fontStyle: FontStyle.italic,
                              color: AliisColors.deepTeal,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Week days row
                    Row(
                      children: List.generate(7, (i) {
                        final isToday = i == todayIdx;
                        final hasEntry = _daysWithEntry.contains(i);
                        return Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(right: i < 6 ? 4 : 0),
                            child: Column(
                              children: [
                                Text(dayLabels[i],
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    color: const Color(0xFF9CA3AF),
                                  )),
                                const SizedBox(height: 4),
                                Container(
                                  height: 28,
                                  decoration: BoxDecoration(
                                    color: isToday
                                        ? const Color(0xFF272730)
                                        : hasEntry
                                            ? const Color(0xFFFDDDD5)
                                            : const Color(0xFFF3F4F6),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    isToday ? 'hoy' : hasEntry ? '!' : '',
                                    style: GoogleFonts.inter(
                                      fontSize: 9,
                                      fontWeight: FontWeight.w600,
                                      color: isToday
                                          ? Colors.white
                                          : hasEntry
                                              ? const Color(0xFFE55A36)
                                              : const Color(0xFF9CA3AF),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 24),

                    // Intensity label
                    Text('INTENSIDAD DEL DOLOR',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: const Color(0xFF9CA3AF),
                        letterSpacing: 1.5,
                        fontWeight: FontWeight.w500,
                      )),
                    const SizedBox(height: 10),

                    // Intensity buttons 0-5
                    Row(
                      children: List.generate(6, (v) {
                        final isSelected = _intensity == v;
                        return Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(right: v < 5 ? 6 : 0),
                            child: GestureDetector(
                              onTap: () => setState(() => _intensity = v),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 150),
                                height: 40,
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? const Color(0xFF272730)
                                      : _intensityColors[v],
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                alignment: Alignment.center,
                                child: Text('$v',
                                  style: GoogleFonts.inter(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: isSelected
                                        ? Colors.white
                                        : const Color(0xFF374151),
                                  )),
                              ),
                            ),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 6),
                    Center(
                      child: Text(_intensityLabels[_intensity],
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: const Color(0xFF9CA3AF),
                        )),
                    ),
                    const SizedBox(height: 20),

                    // Symptoms label
                    Text('¿QUÉ SÍNTOMAS? TOCA LOS QUE APLIQUEN',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: const Color(0xFF9CA3AF),
                        letterSpacing: 1.5,
                        fontWeight: FontWeight.w500,
                      )),
                    const SizedBox(height: 10),

                    // Symptom chips
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _symptoms.map((s) {
                        final active = _selected.contains(s);
                        return GestureDetector(
                          onTap: () => setState(() {
                            if (active) _selected.remove(s); else _selected.add(s);
                          }),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 7),
                            decoration: BoxDecoration(
                              color: active
                                  ? const Color(0xFF272730)
                                  : const Color(0xFFF3F4F6),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              active ? '✓ $s' : s,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: active
                                    ? Colors.white
                                    : const Color(0xFF6B7280),
                              )),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),

                    // Notes label
                    Text('ALGO MÁS QUE RECORDAR — OPCIONAL',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: const Color(0xFF9CA3AF),
                        letterSpacing: 1.5,
                        fontWeight: FontWeight.w500,
                      )),
                    const SizedBox(height: 8),

                    // Notes field
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8F8F8),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: TextField(
                        controller: _notesCtrl,
                        maxLines: 3,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: const Color(0xFF0F0F0F),
                          height: 1.6,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Empezó después de dormir mal, anoche...',
                          hintStyle: GoogleFonts.inter(
                            fontSize: 13,
                            color: const Color(0xFFD1D5DB),
                          ),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.all(14),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Save button
                    GestureDetector(
                      onTap: (_saving || _saved) ? null : _save,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: double.infinity,
                        height: 56,
                        decoration: BoxDecoration(
                          color: _saved
                              ? AliisColors.deepTeal
                              : const Color(0xFF272730),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        alignment: Alignment.center,
                        child: _saving
                            ? const SizedBox(
                                width: 22, height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white))
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  if (_saved)
                                    const Padding(
                                      padding: EdgeInsets.only(right: 8),
                                      child: Icon(Icons.check,
                                        color: Colors.white, size: 18),
                                    ),
                                  Text(
                                    _saved
                                        ? 'Guardado'
                                        : 'Guardar entrada de hoy',
                                    style: GoogleFonts.inter(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                    )),
                                ],
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
