import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const headersList = headers()

  return NextResponse.json({
    city: headersList.get('x-user-city') || 'Clemson',
    region: headersList.get('x-user-region') || 'SC',
    country: headersList.get('x-user-country') || 'US',
    latitude: headersList.get('x-user-latitude') || null,
    longitude: headersList.get('x-user-longitude') || null
  })
}
