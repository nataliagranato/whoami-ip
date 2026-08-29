import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const UNKNOWN = 'Indisponível'

function isIPv4(value: string) {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)
}

function isIPv6(value: string) {
  return value.includes(':')
}

async function getJson(url: string) {
  try {
    const response = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } })
    return response.ok ? await response.json() : null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
  const detectedIp = forwarded || request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || UNKNOWN
  const hostname = request.headers.get('host') || new URL(request.url).hostname
  const locationIp = isIPv4(detectedIp) || isIPv6(detectedIp) ? detectedIp : null

  const [location, publicIpv4, publicIpv6] = await Promise.all([
    getJson(locationIp ? `https://ipapi.co/${locationIp}/json/` : 'https://ipapi.co/json/'),
    getJson('https://api.ipify.org?format=json'),
    getJson('https://api6.ipify.org?format=json'),
  ])

  const ipv4 = publicIpv4?.ip || (isIPv4(detectedIp) ? detectedIp : UNKNOWN)
  const ipv6 = publicIpv6?.ip || (isIPv6(detectedIp) ? detectedIp : UNKNOWN)
  const ip = locationIp || ipv4

  return NextResponse.json({
    ip,
    ipv4,
    ipv6,
    hostname,
    userAgent: request.headers.get('user-agent') || UNKNOWN,
    city: location?.city || UNKNOWN,
    region: location?.region || UNKNOWN,
    country: location?.country_name || location?.country || UNKNOWN,
    latitude: location?.latitude?.toString() || 'N/A',
    longitude: location?.longitude?.toString() || 'N/A',
    timezone: location?.timezone || UNKNOWN,
    isp: location?.org || location?.asn || UNKNOWN,
    timestamp: new Date().toISOString(),
  })
}
