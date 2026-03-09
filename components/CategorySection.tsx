import Link from 'next/link'

const categories = [
  {
    name: 'Phones',
    slug: 'phones',
    description: 'Latest smartphones from top brands',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Tablets',
    slug: 'tablets',
    description: 'Powerful tablets for work and play',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-purple-500 to-purple-600',
  },
  {
    name: 'Laptops',
    slug: 'laptops',
    description: 'High-performance laptops',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-green-500 to-green-600',
  },
  {
    name: 'Audio',
    slug: 'audio',
    description: 'Premium headphones and speakers',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    ),
    color: 'from-orange-500 to-orange-600',
  },
  {
    name: 'Wearables',
    slug: 'wearables',
    description: 'Smartwatches and fitness trackers',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-pink-500 to-pink-600',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Cases, chargers, and more',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'from-teal-500 to-teal-600',
  },
]

export default function CategorySection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
        <p className="text-gray-600">Browse our wide selection of electronics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/shop?category=${category.slug}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center">
              <div className={`bg-gradient-to-br ${category.color} text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                {category.icon}
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600 hidden md:block">
                {category.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
