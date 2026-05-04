'use client'

import { createContext, useContext, useState } from 'react'

type ScreenContext = 'diario' | 'pack' | 'tratamientos' | 'historial' | 'cuenta'

interface AliisAgentContextValue {
  open: boolean
  setOpen: (v: boolean) => void
  screenContext: ScreenContext
  setScreenContext: (v: ScreenContext) => void
}

const AliisAgentContext = createContext<AliisAgentContextValue | null>(null)

export function AliisAgentProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [screenContext, setScreenContext] = useState<ScreenContext>('diario')

  return (
    <AliisAgentContext.Provider value={{ open, setOpen, screenContext, setScreenContext }}>
      {children}
    </AliisAgentContext.Provider>
  )
}

export function useAliisAgentContext(): AliisAgentContextValue {
  const ctx = useContext(AliisAgentContext)
  if (!ctx) {
    throw new Error('useAliisAgentContext must be used within AliisAgentProvider')
  }
  return ctx
}
