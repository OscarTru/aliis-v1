export type IntentClass = 'SAFE' | 'DOSE' | 'DIAGN' | 'EMERG' | 'OOD'

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

export interface GeneratedPack {
  summary: string
  chapters: Chapter[]
  references: Reference[]
}

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
