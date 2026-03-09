interface ShopFiltersProps {
  categories: any[]
  products: any[]
  selectedCategory: string
  priceRange: string
  onCategoryChange: (category: string) => void
  onPriceRangeChange: (range: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export default function ShopFilters({
  categories,
  products,
  selectedCategory,
  priceRange,
  onCategoryChange,
  onPriceRangeChange,
  onClearFilters,
  hasActiveFilters,
}: ShopFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-lg">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
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
              onChange={() => onCategoryChange('all')}
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
                  onChange={() => onCategoryChange(category.slug)}
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
              onChange={() => onPriceRangeChange('all')}
              className="mr-3 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">All Prices</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={priceRange === 'under-100'}
              onChange={() => onPriceRangeChange('under-100')}
              className="mr-3 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Under $100</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={priceRange === '100-500'}
              onChange={() => onPriceRangeChange('100-500')}
              className="mr-3 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">$100 - $500</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={priceRange === '500-1000'}
              onChange={() => onPriceRangeChange('500-1000')}
              className="mr-3 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">$500 - $1,000</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={priceRange === 'over-1000'}
              onChange={() => onPriceRangeChange('over-1000')}
              className="mr-3 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Over $1,000</span>
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
  )
}
