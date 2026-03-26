'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import { getProducts, getCategories } from '@/lib/supabase-functions'
import { Product } from '@/lib/types'

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('name-asc')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [selectedCategory, priceRange, searchQuery, sortBy, products])

  const loadData = async () => {
    setLoading(true)
    const [productsData, categoriesData] = await Promise.all([
      getProducts(),
      getCategories()
    ])
    setProducts(productsData)
    setFilteredProducts(productsData)
    setCategories(categoriesData)
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...products]

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Price range filter
    if (priceRange !== 'all') {
      switch (priceRange) {
        case 'under-50k':
          filtered = filtered.filter(p => p.price < 50000)
          break
        case '50k-100k':
          filtered = filtered.filter(p => p.price >= 50000 && p.price <= 100000)
          break
        case '100k-200k':
          filtered = filtered.filter(p => p.price > 100000 && p.price <= 200000)
          break
        case 'over-200k':
          filtered = filtered.filter(p => p.price > 200000)
          break
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      )
    }

    // Sorting
    switch (sortBy) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    setFilteredProducts(filtered)
  }

  const clearFilters = () => {
    setSelectedCategory('all')
    setPriceRange('all')
    setSearchQuery('')
    setSortBy('name-asc')
  }

  const hasActiveFilters = selectedCategory !== 'all' || priceRange !== 'all' || searchQuery.trim() !== ''

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop All Products</h1>
          <p className="text-gray-600">Discover our complete collection of electronics</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search products by name, brand, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-sm uppercase text-gray-600">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'all'}
                      onChange={() => setSelectedCategory('all')}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">All Products ({products.length})</span>
                  </label>
                  {categories.map((category) => {
                    const count = products.filter(p => p.category === category.slug).length
                    return (
                      <label key={category.id} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category.slug}
                          onChange={() => setSelectedCategory(category.slug)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{category.name} ({count})</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold mb-3 text-sm uppercase text-gray-600">Price Range</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === 'all'}
                      onChange={() => setPriceRange('all')}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">All Prices</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === 'under-50k'}
                      onChange={() => setPriceRange('under-50k')}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Under KSh 50,000</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === '50k-100k'}
                      onChange={() => setPriceRange('50k-100k')}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">KSh 50,000 - KSh 100,000</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === '100k-200k'}
                      onChange={() => setPriceRange('100k-200k')}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">KSh 100,000 - KSh 200,000</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === 'over-200k'}
                      onChange={() => setPriceRange('over-200k')}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Over KSh 200,000</span>
                  </label>
                </div>
              </div>

              {/* Stock Status */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase text-gray-600">Availability</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">In Stock</span>
                    <span className="font-medium text-green-600">
                      {products.filter(p => p.stock > 0).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Out of Stock</span>
                    <span className="font-medium text-red-600">
                      {products.filter(p => p.stock === 0).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and Results Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{products.length}</span> products
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                <p className="mt-4 text-gray-600 text-lg">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* No Results */
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search query
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              /* Products Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
