'use client'

import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerProps {
  /** ISO date string yyyy-MM-dd (matches HTML input type=date format). */
  value?: string
  onChange: (iso: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Optional. Disable dates outside [min, max]. */
  min?: Date
  max?: Date
}

/**
 * Branded date picker — replaces native `<input type="date">` with a Popover
 * containing a shadcn-style Calendar. Mirrors the Aliis design language and
 * is consistent across browsers and platforms (no native iOS/Android wheel).
 *
 * Value is exchanged as ISO yyyy-MM-dd to keep the same shape as the native
 * input — drop-in replacement for forms.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = 'dd/mm/yyyy',
  disabled,
  className,
  min,
  max,
}: DatePickerProps) {
  const selected = React.useMemo(() => {
    if (!value) return undefined
    const parsed = parse(value, 'yyyy-MM-dd', new Date())
    return isValid(parsed) ? parsed : undefined
  }, [value])

  const display = selected
    ? format(selected, 'd MMMM yyyy', { locale: es })
    : placeholder

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[14px] text-left',
            'inline-flex items-center justify-between gap-2',
            'focus:outline-none focus:border-primary/50 transition-colors',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            !selected && 'text-muted-foreground',
            selected && 'text-foreground',
            className
          )}
        >
          <span className="truncate">{display}</span>
          <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) onChange(format(date, 'yyyy-MM-dd'))
          }}
          disabled={[
            ...(min ? [{ before: min }] : []),
            ...(max ? [{ after: max }] : []),
          ]}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
