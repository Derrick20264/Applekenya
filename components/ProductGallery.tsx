'use client'

import { useState } from 'react'

interface ProductGalleryProps {
  imageUrl?: string
  productName: string
}

export default function ProductGallery({ imageUrl, productName }: ProductGalleryProps) {
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <div className="relative">
      <div 
        className={`bg-gray-100 rounded-lg aspect-square flex items-center justify-center overflow-hidden cursor-zoom-in ${
          isZoomed ? 'cursor-zoom-out' : ''
        }`}
        onClick={() => setIsZoomed(!isZoomed)}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={productName}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
          />
        ) : (
          <div className="text-center p-8">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-400 text-sm">No image available</span>
          </div>
        )}
      </div>
      
      {imageUrl && (
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full p-2 shadow-lg">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      )}
    </div>
  )
}
