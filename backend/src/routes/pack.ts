import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { classifyIntent } from '../lib/classifier'
import { enrichContext } from '../lib/enricher'
import { generatePack } from '../lib/generator'
import { resolveLibraryMatch, type MatchedCondition } from '../lib/library-resolver'
import { verifyReferences } from '../lib/verifier'
import { EMERGENCY_RESPONSE, BLOCKED_MESSAGES } from '../lib/emergency'
import { supabase } from '../index'
import { requireAuth } from '../middleware/auth'
import type { GeneratePackRequest } from '../types'

export const packRouter = Router()

function isValidRequest(body: unknown): body is GeneratePackRequest {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (b.conditionSlug !== undefined && b.conditionSlug !== null && typeof b.conditionSlug !== 'string') {
    return false
  }
  return (
    typeof b.diagnostico === 'string' && (b.diagnostico as string).trim().length > 0 &&
    typeof b.userPlan === 'string' && (b.userPlan as string).trim().length > 0
  )
}

packRouter.post('/generate', requireAuth, async (req, res) => {
  console.log('[pack/generate] body:', JSON.stringify(req.body))
  if (!isValidRequest(req.body)) {
    console.log('[pack/generate] invalid request body')
    res.status(400).json({ error: 'diagnostico y userPlan son requeridos' })
    return
  }

  const { diagnostico, conditionSlug: rawConditionSlug, contexto, userPlan } = req.body
  const userId = res.locals.userId
  const dx = diagnostico.trim()
  const conditionSlug = typeof rawConditionSlug === 'string' && rawConditionSlug.trim().length <= 100
    ? rawConditionSlug.trim()
    : null

  if (!dx) {
    res.status(400).json({ error: 'El diagnóstico no puede estar vacío' })
    return
  }
  if (dx.length > 500) {
    res.status(400).json({ error: 'El diagnóstico no puede superar 500 caracteres' })
    return
  }

  // Free tier limit: 1 pack per 7 days
  if (userPlan === 'free') {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await supabase
      .from('packs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', since)

    if (countError) {
      res.status(500).json({ error: 'Error comprobando límite de uso.' })
      return
    }
    if ((count ?? 0) >= 1) {
      res.json({ limitReached: true })
      return
    }
  }

  // Layer 1: classify intent
  console.log('[pack/generate] classifying intent for:', dx)
  let intent
  try {
    intent = await classifyIntent(dx)
  } catch (err) {
    console.error('[pack/generate] classifier error (fallback SAFE):', err)
    intent = 'SAFE' // classifier unavailable — proceed, Claude will refuse if needed
  }
  console.log('[pack/generate] intent:', intent)

  if (intent === 'EMERG') {
    res.json({ emergencyResponse: EMERGENCY_RESPONSE })
    return
  }

  if (intent !== 'SAFE') {
    res.json({
      blockedReason: intent as 'DOSE' | 'DIAGN' | 'OOD',
      blockedMessage: BLOCKED_MESSAGES[intent as keyof typeof BLOCKED_MESSAGES],
    })
    return
  }

  // Layer 2: enrich context
  console.log('[pack/generate] enriching context')
  let context
  try {
    context = await enrichContext(userId, contexto, userPlan)
  } catch (err) {
    console.error('[pack/generate] enricher error:', err)
    res.status(500).json({ error: 'Error enriqueciendo contexto.' })
    return
  }

  // Layer 3: resolve library match
  console.log('[pack/generate] resolving library match')
  let libraryMatch: MatchedCondition | null = null
  try {
    libraryMatch = await resolveLibraryMatch(dx, conditionSlug)
    console.log('[pack/generate] library match:', libraryMatch?.slug ?? 'none')
  } catch (err) {
    console.error('[pack/generate] library resolver error (non-fatal):', err)
    // Non-fatal: proceed without library augmentation
  }

  // Layer 4: generate pack
  console.log('[pack/generate] generating pack')
  let generated
  try {
    generated = await generatePack(dx, context, libraryMatch)
    console.log('[pack/generate] pack generated OK, tools:', generated.tools?.length ?? 0)
  } catch (err) {
    console.error('[pack/generate] generator error:', err)
    res.status(500).json({ error: 'Error generando el pack. Intenta de nuevo.' })
    return
  }

  // Layer 5: verify DOIs
  const verifiedRefs = await verifyReferences(generated.references)

  // Persist to Supabase — note: column is "refs", not "references"
  const packId = uuidv4()
  const { error: insertError } = await supabase.from('packs').insert({
    id: packId,
    user_id: userId,
    dx,
    summary: generated.summary,
    chapters: generated.chapters,
    refs: verifiedRefs,
    condition_slug: libraryMatch?.slug ?? null,
    tools: generated.tools ?? [],
  })

  if (insertError) {
    console.error('Error saving pack:', insertError)
    res.status(500).json({ error: 'Error guardando el pack.' })
    return
  }

  // Layer 6: disclaimer is added programmatically on the frontend, not here
  res.json({
    pack: {
      id: packId,
      dx,
      for: context.para,
      createdAt: new Date().toISOString(),
      summary: generated.summary,
      chapters: generated.chapters,
      references: verifiedRefs,
      conditionSlug: libraryMatch?.slug ?? null,
      tools: generated.tools ?? [],
    },
    references: verifiedRefs,
  })
})
