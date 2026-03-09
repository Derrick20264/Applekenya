import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrderStatus } from '@/lib/supabase-functions'

// GET single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order ID is required',
        },
        { status: 400 }
      )
    }

    const order = await getOrderById(id)

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching order:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch order',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

// PATCH update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order ID is required',
        },
        { status: 400 }
      )
    }

    if (!body.status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Status is required',
        },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status',
          validStatuses,
        },
        { status: 400 }
      )
    }

    const updatedOrder = await updateOrderStatus(id, body.status)

    if (!updatedOrder) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update order status',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating order status:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order status',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
