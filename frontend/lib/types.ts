export interface Reference {
  id: number
  authors: string
  journal: string
  year: number
  doi: string
  quote: string
  verified?: boolean
}

export interface Chapter {
  id: string
  n: string
  kicker: string
  kickerItalic: string
  readTime: string
  tldr: string
  paragraphs?: string[]
  callout?: { label: string; body: string }
  timeline?: { w: string; t: string }[]
  questions?: string[]
  alarms?: { tone: 'red' | 'amber'; t: string; d: string }[]
  practices?: { t: string; d: string }[]
}

export interface Pack {
  id: string
  dx: string
  for: string
  createdAt: string
  summary: string
  chapters: Chapter[]
  references: Reference[]
}

export type IntentClass = 'SAFE' | 'DOSE' | 'DIAGN' | 'EMERG' | 'OOD'

export interface GeneratePackRequest {
  diagnostico: string
  medicamentos?: string[]
  contexto?: {
    frecuencia?: string
    dudas?: string
    para?: 'yo' | 'familiar'
    nombre?: string
  }
  userId: string
  userPlan: 'free' | 'pro'
}

export interface GeneratePackResponse {
  pack?: Pack
  references?: Reference[]
  limitReached?: boolean
  emergencyResponse?: string
  blockedReason?: 'DOSE' | 'DIAGN' | 'OOD'
}

export interface Profile {
  id: string
  name: string | null
  who: 'yo' | 'familiar' | null
  plan: 'free' | 'pro'
  stripe_customer_id: string | null
  onboarding_done: boolean
  created_at: string
}
