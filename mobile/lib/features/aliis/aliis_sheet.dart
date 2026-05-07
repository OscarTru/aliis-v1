import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import '../../core/supabase_client.dart';
import '../../core/theme.dart';

const _agentUrl = 'https://aliis.app/api/aliis/agent';

const _suggestions = [
  '¿Cómo distingo migraña de cefalea tensional?',
  '¿Qué hago durante una crisis de migraña?',
  '¿Mi tratamiento puede causar somnolencia?',
  '¿Cuándo debo ir a urgencias por un dolor de cabeza?',
];

class _ChatMessage {
  final String text;
  final bool isUser;
  final bool isLoading;
  _ChatMessage({required this.text, required this.isUser, this.isLoading = false});
}

class AliisSheet extends ConsumerStatefulWidget {
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
  ConsumerState<AliisSheet> createState() => _AliisSheetState();
}

class _AliisSheetState extends ConsumerState<AliisSheet> {
  final _messages = <_ChatMessage>[
    _ChatMessage(text: '¡Hola! Soy Aliis. ¿En qué puedo ayudarte hoy?', isUser: false),
  ];
  final _scrollController = ScrollController();
  bool _sending = false;

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _send(String text) async {
    if (_sending || text.isEmpty) return;

    setState(() {
      _messages.add(_ChatMessage(text: text, isUser: true));
      _messages.add(_ChatMessage(text: '', isUser: false, isLoading: true));
      _sending = true;
    });
    _scrollToBottom();

    try {
      final session = supabase.auth.currentSession;
      final token = session?.accessToken;
      if (token == null) {
        _replaceLoading('Necesitas iniciar sesión para hablar con Aliis.');
        return;
      }

      final history = _messages
          .where((m) => !m.isLoading)
          .take(_messages.length - 2)
          .map((m) => {'role': m.isUser ? 'user' : 'assistant', 'content': m.text})
          .where((m) => (m['content'] as String).isNotEmpty)
          .toList();

      final body = jsonEncode({
        'message': text,
        'screen': 'mobile',
        'history': history,
      });

      final response = await http.post(
        Uri.parse(_agentUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: body,
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body) as Map<String, dynamic>;
        final reply = json['reply'] as String? ?? json['text'] as String? ?? '…';
        _replaceLoading(reply);
      } else {
        _replaceLoading('Algo salió mal. Intenta de nuevo.');
      }
    } on TimeoutException {
      _replaceLoading('La respuesta tardó demasiado. Intenta de nuevo.');
    } catch (_) {
      _replaceLoading('No pude conectarme. Verifica tu conexión.');
    } finally {
      setState(() => _sending = false);
      _scrollToBottom();
    }
  }

  void _replaceLoading(String text) {
    setState(() {
      final idx = _messages.lastIndexWhere((m) => m.isLoading);
      if (idx != -1) {
        _messages[idx] = _ChatMessage(text: text, isUser: false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, __) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Color(0xFFE5E7EB), width: 1),
                ),
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: const Icon(
                      Icons.chevron_left,
                      size: 22,
                      color: Color(0xFF4B5563),
                    ),
                  ),
                  Expanded(
                    child: Column(
                      children: [
                        Text(
                          'Pregunta · Migraña',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            letterSpacing: 0.1 * 11,
                            color: const Color(0xFF9CA3AF),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 2),
                        _OnlineBadge(),
                      ],
                    ),
                  ),
                  // Spacer to mirror chevron width and keep title centered
                  const SizedBox(width: 22),
                ],
              ),
            ),

            // Messages
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                itemCount: _messages.length + (_sending ? 0 : 1),
                itemBuilder: (context, i) {
                  // Last item: suggestions or nothing when sending
                  if (i == _messages.length) {
                    final realCount =
                        _messages.where((m) => !m.isLoading).length;
                    if (realCount < 4) {
                      return _SuggestionChips(onTap: _send);
                    }
                    return const SizedBox.shrink();
                  }

                  final msg = _messages[i];
                  if (msg.isLoading) {
                    return const Padding(
                      padding: EdgeInsets.only(bottom: 16),
                      child: _TypingRow(),
                    );
                  }
                  if (msg.isUser) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _UserBubble(text: msg.text),
                    );
                  }
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: _AliisBubble(text: msg.text),
                  );
                },
              ),
            ),

            // Input bar
            _ChatInput(
              onSend: _send,
              enabled: !_sending,
            ),
            SizedBox(height: MediaQuery.of(context).padding.bottom + 12),
          ],
        ),
      ),
    );
  }
}

// ── Online badge ────────────────────────────────────────────────────────────

class _OnlineBadge extends StatefulWidget {
  @override
  State<_OnlineBadge> createState() => _OnlineBadgeState();
}

