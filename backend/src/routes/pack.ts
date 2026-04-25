import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { classifyIntent } from '../lib/classifier'
import { enrichContext } from '../lib/enricher'
import { generatePack } from '../lib/generator'
import { verifyReferences } from '../lib/verifier'
import { EMERGENCY_RESPONSE, BLOCKED_MESSAGES } from '../lib/emergency'
import { supabase } from '../index'
import type { GeneratePackRequest } from '../types'

export const packRouter = Router()

function isValidRequest(body: unknown): body is GeneratePackRequest {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.diagnostico === 'string' &&
    typeof b.userId === 'string' &&
    typeof b.userPlan === 'string'
  )
}

packRouter.post('/generate', async (req, res) => {
  if (!isValidRequest(req.body)) {
    res.status(400).json({ error: 'diagnostico, userId y userPlan son requeridos' })
    return
  }

  const { diagnostico, contexto, userId, userPlan } = req.body
  const dx = diagnostico.trim()

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
    const { count } = await supabase
      .from('packs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', since)

    if ((count ?? 0) >= 1) {
      res.json({ limitReached: true })
      return
    }
  }

  // Layer 1: classify intent
  const intent = await classifyIntent(dx)

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
  const context = await enrichContext(userId, contexto)

  // Layer 3: generate pack
  let generated
  try {
    generated = await generatePack(dx, context)
  } catch {
    res.status(500).json({ error: 'Error generando el pack. Intenta de nuevo.' })
    return
  }

  // Layer 4: verify DOIs
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
  })

  if (insertError) {
    console.error('Error saving pack:', insertError)
    res.status(500).json({ error: 'Error guardando el pack.' })
    return
  }

  // Layer 5: disclaimer is added programmatically on the frontend, not here
  res.json({
    pack: {
      id: packId,
      dx,
      for: context.para,
      createdAt: new Date().toISOString(),
      summary: generated.summary,
      chapters: generated.chapters,
      references: verifiedRefs,
    },
    references: verifiedRefs,
  })
})
