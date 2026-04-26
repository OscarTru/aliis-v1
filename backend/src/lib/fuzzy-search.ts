export function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

// Returns a score 0..1: 1 = exact match, 0 = no match.
// Threshold: best word score must be >= minScore to be considered a match.
export function fuzzyScore(q: string, target: string): number {
  const nq = normalize(q)
  const nt = normalize(target)
  if (nt === nq) return 1
  if (nt.includes(nq)) return 0.95
  const words = nt.split(/\s+/)
  let best = 0
  for (const w of words) {
    const maxLen = Math.max(nq.length, w.length)
    if (maxLen === 0) continue
    const dist = levenshtein(nq, w)
    const score = 1 - dist / maxLen
    if (score > best) best = score
  }
  return best
}
