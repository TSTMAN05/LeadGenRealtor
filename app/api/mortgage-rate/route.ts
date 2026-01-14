import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.api-ninjas.com/v1/mortgagerate', {
      headers: {
        'X-Api-Key': process.env.API_NINJAS_KEY || ''
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error('Failed to fetch mortgage rate')
    }

    const data = await response.json()

    return NextResponse.json({
      frm_30: data[0]?.frm_30 || null,
      frm_15: data[0]?.frm_15 || null,
      week: data[0]?.week || null
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch rate' }, { status: 500 })
  }
}
