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

export interface Tool {
  title: string
  description: string
}

export interface GeneratedPack {
  summary: string
  chapters: Chapter[]
  references: Reference[]
  tools?: Tool[]
}

export interface GeneratePackRequest {
  conditionSlug?: string | null
  diagnostico: string
  medicamentos?: string[]
  contexto?: {
    dudas?: string
    para?: 'yo' | 'familiar' | 'acompanando'
    nombre?: string
    emocion?: string
  }
  userId: string
  userPlan: 'free' | 'pro'
}
