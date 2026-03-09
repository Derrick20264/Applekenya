import { NextRequest, NextResponse } from 'next/server'
import { queryMpesaSTKPushStatus } from '@/lib/mpesa'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { checkoutRequestID } = body

    if (!checkoutRequestID) {
      return NextResponse.json(
        { success: false, error: 'Checkout Request ID is required' },
        { status: 400 }
      )
    }

    const result = await queryMpesaSTKPushStatus(checkoutRequestID)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in M-Pesa query route:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
