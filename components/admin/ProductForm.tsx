'use client'

import { useState, useEffect } from 'react'
import { createProduct, updateProduct, uploadProductImage } from '@/lib/supabase-functions'
import { Product, Variant } from '@/lib/types'

interface ProductFormProps {
  product?: Product | null
  onClose: () => void
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    image_url: '',
  })
  const [variants, setVariants] = useState<Variant[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(false)

  const showVariantFields = ['phones', 'tablets', 'laptops'].includes(formData.category)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        description: product.description,
        image_url: product.image_url || '',
      })
      if (product.image_url) {
        setImagePreview(product.image_url)
      }
      setVariants(product.variants ?? [])
    }
  }, [product])

  const addVariant = () =>
    setVariants(v => [...v, { storage: '', color: '', price: 0, stock: 0 }])

  const removeVariant = (i: number) =>
    setVariants(v => v.filter((_, idx) => idx !== i))

  const updateVariant = (i: number, field: keyof Variant, value: string) =>
    setVariants(v => v.map((row, idx) =>
      idx === i
        ? { ...row, [field]: field === 'price' || field === 'stock' ? Number(value) : value }
        : row
    ))


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Required field validation before touching Supabase
    if (!formData.name.trim()) {
      alert('Product name is required.')
      return
    }
    if (!formData.category) {
      alert('Please select a category.')
      return
    }

    setLoading(true)

    try {
      // ── Step 1: image upload ──────────────────────────────────────────
      // Must complete and return a URL before we build the insert payload.
      let imageUrl = formData.image_url.trim()

      if (imageFile && imageSource === 'upload') {
        setUploadProgress(true)
        imageUrl = await uploadProductImage(imageFile) // throws on failure
        setUploadProgress(false)
      }

      if (!imageUrl) {
        alert('An image URL is required. Upload a file or paste a URL.')
        return
      }

      // ── Step 2: build payload ─────────────────────────────────────────
      const productData = {
        name:            formData.name.trim(),
        brand:           formData.brand.trim()       || '',
        price:           Number(formData.price)      || 0,
        stock:           Number(formData.stock)      || 0,
        category:        formData.category,
        description:     formData.description.trim() || '',
        image_url:       imageUrl,
        variants:        showVariantFields ? variants : [],
      }

      console.log('Payload:', productData)

      // ── Step 3: insert / update ───────────────────────────────────────
      if (product) {
        await updateProduct(product.id, productData)
      } else {
        await createProduct(productData) // throws with full DB error on failure
      }

      onClose()
    } catch (error: any) {
      console.error('DB Error:', error?.message, error?.details, error?.hint)
      alert('Error: ' + (error?.message ?? 'Unknown error'))
    } finally {
      setLoading(false)
      setUploadProgress(false)
    }
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImageSource('upload')
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFormData({ ...formData, image_url: url })
    setImageSource('url')
    setImageFile(null)
    
    // Set preview if valid URL
    if (url) {
      setImagePreview(url)
    } else {
      setImagePreview('')
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview('')
    setFormData({ ...formData, image_url: '' })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., iPhone 15 Pro"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Brand *</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Apple"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price (KSh) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="999.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              <option value="phones">Phones</option>
              <option value="tablets">Tablets</option>
              <option value="laptops">Laptops</option>
              <option value="accessories">Accessories</option>
              <option value="audio">Audio</option>
              <option value="wearables">Wearables</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Describe the product features and specifications..."
              required
            />
          </div>

          {/* Product Variants (phones / tablets / laptops only) */}
          {showVariantFields && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Product Variants</span>
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  + Add Variant
                </button>
              </div>

              {variants.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">No variants yet. Click "+ Add Variant" to start.</p>
              )}

              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                  <input
                    type="text"
                    value={v.storage}
                    onChange={(e) => updateVariant(i, 'storage', e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Storage"
                  />
                  <input
                    type="text"
                    value={v.color}
                    onChange={(e) => updateVariant(i, 'color', e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Color"
                  />
                  <input
                    type="number"
                    value={v.price || ''}
                    onChange={(e) => updateVariant(i, 'price', e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Price"
                    min={0}
                  />
                  <input
                    type="number"
                    value={v.stock || ''}
                    onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Stock"
                    min={0}
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="text-red-400 hover:text-red-600 text-lg leading-none px-1"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}

              {variants.length > 0 && (
                <p className="text-xs text-gray-400">Storage · Color · Price (KSh) · Stock</p>
              )}
            </div>
          )}

          {/* Image Upload Section */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium mb-4">Product Image</label>
            
            <div className="space-y-4">
              {/* Upload from Device */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload from device
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: JPG, PNG, or WebP (max 5MB)
                </p>
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 border-t"></div>
                <span className="text-sm text-gray-500 font-medium">OR</span>
                <div className="flex-1 border-t"></div>
              </div>

              {/* Paste Image URL */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Paste image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={handleImageUrlChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a direct link to an image
                </p>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Preview</label>
                    <button
                      type="button"
                      onClick={clearImage}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {imageSource === 'upload' ? (
                      <span className="text-green-600">✓ Image will be uploaded to storage</span>
                    ) : (
                      <span className="text-blue-600">✓ Using external URL</span>
                    )}
                  </p>
                </div>
              )}

              {/* No Image Placeholder */}
              {!imagePreview && (
                <div className="w-full h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No image selected</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-blue-800 font-medium">Uploading image...</span>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
