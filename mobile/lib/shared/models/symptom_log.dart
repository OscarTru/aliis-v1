class SymptomLog {
  final String id;
  final String userId;
  final DateTime loggedAt;
  final double? glucose;
  final int? bpSystolic;
  final int? bpDiastolic;
  final int? heartRate;
  final double? temperature;
  final double? weight;
  final String? note;
  final Map<String, dynamic>? freeText;

  const SymptomLog({
    required this.id,
    required this.userId,
    required this.loggedAt,
    this.glucose,
    this.bpSystolic,
    this.bpDiastolic,
    this.heartRate,
    this.temperature,
    this.weight,
    this.note,
    this.freeText,
  });

  factory SymptomLog.fromJson(Map<String, dynamic> json) => SymptomLog(
    id: json['id'] as String,
    userId: json['user_id'] as String,
    loggedAt: DateTime.parse(json['logged_at'] as String),
    glucose: (json['glucose'] as num?)?.toDouble(),
    bpSystolic: json['bp_systolic'] as int?,
    bpDiastolic: json['bp_diastolic'] as int?,
    heartRate: json['heart_rate'] as int?,
    temperature: (json['temperature'] as num?)?.toDouble(),
    weight: (json['weight'] as num?)?.toDouble(),
    note: json['note'] as String?,
    freeText: json['free_text'] as Map<String, dynamic>?,
  );
}
