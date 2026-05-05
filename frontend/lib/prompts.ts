import { readFileSync } from 'fs'
import { join } from 'path'

const cache = new Map<string, string>()

export function readPrompt(name: string, version: string): string {
  const key = `${name}/${version}`
  if (cache.has(key)) return cache.get(key)!
  const filePath = join(process.cwd(), '..', 'docs', 'prompts', name, `${version}.md`)
  const content = readFileSync(filePath, 'utf-8')
  cache.set(key, content)
  return content
}
