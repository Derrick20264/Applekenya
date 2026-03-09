import { NextRequest, NextResponse } from 'next/server'
import { initiateMpesaSTKPush } from '@/lib/mpesa'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, amount, accountReference, transactionDesc } = body

    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { success: false, error: 'Phone number and amount are required' },
        { status: 400 }
      )
    }

    const result = await initiateMpesaSTKPush({
      phoneNumber,
      amount,
      accountReference: accountReference || 'Order',
      transactionDesc: transactionDesc || 'Payment for order',
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in M-Pesa initiate route:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
