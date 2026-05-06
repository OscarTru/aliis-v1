class Chapter {
  final String id;
  final String n;
  final String kicker;
  final String tldr;
  final List<String> paragraphs;

  const Chapter({
    required this.id,
    required this.n,
    required this.kicker,
    required this.tldr,
    required this.paragraphs,
  });

  factory Chapter.fromJson(Map<String, dynamic> json) => Chapter(
    id: json['id'] as String,
    n: json['n'] as String,
    kicker: json['kicker'] as String,
    tldr: json['tldr'] as String,
    paragraphs: (json['paragraphs'] as List<dynamic>? ?? [])
        .map((p) => p as String)
        .toList(),
  );
}

class Pack {
  final String id;
  final String dx;
  final String? summary;
  final DateTime createdAt;
  final List<Chapter> chapters;

  const Pack({
    required this.id,
    required this.dx,
    this.summary,
    required this.createdAt,
    required this.chapters,
  });

  factory Pack.fromJson(Map<String, dynamic> json) => Pack(
    id: json['id'] as String,
    dx: json['dx'] as String,
    summary: json['summary'] as String?,
    createdAt: DateTime.parse(json['created_at'] as String),
    chapters: (json['chapters'] as List? ?? [])
        .map((c) => Chapter.fromJson(c as Map<String, dynamic>))
        .toList(),
  );
}
