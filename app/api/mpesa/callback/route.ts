import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log the callback for debugging
    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2))

    // Extract callback data
    const { Body } = body
    const { stkCallback } = Body

    if (stkCallback) {
      const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback

      if (ResultCode === 0) {
        // Payment successful
        const metadata = CallbackMetadata?.Item || []
        const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value
        const mpesaReceiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value
        const phoneNumber = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value

        console.log('Payment successful:', {
          CheckoutRequestID,
          amount,
          mpesaReceiptNumber,
          phoneNumber,
        })

        // Here you can update your database with the payment status
        // For now, we'll just log it
      } else {
        // Payment failed or cancelled
        console.log('Payment failed:', ResultDesc)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
