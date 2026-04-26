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

export function fuzzyMatch(q: string, target: string): boolean {
  const nq = normalize(q)
  const nt = normalize(target)
  if (nt.includes(nq)) return true
  const words = nt.split(/\s+/)
  const threshold = Math.floor(nq.length / 4) + 1
  return words.some((w) => {
    if (Math.abs(w.length - nq.length) > threshold) return false
    return levenshtein(nq, w.slice(0, nq.length + threshold)) <= threshold
  })
}
