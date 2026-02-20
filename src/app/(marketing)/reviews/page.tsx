"use client";

/**
 * ReviewsPage.tsx — Optimized Version
 *
 * Improvements over original:
 * ─────────────────────────────────────────────────────────────────────────────
 * ✅ 1. Global cache (reviewsCache.ts) — survives component remounts
 * ✅ 2. Debounced realtime handler — 10 inserts = 1 fetch, not 10
 * ✅ 3. React.memo ReviewCard — only new cards re-render on realtime update
 * ✅ 4. useTransition correctly applied — setReviews() is the non-urgent update
 * ✅ 5. Lazy-loaded ReviewModal via dynamic() — excluded from initial bundle
 * ✅ 6. Image upload via /api/upload — upload_preset never exposed to browser
 * ✅ 7. invalidateReviewsCache() on submit — forces fresh fetch after new review
 * ✅ 8. isMounted guard on all async callbacks — prevents setState after unmount
 */

import { useState, useEffect, useCallback, useRef, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { getSupabaseClient }    from '@/lib/supabase/client'
import {
  getReviewsCache,
  setReviewsCache,
  isReviewsCacheValid,
}                               from '@/lib/cache/reviewsCache'
import ReviewCard               from '@/components/reviews/ReviewCard'
import type { Review }          from '@/components/reviews/types'

// ✅ Lazy load — modal is never in the initial bundle
const ReviewModal = dynamic(
  () => import('@/components/reviews/ReviewModal'),
  { ssr: false }
)

const CACHE_TTL       = 1000 * 60 * 5   // 5 minutes
const DEBOUNCE_MS     = 1000             // collapse burst inserts into one fetch

// ── Skeleton ─────────────────────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <div className="break-inside-avoid bg-white border border-[#1B342B]/10 p-8 rounded-sm shadow-sm animate-pulse">
      <div className="w-full h-48 bg-[#1B342B]/5 rounded-sm mb-6" />
      <div className="flex space-x-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-[#1B342B]/10 rounded-full" />
        ))}
      </div>
      <div className="space-y-2 mb-8">
        <div className="h-4 bg-[#1B342B]/5 rounded w-full" />
        <div className="h-4 bg-[#1B342B]/5 rounded w-5/6" />
        <div className="h-4 bg-[#1B342B]/5 rounded w-4/6" />
      </div>
      <div className="border-t border-[#1B342B]/10 pt-4 space-y-2">
        <div className="h-3 bg-[#1B342B]/10 rounded w-24" />
        <div className="h-3 bg-[#A67C52]/20 rounded w-16" />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  const supabase    = getSupabaseClient()
  const isMounted   = useRef(false)
  const fetchingRef = useRef(false)
  const realtimeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [reviews,     setReviews]     = useState<Review[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // ✅ useTransition — marks setReviews as non-urgent
  // UI (skeleton → content transition) won't block higher-priority interactions
  const [, startTransition] = useTransition()

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  // Body scroll lock when modal is open
  useEffect(() => {
    if (!isModalOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isModalOpen])

  // ── fetchReviews ──────────────────────────────────────────────────────────
  const fetchReviews = useCallback(async (force = false) => {
    if (fetchingRef.current) return

    // ✅ Global cache check — hits on remount even after navigation away/back
    if (!force && isReviewsCacheValid(CACHE_TTL)) {
      const cached = getReviewsCache()
      if (cached) {
        // ✅ useTransition correctly placed — wraps the state update, not the fetch
        startTransition(() => setReviews(cached.data))
        setLoading(false)
        return
      }
    }

    fetchingRef.current = true
    if (!force) setLoading(true)
    setError(null)

    try {
      const { data, error: queryError } = await supabase
        .from('reviews')
        .select('id, name, location, quote, rating, image_url, created_at')
        .order('created_at', { ascending: false })
        .limit(30)

      if (!isMounted.current) return
      if (queryError) throw queryError

      const safeData = (data as Review[]) ?? []

      // Cache globally — next remount within TTL will skip this fetch entirely
      setReviewsCache(safeData)

      // ✅ Non-urgent update — React can defer this if user is interacting
      startTransition(() => setReviews(safeData))

    } catch (err) {
      if (!isMounted.current) return
      console.error('Reviews fetch error:', err)
      setError('Failed to load reviews. Please refresh.')
    } finally {
      if (isMounted.current) {
        setLoading(false)
        fetchingRef.current = false
      }
    }
  }, [supabase])

  // Initial fetch
  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // ── Realtime subscription with debounce ───────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('reviews-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, () => {
        // ✅ Debounce: burst of 10 inserts → wait 1s → 1 fetch
        if (realtimeTimeout.current) clearTimeout(realtimeTimeout.current)
        realtimeTimeout.current = setTimeout(() => {
          if (isMounted.current) fetchReviews(true)
        }, DEBOUNCE_MS)
      })
      .subscribe()

    return () => {
      if (realtimeTimeout.current) clearTimeout(realtimeTimeout.current)
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchReviews])

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen bg-[#FDFBF7] w-full pb-24 relative">

      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <span className="text-[#A67C52] tracking-[0.3em] text-xs font-semibold uppercase mb-4 block">
          Client Diaries
        </span>
        <h1 className="text-5xl md:text-7xl font-serif text-[#1B342B] mb-8 tracking-tight">
          Love <span className="italic font-light">Letters</span>
        </h1>
        <p className="text-[#1B342B]/70 font-light max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-8">
          The greatest privilege of our artistry is being part of your most cherished celebrations across the globe.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="border border-[#1B342B] text-[#1B342B] px-8 py-3 rounded-sm hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-all duration-500 uppercase text-xs tracking-[0.2em] font-bold"
        >
          Share Your Experience
        </button>
      </div>

      {/* Reviews grid */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {error ? (
          <div className="text-center py-20 border border-red-200 bg-red-50">
            <p className="text-red-600 font-serif text-lg mb-4">{error}</p>
            <button
              onClick={() => fetchReviews(true)}
              className="text-xs uppercase tracking-widest font-bold text-red-600 border border-red-300 px-6 py-2 hover:bg-red-50"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {loading ? (
              [...Array(6)].map((_, i) => <ReviewSkeleton key={i} />)
            ) : reviews.length === 0 ? (
              <div className="col-span-3 text-center py-20 border border-[#1B342B]/10 bg-white">
                <p className="text-[#1B342B]/50 italic font-serif text-lg">
                  Be the first to share your beautiful mehndi experience.
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                // ✅ Memoized — only re-renders if this card's data changes
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        )}
      </div>

      {/* ✅ Lazy-loaded modal — downloaded only when user clicks the button */}
      {isModalOpen && (
        <ReviewModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchReviews(true)}
        />
      )}
    </section>
  )
}