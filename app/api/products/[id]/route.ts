import { NextRequest, NextResponse } from 'next/server'
import { getProductById, updateProduct, deleteProduct } from '@/lib/supabase-functions'

// GET single product by ID
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
          error: 'Product ID is required',
        },
        { status: 400 }
      )
    }

    const product = await getProductById(id)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching product:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

// PUT update product by ID
export async function PUT(
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
          error: 'Product ID is required',
        },
        { status: 400 }
      )
    }

    const updatedProduct = await updateProduct(id, body)

    if (!updatedProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update product',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating product:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

// DELETE product by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product ID is required',
        },
        { status: 400 }
      )
    }

    const success = await deleteProduct(id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete product',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting product:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete product',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
