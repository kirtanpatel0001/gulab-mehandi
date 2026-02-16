"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function ServicesPage() {
  
  // 1. BRIDAL & INTERNATIONAL PACKAGES
  const premiumServices = [
    {
      title: "The Classic Bridal",
      scope: "Local & Domestic",
      description: "Our signature bridal service for local clients. Intricate, bespoke designs covering the arms up to the elbows and detailed feet. Includes a pre-wedding consultation and our organic aftercare kit for the perfect dark stain.",
      features: ["Elbow-length arms & full feet", "Pre-wedding consultation", "Organic aftercare kit"],
      image: "/HEROBG/desktop/1.jpg"
    },
    {
      title: "Destination Bridal",
      scope: "International & Global",
      description: "Passport ready. For our international brides across the UAE, USA, UK, Australia, and beyond. This covers multi-day travel, VIP bridal henna, and priority scheduling to ensure your stain peaks perfectly for your destination events.",
      features: ["Multi-day artist coverage", "Priority global booking", "Custom motif design"],
      image: "/HEROBG/desktop/2.jpg"
    }
  ];

  // 2. FESTIVALS & MARRIAGE OCCASIONS
  const occasionServices = [
    {
      title: "The Festive Special",
      scope: "All Major Festivals",
      description: "Celebrate your traditions with rich, organic stains. We open dedicated, fast-track booking slots for all major global and local festivals. Perfect for both minimalist and heavy traditional designs.",
      features: ["Diwali & Eid", "Karwa Chauth & Teej", "Raksha Bandhan & Navratri"]
    },
    {
      title: "Marriage Occasions & Guests",
      scope: "Sangeet & Wedding Events",
      description: "Flawless artistry for your family and guests during all marriage occasions. Ideal for Sangeets, Haldi ceremonies, and Mehndi nights. We provide rapid, beautiful designs so everyone gets a touch of luxury without the long wait.",
      features: ["Sangeets & Mehndi Nights", "Haldi & Wedding Events", "Bridal Party Henna"]
    }
  ];

  return (
    <section className="min-h-screen bg-[#FDFBF7] w-full pb-24">
      
      {/* HEADER SECTION */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <span className="text-[#A67C52] tracking-[0.3em] text-xs font-semibold uppercase mb-4 block">
          Service Menu
        </span>
        <h1 className="text-5xl md:text-6xl font-serif text-[#1B342B] mb-6 tracking-tight">
          From Local Intricacy to <br className="hidden md:block" />
          <span className="italic font-light">Global Artistry</span>
        </h1>
        <p className="text-[#1B342B]/70 font-light text-sm md:text-base leading-relaxed">
          Whether you are booking a local festive appointment, celebrating a pre-wedding marriage occasion, or flying us out for a destination wedding, every client receives our signature 100% organic, hand-mixed henna.
        </p>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 space-y-24">
        
        {/* --- SECTION 1: BRIDAL & INTERNATIONAL --- */}
        <div>
          <div className="border-b border-[#1B342B]/10 pb-4 mb-10">
            <h2 className="text-3xl font-serif text-[#1B342B]">Bridal & Destination</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {premiumServices.map((service, index) => (
              <div key={index} className="bg-white border border-[#1B342B]/10 p-6 md:p-8 rounded-sm shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                <div className="relative w-full h-64 mb-8 rounded-sm overflow-hidden">
                  <Image src={service.image} alt={service.title} fill className="object-cover" />
                </div>
                
                <div className="mb-6">
                  <h3 className="text-2xl font-serif text-[#1B342B] mb-1">{service.title}</h3>
                  <span className="text-[#A67C52] text-[10px] uppercase tracking-widest font-bold">{service.scope}</span>
                </div>
                
                <p className="text-[#1B342B]/70 font-light text-sm leading-relaxed mb-6 flex-grow">
                  {service.description}
                </p>
                
                <ul className="space-y-2 mb-8 border-t border-[#1B342B]/10 pt-6">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-xs text-[#1B342B]/80 font-medium tracking-wide">
                      <svg className="w-4 h-4 text-[#A67C52] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link href={`/book?service=${encodeURIComponent(service.title)}`} className="mt-auto">
                  <button className="w-full bg-[#1B342B] text-white py-3 rounded-sm hover:bg-[#A67C52] transition-colors duration-300 uppercase text-xs tracking-[0.2em] font-bold">
                    Inquire Availability
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECTION 2: FESTIVALS & OCCASIONS --- */}
        <div>
          <div className="border-b border-[#1B342B]/10 pb-4 mb-10">
            <h2 className="text-3xl font-serif text-[#1B342B]">Festivals & Marriage Occasions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {occasionServices.map((service, index) => (
              <div key={index} className="bg-[#1B342B]/5 border border-[#1B342B]/10 p-6 md:p-8 rounded-sm hover:bg-white transition-colors duration-300 flex flex-col h-full">
                
                <div className="mb-6">
                  <h3 className="text-2xl font-serif text-[#1B342B] mb-1">{service.title}</h3>
                  <span className="text-[#A67C52] text-[10px] uppercase tracking-widest font-bold">{service.scope}</span>
                </div>
                
                <p className="text-[#1B342B]/70 font-light text-sm leading-relaxed mb-6 flex-grow">
                  {service.description}
                </p>
                
                <ul className="space-y-2 mb-8 border-t border-[#1B342B]/10 pt-6">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-xs text-[#1B342B]/80 font-medium tracking-wide">
                      <svg className="w-4 h-4 text-[#A67C52] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link href={`/book?service=${encodeURIComponent(service.title)}`} className="mt-auto">
                  <button className="w-full border border-[#1B342B] text-[#1B342B] py-3 rounded-sm hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-colors duration-300 uppercase text-xs tracking-[0.2em] font-bold">
                    Request a Consultation
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}