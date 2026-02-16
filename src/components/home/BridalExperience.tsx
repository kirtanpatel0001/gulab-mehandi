"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function BridalExperience() {
  return (
    <section className="bg-[#FAF7F2] py-24 md:py-40 relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* LEFT: The Offset Editorial Portrait */}
        <div className="relative w-full max-w-lg mx-auto lg:max-w-none aspect-[4/5] lg:aspect-[3/4] group">
          {/* Decorative Offset Block (Creates that modern art-gallery framing) */}
          <div className="absolute top-8 -left-6 lg:-left-10 w-full h-full bg-[#E8DCC4] -z-10 transition-transform duration-700 group-hover:translate-x-4 group-hover:-translate-y-4"></div>
          
          <div className="relative w-full h-full overflow-hidden shadow-2xl border border-[#C5A059]/20">
            <Image 
              src="/HEROBG/desktop/2.jpg" // Change this to a beautiful portrait of a bride's mehndi
              alt="Bespoke Bridal Mehndi Experience"
              fill
              className="object-cover transform transition-transform duration-[2s] group-hover:scale-105"
            />
          </div>
        </div>

        {/* RIGHT: Typography & Booking CTA */}
        <div className="flex flex-col justify-center text-center lg:text-left">
          
          {/* Crimson Eyebrow Text */}
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
            <span className="h-[1px] w-12 bg-[#8B2F2F]"></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8B2F2F] font-bold">
              Bespoke Services
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2C1A14] leading-[1.15] mb-8">
            The Royal Bridal <br className="hidden lg:block" />
            <span className="italic text-[#C5A059]">Consultation</span>
          </h2>

          <p className="text-[#5C4A45] font-serif text-lg md:text-xl leading-relaxed mb-12">
            Your wedding day deserves nothing less than perfection. We offer bespoke henna designs tailored to your love story, using our signature deep-staining organic paste. Available for destination weddings worldwide.
          </p>

          <div className="flex justify-center lg:justify-start">
            <Link 
              href="/book" 
              className="inline-flex items-center justify-center bg-[#2C1A14] text-[#FAF7F2] px-10 py-5 text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-[#C5A059] hover:text-[#2C1A14] transition-colors duration-500 shadow-xl"
            >
              Inquire For Your Date
            </Link>
          </div>
          
        </div>

      </div>
    </section>
  );
}