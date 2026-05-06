import { createServerSupabaseClient } from './supabase-server'
import { encrypt, decrypt } from './memory-crypto'
import type { AgentMemory, AgentName, MemoryType } from './types'

export async function writeMemory(
  userId: string,
  agentName: AgentName,
  type: MemoryType,
  content: Record<string, unknown>,
  expiresInDays?: number
): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const expires_at = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86_400_000).toISOString()
    : null
  const { error } = await supabase.from('agent_memory').insert({
    user_id: userId,
    agent_name: agentName,
    memory_type: type,
    content: encrypt(content),
    expires_at,
  })
  if (error) console.error('[agent-memory] writeMemory error', error.message)
}

export async function readMemory(
  userId: string,
  agentName: AgentName,
  type?: MemoryType,
  limitDays = 30
): Promise<AgentMemory[]> {
  const supabase = await createServerSupabaseClient()
  const since = new Date(Date.now() - limitDays * 86_400_000).toISOString()

  let q = supabase
    .from('agent_memory')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_name', agentName)
    .gte('created_at', since)
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('created_at', { ascending: false })
    .limit(50)

  if (type) q = q.eq('memory_type', type)

  const { data, error } = await q
  if (error) {
    console.error('[agent-memory] readMemory error', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    ...row,
    content: decrypt(row.content as string),
  })) as AgentMemory[]
}
