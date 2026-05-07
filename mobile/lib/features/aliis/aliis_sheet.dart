import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../home/home_provider.dart';

class AliisSheet extends ConsumerWidget {
  const AliisSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AliisSheet(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeAsync = ref.watch(homeProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AliisColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Aliis',
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 22,
                      fontStyle: FontStyle.italic,
                      fontWeight: FontWeight.w300,
                      color: AliisColors.foreground,
                    )),
                  Text('Tu acompañante de salud',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      color: AliisColors.mutedFg,
                    )),
                ],
              ),
            ),
            const SizedBox(height: 16),

            homeAsync.maybeWhen(
              data: (data) => _ContextStrip(data: data),
              orElse: () => const SizedBox.shrink(),
            ),

            const Divider(height: 1, color: AliisColors.border),
            const SizedBox(height: 8),

            Expanded(
              child: ListView(
                controller: controller,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                children: [
                  _AliisBubble(
                    text: '¡Hola! Soy Aliis. ¿En qué puedo ayudarte hoy?',
                  ),
                ],
              ),
            ),

            _ChatInput(onSend: (_) {}),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

class _ContextStrip extends StatelessWidget {
  final HomeData data;
  const _ContextStrip({required this.data});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: IntrinsicHeight(
        child: Row(
          children: [
            _ContextCell(label: 'Adherencia', value: '${data.adherencia14d}%'),
            Container(width: 1, color: AliisColors.border),
            _ContextCell(
              label: 'Registros',
              value: '${data.diasRegistrados30d}d'),
            Container(width: 1, color: AliisColors.border),
            _ContextCell(
              label: 'Tratamientos',
              value: '${data.treatments.length}'),
          ],
        ),
      ),
    );
  }
}

class _ContextCell extends StatelessWidget {
  final String label;
  final String value;
  const _ContextCell({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Column(
          children: [
            Text(value,
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AliisColors.primary,
              )),
            Text(label,
              style: GoogleFonts.inter(
                fontSize: 9,
                color: AliisColors.mutedFg,
              )),
          ],
        ),
      ),
    );
  }
}

class _AliisBubble extends StatelessWidget {
  final String text;
  const _AliisBubble({required this.text});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: const BoxDecoration(
          color: Color(0xFFF7F7F7),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(14),
            topRight: Radius.circular(14),
            bottomLeft: Radius.circular(4),
            bottomRight: Radius.circular(14),
          ),
        ),
        child: Text(text,
          style: GoogleFonts.inter(
            fontSize: 13,
            color: AliisColors.foreground,
            height: 1.5,
          )),
      ),
    );
  }
}

class _ChatInput extends StatefulWidget {
  final ValueChanged<String> onSend;
  const _ChatInput({required this.onSend});

  @override
  State<_ChatInput> createState() => _ChatInputState();
}

class _ChatInputState extends State<_ChatInput> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: const Color(0xFFE8E8E8)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: TextField(
                controller: _controller,
                decoration: InputDecoration(
                  hintText: 'Escribe un mensaje...',
                  hintStyle: GoogleFonts.inter(
                    fontSize: 13, color: AliisColors.mutedFg),
                  border: InputBorder.none,
                ),
                style: GoogleFonts.inter(fontSize: 13),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () {
              if (_controller.text.trim().isNotEmpty) {
                widget.onSend(_controller.text.trim());
                _controller.clear();
              }
            },
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AliisColors.deepTeal,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AliisColors.primary.withValues(alpha: 0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: const Icon(Icons.arrow_upward,
                color: Colors.white, size: 18),
            ),
          ),
        ],
      ),
    );
  }
}
