import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Get geo data from Vercel headers (only works in production)
  const city = request.headers.get('x-vercel-ip-city') || 'Clemson'
  const region = request.headers.get('x-vercel-ip-region') || 'SC'
  const country = request.headers.get('x-vercel-ip-country') || 'US'
  const latitude = request.headers.get('x-vercel-ip-latitude') || ''
  const longitude = request.headers.get('x-vercel-ip-longitude') || ''

  // Pass geo data to pages via headers
  response.headers.set('x-user-city', city)
  response.headers.set('x-user-region', region)
  response.headers.set('x-user-country', country)
  response.headers.set('x-user-latitude', latitude)
  response.headers.set('x-user-longitude', longitude)

  return response
}

export const config = {
  matcher: ['/', '/estimate/:path*']
}
