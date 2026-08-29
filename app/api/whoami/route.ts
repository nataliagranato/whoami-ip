import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'Indisponível'
  const hostname = request.headers.get('host') || 'whoami.moe'
  const userAgent = request.headers.get('user-agent') || 'Indisponível'

  return new Response(`IP: ${ip}\nHostname: ${hostname}\nUser-Agent: ${userAgent}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
