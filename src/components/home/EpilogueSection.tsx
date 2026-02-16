"use client";

import { useState } from 'react';

export default function EpilogueSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can later wire up Supabase to save the emails!
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 3000);
  };

  return (
    <section className="bg-[#2C1A14] py-24 md:py-36 border-t border-[#C5A059]/20">
      <div className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
        
        {/* GOLD EYEBROW TEXT */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="h-[1px] w-8 bg-[#C5A059]"></span>
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold">
            The Inner Circle
          </span>
          <span className="h-[1px] w-8 bg-[#C5A059]"></span>
        </div>
        
        {/* HEADING */}
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-[#FAF7F2] leading-tight mb-6">
          Elevate Your <span className="italic text-[#C5A059]">Craft</span>
        </h2>
        
        {/* PARAGRAPH */}
        <p className="text-[#D1CFC9] font-serif text-lg md:text-xl italic mb-12 max-w-xl">
          Join our exclusive registry to receive early access to seasonal cone releases, bespoke bridal inspiration, and the artistry of Gulab Mehandi.
        </p>

        {/* MINIMALIST FORM */}
        <form onSubmit={handleSubmit} className="w-full max-w-lg relative flex flex-col md:flex-row items-center gap-6 md:gap-0">
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email Address" 
            className="w-full bg-transparent border-b border-[#C5A059]/40 text-[#FAF7F2] placeholder-[#8C8A88] font-sans text-[11px] uppercase tracking-[0.2em] px-2 py-4 focus:outline-none focus:border-[#C5A059] transition-colors rounded-none"
          />
          <button 
            type="submit" 
            className="w-full md:w-auto md:absolute md:right-0 md:bottom-2 text-[#C5A059] font-sans text-[10px] uppercase tracking-[0.3em] font-bold hover:text-[#FAF7F2] transition-colors duration-300 pb-2 md:pb-0"
          >
            {subscribed ? 'Welcome' : 'Subscribe'}
          </button>
        </form>

      </div>
    </section>
  );
}