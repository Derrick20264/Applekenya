import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/supabase-functions'

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const searchQuery = searchParams.get('search')

    // Build filters object
    const filters: {
      category?: string
      minPrice?: number
      maxPrice?: number
      searchQuery?: string
    } = {}

    if (category) filters.category = category
    if (minPrice) filters.minPrice = parseFloat(minPrice)
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice)
    if (searchQuery) filters.searchQuery = searchQuery

    // Fetch products from Supabase
    const products = await getProducts(filters)

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        count: products.length,
        data: products,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching products:', error)

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
