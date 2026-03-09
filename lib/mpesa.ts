// M-Pesa API Integration

interface MpesaSTKPushRequest {
  phoneNumber: string
  amount: number
  accountReference: string
  transactionDesc: string
}

interface MpesaSTKPushResponse {
  success: boolean
  checkoutRequestID?: string
  message?: string
  error?: string
}

interface MpesaCallbackResponse {
  success: boolean
  transactionId?: string
  message?: string
}

// Get M-Pesa Access Token
async function getMpesaAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY || ''
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || ''
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  try {
    const response = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    )

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error)
    throw new Error('Failed to authenticate with M-Pesa')
  }
}

// Initiate STK Push
export async function initiateMpesaSTKPush(
  request: MpesaSTKPushRequest
): Promise<MpesaSTKPushResponse> {
  try {
    const accessToken = await getMpesaAccessToken()
    
    const businessShortCode = process.env.MPESA_SHORTCODE || '174379'
    const passkey = process.env.MPESA_PASSKEY || ''
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
    const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64')

    // Format phone number (remove leading 0 or +254, add 254)
    let formattedPhone = request.phoneNumber.replace(/\s/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1)
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.slice(1)
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone
    }

    const payload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(request.amount),
      PartyA: formattedPhone,
      PartyB: businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc,
    }

    const response = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()

    if (data.ResponseCode === '0') {
      return {
        success: true,
        checkoutRequestID: data.CheckoutRequestID,
        message: 'STK Push sent successfully',
      }
    } else {
      return {
        success: false,
        error: data.errorMessage || 'Failed to initiate payment',
      }
    }
  } catch (error) {
    console.error('Error initiating M-Pesa STK Push:', error)
    return {
      success: false,
      error: 'Failed to initiate payment. Please try again.',
    }
  }
}

// Query STK Push Status
export async function queryMpesaSTKPushStatus(
  checkoutRequestID: string
): Promise<MpesaCallbackResponse> {
  try {
    const accessToken = await getMpesaAccessToken()
    
    const businessShortCode = process.env.MPESA_SHORTCODE || '174379'
    const passkey = process.env.MPESA_PASSKEY || ''
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
    const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64')

    const payload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    }

    const response = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()

    if (data.ResultCode === '0') {
      return {
        success: true,
        transactionId: data.MpesaReceiptNumber,
        message: 'Payment completed successfully',
      }
    } else if (data.ResultCode === '1032') {
      return {
        success: false,
        message: 'Payment cancelled by user',
      }
    } else {
      return {
        success: false,
        message: data.ResultDesc || 'Payment failed',
      }
    }
  } catch (error) {
    console.error('Error querying M-Pesa STK Push status:', error)
    return {
      success: false,
      message: 'Failed to verify payment status',
    }
  }
}
