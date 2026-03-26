export interface Variant {
  storage: string
  color: string
  price: number
  stock: number
}

export interface Product {
  id: string
  name: string
  brand: string
  price: number
  stock: number
  category: string
  description: string
  image_url?: string
  storage_options?: string[]
  color_options?: string[]
  variants?: Variant[]
  created_at: string
}

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  created_at: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
}
