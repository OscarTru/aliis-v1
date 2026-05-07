import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../shared/models/app_notification.dart';
import 'alertas_provider.dart';

class AlertasScreen extends ConsumerWidget {
  const AlertasScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alertasAsync = ref.watch(alertasProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: alertasAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => RefreshIndicator(
            onRefresh: () async => ref.invalidate(alertasProvider),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                const SizedBox(height: 200),
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Error cargando alertas',
                        style: GoogleFonts.inter(color: AliisColors.mutedFg)),
                      const SizedBox(height: 12),
                      TextButton(
                        onPressed: () => ref.invalidate(alertasProvider),
                        child: const Text('Reintentar'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          data: (notifications) => RefreshIndicator(
            onRefresh: () async => ref.invalidate(alertasProvider),
            child: _AlertasContent(notifications: notifications, ref: ref),
          ),
        ),
      ),
    );
  }
}

class _AlertasContent extends StatelessWidget {
  final List<AppNotification> notifications;
  final WidgetRef ref;
  const _AlertasContent({required this.notifications, required this.ref});

  @override
  Widget build(BuildContext context) {
    final unread = notifications.where((n) => !n.read).toList();
    final read = notifications.where((n) => n.read).toList();
    final unreadCount = unread.length;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
      children: [
        // Eyebrow
        Text(
          '· Alertas · ${unreadCount > 0 ? '$unreadCount cosas que mirar' : 'todo al día'}',
          style: GoogleFonts.inter(
            fontSize: 10,
            letterSpacing: 1.5,
            color: AliisColors.mutedFg,
          ),
        ),
        const SizedBox(height: 4),

        // Heading Playfair
        RichText(
          text: TextSpan(
            style: GoogleFonts.playfairDisplay(
              fontSize: 30,
              fontWeight: FontWeight.w400,
              color: AliisColors.foreground,
              height: 1.1,
            ),
            children: [
              const TextSpan(text: 'Lo que '),
              TextSpan(
                text: 'te toca hoy.',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 30,
                  fontWeight: FontWeight.w400,
                  fontStyle: FontStyle.italic,
                  color: const Color(0xFF1B6B54),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // HOY — alertas sin leer (urgentes)
        if (unread.isNotEmpty) ...[
          Text('HOY',
            style: GoogleFonts.inter(
              fontSize: 10,
              letterSpacing: 1.5,
              color: AliisColors.mutedFg,
              fontWeight: FontWeight.w500,
            )),
          const SizedBox(height: 12),
          ...unread.map((n) => _UrgentCard(n: n, ref: ref)),
          const SizedBox(height: 20),
        ],

        // ESTA SEMANA — alertas leídas / citas
        if (read.isNotEmpty) ...[
          Text('ESTA SEMANA',
            style: GoogleFonts.inter(
              fontSize: 10,
              letterSpacing: 1.5,
              color: AliisColors.mutedFg,
              fontWeight: FontWeight.w500,
            )),
          const SizedBox(height: 12),
          ...read.map((n) => _AppointmentCard(n: n)),
          const SizedBox(height: 20),
        ],

        // DIARIO DE CEFALEAS — siempre visible con datos mock + real
        Text('DIARIO DE CEFALEAS',
          style: GoogleFonts.inter(
            fontSize: 10,
            letterSpacing: 1.5,
            color: AliisColors.mutedFg,
            fontWeight: FontWeight.w500,
          )),
        const SizedBox(height: 12),
        const _HeadacheDiaryCard(),
        const SizedBox(height: 20),

        // MEDICACIÓN — siempre visible
        Text('MEDICACIÓN',
          style: GoogleFonts.inter(
            fontSize: 10,
            letterSpacing: 1.5,
            color: AliisColors.mutedFg,
            fontWeight: FontWeight.w500,
          )),
        const SizedBox(height: 12),
        const _MedicationRow(
          name: 'Topiramato 25mg',
          time: '8:00 · mañana',
          taken: true,
        ),
        const SizedBox(height: 8),
        const _MedicationRow(
          name: 'Magnesio 400mg',
          time: '21:00 · noche',
          taken: false,
        ),

        if (notifications.isEmpty && unread.isEmpty && read.isEmpty) ...[
          const SizedBox(height: 40),
          Center(
            child: Column(
              children: [
                const Icon(Icons.check_circle_outline,
                  size: 48, color: Color(0xFF1B6B54)),
                const SizedBox(height: 16),
                Text('Todo en orden por hoy.',
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 18,
                    fontWeight: FontWeight.w400,
                    color: AliisColors.foreground,
                  )),
                const SizedBox(height: 8),
                Text('No hay alertas pendientes.',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: AliisColors.mutedFg,
                  )),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _UrgentCard extends StatelessWidget {
  final AppNotification n;
  final WidgetRef ref;
  const _UrgentCard({required this.n, required this.ref});

  @override
  Widget build(BuildContext context) {
    final isAppointment = n.type == 'appointment';
    final bgColor = isAppointment
        ? const Color(0xFFF8FAF9)
        : const Color(0xFFFFF8F5);
    final borderColor = isAppointment
        ? const Color(0xFFD1E8DF)
        : const Color(0xFFFDDDD5);
    final accentColor = isAppointment
        ? const Color(0xFF1B6B54)
        : const Color(0xFFE55A36);
    final label = isAppointment ? '— Consulta' : '— Urgente · Revisa antes de tomar';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: isAppointment ? 1 : 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Label row with lines (matches Figma urgent style)
          if (!isAppointment)
            Row(
              children: [
                Expanded(child: Divider(color: borderColor, height: 1)),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Text(label,
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      letterSpacing: 1.2,
                      fontWeight: FontWeight.w600,
                      color: accentColor,
                    )),
                ),
                Expanded(child: Divider(color: borderColor, height: 1)),
              ],
            )
          else
            Text(label,
              style: GoogleFonts.inter(
                fontSize: 10,
                letterSpacing: 1.2,
                fontWeight: FontWeight.w600,
                color: accentColor,
              )),
          const SizedBox(height: 8),
          Text(n.title,
            style: GoogleFonts.playfairDisplay(
              fontSize: 17,
              fontWeight: FontWeight.w400,
              color: AliisColors.foreground,
            )),
          const SizedBox(height: 4),
          Text(n.body,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: const Color(0xFF6B7280),
              height: 1.4,
            )),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 44,
                  child: ElevatedButton(
                    onPressed: () async {
                      await marcarLeida(n.id);
                      ref.invalidate(alertasProvider);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AliisColors.foreground,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text('Marcar leída',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      )),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: SizedBox(
                  height: 44,
                  child: OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF6B7280),
                      side: BorderSide.none,
                      backgroundColor: const Color(0xFFF3F4F6),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text('Saltar',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: const Color(0xFF6B7280),
                      )),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AppointmentCard extends StatelessWidget {
  final AppNotification n;
  const _AppointmentCard({required this.n});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAF9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFD1E8DF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('— ${n.type == 'appointment' ? 'Consulta' : 'Esta semana'}',
            style: GoogleFonts.inter(
              fontSize: 10,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF1B6B54),
            )),
          const SizedBox(height: 6),
          Text(n.title,
            style: GoogleFonts.playfairDisplay(
              fontSize: 16,
              fontWeight: FontWeight.w400,
              color: AliisColors.foreground,
            )),
          const SizedBox(height: 4),
          Text(n.body,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: const Color(0xFF6B7280),
              height: 1.4,
            )),
        ],
      ),
    );
  }
}

// Mock headache data matching Figma
const _headacheData = [
  (day: 'L', value: 0),
  (day: 'M', value: 3),
  (day: 'X', value: 0),
  (day: 'J', value: 4),
  (day: 'V', value: 0),
  (day: 'S', value: 0),
  (day: 'D', value: 2),
];

class _HeadacheDiaryCard extends StatelessWidget {
  const _HeadacheDiaryCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Esta semana',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: const Color(0xFF6B7280),
                )),
              Text('2 episodios',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: AliisColors.mutedFg,
                )),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 70,
            child: CustomPaint(
              painter: _HeadacheChartPainter(),
              size: Size(MediaQuery.of(context).size.width - 72, 70),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 40,
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF6B7280),
                side: BorderSide.none,
                backgroundColor: const Color(0xFFF3F4F6),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text('+ Apuntar episodio',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF6B7280),
                )),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeadacheChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final maxValue = 5.0;
    final barWidth = size.width / _headacheData.length;
    final barAreaHeight = size.height - 16; // leave room for labels

    for (var i = 0; i < _headacheData.length; i++) {
      final entry = _headacheData[i];
      final x = i * barWidth + barWidth * 0.15;
      final w = barWidth * 0.7;

      // Bar color
      Color barColor;
      if (entry.value == 0) {
        barColor = const Color(0xFFF3F4F6);
      } else if (entry.value > 3) {
        barColor = const Color(0xFFE55A36);
      } else {
        barColor = const Color(0xFF1B6B54);
      }

      // Bar height (minimum 4 for empty bars)
      final normalizedHeight = entry.value == 0
          ? 4.0
          : (entry.value / maxValue) * barAreaHeight;
      final barTop = barAreaHeight - normalizedHeight;

      final paint = Paint()
        ..color = barColor
        ..style = PaintingStyle.fill;

      final rrect = RRect.fromRectAndCorners(
        Rect.fromLTWH(x, barTop, w, normalizedHeight),
        topLeft: const Radius.circular(3),
        topRight: const Radius.circular(3),
      );
      canvas.drawRRect(rrect, paint);

      // Day label
      final textPainter = TextPainter(
        text: TextSpan(
          text: entry.day,
          style: const TextStyle(
            fontSize: 10,
            color: Color(0xFF9CA3AF),
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      textPainter.paint(
        canvas,
        Offset(x + w / 2 - textPainter.width / 2, barAreaHeight + 4),
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _MedicationRow extends StatefulWidget {
  final String name;
  final String time;
  final bool taken;
  const _MedicationRow({
    required this.name,
    required this.time,
    required this.taken,
  });

  @override
  State<_MedicationRow> createState() => _MedicationRowState();
}

class _MedicationRowState extends State<_MedicationRow> {
  late bool _taken;

  @override
  void initState() {
    super.initState();
    _taken = widget.taken;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFE5E7EB)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: const BoxDecoration(
              color: Color(0xFFFFF0EB),
              shape: BoxShape.circle,
            ),
            child: const Center(child: Text('💊', style: TextStyle(fontSize: 14))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.name,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AliisColors.foreground,
                  )),
                Text(widget.time,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: AliisColors.mutedFg,
                  )),
              ],
            ),
          ),
          if (_taken) ...[
            GestureDetector(
              onTap: () => setState(() => _taken = true),
              child: Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  color: Color(0xFF1B6B54),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, size: 14, color: Colors.white),
              ),
            ),
            const SizedBox(width: 6),
            GestureDetector(
              onTap: () => setState(() => _taken = false),
              child: Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  color: Color(0xFFF3F4F6),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.close, size: 14, color: Color(0xFF9CA3AF)),
              ),
            ),
          ] else
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(20),
              ),
              child: GestureDetector(
                onTap: () => setState(() => _taken = true),
                child: Text('Marcar',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: AliisColors.mutedFg,
                  )),
              ),
            ),
        ],
      ),
    );
  }
}
