import { NextRequest, NextResponse } from 'next/server'
import { getOrders, createOrder } from '@/lib/supabase-functions'

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const orders = await getOrders()

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        data: orders,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching orders:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

// POST create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.customer_name || !body.customer_phone || !body.shipping_address || !body.items) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['customer_name', 'customer_phone', 'shipping_address', 'items'],
        },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order must contain at least one item',
        },
        { status: 400 }
      )
    }

    const order = await createOrder(body)

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create order',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: order,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
