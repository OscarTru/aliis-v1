// frontend/lib/memory-crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALG = 'aes-256-gcm'
const KEY_ENV = 'AGENT_MEMORY_ENCRYPTION_KEY'

function getKey(): Buffer {
  const hex = process.env[KEY_ENV]
  if (!hex || hex.length !== 64) {
    throw new Error(`${KEY_ENV} must be a 64-char hex string (32 bytes)`)
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Cifra un objeto JSON con AES-256-GCM.
 * Retorna: base64url(<iv:12><authTag:16><ciphertext>)
 */
export function encrypt(obj: Record<string, unknown>): string {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALG, key, iv)
  const plain = JSON.stringify(obj)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Empaqueta iv + authTag + ciphertext en un solo buffer
  const packed = Buffer.concat([iv, authTag, encrypted])
  return packed.toString('base64url')
}

/**
 * Descifra un ciphertext producido por encrypt().
 * Si falla (dato corrupto, clave incorrecta, texto plano legacy), retorna {}.
 */
export function decrypt(ciphertext: string): Record<string, unknown> {
  try {
    const key = getKey()
    const packed = Buffer.from(ciphertext, 'base64url')
    const iv = packed.subarray(0, 12)
    const authTag = packed.subarray(12, 28)
    const encrypted = packed.subarray(28)
    const decipher = createDecipheriv(ALG, key, iv)
    decipher.setAuthTag(authTag)
    const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
    return JSON.parse(plain) as Record<string, unknown>
  } catch {
    // Dato no encriptado (fila legacy) o corrupto — retorna vacío
    return {}
  }
}
