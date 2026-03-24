import { supabase } from './supabase'
import { Product, Order } from './types'
import { products as staticProducts, categories as staticCategories } from './data'

// ==================== PRODUCT CRUD OPERATIONS ====================

export async function getProducts(filters?: {
  category?: string
  minPrice?: number
  maxPrice?: number
  searchQuery?: string
}): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')

    // Apply filters if provided
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice)
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice)
    }

    if (filters?.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,brand.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      const pgError = error as any

      // If the products table does not exist in Supabase (PGRST205),
      // fall back to the static seed data so builds and pages still work.
      if (pgError?.code === 'PGRST205') {
        console.warn(
          "Supabase table 'products' not found (PGRST205). Falling back to static product data from lib/data.ts."
        )

        let fallback = staticProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          brand: p.brand ?? 'Demo brand',
          price: p.price,
          stock: p.stock,
          category: p.category,
          description: p.description,
          image_url: p.image,
          created_at: new Date().toISOString(),
        })) as Product[]

        // Apply the same filters on the fallback data
        if (filters?.category) {
          fallback = fallback.filter((p) => p.category === filters.category)
        }

        if (filters?.minPrice !== undefined) {
          fallback = fallback.filter((p) => p.price >= filters.minPrice!)
        }

        if (filters?.maxPrice !== undefined) {
          fallback = fallback.filter((p) => p.price <= filters.maxPrice!)
        }

        if (filters?.searchQuery) {
          const q = filters.searchQuery.toLowerCase()
          fallback = fallback.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
          )
        }

        return fallback
      }

      throw error
    }

    return (data as Product[]) || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
  const payload = {
    name:            String(product.name        ?? '').trim(),
    brand:           String(product.brand       ?? '').trim(),
    price:           parseFloat(String(product.price))   || 0,
    stock:           parseInt(String(product.stock), 10) || 0,
    category:        String(product.category    ?? '').trim(),
    description:     String(product.description ?? '').trim(),
    image_url:       String(product.image_url   ?? '').trim(),
    storage_options: Array.isArray(product.storage_options) ? product.storage_options : [],
    color_options:   Array.isArray(product.color_options)   ? product.color_options   : [],
  }

  console.log('Final Payload:', payload)

  const { data, error: dbError } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single()

  if (dbError) {
    console.error('DB Error:', dbError.message, dbError.details, dbError.hint)
    throw dbError
  }

  return data
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating product:', error)
    return null
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    return false
  }
}

// ==================== IMAGE UPLOAD ====================

// Bucket name as it appears in Supabase Storage dashboard
const STORAGE_BUCKET = 'products'

export async function uploadProductImage(file: File): Promise<string> {
  // Guard: should never be called without a file, but be explicit
  if (!file) throw new Error('No file provided for upload.')

  // Clean path: products/1234567890_filename.jpg
  const filePath = `${Date.now()}_${file.name}`

  // Step 1: upload to the 'products' bucket
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, { upsert: false })

  if (uploadError) {
    console.error('Storage Error:', uploadError)
    throw new Error(uploadError.message)
  }

  // Step 2: get public URL only after confirmed upload
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath)

  if (!data?.publicUrl) {
    throw new Error('Upload succeeded but public URL could not be retrieved.')
  }

  return data.publicUrl
}

// ==================== ORDER OPERATIONS ====================

export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating order:', error)
    return null
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating order status:', error)
    return null
  }
}

// ==================== CATEGORY OPERATIONS ====================

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      const pgError = error as any

      if (pgError?.code === 'PGRST205') {
        console.warn(
          "Supabase table 'categories' not found (PGRST205). Falling back to static category data from lib/data.ts."
        )
        return staticCategories
      }

      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// ==================== ANALYTICS ====================

export async function getDashboardStats() {
  try {
    const [productsCount, ordersCount, revenue] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total'),
    ])

    const totalRevenue = revenue.data?.reduce((sum, order) => sum + order.total, 0) || 0

    return {
      totalProducts: productsCount.count || 0,
      totalOrders: ordersCount.count || 0,
      totalRevenue,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
    }
  }
}


// ==================== STOCK MANAGEMENT ====================

export async function updateProductStock(productId: string, quantityChange: number): Promise<boolean> {
  try {
    // Get current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single()

    if (fetchError) throw fetchError

    const newStock = product.stock + quantityChange

    // Update stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId)

    if (updateError) throw updateError
    return true
  } catch (error) {
    console.error('Error updating product stock:', error)
    return false
  }
}

export async function decreaseProductStock(productId: string, quantity: number): Promise<boolean> {
  return updateProductStock(productId, -quantity)
}
