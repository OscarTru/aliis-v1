import { createHash } from 'node:crypto'

export function userInShard(userId: string, shard: number, total: number): boolean {
  if (total <= 1) return true
  const hash = createHash('sha256').update(userId).digest()
  const bucket = hash.readUInt32BE(0) % total
  return bucket === shard
}

export function filterShard<T extends string>(userIds: T[], shard: number, total: number): T[] {
  if (total <= 1) return userIds
  return userIds.filter(id => userInShard(id, shard, total))
}
