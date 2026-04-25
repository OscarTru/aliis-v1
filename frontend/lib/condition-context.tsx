'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Condition } from '@/lib/types'

interface ConditionContextValue {
  condition: Condition | null
  activeIdx: number
  setCondition: (condition: Condition | null) => void
  setActiveIdx: (idx: number) => void
}

const ConditionContext = createContext<ConditionContextValue>({
  condition: null,
  activeIdx: 0,
  setCondition: () => {},
  setActiveIdx: () => {},
})

export function ConditionProvider({ children }: { children: React.ReactNode }) {
  const [condition, setConditionState] = useState<Condition | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const setCondition = useCallback((c: Condition | null) => {
    setConditionState(c)
    setActiveIdx(0)
  }, [])

  return (
    <ConditionContext.Provider value={{ condition, activeIdx, setCondition, setActiveIdx }}>
      {children}
    </ConditionContext.Provider>
  )
}

export function useConditionContext() {
  return useContext(ConditionContext)
}
