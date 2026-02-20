/**
 * lib/cache/reviewsCache.ts
 *
 * Module-level cache — lives for the entire browser session.
 *
 * Why this beats useRef:
 * ─────────────────────────────────────────────────────────────
 * useRef cache lives inside the component instance.
 * When the user navigates away and back → component unmounts/remounts
 * → useRef is reset to null → DB is queried again even if data is fresh.
 *
 * Module-level variable is initialized once per page load and never reset
 * by React lifecycle. User can visit /reviews 10 times in a session and
 * only the first visit hits Supabase (within the TTL window).
 */

import type { Review } from '@/components/reviews/types'

type CachedReviews = {
  data: Review[]
  timestamp: number
}

// Module-level singleton — persists across component mounts/unmounts
let cache: CachedReviews | null = null

export function getReviewsCache(): CachedReviews | null {
  return cache
}

export function setReviewsCache(data: Review[]): void {
  cache = { data, timestamp: Date.now() }
}

export function isReviewsCacheValid(ttlMs: number): boolean {
  if (!cache) return false
  return Date.now() - cache.timestamp < ttlMs
}

export function invalidateReviewsCache(): void {
  cache = null
}