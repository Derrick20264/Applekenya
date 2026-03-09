import Link from 'next/link'

export default function HeroBanner() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Discover the Latest in Electronics
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Premium phones, tablets, and accessories at unbeatable prices
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/shop" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-center"
            >
              Shop Now
            </Link>
            <Link 
              href="/shop?category=phones" 
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition text-center"
            >
              View Phones
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="relative">
        <svg 
          className="w-full h-12 md:h-16 text-white" 
          viewBox="0 0 1440 48" 
          fill="currentColor" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 48h1440V0c-240 48-480 48-720 24C480 0 240 0 0 24v24z" />
        </svg>
      </div>
    </section>
  )
}
