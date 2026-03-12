'use client'

import Link from 'next/link'
import { CartItem as CartItemType } from '@/lib/cart-context'
import { formatKsh } from '@/lib/currency'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const subtotal = item.price * item.quantity

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= item.stock) {
      onUpdateQuantity(item.id, newQuantity)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-6 border-b last:border-b-0">
      {/* Product Image */}
      <Link href={`/product/${item.id}`} className="flex-shrink-0">
        <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden hover:opacity-75 transition">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-xs">No image</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Link href={`/product/${item.id}`} className="hover:text-blue-600 transition">
            <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
          </Link>
          <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
          
          {/* Stock Warning */}
          {item.quantity >= item.stock && (
            <p className="text-xs text-orange-600 font-medium">
              Maximum quantity reached
            </p>
          )}
          {item.stock < 10 && item.stock > 0 && (
            <p className="text-xs text-orange-600 font-medium">
              Only {item.stock} left in stock
            </p>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Price</p>
            <p className="text-lg font-bold text-blue-600">{formatKsh(item.price)}</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex flex-col items-end gap-2">
            <p className="text-sm text-gray-600">Quantity</p>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Decrease quantity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                min="1"
                max={item.stock}
                value={item.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-16 text-center py-2 border-x focus:outline-none"
              />
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Increase quantity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Subtotal */}
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Subtotal</p>
            <p className="text-xl font-bold text-gray-900">{formatKsh(subtotal)}</p>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.id)}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
