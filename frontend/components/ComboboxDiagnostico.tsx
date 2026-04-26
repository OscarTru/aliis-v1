'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { fuzzyMatch } from '@/lib/fuzzy-search'

type ConditionSuggestion = {
  id: string
  slug: string
  name: string
}

type Props = {
  value: string
  onChange: (text: string, conditionSlug: string | null) => void
  conditions: ConditionSuggestion[]
  placeholder?: string
}

const MAX_SUGGESTIONS = 6

export function ComboboxDiagnostico({ value, onChange, conditions, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [displayedValue, setDisplayedValue] = useState(value)

  // Sync displayedValue when parent resets value externally
  useEffect(() => {
    setDisplayedValue(value)
  }, [value])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const suggestions = useMemo(() => {
    const q = displayedValue.trim()
    if (q.length < 2) return conditions.slice(0, 4)
    return conditions.filter((c) => fuzzyMatch(q, c.name)).slice(0, MAX_SUGGESTIONS)
  }, [displayedValue, conditions])

  const showFreeText = displayedValue.trim().length >= 2

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setDisplayedValue(text)
    setActiveIdx(-1)
    // Debounce the parent onChange for performance
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange(text, null)
    }, 150)
  }, [onChange])

  function selectCondition(c: ConditionSuggestion) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setDisplayedValue(c.name)
    onChange(c.name, c.slug)
    setOpen(false)
    setActiveIdx(-1)
  }

  function selectFreeText() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const text = displayedValue.trim()
    onChange(text, null)
    setOpen(false)
    setActiveIdx(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const total = suggestions.length + (showFreeText ? 1 : 0)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => (i + 1) % total)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => (i - 1 + total) % total)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && activeIdx < suggestions.length) {
        selectCondition(suggestions[activeIdx])
      } else {
        selectFreeText()
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
        <input
          type="text"
          value={displayedValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Escribe tu diagnóstico o busca en la biblioteca…'}
          className="w-full pl-10 pr-4 py-[14px] rounded-[14px] border border-border bg-muted font-sans text-[15px] text-foreground outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20 transition-colors placeholder:text-muted-foreground/50"
          autoComplete="off"
        />
      </div>

      <AnimatePresence>
        {open && (suggestions.length > 0 || showFreeText) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1.5 bg-background border border-border rounded-[14px] shadow-lg overflow-hidden"
          >
            <ul className="py-1.5">
              {suggestions.map((c, i) => (
                <li key={c.id}>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault()
                      selectCondition(c)
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors',
                      activeIdx === i ? 'bg-muted' : 'hover:bg-muted/60'
                    )}
                  >
                    <span className="font-sans text-[15px] text-foreground">{c.name}</span>
                    <span className="shrink-0 font-mono text-[9px] tracking-[.15em] uppercase text-primary/70 bg-primary/[0.08] px-2 py-0.5 rounded-full">
                      En biblioteca
                    </span>
                  </button>
                </li>
              ))}
              {showFreeText && (
                <li>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault()
                      selectFreeText()
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 font-sans text-[14px] text-muted-foreground transition-colors border-t border-border',
                      activeIdx === suggestions.length ? 'bg-muted' : 'hover:bg-muted/60'
                    )}
                  >
                    + Usar &ldquo;{displayedValue.trim()}&rdquo; como diagnóstico
                  </button>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
