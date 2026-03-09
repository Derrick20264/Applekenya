// API Client for frontend to backend communication

interface ApiResponse<T> {
  success: boolean
  data?: T
  count?: number
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Request failed')
      }

      return data
    } catch (error) {
      console.error('API request error:', error)
      throw error
    }
  }

  // Products
  async getProducts(filters?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    search?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString())
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
    if (filters?.search) params.append('search', filters.search)

    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/api/products${query}`)
  }

  async getProduct(id: string) {
    return this.request(`/api/products/${id}`)
  }

  async createProduct(data: any) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: string) {
    return this.request(`/api/products/${id}`, {
      method: 'DELETE',
    })
  }

  // Orders
  async getOrders() {
    return this.request('/api/orders')
  }

  async getOrder(id: string) {
    return this.request(`/api/orders/${id}`)
  }

  async createOrder(data: any) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/api/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  // Categories
  async getCategories() {
    return this.request('/api/categories')
  }
}

export const apiClient = new ApiClient()
