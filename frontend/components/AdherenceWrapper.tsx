'use client'

import { AdherenceSection } from './AdherenceSection'
import type { AdherenceLog } from '@/lib/types'

interface Props {
  medications: string[]
  initialLogs: AdherenceLog[]
}

export function AdherenceWrapper({ medications, initialLogs }: Props) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const todayDate = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())

  return (
    <AdherenceSection
      medications={medications}
      initialLogs={initialLogs}
      timezone={timezone}
      todayDate={todayDate}
    />
  )
}
