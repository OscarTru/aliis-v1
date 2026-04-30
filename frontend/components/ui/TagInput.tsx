'use client'
import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagInputProps {
  label: string
  placeholder: string
  value: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  className?: string
}

export function TagInput({ label, placeholder, value, onChange, maxTags = 10, className }: TagInputProps) {
  const [input, setInput] = useState('')

  function addTag() {
    const tag = input.trim()
    if (!tag || value.includes(tag) || value.length >= maxTags || tag.length > 60) return
    onChange([...value, tag])
    setInput('')
  }

  function removeTag(tag: string) {
    onChange(value.filter(t => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="font-sans text-[13px] text-muted-foreground">{label}</label>
      <div className="min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 flex flex-wrap gap-1.5 focus-within:border-primary/50 transition-colors">
        {value.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted font-sans text-[13px] text-foreground">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {value.length < maxTags && (
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[140px] bg-transparent font-sans text-[14px] outline-none placeholder:text-muted-foreground/50"
          />
        )}
      </div>
      <p className="font-sans text-[11px] text-muted-foreground/50">Presiona Enter o coma para agregar</p>
    </div>
  )
}
