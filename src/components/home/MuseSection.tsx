"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function MuseSection() {
  // Replace these images with your actual bridal portfolio shots
  const muses = [
    { id: 1, name: "Aisha", location: "Udaipur, India", image: "/HEROBG/desktop/1.jpg", height: "h-[400px] md:h-[500px]" },
    { id: 2, name: "Meera", location: "London, UK", image: "/HEROBG/desktop/2.jpg", height: "h-[300px] md:h-[350px]" },
    { id: 3, name: "Kavya", location: "Lake Como, Italy", image: "/HEROBG/desktop/3.jpg", height: "h-[450px] md:h-[600px]" },
    { id: 4, name: "Rhea", location: "Dubai, UAE", image: "/HEROBG/desktop/4.jpg", height: "h-[350px] md:h-[400px]" },
  ];

  return (
    <section className="bg-[#FAF7F2] py-24 md:py-32 border-t border-[#E5E3DB]">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center mb-16">
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="h-[1px] w-8 bg-[#C5A059]"></span>
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold">
            The Bridal Portfolio
          </span>
          <span className="h-[1px] w-8 bg-[#C5A059]"></span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2C1A14] leading-tight mb-6">
          The Gulab <span className="italic text-[#8B2F2F]">Muse</span>
        </h2>
      </div>

      {/* EDITORIAL MASONRY GALLERY */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
          
          {muses.map((muse) => (
            <div 
              key={muse.id} 
              className={`relative w-full ${muse.height} overflow-hidden group cursor-pointer break-inside-avoid`}
            >
              <Image 
                src={muse.image} 
                alt={`${muse.name}'s Bridal Mehndi in ${muse.location}`}
                fill
                className="object-cover transform transition-transform duration-[2s] group-hover:scale-105"
              />
              
              {/* Hover Darken Overlay */}
              <div className="absolute inset-0 bg-[#2C1A14]/0 group-hover:bg-[#2C1A14]/40 transition-colors duration-500"></div>
              
              {/* Fade-in Text on Hover */}
              <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center text-center">
                <span className="font-serif text-2xl text-[#FAF7F2] mb-1">{muse.name}</span>
                <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#C5A059]">{muse.location}</span>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* FOOTER CALL TO ACTION */}
      <div className="mt-20 text-center">
        <Link 
          href="/gallery" 
          className="inline-flex items-center justify-center border-b border-[#2C1A14] text-[#2C1A14] pb-2 text-[10px] uppercase tracking-[0.25em] font-medium hover:text-[#C5A059] hover:border-[#C5A059] transition-all duration-300"
        >
          View Full Gallery
        </Link>
      </div>

    </section>
  );
}