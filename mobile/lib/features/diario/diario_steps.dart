enum StepType { mood, slider, vitals, boolean, text }

class DiarioStep {
  final String key;
  final String label;
  final StepType type;
  final String? hint;
  final String? unit;
  final double? min;
  final double? max;

  const DiarioStep({
    required this.key,
    required this.label,
    required this.type,
    this.hint,
    this.unit,
    this.min,
    this.max,
  });
}

const _stepMood = DiarioStep(
  key: 'mood', label: '¿Cómo te sientes hoy?', type: StepType.mood);

const _stepNota = DiarioStep(
  key: 'nota', label: 'Algo más que quieras anotar', type: StepType.text,
  hint: 'Síntomas, observaciones...');

const _stepFC = DiarioStep(
  key: 'heart_rate', label: 'Frecuencia cardíaca', type: StepType.vitals,
  unit: 'lpm', min: 30, max: 200);

const _stepTA = DiarioStep(
  key: 'bp', label: 'Presión arterial', type: StepType.vitals, unit: 'mmHg');

const _stepGlucosa = DiarioStep(
  key: 'glucose', label: 'Glucosa', type: StepType.vitals,
  unit: 'mg/dL', min: 20, max: 600);

const _stepTemp = DiarioStep(
  key: 'temperature', label: 'Temperatura (opcional)', type: StepType.vitals,
  unit: '°C', min: 34, max: 42);

const _stepDolor = DiarioStep(
  key: 'pain_intensity', label: 'Intensidad del dolor', type: StepType.slider,
  min: 0, max: 10);

const _stepEstres = DiarioStep(
  key: 'stress', label: 'Nivel de estrés', type: StepType.slider,
  min: 0, max: 10);

const _stepFatiga = DiarioStep(
  key: 'fatigue', label: 'Nivel de fatiga', type: StepType.slider,
  min: 0, max: 10);

const _stepAnimo = DiarioStep(
  key: 'mood_score', label: 'Estado de ánimo', type: StepType.slider,
  min: 0, max: 10);

const _stepAnsiedad = DiarioStep(
  key: 'anxiety', label: 'Nivel de ansiedad', type: StepType.slider,
  min: 0, max: 10);

const _stepSueno = DiarioStep(
  key: 'sleep_hours', label: 'Horas de sueño', type: StepType.slider,
  min: 0, max: 14);

const _stepNauseas = DiarioStep(
  key: 'nausea', label: '¿Náuseas o vómito?', type: StepType.boolean);

const _stepFotosensiblidad = DiarioStep(
  key: 'photosensitivity', label: '¿Fotosensibilidad?', type: StepType.boolean);

const _stepPalpitaciones = DiarioStep(
  key: 'palpitations', label: '¿Palpitaciones?', type: StepType.boolean);

const _stepEdema = DiarioStep(
  key: 'edema', label: '¿Edema en pies?', type: StepType.boolean);

const _stepDolPecho = DiarioStep(
  key: 'chest_pain', label: '¿Dolor en el pecho?', type: StepType.boolean);

const _stepHipoglucemia = DiarioStep(
  key: 'hypoglycemia', label: '¿Hipoglucemia hoy?', type: StepType.boolean);

const _stepSibilancias = DiarioStep(
  key: 'wheezing', label: '¿Sibilancias?', type: StepType.boolean);

const _stepInhalador = DiarioStep(
  key: 'rescue_inhaler', label: '¿Usó inhalador de rescate?', type: StepType.boolean);

const _stepRigidez = DiarioStep(
  key: 'morning_stiffness', label: '¿Rigidez matutina?', type: StepType.boolean);

const _stepBrote = DiarioStep(
  key: 'flare', label: '¿Brote activo?', type: StepType.boolean);

const _stepPensamientos = DiarioStep(
  key: 'intrusive_thoughts', label: '¿Pensamientos intrusivos?', type: StepType.boolean);

const _stepActividad = DiarioStep(
  key: 'activity', label: 'Nivel de actividad física', type: StepType.slider,
  min: 0, max: 10);

const _stepSaturacion = DiarioStep(
  key: 'oxygen_saturation', label: 'Saturación de O₂', type: StepType.vitals,
  unit: '%', min: 70, max: 100);

const Map<String, List<String>> _conditionKeywords = {
  'neuro': ['migraña', 'epilepsia', 'esclerosis múltiple', 'parkinson',
             'neuropatía', 'ecv', 'ictus', 'alzheimer', 'neurológi'],
  'cardio': ['hipertensión', 'arritmia', 'insuficiencia cardíaca', 'cardiovascular',
              'cardíaco', 'corazón', 'ecv', 'ictus'],
  'metabolic': ['diabetes', 'glucosa', 'obesidad', 'hipotiroidismo', 'síndrome metabólico',
                 'insulina', 'tiroides'],
  'respiratory': ['asma', 'epoc', 'fibrosis pulmonar', 'pulmonar', 'respiratori'],
  'autoimmune': ['lupus', 'artritis reumatoide', 'fibromialgia', 'crohn', 'colitis',
                  'autoinmune', 'reumatológi'],
  'mental': ['depresión', 'ansiedad', 'bipolar', 'tdah', 'trastorno', 'mental'],
};

List<DiarioStep> buildStepsForConditions(List<String> condiciones) {
  final lower = condiciones.map((c) => c.toLowerCase()).toList();
  final detected = <String>{};

  for (final cat in _conditionKeywords.keys) {
    for (final kw in _conditionKeywords[cat]!) {
      if (lower.any((c) => c.contains(kw))) {
        detected.add(cat);
        break;
      }
    }
  }

  final steps = <DiarioStep>[_stepMood];
  final keys = <String>{};

  void add(DiarioStep s) {
    if (!keys.contains(s.key)) {
      steps.add(s);
      keys.add(s.key);
    }
  }

  if (detected.isEmpty) {
    add(_stepFC);
    add(_stepSueno);
    add(_stepActividad);
  } else {
    if (detected.contains('neuro')) {
      add(_stepDolor);
      add(_stepNauseas);
      add(_stepFotosensiblidad);
      add(_stepSueno);
      add(_stepEstres);
      add(_stepFC);
    }
    if (detected.contains('cardio')) {
      add(_stepTA);
      add(_stepFC);
      add(_stepPalpitaciones);
      add(_stepEdema);
      add(_stepDolPecho);
      add(_stepActividad);
    }
    if (detected.contains('metabolic')) {
      add(_stepGlucosa);
      add(_stepHipoglucemia);
      add(_stepActividad);
      add(_stepTA);
    }
    if (detected.contains('respiratory')) {
      add(_stepSibilancias);
      add(_stepInhalador);
      add(_stepFC);
      add(_stepSaturacion);
      add(_stepActividad);
    }
    if (detected.contains('autoimmune')) {
      add(_stepDolor);
      add(_stepRigidez);
      add(_stepFatiga);
      add(_stepBrote);
      add(_stepTemp);
      add(_stepSueno);
    }
    if (detected.contains('mental')) {
      add(_stepAnimo);
      add(_stepAnsiedad);
      add(_stepSueno);
      add(_stepPensamientos);
      add(_stepActividad);
    }
  }

  add(_stepTemp);
  add(_stepNota);
  return steps;
}
