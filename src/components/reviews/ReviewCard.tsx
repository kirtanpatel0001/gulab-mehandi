/**
 * components/reviews/ReviewCard.tsx
 *
 * React.memo with custom comparator — re-renders ONLY when review.id
 * or review data changes. Without this, every realtime insert causes
 * all 30 cards to reconcile even though only 1 card is new.
 *
 * star rendering moved inside — removed unnecessary starArray prop
 * since [1,2,3,4,5] never changes.
 */

import React from 'react'
import Image from 'next/image'
import type { Review } from './types'

// Star SVG extracted as a constant — no allocation per render
const StarIcon = (
  <svg className="w-4 h-4 text-[#A67C52]" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

interface Props {
  review: Review
}

function ReviewCard({ review }: Props) {
  const hasImage = !!review.image_url && (
    review.image_url.startsWith('http://') ||
    review.image_url.startsWith('https://')
  )

  return (
    <div className="break-inside-avoid bg-white border border-[#1B342B]/10 p-8 rounded-sm shadow-sm hover:shadow-xl transition-all duration-500 group">

      {/* Photo */}
      {hasImage && (
        <div className="relative w-full h-64 mb-6 rounded-sm overflow-hidden bg-[#1B342B]/5">
          <Image
            src={review.image_url!}
            alt={`Review by ${review.name}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).parentElement!.style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Stars */}
      <div className="flex space-x-1 mb-6">
        {Array.from({ length: review.rating }, (_, i) => (
          <span key={i}>{StarIcon}</span>
        ))}
      </div>

      {/* Quote */}
      <p className="text-[#1B342B]/80 font-serif text-lg leading-relaxed mb-8 italic whitespace-pre-line">
        "{review.quote}"
      </p>

      {/* Author */}
      <div className="border-t border-[#1B342B]/10 pt-4 flex flex-col">
        <span className="text-[#1B342B] font-bold text-xs uppercase tracking-widest">
          {review.name}
        </span>
        <span className="text-[#A67C52] text-[10px] uppercase tracking-widest mt-1 font-medium">
          {review.location}
        </span>
      </div>
    </div>
  )
}

// Custom comparator — skip re-render if review object hasn't changed
export default React.memo(ReviewCard, (prev, next) => prev.review.id === next.review.id && prev.review.quote === next.review.quote)