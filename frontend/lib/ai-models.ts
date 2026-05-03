/**
 * Single source of truth for Anthropic model identifiers.
 *
 * Bump these when upgrading. All call sites import from here so a model swap
 * is a one-line change instead of a grep-replace across 8+ files.
 *
 * Pricing reference (per Mtok input/output, May 2026):
 *   - Haiku 4.5: $0.25 / $1.25
 *   - Sonnet 4.6: $3 / $15 (12× more expensive — only use when judgment > speed)
 */

export const HAIKU_4_5 = 'claude-haiku-4-5-20251001'

// Sonnet not currently used after Plan E migrated all call sites to Haiku.
// Kept here for documentation; uncomment when a task warrants the cost.
// export const SONNET_4_6 = 'claude-sonnet-4-6'