class _OnlineBadgeState extends State<_OnlineBadge>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse;
  late final Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _opacity = Tween<double>(begin: 0.3, end: 1.0).animate(_pulse);
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5EF),
        borderRadius: BorderRadius.circular(99),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          FadeTransition(
            opacity: _opacity,
            child: Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: Color(0xFF1B6B54),
                shape: BoxShape.circle,
              ),
            ),
          ),
          const SizedBox(width: 4),
          Text(
            'En línea',
            style: GoogleFonts.inter(
              fontSize: 11,
              color: const Color(0xFF1B6B54),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Aliis avatar ────────────────────────────────────────────────────────────

class _AliisAvatar extends StatelessWidget {
  const _AliisAvatar();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28,
      height: 28,
      decoration: const BoxDecoration(
        color: AliisColors.deepTeal,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Text(
        'A',
        style: GoogleFonts.inter(
          fontSize: 10,
          color: Colors.white,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

// ── Aliis bubble (with avatar) ──────────────────────────────────────────────

class _AliisBubble extends StatelessWidget {
  final String text;
  const _AliisBubble({required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        const _AliisAvatar(),
        const SizedBox(width: 8),
        Flexible(
          child: Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.8,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFF3F4F6),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(16),
              ),
            ),
            child: Text(
              text,
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AliisColors.foreground,
                height: 1.5,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ── User bubble ─────────────────────────────────────────────────────────────

class _UserBubble extends StatelessWidget {
  final String text;
  const _UserBubble({required this.text});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerRight,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.8,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(
          color: AliisColors.foreground,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
            bottomLeft: Radius.circular(16),
            bottomRight: Radius.circular(4),
          ),
        ),
        child: Text(
          text,
          style: GoogleFonts.inter(
            fontSize: 14,
            color: Colors.white,
            height: 1.5,
          ),
        ),
      ),
    );
  }
}

// ── Typing indicator ────────────────────────────────────────────────────────

class _TypingRow extends StatelessWidget {
  const _TypingRow();

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        const _AliisAvatar(),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: const BoxDecoration(
            color: Color(0xFFF3F4F6),
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(16),
              topRight: Radius.circular(16),
              bottomLeft: Radius.circular(4),
              bottomRight: Radius.circular(16),
            ),
          ),
          child: const _ThreeDots(),
        ),
      ],
    );
  }
}

class _ThreeDots extends StatefulWidget {
  const _ThreeDots();

  @override
  State<_ThreeDots> createState() => _ThreeDotsState();
}

class _ThreeDotsState extends State<_ThreeDots>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (i) {
            final delay = i / 3;
            final t = (_controller.value - delay).clamp(0.0, 1.0);
            final opacity = (t < 0.5 ? t * 2 : (1 - t) * 2).clamp(0.3, 1.0);
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 2),
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: const Color(0xFF9CA3AF).withValues(alpha: opacity),
                shape: BoxShape.circle,
              ),
            );
          }),
        );
      },
    );
  }
}

// ── Suggestion chips ────────────────────────────────────────────────────────

class _SuggestionChips extends StatelessWidget {
  final Future<void> Function(String) onTap;
  const _SuggestionChips({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 8),
        Text(
          'SEGUIR PREGUNTANDO',
          style: GoogleFonts.inter(
            fontSize: 11,
            letterSpacing: 0.1 * 11,
            color: const Color(0xFF9CA3AF),
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        ..._suggestions.map(
          (s) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: GestureDetector(
              onTap: () => onTap(s),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8F8F8),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  s,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: AliisColors.foreground,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Chat input ───────────────────────────────────────────────────────────────

class _ChatInput extends StatefulWidget {
  final Future<void> Function(String) onSend;
  final bool enabled;
  const _ChatInput({required this.onSend, required this.enabled});

  @override
  State<_ChatInput> createState() => _ChatInputState();
}

class _ChatInputState extends State<_ChatInput> {
  final _controller = TextEditingController();
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(() {
      final hasText = _controller.text.trim().isNotEmpty;
      if (hasText != _hasText) {
        setState(() => _hasText = hasText);
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    final text = _controller.text.trim();
    if (text.isEmpty || !widget.enabled) return;
    _controller.clear();
    widget.onSend(text);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Row(
        children: [
          // Plus button
          Container(
            width: 36,
            height: 36,
            decoration: const BoxDecoration(
              color: Color(0xFFF3F4F6),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.add,
              size: 18,
              color: Color(0xFF6B7280),
            ),
          ),
          const SizedBox(width: 8),
          // Text field container
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      enabled: widget.enabled,
                      onSubmitted: (_) => _submit(),
                      decoration: InputDecoration(
                        hintText: 'Escribe a Aliis...',
                        hintStyle: GoogleFonts.inter(
                          fontSize: 14,
                          color: AliisColors.mutedFg,
                        ),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: const EdgeInsets.symmetric(vertical: 8),
                      ),
                      style: GoogleFonts.inter(fontSize: 14),
                    ),
                  ),
                  const SizedBox(width: 4),
                  // Send button
                  GestureDetector(
                    onTap: _hasText ? _submit : null,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: _hasText
                            ? AliisColors.foreground
                            : const Color(0xFFE5E7EB),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.arrow_upward,
                        size: 13,
                        color: _hasText ? Colors.white : const Color(0xFF9CA3AF),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
