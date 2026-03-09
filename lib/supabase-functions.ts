import { supabase } from './supabase'
import { Product, Order } from './types'

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

    if (error) throw error
    return data || []
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
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating product:', error)
    return null
  }
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

export async function uploadProductImage(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
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

    if (error) throw error
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
