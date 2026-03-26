import { getProductById, getProducts } from '@/lib/supabase-functions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductGallery from '@/components/ProductGallery'
import RelatedProducts from '@/components/RelatedProducts'
import ProductVariantSelector from '@/components/ProductVariantSelector'
import { formatKsh } from '@/lib/currency'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  // Fetch related products from same category
  const allProducts = await getProducts({ category: product.category })
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm flex items-center gap-2 flex-wrap">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          <span className="text-gray-400">/</span>
          <Link href="/shop" className="text-blue-600 hover:underline">Shop</Link>
          <span className="text-gray-400">/</span>
          <Link href={`/shop?category=${product.category}`} className="text-blue-600 hover:underline capitalize">
            {product.category}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 truncate">{product.name}</span>
        </nav>

        {/* Product Details Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 p-6 md:p-8">
            {/* Product Image */}
            <ProductGallery imageUrl={product.image_url} productName={product.name} />

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Category Badge */}
              <div className="mb-3">
                <Link 
                  href={`/shop?category=${product.category}`}
                  className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full uppercase hover:bg-blue-200 transition"
                >
                  {product.category}
                </Link>
              </div>
              
              {/* Product Name */}
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">{product.name}</h1>
              
              {/* Brand */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">Brand:</span>
                <span className="text-sm font-semibold text-gray-900">{product.brand}</span>
              </div>

              {/* Price, Variant Selector, and Add to Cart */}
              <ProductVariantSelector product={product} />

              {/* Description */}
              <div className="mb-6 mt-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-900">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Product Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Availability:</span>
                  <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {product.stock} in stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Out of stock
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">SKU:</span>
                  <span className="text-sm font-mono text-gray-900">{product.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Category:</span>
                  <span className="text-sm text-gray-900 capitalize">{product.category}</span>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Authentic Product</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Fast Shipping</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Warranty</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Product Specifications</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex justify-between py-3 border-b">
              <span className="font-medium text-gray-600">Brand</span>
              <span className="text-gray-900">{product.brand}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-medium text-gray-600">Category</span>
              <span className="text-gray-900 capitalize">{product.category}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-medium text-gray-600">Price</span>
              <span className="text-gray-900 font-semibold">{formatKsh(product.price)}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-medium text-gray-600">Stock Status</span>
              <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} currentCategory={product.category} />
        )}
      </div>
    </div>
  )
}
