"use client";

import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond, Cinzel } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cinzel",
});

export default function StoryPage() {
  return (
    <div className={`${cormorant.variable} ${cinzel.variable} min-h-screen bg-[#FAF7F2] font-sans selection:bg-[#C5A059] selection:text-[#2C1A14]`}>
      
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Deep overlay to make text readable */}
        <div className="absolute inset-0 bg-[#2C1A14]/40 z-10"></div>
        
        <Image 
          src="/HEROBG/desktop/4.jpg" // Use a wide, stunning background image here
          alt="The Gulab Heritage" 
          fill 
          className="object-cover transform scale-105 animate-[slowZoom_20s_ease-in-out_infinite]"
          priority
        />
        
        <div className="relative z-20 text-center px-6 mt-16">
          <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#E8DCC4] mb-6 drop-shadow-md">
            Our Heritage
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#FAF7F2] leading-none drop-shadow-xl">
            The Hands That <br />
            <span className="italic text-[#C5A059]">Craft</span>
          </h1>
        </div>
      </section>

      {/* 2. THE ORIGIN (Warm Ivory Layout) */}
      <section className="py-24 md:py-36 px-6 lg:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        <div className="order-2 lg:order-1 flex flex-col justify-center text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
            <span className="h-[1px] w-12 bg-[#8B2F2F]"></span>
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8B2F2F] font-bold">
              The Beginning
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-serif text-[#2C1A14] leading-[1.2] mb-8">
            Rooted in the rich soils of <span className="italic text-[#C5A059]">Rajasthan.</span>
          </h2>
          
          <p className="text-[#5C4A45] font-serif text-lg md:text-xl leading-relaxed mb-6">
            Gulab Mehandi was not born in a laboratory. It was born from generations of ancestral knowledge, passed down through the hands of the women who came before us. 
          </p>
          <p className="text-[#5C4A45] font-serif text-lg md:text-xl leading-relaxed">
            We source our henna leaves directly from the arid, sun-drenched farms of Sojat, Rajasthan—globally renowned for producing the most potent, highest-yielding henna crops in the world. Every leaf is hand-selected and triple-sifted to ensure a powder as fine as silk.
          </p>
        </div>

        <div className="order-1 lg:order-2 relative w-full aspect-[3/4] max-w-md mx-auto">
          {/* Offset Gold Border Frame */}
          <div className="absolute top-6 -right-6 w-full h-full border border-[#C5A059]/40 z-0 hidden md:block"></div>
          <div className="relative w-full h-full overflow-hidden shadow-2xl z-10 bg-[#E8DCC4]">
            <Image 
              src="/HEROBG/desktop/2.jpg" // Beautiful image of hands, powder, or Rajasthan
              alt="Rajasthani Roots" 
              fill 
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 3. THE ALCHEMY (Deep Espresso Layout) */}
      <section className="bg-[#2C1A14] py-24 md:py-36 text-[#FAF7F2] relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <div className="relative w-full aspect-square md:aspect-[4/5] max-w-md mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C1A14] to-transparent opacity-50 z-10"></div>
            <Image 
              src="/HEROBG/desktop/3.jpg" // Image of mixing bowls, essential oils, or cones
              alt="The Art of Mixing" 
              fill 
              className="object-cover transition-transform duration-[3s] group-hover:scale-105"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-8">
              <span className="h-[1px] w-12 bg-[#C5A059]"></span>
              <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold">
                The Alchemy
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-serif leading-[1.2] mb-8">
              The sacred art of <br className="hidden lg:block"/>
              <span className="italic text-[#C5A059]">the perfect mix.</span>
            </h2>
            
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <span className="text-[#C5A059] font-serif text-3xl italic">01.</span>
                <div>
                  <h3 className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-[#E8DCC4] mb-2">100% Organic Ingredients</h3>
                  <p className="font-serif text-[#D1CFC9] text-lg leading-relaxed">No PPD, no chemical dyes, and no preservatives. We use only pure cane sugar, lemon juice, and filtered water to release the dye.</p>
                </div>
              </div>
              
              <div className="flex gap-6 items-start">
                <span className="text-[#C5A059] font-serif text-3xl italic">02.</span>
                <div>
                  <h3 className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-[#E8DCC4] mb-2">Therapeutic Essential Oils</h3>
                  <p className="font-serif text-[#D1CFC9] text-lg leading-relaxed">Infused with premium therapeutic-grade Eucalyptus, Clove, and Damask Rose essential oils for a deep, intoxicating fragrance and rich stain.</p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <span className="text-[#C5A059] font-serif text-3xl italic">03.</span>
                <div>
                  <h3 className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-[#E8DCC4] mb-2">Micro-Batched Fresh</h3>
                  <p className="font-serif text-[#D1CFC9] text-lg leading-relaxed">Crafted in incredibly small batches immediately before shipping, ensuring the paste arrives to you at its absolute peak potency.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. THE PROMISE (Minimalist Call to Action) */}
      <section className="py-32 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-serif text-[#2C1A14] italic leading-tight mb-8">
          "We don't just create henna. We craft the memories of your most sacred celebrations."
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
          <Link 
            href="/shop" 
            className="bg-[#2C1A14] text-[#FAF7F2] px-10 py-5 font-sans text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-[#C5A059] hover:text-[#2C1A14] transition-colors duration-500 w-full sm:w-auto shadow-xl"
          >
            Explore The Boutique
          </Link>
          <Link 
            href="/book" 
            className="border border-[#2C1A14] text-[#2C1A14] px-10 py-5 font-sans text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-[#FAF7F2] transition-colors duration-500 w-full sm:w-auto"
          >
            Book A Consultation
          </Link>
        </div>
      </section>

    </div>
  );
}