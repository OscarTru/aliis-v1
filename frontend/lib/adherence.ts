import type { AdherenceLog } from './types'

// Returns how many consecutive calendar days (ending today or yesterday) the user
// took at least one medication, in the given timezone.
export function calculateStreak(logs: AdherenceLog[], timezone: string): number {
  if (logs.length === 0) return 0

  const toLocalDate = (iso: string): string =>
    new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date(iso))

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())

  const takenDates = new Set(logs.map(l => l.taken_date))

  // Streak starts from today; if today not taken, try yesterday as anchor
  let anchor = today
  if (!takenDates.has(today)) {
    const yesterday = toLocalDate(new Date(Date.now() - 86400000).toISOString())
    if (!takenDates.has(yesterday)) return 0
    anchor = yesterday
  }

  let streak = 0
  let cursor = new Date(anchor + 'T12:00:00Z')

  while (true) {
    const dateStr = toLocalDate(cursor.toISOString())
    if (!takenDates.has(dateStr)) break
    streak++
    cursor = new Date(cursor.getTime() - 86400000)
  }

  return streak
}
