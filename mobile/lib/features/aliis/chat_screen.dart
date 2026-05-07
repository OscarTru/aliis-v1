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
  '¿Cómo va mi adherencia?',
  '¿Qué síntomas he tenido esta semana?',
  '¿Qué debo llevar a mi próxima cita?',
];

class _Msg {
  final String text;
  final bool isUser;
  final bool isLoading;
  _Msg({required this.text, required this.isUser, this.isLoading = false});
}

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _messages = <_Msg>[
    _Msg(text: '¡Hola! Soy Aliis. ¿En qué puedo ayudarte hoy?', isUser: false),
  ];
  final _scrollController = ScrollController();
  final _textController = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _scrollController.dispose();
    _textController.dispose();
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
    if (_sending || text.trim().isEmpty) return;
    setState(() {
      _messages.add(_Msg(text: text, isUser: true));
      _messages.add(_Msg(text: '', isUser: false, isLoading: true));
      _sending = true;
    });
    _scrollToBottom();

    try {
      final token = supabase.auth.currentSession?.accessToken;
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

      final response = await http.post(
        Uri.parse(_agentUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'message': text, 'screen': 'mobile', 'history': history}),
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
      if (idx != -1) _messages[idx] = _Msg(text: text, isUser: false);
    });
  }

  void _submit() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;
    _textController.clear();
    _send(text);
  }

  @override
  Widget build(BuildContext context) {
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AliisColors.border)),
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: const Icon(Icons.chevron_left, size: 26, color: Color(0xFF374151)),
                  ),
                  const Spacer(),
                  Column(
                    children: [
                      Text('ALIIS',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          letterSpacing: 1.5,
                          color: AliisColors.mutedFg,
                        )),
                      const SizedBox(height: 3),
                      _OnlineBadge(),
                    ],
                  ),
                  const Spacer(),
                  const SizedBox(width: 26),
                ],
              ),
            ),

            // Messages
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                itemCount: _messages.length +
                    (!_sending && _messages.length < 4 ? 1 : 0),
                itemBuilder: (_, i) {
                  if (i == _messages.length) {
                    return _SuggestionsBlock(onTap: (s) {
                      _textController.clear();
                      _send(s);
                    });
                  }
                  final msg = _messages[i];
                  if (msg.isLoading) return _TypingBubble();
                  return msg.isUser
                      ? _UserBubble(text: msg.text)
                      : _AliisBubble(text: msg.text);
                },
              ),
            ),

            // Input
            Container(
              padding: EdgeInsets.fromLTRB(16, 8, 16, bottomPad > 0 ? bottomPad : 16),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AliisColors.border)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: TextField(
                        controller: _textController,
                        enabled: !_sending,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _submit(),
                        decoration: InputDecoration(
                          hintText: 'Escribe a Aliis...',
                          hintStyle: GoogleFonts.inter(
                            fontSize: 14,
                            color: AliisColors.mutedFg,
                          ),
                          border: InputBorder.none,
                        ),
                        style: GoogleFonts.inter(fontSize: 14, color: AliisColors.foreground),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ValueListenableBuilder<TextEditingValue>(
                    valueListenable: _textController,
                    builder: (_, val, __) {
                      final hasText = val.text.trim().isNotEmpty;
                      return GestureDetector(
                        onTap: _submit,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: hasText && !_sending
                                ? AliisColors.foreground
                                : const Color(0xFFE5E7EB),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.arrow_upward, color: Colors.white, size: 18),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnlineBadge extends StatefulWidget {
  @override
  State<_OnlineBadge> createState() => _OnlineBadgeState();
}

class _OnlineBadgeState extends State<_OnlineBadge>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
      ..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.4, end: 1.0).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5EF),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedBuilder(
            animation: _anim,
            builder: (_, __) => Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: AliisColors.deepTeal.withValues(alpha: _anim.value),
                shape: BoxShape.circle,
              ),
            ),
          ),
          const SizedBox(width: 4),
          Text('En línea',
            style: GoogleFonts.inter(
              fontSize: 11,
              color: AliisColors.deepTeal,
              fontWeight: FontWeight.w500,
            )),
        ],
      ),
    );
  }
}

class _AliisBubble extends StatelessWidget {
  final String text;
  const _AliisBubble({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            margin: const EdgeInsets.only(right: 8, top: 2),
            decoration: const BoxDecoration(
              color: AliisColors.deepTeal,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text('A',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                )),
            ),
          ),
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: Color(0xFFF3F4F6),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(18),
                  topRight: Radius.circular(18),
                  bottomLeft: Radius.circular(4),
                  bottomRight: Radius.circular(18),
                ),
              ),
              child: Text(text,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: AliisColors.foreground,
                  height: 1.5,
                )),
            ),
          ),
        ],
      ),
    );
  }
}

class _UserBubble extends StatelessWidget {
  final String text;
  const _UserBubble({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: AliisColors.foreground,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(18),
                  topRight: Radius.circular(18),
                  bottomLeft: Radius.circular(18),
                  bottomRight: Radius.circular(4),
                ),
              ),
              child: Text(text,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: Colors.white,
                  height: 1.5,
                )),
            ),
          ),
        ],
      ),
    );
  }
}

class _TypingBubble extends StatefulWidget {
  @override
  State<_TypingBubble> createState() => _TypingBubbleState();
}

class _TypingBubbleState extends State<_TypingBubble>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
      ..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            margin: const EdgeInsets.only(right: 8, top: 2),
            decoration: const BoxDecoration(
              color: AliisColors.deepTeal,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text('A',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                )),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: const BoxDecoration(
              color: Color(0xFFF3F4F6),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(18),
                topRight: Radius.circular(18),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(18),
              ),
            ),
            child: AnimatedBuilder(
              animation: _ctrl,
              builder: (_, __) => Row(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(3, (i) {
                  final delay = i / 3;
                  final t = (_ctrl.value - delay).clamp(0.0, 1.0);
                  final opacity = (t < 0.5 ? t * 2 : (1 - t) * 2).clamp(0.3, 1.0);
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    width: 7,
                    height: 7,
                    decoration: BoxDecoration(
                      color: AliisColors.mutedFg.withValues(alpha: opacity),
                      shape: BoxShape.circle,
                    ),
                  );
                }),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SuggestionsBlock extends StatelessWidget {
  final void Function(String) onTap;
  const _SuggestionsBlock({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('SEGUIR PREGUNTANDO',
            style: GoogleFonts.inter(
              fontSize: 10,
              letterSpacing: 1.5,
              color: AliisColors.mutedFg,
            )),
          const SizedBox(height: 8),
          ..._suggestions.map((s) => GestureDetector(
            onTap: () => onTap(s),
            child: Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8F8F8),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(s,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: const Color(0xFF6B7280),
                )),
            ),
          )),
        ],
      ),
    );
  }
}
