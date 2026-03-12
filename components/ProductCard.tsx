'use client'

import Link from 'next/link'
import { Product } from '@/lib/types'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Link href={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
        {/* Product Image */}
        <div className="relative bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
          {product.image_url && !imageError ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 p-4">
              <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">No Image</span>
            </div>
          )}
          
          {/* Stock Badges */}
          {product.stock < 10 && product.stock > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
              Low Stock
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Out of Stock
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="text-xs text-gray-500 mb-1 uppercase">{product.brand}</div>
          <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition line-clamp-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
            <span className={`text-sm ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
