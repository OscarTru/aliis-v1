import type { Reference } from '../types'

const DOI_REGEX = /^10\.\d{4,}\/\S+$/

async function checkDoi(doi: string): Promise<boolean> {
  if (!DOI_REGEX.test(doi)) return false
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(doi)}?fields=title`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}

export async function verifyReferences(references: Reference[]): Promise<Reference[]> {
  const results = await Promise.all(
    references.map(async (ref) => ({
      ...ref,
      verified: await checkDoi(ref.doi),
    }))
  )

  const verifiedCount = results.filter((r) => r.verified).length
  const failRate = references.length > 0 ? 1 - verifiedCount / references.length : 0

  if (failRate > 0.5) {
    return results.map((r) => ({ ...r, verified: false }))
  }

  return results
}
