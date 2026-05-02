import { NextRequest } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shard: string }> }
) {
  const { shard } = await params
  const total = parseInt(process.env.NOTIFY_CRON_SHARDS ?? '4', 10)

  const parent = await import('../route')
  const url = new URL(req.url)
  url.pathname = '/api/aliis/notify'
  url.searchParams.set('shard', shard)
  url.searchParams.set('total', String(total))
  const forwardReq = new Request(url.toString(), {
    method: 'GET',
    headers: req.headers,
  })
  return parent.GET(forwardReq)
}
