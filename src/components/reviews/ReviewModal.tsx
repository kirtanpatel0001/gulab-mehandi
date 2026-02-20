"use client";

/**
 * components/reviews/ReviewModal.tsx
 *
 * Lazy-loaded via dynamic() in ReviewsPage.
 * This entire form (~80 lines of JSX + handlers) is excluded from the
 * initial JS bundle. It's only downloaded when the user clicks
 * "Share Your Experience" — which most visitors never do.
 *
 * Image upload now goes through /api/upload (server-side Cloudinary)
 * instead of exposing upload_preset in the browser. See /app/api/upload/route.ts
 */

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { invalidateReviewsCache } from '@/lib/cache/reviewsCache'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const STAR_ARRAY = [1, 2, 3, 4, 5] as const

export default function ReviewModal({ onClose, onSuccess }: Props) {
  const supabase     = getSupabaseClient()
  const [rating,     setRating]     = useState(5)
  const [imageFile,  setImageFile]  = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    // Validate image before any network call
    if (imageFile) {
      if (!imageFile.type.startsWith('image/')) {
        alert('Invalid file type. Please upload an image.')
        setSubmitting(false)
        return
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB.')
        setSubmitting(false)
        return
      }
    }

    const formData = new FormData(e.currentTarget)
    let uploadedImageUrl: string | null = null

    // ✅ Upload via server route — upload_preset never exposed to browser
    if (imageFile) {
      const body = new FormData()
      body.append('file', imageFile)

      try {
        const res  = await fetch('/api/upload', { method: 'POST', body })
        const json = await res.json()
        if (!res.ok || !json.secure_url) throw new Error('Upload failed')
        uploadedImageUrl = json.secure_url
      } catch (err) {
        console.error('Upload error:', err)
        alert('Failed to upload image. Please try again.')
        setSubmitting(false)
        return
      }
    }

    const { error } = await supabase.from('reviews').insert([{
      name:      formData.get('name'),
      location:  formData.get('location'),
      quote:     formData.get('quote'),
      rating:    Math.min(5, Math.max(1, rating)),
      image_url: uploadedImageUrl,
    }])

    if (error) {
      console.error('Insert error:', error)
      alert('Something went wrong. Please try again.')
    } else {
      invalidateReviewsCache()  // Force fresh fetch after new review
      onSuccess()
      onClose()
    }

    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#FDFBF7] w-full max-w-2xl rounded-sm p-8 md:p-12 relative max-h-[90vh] overflow-y-auto shadow-2xl">

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#1B342B]/50 hover:text-[#1B342B] transition-transform hover:rotate-90 duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-[#1B342B] mb-2">Your Experience</h2>
          <p className="text-[#A67C52] text-xs uppercase tracking-[0.2em] font-semibold">
            We would love to hear from you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Full Name</label>
              <input name="name" required placeholder="e.g. Sarah Khan"
                className="border border-[#1B342B]/15 p-3.5 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm outline-none" />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">City, Country</label>
              <input name="location" required placeholder="e.g. Dubai, UAE"
                className="border border-[#1B342B]/15 p-3.5 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm outline-none" />
            </div>
          </div>

          {/* Star rating */}
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Rating</label>
            <div className="flex space-x-2">
              {STAR_ARRAY.map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110">
                  <svg className={`w-8 h-8 ${rating >= star ? 'text-[#A67C52]' : 'text-[#1B342B]/15 hover:text-[#A67C52]/50'}`}
                    fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Your Story</label>
            <textarea name="quote" required rows={4}
              placeholder="Tell us about your stain, the design process, and your event..."
              className="border border-[#1B342B]/15 p-3.5 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm outline-none resize-none" />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80 flex justify-between items-end">
              <span>Attach a Photo (Optional)</span>
              <span className="font-medium text-[#1B342B]/40 normal-case tracking-normal">Max 5MB</span>
            </label>
            <input type="file" accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-[#1B342B]/70 file:mr-4 file:py-3 file:px-6 file:rounded-sm file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-[0.2em] file:bg-[#1B342B]/5 file:text-[#1B342B] hover:file:bg-[#1B342B]/10 cursor-pointer border border-[#1B342B]/15 bg-white rounded-sm" />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={submitting}
              className="w-full bg-[#1B342B] text-[#FDFBF7] px-8 rounded-sm hover:bg-[#A67C52] transition-colors duration-500 uppercase text-[11px] tracking-[0.2em] font-bold disabled:opacity-50 shadow-md flex justify-center items-center h-14">
              {submitting ? (
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Publishing...</span>
                </div>
              ) : 'Publish Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}