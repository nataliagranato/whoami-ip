import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-real-ip') ||
      'Indisponível'

    const userAgent = request.headers.get('user-agent') || 'Indisponível'

    // Tentar obter informações de localização via ipapi.co (serviço gratuito)
    let locationData = {
      city: 'Desconhecida',
      region: 'Desconhecida',
      country: 'Desconhecida',
      latitude: 'N/A',
      longitude: 'N/A',
      timezone: 'N/A',
      isp: 'Desconhecida',
    }

    if (ip !== 'Indisponível') {
      try {
        const locationRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          next: { revalidate: 3600 },
        })
        if (locationRes.ok) {
          const locationJson = await locationRes.json()
          locationData = {
            city: locationJson.city || 'Desconhecida',
            region: locationJson.region || 'Desconhecida',
            country: locationJson.country_name || 'Desconhecida',
            latitude: locationJson.latitude?.toString() || 'N/A',
            longitude: locationJson.longitude?.toString() || 'N/A',
            timezone: locationJson.timezone || 'N/A',
            isp: locationJson.org || 'Desconhecida',
          }
        }
      } catch {
        // Se a API falhar, usa os dados padrão
      }
    }

    return NextResponse.json({
      ip,
      userAgent,
      ...locationData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao obter informações de IP', details: String(error) },
      { status: 500 }
    )
  }
}
