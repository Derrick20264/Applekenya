'use client'

import { useState, useMemo } from 'react'
import { Product, Variant } from '@/lib/types'
import { formatKsh } from '@/lib/currency'
import AddToCartButton from './AddToCartButton'

interface Props {
  product: Product
}

export default function ProductVariantSelector({ product }: Props) {
  const variants: Variant[] = product.variants ?? []
  const hasVariants = variants.length > 0

  // Unique option lists
  const storageOptions = useMemo(
    () => [...new Set(variants.map(v => v.storage).filter(Boolean))],
    [variants]
  )
  const colorOptions = useMemo(
    () => [...new Set(variants.map(v => v.color).filter(Boolean))],
    [variants]
  )

  const [selectedStorage, setSelectedStorage] = useState(storageOptions[0] ?? '')
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] ?? '')

  // Find the matching variant for the current selection
  const matchedVariant = useMemo<Variant | undefined>(
    () => variants.find(v => v.storage === selectedStorage && v.color === selectedColor),
    [variants, selectedStorage, selectedColor]
  )

  // Build the effective product to pass to AddToCartButton
  const effectiveProduct: Product = useMemo(() => {
    if (!hasVariants || !matchedVariant) return product
    return {
      ...product,
      price: matchedVariant.price,
      stock: matchedVariant.stock,
      // Append variant label to name so cart shows it clearly
      name: `${product.name} (${selectedStorage}, ${selectedColor})`,
    }
  }, [product, matchedVariant, hasVariants, selectedStorage, selectedColor])

  const displayPrice = hasVariants && matchedVariant ? matchedVariant.price : product.price
  const displayStock = hasVariants && matchedVariant ? matchedVariant.stock : product.stock

  return (
    <>
      {/* Price */}
      <div className="flex items-baseline gap-4 mb-6 pb-6 border-b">
        <p className="text-4xl font-bold text-blue-600 transition-all">{formatKsh(displayPrice)}</p>
        {displayStock < 10 && displayStock > 0 && (
          <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
            Only {displayStock} left!
          </span>
        )}
      </div>

      {/* Variant Dropdowns */}
      {hasVariants && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {storageOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage</label>
              <select
                value={selectedStorage}
                onChange={e => setSelectedStorage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {storageOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}
          {colorOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select
                value={selectedColor}
                onChange={e => setSelectedColor(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {colorOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}
          {hasVariants && !matchedVariant && (
            <p className="col-span-2 text-sm text-orange-600">
              This combination is not available.
            </p>
          )}
        </div>
      )}

      {/* Add to Cart */}
      <AddToCartButton product={effectiveProduct} />
    </>
  )
}
