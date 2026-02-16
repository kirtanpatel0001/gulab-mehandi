"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function ShopPage() {
  // Mock products tailored for a premium Mehndi artist
  // Later, you can fetch these directly from your Supabase 'products' table!
  const products = [
    {
      id: 1,
      name: "Signature Organic Henna Cones",
      description: "Pack of 5 • Lavender & Eucalyptus blend",
      price: "$25.00",
      image: "/HEROBG/mobile/4.jpg", // Replace with actual product images
      tag: "Best Seller",
      inStock: true,
    },
    {
      id: 2,
      name: "Bridal Aftercare Sealant",
      description: "Lemon & Sugar mist for the deepest stains",
      price: "$18.00",
      image: "/HEROBG/desktop/2.jpg",
      tag: "",
      inStock: true,
    },
    {
      id: 3,
      name: "Premium Essential Oil Mix",
      description: "30ml • Therapeutic grade for DIY mixing",
      price: "$22.00",
      image: "/HEROBG/desktop/6.jpg",
      tag: "New",
      inStock: true,
    },
    {
      id: 4,
      name: "Acrylic Practice Board",
      description: "Reusable bridal hand & arm template",
      price: "$35.00",
      image: "/HEROBG/mobile/2.jpg",
      tag: "",
      inStock: false, // Notice how it automatically grays out if out of stock
    }
  ];

  // Simple state to show a "Added to Cart" notification
  const [cartNotification, setCartNotification] = useState("");

  const handleAddToCart = (productName: string) => {
    setCartNotification(`${productName} added to your bag.`);
    setTimeout(() => setCartNotification(""), 3000); // Hide after 3 seconds
  };

  return (
    <section className="min-h-screen bg-[#FDFBF7] w-full pb-24 relative">
      
      {/* FLOATING CART NOTIFICATION */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${cartNotification ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-[#1B342B] text-[#FDFBF7] px-6 py-3 rounded-sm shadow-xl flex items-center space-x-3">
          <svg className="w-4 h-4 text-[#A67C52]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-xs tracking-widest uppercase font-semibold">{cartNotification}</span>
        </div>
      </div>

      {/* HEADER SECTION */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <span className="text-[#A67C52] tracking-[0.3em] text-xs font-semibold uppercase mb-4 block">
          The Boutique
        </span>
        <h1 className="text-5xl md:text-7xl font-serif text-[#1B342B] mb-8 tracking-tight">
          Artist <span className="italic font-light">Essentials</span>
        </h1>
        <p className="text-[#1B342B]/70 font-light max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          The exact 100% organic, chemical-free formulas we use on our international brides. Hand-mixed fresh in small batches.
        </p>
      </div>

      {/* THE LUXURY PRODUCT GRID */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          
          {products.map((product) => (
            <div key={product.id} className="flex flex-col group cursor-pointer">
              
              {/* Product Image Box */}
              <div className="relative aspect-[3/4] w-full rounded-sm overflow-hidden bg-[#1B342B]/5 mb-6">
                
                {/* Image */}
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  className={`object-cover transform transition-transform duration-[10s] group-hover:scale-105 ${!product.inStock && 'opacity-60 grayscale'}`}
                />

                {/* Tags (New, Best Seller) */}
                {product.tag && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/95 text-[#1B342B] px-3 py-1 text-[9px] uppercase tracking-widest font-bold shadow-sm rounded-sm">
                      {product.tag}
                    </span>
                  </div>
                )}

                {/* Out of Stock Badge */}
                {!product.inStock && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-[#1B342B]/80 text-[#FDFBF7] px-3 py-1 text-[9px] uppercase tracking-widest font-bold shadow-sm rounded-sm backdrop-blur-sm">
                      Sold Out
                    </span>
                  </div>
                )}

                {/* Sliding "Add to Cart" Button (Appears on Hover) */}
                <div className={`absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out ${!product.inStock && 'hidden'}`}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents clicking the button from clicking the whole card
                      handleAddToCart(product.name);
                    }}
                    className="w-full bg-[#FDFBF7]/95 backdrop-blur-sm border border-[#1B342B]/10 text-[#1B342B] py-4 rounded-sm hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-colors duration-300 uppercase text-xs tracking-widest font-bold shadow-lg"
                  >
                    Quick Add +
                  </button>
                </div>

              </div>

              {/* Product Info */}
              <div className="flex flex-col text-center md:text-left">
                <h3 className="text-lg font-serif text-[#1B342B] mb-1 group-hover:text-[#A67C52] transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-[#1B342B]/60 text-xs font-light mb-3">
                  {product.description}
                </p>
                <span className="text-[#1B342B] font-medium text-sm tracking-wide">
                  {product.price}
                </span>
              </div>

            </div>
          ))}

        </div>
      </div>

      {/* BOTTOM INFO SECTION */}
      <div className="max-w-6xl mx-auto px-6 mt-32 border-t border-[#1B342B]/10 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start">
            <svg className="w-6 h-6 text-[#A67C52] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#1B342B] mb-2">Shipping Worldwide</h4>
            <p className="text-xs text-[#1B342B]/70 leading-relaxed max-w-[200px]">Freshly mixed and shipped express to ensure cone quality.</p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <svg className="w-6 h-6 text-[#A67C52] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#1B342B] mb-2">100% Chemical Free</h4>
            <p className="text-xs text-[#1B342B]/70 leading-relaxed max-w-[200px]">Zero PPD or artificial dyes. Safe for all skin types and pregnancies.</p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <svg className="w-6 h-6 text-[#A67C52] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#1B342B] mb-2">Perishable Item</h4>
            <p className="text-xs text-[#1B342B]/70 leading-relaxed max-w-[200px]">Cones must be frozen immediately upon delivery to preserve the stain.</p>
          </div>

        </div>
      </div>

    </section>
  );
}