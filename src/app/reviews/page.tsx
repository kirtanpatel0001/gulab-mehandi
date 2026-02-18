"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { CldImage } from 'next-cloudinary';

interface Review {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  image_url?: string;
  created_at: string;
}

type CachedReviews = {
  data: Review[];
  timestamp: number;
};

const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export default function ReviewsPage() {
  // --- FIX: Replaced global variable with component-scoped useRef ---
  const cacheRef = useRef<CachedReviews | null>(null);
  
  // Initialize with empty/loading state since ref is empty on first mount
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isModalOpen]);

  // --- FIX: Safely check cacheRef and update state without infinite loops ---
  const fetchReviews = useCallback(async (force = false) => {
    const cache = cacheRef.current;
    const isValid = cache && Date.now() - cache.timestamp < CACHE_TTL;

    if (isValid && !force) {
      setReviews(cache.data);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }

      // Update cache safely
      cacheRef.current = {
        data: data || [],
        timestamp: Date.now()
      };
      
      setReviews(data || []);
    } catch (err) {
      console.error("Unexpected fetch error:", err);
    } finally {
      setLoading(false); 
    }
  }, []); 

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    let uploadedImageUrl = null;

    if (imageFile) {
      const cloudinaryData = new FormData();
      cloudinaryData.append('file', imageFile);
      cloudinaryData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      try {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: cloudinaryData,
        });
        
        const data = await res.json();
        uploadedImageUrl = data.secure_url; 
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
        alert("Failed to upload image. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    const safeRating = Math.min(5, Math.max(1, rating));

    const { error } = await supabase.from('reviews').insert([{
      name: formData.get('name'),
      location: formData.get('location'),
      quote: formData.get('quote'),
      rating: safeRating,
      image_url: uploadedImageUrl,
    }]);

    if (error) {
      console.error("Supabase insert failed:", error);
      alert("Something went wrong saving the review.");
    } else {
      setIsModalOpen(false);
      setImageFile(null);
      setRating(5);
      fetchReviews(true); // Force bypasses cache after a new review
    }
    
    setIsSubmitting(false);
  };

  const starArray = useMemo(() => [1, 2, 3, 4, 5], []);

  return (
    <section className="min-h-screen bg-[#FDFBF7] w-full pb-24 relative">
      
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

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-2 border-[#1B342B]/20 border-t-[#A67C52] rounded-full animate-spin"></div>
              <p className="text-[#1B342B]/50 text-xs uppercase tracking-[0.2em] font-semibold animate-pulse">Curating Stories...</p>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 border border-[#1B342B]/10 bg-white shadow-sm">
            <p className="text-[#1B342B]/50 italic font-serif text-lg">Be the first to share your beautiful mehndi experience.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="break-inside-avoid bg-white border border-[#1B342B]/10 p-8 rounded-sm shadow-sm hover:shadow-xl transition-all duration-500 group"
              >
                {review.image_url && (
                  <div className="relative w-full h-64 mb-6 rounded-sm overflow-hidden bg-[#1B342B]/5">
                    <CldImage 
                      src={review.image_url} 
                      alt={`Review by ${review.name}`} 
                      fill 
                      format="auto"    
                      quality="auto"   
                      className="object-cover transform transition-transform duration-[10s] group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}

                <div className="flex space-x-1 mb-6">
                  {starArray.slice(0, review.rating).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[#A67C52]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-[#1B342B]/80 font-serif text-lg leading-relaxed mb-8 italic whitespace-pre-line">
                  "{review.quote}"
                </p>

                <div className="border-t border-[#1B342B]/10 pt-4 flex flex-col">
                  <span className="text-[#1B342B] font-bold text-xs uppercase tracking-widest">{review.name}</span>
                  <span className="text-[#A67C52] text-[10px] uppercase tracking-widest mt-1 font-medium">{review.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-[#FDFBF7] w-full max-w-2xl rounded-sm p-8 md:p-12 relative max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-[#1B342B]/50 hover:text-[#1B342B] transition-transform hover:rotate-90 duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-serif text-[#1B342B] mb-2">Your Experience</h2>
              <p className="text-[#A67C52] text-xs uppercase tracking-[0.2em] font-semibold">We would love to hear from you</p>
            </div>

            <form onSubmit={handleSubmitReview} className="flex flex-col space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Full Name</label>
                  <input name="name" required placeholder="e.g. Sarah Khan" className="border border-[#1B342B]/15 p-3.5 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm outline-none transition-shadow hover:shadow-sm" />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">City, Country</label>
                  <input name="location" required placeholder="e.g. Dubai, UAE" className="border border-[#1B342B]/15 p-3.5 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm outline-none transition-shadow hover:shadow-sm" />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Rating</label>
                <div className="flex space-x-2">
                  {starArray.map((star) => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <svg className={`w-8 h-8 ${rating >= star ? 'text-[#A67C52]' : 'text-[#1B342B]/15 hover:text-[#A67C52]/50'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Your Story</label>
                <textarea name="quote" required rows={4} placeholder="Tell us about your stain, the design process, and your event..." className="border border-[#1B342B]/15 p-3.5 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm outline-none resize-none transition-shadow hover:shadow-sm" />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80 flex justify-between items-end">
                  <span>Attach a Photo (Optional)</span>
                  <span className="font-medium text-[#1B342B]/40 normal-case tracking-normal">Max 5MB</span>
                </label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-[#1B342B]/70 file:mr-4 file:py-3 file:px-6 file:rounded-sm file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-[0.2em] file:bg-[#1B342B]/5 file:text-[#1B342B] hover:file:bg-[#1B342B]/10 cursor-pointer border border-[#1B342B]/15 bg-white rounded-sm transition-colors"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#1B342B] text-[#FDFBF7] px-8 py-4.5 rounded-sm hover:bg-[#A67C52] transition-colors duration-500 uppercase text-[11px] tracking-[0.2em] font-bold disabled:opacity-50 shadow-md hover:shadow-lg flex justify-center items-center h-14"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Publishing...</span>
                    </div>
                  ) : (
                    'Publish Review'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </section>
  );
}