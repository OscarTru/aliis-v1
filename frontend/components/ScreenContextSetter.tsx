'use client'

import { useEffect } from 'react'
import { useAliisAgentContext } from '@/lib/aliis-agent-context'
import type { AgentRequest } from '@/lib/types'

type ScreenContext = AgentRequest['screen_context']

export function ScreenContextSetter({ value }: { value: ScreenContext }) {
  const { setScreenContext } = useAliisAgentContext()
  useEffect(() => {
    setScreenContext(value)
  }, [value, setScreenContext])
  return null
}
