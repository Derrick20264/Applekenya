import ProductCard from './ProductCard'
import { Product } from '@/lib/types'

interface RelatedProductsProps {
  products: Product[]
  currentCategory: string
}

export default function RelatedProducts({ products, currentCategory }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Related Products</h2>
        <span className="text-sm text-gray-500 capitalize">in {currentCategory}</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
