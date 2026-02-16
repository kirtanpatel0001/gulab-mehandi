"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Hero() {
  // 1. Desktop Images (Wide format)
  const desktopImages = [
    '/HEROBG/desktop/1.jpg',
    '/HEROBG/desktop/2.jpg',
    '/HEROBG/desktop/3.jpg',
    '/HEROBG/desktop/4.jpg',
    '/HEROBG/desktop/5.png',
    '/HEROBG/desktop/6.jpg',
  ];

  // 2. Mobile Images (Portrait format)
  const mobileImages = [
    '/HEROBG/mobile/1.jpg',
    '/HEROBG/mobile/2.jpg',
    '/HEROBG/mobile/3.jpg',
    '/HEROBG/mobile/4.jpg',
    '/HEROBG/mobile/5.png',
    '/HEROBG/mobile/6.jpg',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % desktopImages.length);
    }, 5000); 

    return () => clearInterval(interval); 
  }, [desktopImages.length]);

  return (
    <section className="relative w-full h-[calc(100dvh-52px)] flex items-center justify-center overflow-hidden bg-[#1B342B]">
      
      {/* --- DESKTOP IMAGES (Hidden on Mobile) --- */}
      {desktopImages.map((src, index) => (
        <Image
          key={`desktop-${index}`}
          src={src}
          alt={`Gulab Mehndi Hero Desktop ${index + 1}`}
          fill
          priority={index === 0} 
          // Desktop stays object-cover because laptop screens are wide
          className={`hidden md:block object-cover object-center absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}

      {/* --- MOBILE IMAGES (Hidden on Desktop) --- */}
      {mobileImages.map((src, index) => (
        <Image
          key={`mobile-${index}`}
          src={src}
          alt={`Gulab Mehndi Hero Mobile ${index + 1}`}
          fill
          priority={index === 0} 
          // FIX: Changed object-cover to object-contain so the full width is visible without cropping
          className={`block md:hidden object-contain object-center absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-bounce text-white/70 drop-shadow-md mix-blend-overlay">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

    </section>
  );
}