import { NextRequest, NextResponse } from 'next/server'

function isIPv4(value: string) {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)
}

function isIPv6(value: string) {
  return value.includes(':')
}

export async function GET(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
  const detectedIp = forwarded || request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || 'Indisponível'
  const hostname = request.headers.get('host') || new URL(request.url).hostname
  let ipv4 = isIPv4(detectedIp) ? detectedIp : 'Indisponível'
  let ipv6 = isIPv6(detectedIp) ? detectedIp : 'Indisponível'

  const location = { city: 'Desconhecida', region: 'Desconhecida', country: 'Desconhecido', latitude: 'N/A', longitude: 'N/A', timezone: 'N/A', isp: 'Desconhecido' }

  try {
    const [locationRes, ipv4Res, ipv6Res] = await Promise.all([
      detectedIp !== 'Indisponível' ? fetch(`https://ipapi.co/${detectedIp}/json/`, { next: { revalidate: 3600 } }) : Promise.resolve(null),
      fetch('https://api.ipify.org?format=json', { next: { revalidate: 300 } }),
      fetch('https://api6.ipify.org?format=json', { next: { revalidate: 300 } }),
    ])
    if (locationRes?.ok) {
      const value = await locationRes.json()
      Object.assign(location, { city: value.city || location.city, region: value.region || location.region, country: value.country_name || location.country, latitude: value.latitude?.toString() || location.latitude, longitude: value.longitude?.toString() || location.longitude, timezone: value.timezone || location.timezone, isp: value.org || location.isp })
    }
    if (ipv4Res.ok) ipv4 = (await ipv4Res.json()).ip || ipv4
    if (ipv6Res.ok) ipv6 = (await ipv6Res.json()).ip || ipv6
  } catch {
    // Mantém os valores disponíveis quando um serviço externo não responde.
  }

  return NextResponse.json({ ip: detectedIp, ipv4, ipv6, hostname, userAgent: request.headers.get('user-agent') || 'Indisponível', ...location, timestamp: new Date().toISOString() })
}
