import { supabase } from '../index'
import { fuzzyScore } from './fuzzy-search'

export interface MatchedCondition {
  slug: string
  name: string
  sections: Array<{
    slug: string
    title: string
    content: Record<string, unknown>
  }>
}

const MATCH_THRESHOLD = 0.85

function formatSectionContent(content: Record<string, unknown>): string {
  const lines: string[] = []

  const paragraphs = content.paragraphs as string[] | undefined
  if (paragraphs) lines.push(...paragraphs)

  const callout = content.callout as { label?: string; body?: string } | undefined
  if (callout?.body) lines.push(`[${callout.label ?? 'Nota'}] ${callout.body}`)

  const timeline = content.timeline as Array<{ w: string; t: string }> | undefined
  if (timeline) {
    for (const item of timeline) lines.push(`${item.w}: ${item.t}`)
  }

  const questions = content.questions as string[] | undefined
  if (questions) {
    for (const q of questions) lines.push(`- ${q}`)
  }

  const alarms = content.alarms as Array<{ tone: string; t: string; d: string }> | undefined
  if (alarms) {
    for (const a of alarms) lines.push(`[${a.tone === 'red' ? 'URGENTE' : 'CONSULTA PRONTO'}] ${a.t}: ${a.d}`)
  }

  return lines.join('\n')
}

async function loadSections(conditionId: string): Promise<MatchedCondition['sections']> {
  const { data } = await supabase
    .from('condition_sections')
    .select('slug, title, content')
    .eq('condition_id', conditionId)
    .order('order')
  return (data ?? []).map((s: { slug: string; title: string; content: Record<string, unknown> }) => ({
    slug: s.slug,
    title: s.title,
    content: s.content,
  }))
}

export async function resolveLibraryMatch(
  dx: string,
  conditionSlug?: string | null
): Promise<MatchedCondition | null> {
  // Path 1: slug provided by frontend combobox selection — direct lookup
  if (conditionSlug) {
    const { data } = await supabase
      .from('conditions')
      .select('id, slug, name')
      .eq('slug', conditionSlug)
      .eq('published', true)
      .single()
    if (!data) return null
    const sections = await loadSections(data.id)
    return { slug: data.slug, name: data.name, sections }
  }

  // Path 2: free-text dx — fuzzy match with high threshold
  const { data: all } = await supabase
    .from('conditions')
    .select('id, slug, name')
    .eq('published', true)
  if (!all || all.length === 0) return null

  let bestScore = 0
  let bestCondition: { id: string; slug: string; name: string } | null = null

  for (const c of all as Array<{ id: string; slug: string; name: string }>) {
    const score = fuzzyScore(dx, c.name)
    if (score > bestScore) {
      bestScore = score
      bestCondition = c
    }
  }

  if (bestScore < MATCH_THRESHOLD || !bestCondition) return null

  const sections = await loadSections(bestCondition.id)
  return { slug: bestCondition.slug, name: bestCondition.name, sections }
}

export { formatSectionContent }
