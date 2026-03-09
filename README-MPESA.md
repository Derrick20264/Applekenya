# M-Pesa Integration Guide

## Overview

This e-commerce store integrates Safaricom M-Pesa STK Push for seamless mobile payments in Kenya.

## Features

- STK Push payment initiation
- Real-time payment status polling
- Automatic order creation after successful payment
- Stock management and updates
- Payment confirmation messages

## Setup Instructions

### 1. Get M-Pesa API Credentials

1. Visit [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
2. Create an account and log in
3. Create a new app to get:
   - Consumer Key
   - Consumer Secret
   - Passkey (for STK Push)

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# M-Pesa Sandbox Credentials
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey

# App URL (for callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Test Phone Numbers (Sandbox)

For testing in sandbox mode, use these numbers:
- `254708374149`
- `254711111111`

### 4. How It Works

1. **Customer enters details** - Name, phone, address
2. **Initiate payment** - STK Push sent to customer's phone
3. **Customer enters PIN** - On their M-Pesa menu
4. **Payment verification** - System polls for payment status
5. **Order creation** - Order saved to Supabase after successful payment
6. **Confirmation** - Customer sees success message

## API Routes

### POST /api/mpesa/initiate
Initiates M-Pesa STK Push

**Request:**
```json
{
  "phoneNumber": "0712345678",
  "amount": 1000,
  "accountReference": "Order-123",
  "transactionDesc": "Payment for order"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutRequestID": "ws_CO_123456789",
  "message": "STK Push sent successfully"
}
```

### POST /api/mpesa/query
Queries payment status

**Request:**
```json
{
  "checkoutRequestID": "ws_CO_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "ABC123XYZ",
  "message": "Payment completed successfully"
}
```

### POST /api/mpesa/callback
Receives M-Pesa payment callbacks (automatic)

## Phone Number Format

The system accepts multiple formats:
- `0712345678` (Kenyan format)
- `254712345678` (International)
- `+254712345678` (With plus)

All are automatically converted to `254712345678` format.

## Production Deployment

### 1. Switch to Production

Update `.env.local`:
```bash
# Change sandbox URLs to production
# https://sandbox.safaricom.co.ke -> https://api.safaricom.co.ke
```

### 2. Update Callback URL

Set your production URL:
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Register Callback URLs

In Daraja Portal, register:
- Validation URL: `https://yourdomain.com/api/mpesa/callback`
- Confirmation URL: `https://yourdomain.com/api/mpesa/callback`

### 4. Get Production Credentials

- Apply for production credentials in Daraja Portal
- Replace sandbox credentials with production ones

## Troubleshooting

### Payment Timeout
- Default timeout: 30 seconds
- User must enter PIN within this time
- If timeout occurs, user can retry

### Invalid Phone Number
- Ensure phone number is Kenyan (starts with 07 or 01)
- System validates format before sending

### Callback Not Received
- Check your callback URL is publicly accessible
- Verify URL is registered in Daraja Portal
- Check server logs for callback data

## Security Notes

1. Never commit `.env.local` to version control
2. Use environment variables for all credentials
3. Validate all user inputs
4. Implement rate limiting for API routes
5. Use HTTPS in production

## Testing

### Test Payment Flow

1. Start development server: `npm run dev`
2. Add items to cart
3. Go to checkout
4. Enter test phone number: `254708374149`
5. Check terminal for STK Push prompt
6. In sandbox, payment auto-completes after 30 seconds

### Test Scenarios

- Successful payment
- Cancelled payment (user cancels on phone)
- Timeout (no response within 30 seconds)
- Invalid phone number
- Insufficient balance

## Support

For M-Pesa API issues:
- Email: apisupport@safaricom.co.ke
- Portal: https://developer.safaricom.co.ke/support

## Additional Resources

- [Daraja API Documentation](https://developer.safaricom.co.ke/docs)
- [STK Push Guide](https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate)
- [Test Credentials](https://developer.safaricom.co.ke/test_credentials)
