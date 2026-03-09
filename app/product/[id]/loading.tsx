export default function Loading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
          <span className="text-gray-400">/</span>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <span className="text-gray-400">/</span>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Product Details Skeleton */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 p-6 md:p-8">
            {/* Image Skeleton */}
            <div className="bg-gray-200 rounded-lg aspect-square animate-pulse"></div>

            {/* Info Skeleton */}
            <div className="flex flex-col space-y-4">
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-14 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Specifications Skeleton */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between py-3 border-b">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
