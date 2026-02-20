"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function GalleryPage() {
  // Define categories for easy filtering
  const categories = ["All", "Bridal", "Festivals", "Party", "Organic Cones"];

  // Full 18-image array to test the Load More function beautifully
  const allGalleryImages = [
    // --- BATCH 1 ---
    { src: '/HEROBG/desktop/1.jpg', alt: 'Intricate bridal henna design', category: 'Bridal' },
    { src: '/HEROBG/mobile/2.jpg', alt: 'Traditional foot mehndi', category: 'Bridal' },
    { src: '/HEROBG/desktop/3.jpg', alt: 'Modern minimalist henna', category: 'Party' },
    { src: '/HEROBG/mobile/1.jpg', alt: 'Diwali Festive Henna', category: 'Festivals' },
    { src: '/HEROBG/desktop/2.jpg', alt: 'Eid Celebration Mehndi', category: 'Festivals' },
    { src: '/HEROBG/mobile/3.jpg', alt: 'Karwa Chauth Special', category: 'Festivals' },
    { src: '/HEROBG/desktop/4.jpg', alt: 'Symmetrical bridal arms', category: 'Bridal' },
    { src: '/HEROBG/mobile/4.jpg', alt: 'Organic Mehndi Cones', category: 'Organic Cones' },
    { src: '/HEROBG/desktop/6.jpg', alt: 'Luxury Party Stain', category: 'Party' },
    
    // --- BATCH 2 (Hidden behind "Load More") ---
    { src: '/HEROBG/desktop/1.jpg', alt: 'Intricate bridal henna design 2', category: 'Bridal' },
    { src: '/HEROBG/mobile/2.jpg', alt: 'Traditional foot mehndi 2', category: 'Bridal' },
    { src: '/HEROBG/desktop/3.jpg', alt: 'Modern minimalist henna 2', category: 'Party' },
    { src: '/HEROBG/mobile/1.jpg', alt: 'Diwali Festive Henna 2', category: 'Festivals' },
    { src: '/HEROBG/desktop/2.jpg', alt: 'Eid Celebration Mehndi 2', category: 'Festivals' },
    { src: '/HEROBG/mobile/3.jpg', alt: 'Karwa Chauth Special 2', category: 'Festivals' },
    { src: '/HEROBG/desktop/4.jpg', alt: 'Symmetrical bridal arms 2', category: 'Bridal' },
    { src: '/HEROBG/mobile/4.jpg', alt: 'Organic Mehndi Cones 2', category: 'Organic Cones' },
    { src: '/HEROBG/desktop/6.jpg', alt: 'Luxury Party Stain 2', category: 'Party' },
  ];

  const [activeCategory, setActiveCategory] = useState("All");
  // Start by showing 9 images
  const [visibleCount, setVisibleCount] = useState(9);

  // Filter logic
  const filteredImages = allGalleryImages.filter(img => 
    activeCategory === "All" ? true : img.category === activeCategory
  );

  // Load 9 more images every time the button is clicked
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 9);
  };

  return (
    <section className="min-h-screen bg-[#FDFBF7] w-full pb-24">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10 text-center">
        <h1 className="text-5xl md:text-7xl font-serif text-[#1B342B] mb-6 tracking-tight">
          The <span className="italic text-[#A67C52] font-light">Collection</span>
        </h1>
        <p className="text-[#1B342B]/70 font-light max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-12">
    Every pattern tells a story. A curated selection of deeply stained, detailed mehndi designs, created to honor love, heritage, and individuality.        </p>

        {/* CATEGORY FILTER BAR */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setVisibleCount(9); // Reset to 9 items when changing category
              }}
              className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-300 pb-1 border-b-2 ${
                activeCategory === cat 
                ? 'text-[#1B342B] border-[#A67C52]' 
                : 'text-[#1B342B]/40 border-transparent hover:text-[#1B342B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MASONRY GRID - RESTORED TO THE LAYOUT YOU LOVED */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          
          {filteredImages.slice(0, visibleCount).map((image, index) => (
            <div 
              key={index} 
              className="break-inside-avoid relative group overflow-hidden rounded-sm bg-[#1B342B]/5 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
            >
              {/* Image Container (Restored proportions) */}
              <div className="relative w-full h-auto">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={600}
                  height={800}
                  priority={index < 3}
                  // Restored the 10-second scale-110 zoom!
                  className="w-full h-auto object-cover transform transition-transform duration-[10s] group-hover:scale-110"
                />
              </div>

              {/* Restored the beautiful dark overlay with "View Detail" in the center */}
              <div className="absolute inset-0 bg-[#1B342B]/0 group-hover:bg-[#1B342B]/20 transition-colors duration-500 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-[#FDFBF7] text-xs uppercase tracking-[0.3em] font-semibold drop-shadow-md transition-opacity duration-500 delay-100">
                  View Detail
                </span>
              </div>

              {/* Added the Category Badge subtly to the top left */}
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                <span className="bg-white/95 text-[#1B342B] px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold shadow-sm rounded-sm">
                  {image.category}
                </span>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* LOAD MORE BUTTON */}
      {visibleCount < filteredImages.length && (
        <div className="flex justify-center mt-16">
          <button 
            onClick={handleLoadMore}
            className="border border-[#1B342B]/30 text-[#1B342B] px-10 py-4 rounded-sm hover:bg-[#1B342B] hover:text-[#FDFBF7] hover:border-[#1B342B] transition-all duration-500 uppercase text-xs tracking-[0.2em] font-bold"
          >
            Load More Beauty
          </button>
        </div>
      )}

      {/* BOOKING CTA */}
      <div className="max-w-4xl mx-auto px-6 mt-32 text-center border-t border-[#1B342B]/10 pt-16">
        <h3 className="text-3xl font-serif text-[#1B342B] mb-4">Celebrate Your Next Festival With Us</h3>
        <p className="text-[#1B342B]/70 text-sm font-light mb-8 max-w-lg mx-auto">
          Whether it is your wedding day or a festive celebration, our bookings for international travel and festivals open months in advance.
        </p>
        <Link href="/book">
          <button className="bg-[#A67C52] text-white px-10 py-4 rounded-sm hover:bg-[#1B342B] transition-colors duration-500 uppercase text-xs tracking-[0.2em] font-bold shadow-xl">
            Book Your Date
          </button>
        </Link>
      </div>

    </section>
  );
}