class Treatment {
  final String id;
  final String userId;
  final String name;
  final String? dose;
  final String? frequencyLabel;
  final bool active;
  final String? updatedAt;

  const Treatment({
    required this.id,
    required this.userId,
    required this.name,
    this.dose,
    this.frequencyLabel,
    required this.active,
    this.updatedAt,
  });

  factory Treatment.fromJson(Map<String, dynamic> json) => Treatment(
    id: json['id'] as String,
    userId: json['user_id'] as String,
    name: json['name'] as String,
    dose: json['dose'] as String?,
    frequencyLabel: json['frequency_label'] as String?,
    active: json['active'] as bool? ?? true,
    updatedAt: json['updated_at'] as String?,
  );

  String get displayName => dose != null ? '$name $dose' : name;
}
