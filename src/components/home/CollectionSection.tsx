"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function CollectionSection() {
  // Using your local images to keep it safe from Next.js errors
  const featuredProducts = [
    {
      id: 1,
      name: "Bridal Crimson Paste",
      price: "₹1,299",
      image: "/HEROBG/desktop/1.jpg", // Change to your actual product image path
    },
    {
      id: 2,
      name: "Damask Rose Sealant",
      price: "₹499",
      image: "/HEROBG/desktop/3.jpg", // Change to your actual product image path
    },
    {
      id: 3,
      name: "Rajasthani Henna Powder",
      price: "₹349",
      image: "/HEROBG/desktop/4.jpg", // Change to your actual product image path
    }
  ];

  return (
    <section className="bg-[#2C1A14] py-24 md:py-32 relative text-[#FAF7F2]">
      
      {/* HEADER AREA */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center mb-16 md:mb-24">
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="h-[1px] w-8 bg-[#C5A059]"></span>
          <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-bold">
            The Artist's Repertoire
          </span>
          <span className="h-[1px] w-8 bg-[#C5A059]"></span>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6">
          Signature <span className="italic text-[#C5A059]">Essentials</span>
        </h2>
        <p className="text-[#D1CFC9] font-serif text-lg md:text-xl max-w-2xl mx-auto italic">
          Hand-mixed in micro-batches to ensure the deepest, most enduring stain for your special day.
        </p>
      </div>

      {/* EDITORIAL STAGGERED GRID */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          
          {featuredProducts.map((product, index) => (
            <Link 
              href={`/shop/${product.id}`} 
              key={product.id}
              // The middle item (index 1) gets pushed down by 3rem (translate-y-12) on desktop for that staggered fashion look
              className={`group flex flex-col ${index === 1 ? 'md:translate-y-12' : ''}`}
            >
              
              {/* Image Frame with Double Border Effect */}
              <div className="relative aspect-[3/4] w-full p-3 border border-[#C5A059]/20 group-hover:border-[#C5A059]/60 transition-colors duration-500 mb-6">
                <div className="relative w-full h-full overflow-hidden bg-[#1A0F0C]">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-cover transform transition-transform duration-[2s] group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />
                  
                  {/* Subtle hover overlay "View Product" */}
                  <div className="absolute inset-0 bg-[#2C1A14]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-[#FAF7F2] font-sans text-[9px] uppercase tracking-[0.3em] border-b border-[#C5A059] pb-1">
                      View Creation
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Typography */}
              <div className="text-center flex flex-col items-center">
                <h3 className="font-serif text-xl md:text-2xl text-[#FAF7F2] mb-2 group-hover:text-[#C5A059] transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="font-sans text-[11px] tracking-widest text-[#D1CFC9]">
                  {product.price}
                </p>
              </div>

            </Link>
          ))}
          
        </div>
      </div>

      {/* CALL TO ACTION */}
      <div className="mt-20 md:mt-36 text-center">
        <Link 
          href="/shop" 
          className="inline-flex items-center justify-center border border-[#C5A059] text-[#C5A059] px-10 py-4 text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-[#C5A059] hover:text-[#2C1A14] transition-all duration-500"
        >
          Explore Full Boutique
        </Link>
      </div>

    </section>
  );
}