"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function HeritageSection() {
  return (
    <section className="bg-[#FAF7F2] py-24 md:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* LEFT: The Image with a Royal Arched Frame */}
        <div className="relative w-full max-w-md mx-auto lg:max-w-none aspect-[3/4] flex justify-center items-center group">
          {/* Decorative background shape */}
          <div className="absolute inset-0 bg-[#E8DCC4] rounded-t-[200px] transform rotate-3 scale-105 transition-transform duration-700 group-hover:rotate-6"></div>
          
          {/* Main Image Container */}
          <div className="relative w-full h-full rounded-t-[200px] overflow-hidden border-[8px] border-[#FAF7F2] shadow-2xl z-10">
            <Image 
              src="/HEROBG/desktop/2.jpg" // Using your local image to avoid Next.js errors!
              alt="Gulab Mehndi Heritage" 
              fill 
              className="object-cover transform transition-transform duration-[2s] group-hover:scale-110"
            />
          </div>
        </div>

        {/* RIGHT: The Heritage Content */}
        <div className="flex flex-col justify-center text-center lg:text-left">
          
          {/* Gold Eyebrow Text */}
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
            <span className="h-[1px] w-12 bg-[#C5A059]"></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold">
              The Royal Standard
            </span>
          </div>
          
          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2C1A14] leading-[1.15] mb-8">
            Adorning brides with <span className="italic text-[#8B2F2F]">pure tradition</span> since the beginning.
          </h2>
          
          {/* Paragraph */}
          <p className="text-[#5C4A45] font-serif text-lg md:text-xl leading-relaxed mb-10">
            We believe mehndi is more than just a temporary stain; it is a sacred ritual. Every cone we craft is hand-mixed using the finest triple-sifted Rajasthani henna, pure essential oils, and generations of ancestral knowledge. 
          </p>
          
          {/* Crimson Call to Action Button */}
          <div className="flex justify-center lg:justify-start">
            <Link 
              href="/story" 
              className="inline-flex items-center justify-center bg-[#8B2F2F] text-[#FAF7F2] px-10 py-5 text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-[#6b2222] transition-colors duration-300 shadow-xl"
            >
              Read Our Story
            </Link>
          </div>
          
        </div>

      </div>
    </section>
  );
}