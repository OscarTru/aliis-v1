'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import type { Pack, PackNote } from '@/lib/types'

interface PackContextValue {
  pack: Pack | null
  activeIdx: number
  readChapters: Set<string>
  chatOpen: boolean
  notes: PackNote | null
  setPack: (pack: Pack | null) => void
  setActiveIdx: (i: number) => void
  markRead: (chapterId: string) => void
  setChatOpen: (open: boolean) => void
  setNotes: (note: PackNote | null) => void
}

const PackContext = createContext<PackContextValue>({
  pack: null,
  activeIdx: 0,
  readChapters: new Set(),
  chatOpen: false,
  notes: null,
  setPack: () => {},
  setActiveIdx: () => {},
  markRead: () => {},
  setChatOpen: () => {},
  setNotes: () => {},
})

export function PackProvider({ children }: { children: React.ReactNode }) {
  const [pack, setPack] = useState<Pack | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set())
  const [chatOpen, setChatOpen] = useState(false)
  const [notes, setNotes] = useState<PackNote | null>(null)

  const handleSetPack = useCallback((p: Pack | null) => {
    setPack(p)
    setActiveIdx(0)
    setReadChapters(new Set())
    setChatOpen(false)
    setNotes(null)
  }, [])

  const handleSetActiveIdx = useCallback((i: number) => setActiveIdx(i), [])

  const markRead = useCallback((chapterId: string) => {
    setReadChapters((prev) => new Set([...prev, chapterId]))
  }, [])

  return (
    <PackContext.Provider value={{
      pack,
      activeIdx,
      readChapters,
      chatOpen,
      notes,
      setPack: handleSetPack,
      setActiveIdx: handleSetActiveIdx,
      markRead,
      setChatOpen,
      setNotes,
    }}>
      {children}
    </PackContext.Provider>
  )
}

export function usePackContext() {
  return useContext(PackContext)
}
