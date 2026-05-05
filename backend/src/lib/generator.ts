import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { GeneratedPack, Tool } from '../types'
import type { EnrichedContext } from './enricher'
import type { MatchedCondition } from './library-resolver'
import { formatSectionContent } from './library-resolver'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const packGeneratorPrompt = readFileSync(
  join(__dirname, '../../../docs/prompts/pack-generator/v1.md'),
  'utf-8'
)

function buildLibrarySection(libraryMatch: MatchedCondition): string {
  const formatted = libraryMatch.sections
    .map((s) => `## ${s.title}\n${formatSectionContent(s.content)}`)
    .join('\n\n')

  return `
== FUENTE DE VERDAD (BIBLIOTECA ALIIS) ==
Este diagnóstico tiene una guía curada por médicos residentes. Úsala como tu fuente de verdad médica: todos los hechos clínicos, mecanismos, evolución típica y señales de alarma deben venir de aquí o ser consistentes con esto. Personaliza el tono y enfoque según el contexto del paciente, pero NO contradigas estos hechos.

CONDICIÓN: ${libraryMatch.name}

CONTENIDO CURADO:
${formatted}`
}


function isValidGeneratedPack(v: unknown): v is GeneratedPack {
  if (!v || typeof v !== 'object') return false
  const p = v as Record<string, unknown>
  return (
    typeof p.summary === 'string' &&
    Array.isArray(p.chapters) &&
    p.chapters.length === 5 &&
    Array.isArray(p.references) &&
    (p.tools === undefined || Array.isArray(p.tools))
  )
}

function isValidTool(t: unknown): t is Tool {
  if (!t || typeof t !== 'object') return false
  const obj = t as Record<string, unknown>
  return typeof obj.title === 'string' && typeof obj.description === 'string'
}

function normalizePack(raw: GeneratedPack): GeneratedPack {
  return {
    ...raw,
    tools: Array.isArray(raw.tools) ? raw.tools.filter(isValidTool) : [],
  }
}

export async function generatePack(
  diagnostico: string,
  context: EnrichedContext,
  libraryMatch?: MatchedCondition | null
): Promise<GeneratedPack> {
  const medicalParts: string[] = []
  if (context.edadYSexo) medicalParts.push(`Paciente: ${context.edadYSexo}`)
  if (context.condicionesPrevias?.length) medicalParts.push(`Condiciones previas: ${context.condicionesPrevias.join(', ')}`)
  if (context.medicamentos?.length) medicalParts.push(`Medicamentos actuales: ${context.medicamentos.join(', ')}`)
  if (context.alergias?.length) medicalParts.push(`Alergias: ${context.alergias.join(', ')}`)

  const userPrompt = [
    `Diagnóstico: ${diagnostico}`,
    context.nombre ? `Nombre del paciente: ${context.nombre}` : null,
    context.para === 'familiar' ? 'Este pack es para un familiar del paciente.' : null,
    context.para === 'acompanando' ? 'El lector está acompañando a alguien con este diagnóstico.' : null,
    context.emocion ? `Estado emocional del paciente: ${context.emocion}` : null,
    context.dudas ? `Dudas principales: ${context.dudas}` : null,
    context.previousDx.length > 0
      ? `Diagnósticos previos del paciente: ${context.previousDx.join(', ')}`
      : null,
    medicalParts.length > 0
      ? `\nCONTEXTO MÉDICO DEL PACIENTE:\n${medicalParts.join('\n')}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  async function attempt(): Promise<GeneratedPack> {
    const staticPrompt = packGeneratorPrompt
    const systemBlocks: Anthropic.TextBlockParam[] = [
      { type: 'text', text: staticPrompt, cache_control: { type: 'ephemeral' } },
      ...(libraryMatch && libraryMatch.sections.length > 0
        ? [{ type: 'text' as const, text: buildLibrarySection(libraryMatch), cache_control: { type: 'ephemeral' } as const }]
        : []),
    ]

    // 45s timeout — Sonnet 4.6 with 8k tokens normally finishes in 15-25s.
    // If we cross 45s something is wrong (network, model overload); fail fast
    // so the user gets a 5xx instead of waiting for Railway's hard timeout.
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45_000)
    let response
    try {
      response = await client.messages.create(
        {
          model: 'claude-sonnet-4-6',
          max_tokens: 8192,
          system: systemBlocks,
          messages: [{ role: 'user', content: userPrompt }],
        },
        { signal: controller.signal }
      )
    } finally {
      clearTimeout(timeout)
    }

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') throw new Error('No text in response')
    if (response.stop_reason === 'max_tokens') throw new Error('No JSON in response')

    const match = textBlock.text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')

    const parsed: unknown = JSON.parse(match[0])
    if (!isValidGeneratedPack(parsed)) throw new Error('Invalid pack structure')

    return normalizePack(parsed as GeneratedPack)
  }

  try {
    return await attempt()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg === 'No JSON in response' || msg === 'Invalid pack structure') {
      return await attempt()
    }
    throw err
  }
}
