// M-Pesa API Integration
// Switch MPESA_ENV to 'production' in .env.local when going live.
// All URLs, shortcode, and passkey must also be updated for production.

const MPESA_ENV = (process.env.MPESA_ENV || 'sandbox') as 'sandbox' | 'production'

const URLS = {
  sandbox: {
    auth:    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkpush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    query:   'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
  },
  production: {
    auth:    'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkpush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    query:   'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
  },
}

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

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise any Kenyan phone number format to 2547XXXXXXXX / 2541XXXXXXXX.
 * Accepts: 0712345678 | +254712345678 | 254712345678 | 712345678
 */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '') // strip everything except digits

  if (digits.startsWith('254') && digits.length === 12) return digits
  if (digits.startsWith('0')   && digits.length === 10) return '254' + digits.slice(1)
  if (digits.length === 9)                               return '254' + digits

  // Already correct or unrecognised — return as-is and let Safaricom reject it
  return digits
}

/**
 * Safaricom requires a whole number for Amount.
 * Math.round is safer than Math.ceil (avoids rounding KSh 100.01 → 101).
 */
function toWholeAmount(amount: number): number {
  return Math.round(amount)
}

// ── Access Token ─────────────────────────────────────────────────────────────

async function getMpesaAccessToken(): Promise<string> {
  const consumerKey    = process.env.MPESA_CONSUMER_KEY    || ''
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || ''

  if (!consumerKey || !consumerSecret) {
    throw new Error('MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET is not set in .env.local')
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  console.log(`[M-Pesa] Attempting to fetch M-Pesa token... (env: ${MPESA_ENV})`)

  const response = await fetch(URLS[MPESA_ENV].auth, {
    headers: { Authorization: `Basic ${auth}` },
  })

  const data = await response.json()

  // Log the full Safaricom auth response — shows exactly why keys are rejected
  console.log(`[M-Pesa] Auth response (HTTP ${response.status}):`, data)

  if (!response.ok || !data.access_token) {
    // Safaricom puts the rejection reason in errorMessage or ResultDesc
    const reason =
      data.errorMessage ||
      data.error_description ||
      data.ResultDesc ||
      JSON.stringify(data)
    throw new Error(`M-Pesa token request failed (HTTP ${response.status}): ${reason}`)
  }

  console.log('[M-Pesa] Token fetched successfully.')
  return data.access_token
}

// ── STK Push ─────────────────────────────────────────────────────────────────

export async function initiateMpesaSTKPush(
  request: MpesaSTKPushRequest
): Promise<MpesaSTKPushResponse> {
  try {
    const accessToken      = await getMpesaAccessToken()
    const businessShortCode = process.env.MPESA_SHORTCODE || '174379'
    const passkey          = process.env.MPESA_PASSKEY    || ''
    const timestamp        = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password         = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64')

    const phone  = formatPhone(request.phoneNumber)
    const amount = toWholeAmount(request.amount)

    const payload = {
      BusinessShortCode: businessShortCode,
      Password:          password,
      Timestamp:         timestamp,
      TransactionType:   'CustomerPayBillOnline',
      Amount:            amount,
      PartyA:            phone,
      PartyB:            businessShortCode,
      PhoneNumber:       phone,
      CallBackURL:       `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`,
      AccountReference:  request.accountReference,
      TransactionDesc:   request.transactionDesc,
    }

    console.log('[M-Pesa] STK Push payload:', { ...payload, Password: '***' })

    const response = await fetch(URLS[MPESA_ENV].stkpush, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    // Log the full Safaricom response so you can see exactly what failed
    console.log('[M-Pesa] STK Push response:', data)

    if (data.ResponseCode === '0') {
      return {
        success:           true,
        checkoutRequestID: data.CheckoutRequestID,
        message:           data.ResponseDescription || 'STK Push sent successfully',
      }
    }

    // Safaricom error — surface the real message, not a generic string
    const safaricomError =
      data.errorMessage       ||
      data.ResponseDescription ||
      data.ResultDesc          ||
      `Safaricom error code: ${data.errorCode ?? data.ResponseCode ?? 'unknown'}`

    console.error('[M-Pesa] STK Push failed:', safaricomError, '| Full response:', data)

    return { success: false, error: safaricomError }

  } catch (error: any) {
    console.error('[M-Pesa] initiateMpesaSTKPush exception:', error)
    return { success: false, error: error.message || 'Failed to initiate payment' }
  }
}

// ── Query STK Push Status ─────────────────────────────────────────────────────

export async function queryMpesaSTKPushStatus(
  checkoutRequestID: string
): Promise<MpesaCallbackResponse> {
  try {
    const accessToken       = await getMpesaAccessToken()
    const businessShortCode = process.env.MPESA_SHORTCODE || '174379'
    const passkey           = process.env.MPESA_PASSKEY   || ''
    const timestamp         = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password          = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64')

    const payload = {
      BusinessShortCode: businessShortCode,
      Password:          password,
      Timestamp:         timestamp,
      CheckoutRequestID: checkoutRequestID,
    }

    const response = await fetch(URLS[MPESA_ENV].query, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    console.log('[M-Pesa] Query response:', data)

    if (data.ResultCode === '0') {
      return {
        success:       true,
        transactionId: data.MpesaReceiptNumber,
        message:       'Payment completed successfully',
      }
    }

    if (data.ResultCode === '1032') {
      return { success: false, message: 'Payment cancelled by user' }
    }

    return {
      success: false,
      message: data.ResultDesc || `Payment failed (code: ${data.ResultCode})`,
    }

  } catch (error: any) {
    console.error('[M-Pesa] queryMpesaSTKPushStatus exception:', error)
    return { success: false, message: 'Failed to verify payment status' }
  }
}
