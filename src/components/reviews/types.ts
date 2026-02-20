/**
 * components/reviews/types.ts
 *
 * Single source of truth for the Review type.
 * Imported by ReviewsPage, ReviewCard, and reviewsCache.
 */

export interface Review {
  id: string
  name: string
  location: string
  quote: string
  rating: number
  image_url?: string
  created_at: string
}