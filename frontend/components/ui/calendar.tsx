'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * shadcn-style calendar styled to match Aliis design system.
 *
 * Selection uses bg-secondary (the navy primary token used in CTAs) so the
 * chosen day visually mirrors the rest of the app instead of the default
 * react-day-picker blue.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn('p-2', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-2',
        month: 'flex flex-col gap-3',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'font-sans text-sm font-medium text-foreground',
        nav: 'flex items-center gap-1',
        nav_button: cn(
          'h-7 w-7 inline-flex items-center justify-center rounded-md',
          'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
          'border border-transparent bg-transparent cursor-pointer'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse',
        head_row: 'flex',
        head_cell: 'text-muted-foreground rounded-md w-9 font-mono text-[10px] tracking-[.1em] uppercase',
        row: 'flex w-full mt-1',
        cell: cn(
          'relative p-0 text-center text-sm',
          '[&:has([aria-selected])]:bg-secondary/10',
          '[&:has([aria-selected].day-outside)]:bg-secondary/5',
          'first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
          'focus-within:relative focus-within:z-20'
        ),
        day: cn(
          'h-9 w-9 p-0 font-sans text-[14px] font-normal rounded-md cursor-pointer',
          'inline-flex items-center justify-center',
          'hover:bg-muted aria-selected:opacity-100 transition-colors',
          'border-none bg-transparent text-foreground'
        ),
        day_selected: cn(
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/90 hover:text-secondary-foreground',
          'focus:bg-secondary focus:text-secondary-foreground'
        ),
        day_today: 'border border-secondary/40 text-foreground',
        day_outside: 'text-muted-foreground/50 opacity-50',
        day_disabled: 'text-muted-foreground/30 opacity-50 cursor-not-allowed',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: (props) =>
          props.orientation === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}

Calendar.displayName = 'Calendar'
