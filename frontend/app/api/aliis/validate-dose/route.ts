import { generateText } from 'ai'
import { models } from '@/lib/ai-providers'

export async function POST(req: Request) {
  const { name, dose } = await req.json()
  if (!name?.trim()) {
    return Response.json({ error: 'Falta nombre' }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: models.insight,
      prompt: `Eres un farmacéutico clínico experto. Tu tarea es validar el nombre y dosis de un medicamento registrado por un paciente, con foco en su seguridad.

Medicamento escrito por el paciente: "${name.trim()}"
Dosis escrita: "${dose?.trim() || ''}"

Responde SOLO con JSON válido, sin markdown, sin explicación:
{
  "nameNormalized": "nombre genérico correcto en español, primera letra mayúscula. Corrige errores ortográficos y expande abreviaturas (ASS→Ácido acetilsalicílico, HCT→Hidroclorotiazida, MTX→Metotrexato, etc.). SIEMPRE normaliza, nunca devuelvas el input sin corregir",
  "nameConfidence": "high si identificas el medicamento aunque tenga errores. low SOLO si es completamente irreconocible",
  "unit": "unidad estándar para este medicamento (mg, mcg, UI, ml, g). Vacío si no aplica",
  "doseNormalized": "SOLO el número y unidad, sin nombre. Ej: '20 mg', '0.5 mcg', '100 UI'. Vacío si no hay dosis",
  "warning": false,
  "warningLevel": "none | caution | danger",
  "warningMessage": "Mensaje en español, tono cálido y de confianza, hablando de tú. Directo pero sin alarmar innecesariamente. Si la dosis no existe como presentación → menciona las que sí existen. Si hay riesgo de toxicidad → explica el riesgo concreto y el máximo seguro. Ej: 'La Atorvastatina viene en 10, 20, 40 y 80 mg — 50 mg no es una presentación estándar, revisa tu receta.' o 'La dosis máxima segura de Paracetamol es 4,000 mg al día — con esta dosis podrías estar en riesgo de daño hepático.' Vacío si no hay warning"
}

CRITERIOS DE SEGURIDAD — evalúa en este orden:

1. PRESENTACIÓN INEXISTENTE (warningLevel: caution)
   La dosis no corresponde a ninguna presentación comercial estándar del medicamento.
   Ejemplos: Atorvastatina 50mg (existe: 10,20,40,80mg), Omeprazol 15mg (existe: 10,20,40mg),
   Metformina 300mg (existe: 500,850,1000mg), Levotiroxina 75mcg (existe: 25,50,100,150mcg)

2. DOSIS ALTA SIN RIESGO INMEDIATO (warningLevel: caution)
   Supera el máximo terapéutico habitual pero no es tóxica de forma aguda.
   Ejemplos: Ibuprofeno 1200mg dosis única, Enalapril 40mg/día, Metoprolol 400mg/día

3. DOSIS POTENCIALMENTE TÓXICA (warningLevel: danger)
   Cerca o por encima del umbral de toxicidad conocido.
   Ejemplos: Paracetamol >4000mg/día (hepatotoxicidad), Digoxina >0.25mg/día (arritmia),
   Warfarina >15mg/día, Metotrexato >25mg/semana en no oncología,
   Levotiroxina >300mcg/día, Litio >2400mg/día, Colchicina >6mg/día

4. DOSIS LETAL O CRÍTICA (warningLevel: danger)
   Supera ampliamente umbrales de toxicidad grave.
   Ejemplos: Paracetamol >8000mg, Digoxina >1mg, cualquier opioide en múltiplos del máximo

REGLAS:
- warning=false SOLO si la dosis existe como presentación real Y está dentro del rango seguro
- Si hay duda entre caution y danger, elige danger
- Si no hay dosis escrita: doseNormalized y unit vacíos, warning=false, warningLevel: none
- El warningMessage debe ser útil para el paciente: menciona las presentaciones correctas o el riesgo concreto`,
      maxOutputTokens: 250,
    })

    const cleaned = text.trim().replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return Response.json(parsed)
  } catch {
    return Response.json({
      nameNormalized: name.trim(),
      nameConfidence: 'high',
      unit: '',
      doseNormalized: dose ?? '',
      warning: false,
      warningLevel: 'none',
      warningMessage: '',
    })
  }
}
