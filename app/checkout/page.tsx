'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { createOrder } from '@/lib/supabase-functions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatKsh } from '@/lib/currency'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, getCartTotal, clearCart } = useCart()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [orderId, setOrderId] = useState('')

  const subtotal = getCartTotal()
  const shipping = subtotal >= 6500 ? 0 : 500 // Free shipping over KSh 6,500
  const tax = subtotal * 0.16 // 16% VAT in Kenya
  const total = subtotal + shipping + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your name')
      return false
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Please enter your phone number')
      return false
    }
    if (!formData.address.trim()) {
      setErrorMessage('Please enter your delivery address')
      return false
    }
    if (!formData.city.trim()) {
      setErrorMessage('Please enter your city')
      return false
    }

    // Validate phone number format
    const phoneRegex = /^(\+?254|0)?[17]\d{8}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g., 0712345678)')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!validateForm()) {
      return
    }

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty')
      return
    }

    setIsProcessing(true)
    setPaymentStatus('pending')

    try {
      // Step 1: Initiate M-Pesa STK Push
      const mpesaResponse = await fetch('/api/mpesa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formData.phone,
          amount: total,
          accountReference: `Order-${Date.now()}`,
          transactionDesc: 'Payment for electronics',
        }),
      })

      const mpesaData = await mpesaResponse.json()

      if (!mpesaData.success) {
        throw new Error(mpesaData.error || 'Failed to initiate payment')
      }

      const checkoutRequestID = mpesaData.checkoutRequestID

      // Step 2: Poll for payment status
      let attempts = 0
      const maxAttempts = 30 // 30 seconds
      let paymentConfirmed = false

      while (attempts < maxAttempts && !paymentConfirmed) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

        const queryResponse = await fetch('/api/mpesa/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutRequestID }),
        })

        const queryData = await queryResponse.json()

        if (queryData.success) {
          paymentConfirmed = true
          
          // Step 3: Create order in Supabase
          const orderData = {
            customer_name: formData.name,
            customer_email: formData.email || 'N/A',
            customer_phone: formData.phone,
            shipping_address: `${formData.address}, ${formData.city}`,
            total: total,
            status: 'pending' as const,
            items: cart.map(item => ({
              product_id: item.id,
              product_name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          }

          const order = await createOrder(orderData)

          if (order) {
            setOrderId(order.id)
            setPaymentStatus('success')
            clearCart()
          } else {
            throw new Error('Failed to create order')
          }
          break
        } else if (queryData.message?.includes('cancelled')) {
          throw new Error('Payment was cancelled')
        }

        attempts++
      }

      if (!paymentConfirmed) {
        throw new Error('Payment timeout. Please try again.')
      }

    } catch (error: any) {
      console.error('Checkout error:', error)
      setPaymentStatus('failed')
      setErrorMessage(error.message || 'An error occurred during checkout')
    } finally {
      setIsProcessing(false)
    }
  }

  if (cart.length === 0 && paymentStatus !== 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <svg className="w-32 h-32 mx-auto text-gray-300 mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
          <Link href="/shop" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Thank you for your purchase</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-mono font-semibold text-lg">{orderId.slice(0, 8).toUpperCase()}</p>
          </div>

          <div className="space-y-3 mb-6 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer</span>
              <span className="font-medium">{formData.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium">{formData.phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Paid</span>
              <span className="font-bold text-green-600">{formatKsh(total)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            We've sent a confirmation to your phone. Your order will be delivered to {formData.address}, {formData.city}.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/" className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
              Continue Shopping
            </Link>
            <button
              onClick={() => window.print()}
              className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">M-Pesa Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0712345678"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the M-Pesa number for payment (e.g., 0712345678)
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Main Street, Apartment 4B"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nairobi"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Delivery Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b">
                    <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {formatKsh(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatKsh(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? <span className="text-green-600">FREE</span> : formatKsh(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (16% VAT)</span>
                  <span className="font-medium">{formatKsh(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">{formatKsh(total)}</span>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handleSubmit}
                disabled={isProcessing || paymentStatus === 'pending'}
                className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition font-semibold text-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {paymentStatus === 'pending' ? 'Waiting for payment...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Pay with M-Pesa
                  </>
                )}
              </button>

              {paymentStatus === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">Check your phone</p>
                  <p>Enter your M-Pesa PIN to complete the payment</p>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center">
                Secure payment powered by Safaricom M-Pesa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
