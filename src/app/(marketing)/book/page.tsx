"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { getSupabaseClient } from '@/lib/supabase/client'; // ✅
import { countries } from '@/lib/countries';

export default function BookPage() {
  // ✅ Stable supabase singleton — no useRef needed
  const supabase = getSupabaseClient();

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.dial_code === '+1') || countries[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-detect location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data?.country_calling_code) {
          const detectedCountry = countries.find(c => c.dial_code === data.country_calling_code);
          if (detectedCountry) setSelectedCountry(detectedCountry);
        }
      } catch (error) {
        console.error("Could not auto-detect location.", error);
      }
    };
    fetchLocation();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dial_code.includes(searchQuery)
  );

  const getPhoneConfig = (dialCode: string) => {
    switch (dialCode) {
      case '+1': return { min: 10, max: 10 };
      case '+91': return { min: 10, max: 10 };
      case '+971': return { min: 9, max: 9 };
      case '+61': return { min: 9, max: 9 };
      case '+64': return { min: 8, max: 10 };
      case '+65': return { min: 8, max: 8 };
      case '+60': return { min: 9, max: 10 };
      case '+966': return { min: 9, max: 9 };
      case '+974': return { min: 8, max: 8 };
      case '+44': return { min: 10, max: 11 };
      default: return { min: 7, max: 15 };
    }
  };

  const phoneConfig = getPhoneConfig(selectedCountry.dial_code);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    setPhoneNumber(onlyNums);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (phoneNumber.length < phoneConfig.min) {
      alert(`Please enter a valid phone number. It looks too short for ${selectedCountry.name}.`);
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullPhoneNumber = `${selectedCountry.dial_code} ${phoneNumber}`;

    const { error } = await supabase.from('bookings').insert([{
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      email: formData.get('email'),
      phone: fullPhoneNumber,
      service_type: formData.get('service'),
      preferred_date: formData.get('date'),
      source: formData.get('source'),
      message: formData.get('message'),
    }]);

    if (error) {
      alert("Something went wrong. Please try again.");
      console.error(error);
    } else {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 bg-[#FDFBF7]">
        <h2 className="text-4xl font-serif text-[#1B342B] mb-4">Thank You</h2>
        <p className="text-[#A67C52] font-medium">We have received your inquiry and will be in touch shortly.</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#FDFBF7] w-full pb-20">
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

        <div className="flex flex-col">
          <h1 className="text-5xl md:text-6xl font-serif text-[#1B342B] mb-6 tracking-tight">Let's work together</h1>
          <p className="text-[#1B342B]/80 font-light mb-8 max-w-md text-sm leading-relaxed">
            Interested in working together? Fill out some info and we will be in touch shortly! We can't wait to hear from you.
          </p>
          <a href="mailto:info@gulabmehndi.com" className="text-[#1B342B] text-sm font-medium hover:text-[#A67C52] transition-colors mb-12 inline-block">
            info@gulabmehndi.com
          </a>
          <div className="relative aspect-[4/5] w-full rounded-md overflow-hidden shadow-lg">
            <Image src="/CONTACTUS/1.jpeg" alt="Bridal Mehndi Detail" fill className="object-cover" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6 lg:pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#1B342B]">Name (Required)</label>
              <input name="firstName" placeholder="First Name" required className="border border-[#1B342B]/20 p-3 focus:outline-none focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm" />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#1B342B] md:opacity-0 hidden md:block">Last Name</label>
              <input name="lastName" placeholder="Last Name" required className="border border-[#1B342B]/20 p-3 focus:outline-none focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm" />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[#1B342B]">Email (Required)</label>
            <input name="email" type="email" required className="border border-[#1B342B]/20 p-3 focus:outline-none focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm" />
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#1B342B]">Phone (Required)</label>
              <span className="text-[10px] text-[#1B342B]/50">{phoneNumber.length} / {phoneConfig.max} digits</span>
            </div>
            <div className="flex bg-white border border-[#1B342B]/20 rounded-sm focus-within:border-[#A67C52] transition-colors relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1.5 bg-transparent text-[#1B342B] text-sm py-3 pl-3 pr-2 border-r border-[#1B342B]/10 focus:outline-none min-w-[90px] justify-center hover:bg-[#1B342B]/5 transition-colors"
              >
                <span>{selectedCountry.flag}</span>
                <span className="font-medium">{selectedCountry.dial_code}</span>
                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-[300px] bg-white border border-[#1B342B]/10 shadow-2xl rounded-sm z-50 overflow-hidden">
                  <div className="p-2 border-b border-[#1B342B]/10 bg-[#FDFBF7]">
                    <input
                      type="text"
                      placeholder="Search country or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-2 text-sm bg-white border border-[#1B342B]/15 rounded-sm focus:outline-none focus:border-[#A67C52]"
                      autoFocus
                    />
                  </div>
                  <ul className="max-h-60 overflow-y-auto pb-2">
                    {!searchQuery && (
                      <div className="bg-[#FDFBF7] pb-1 border-b border-[#1B342B]/10 mb-1">
                        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[#A67C52]">Frequent Locations</div>
                        {[
                          { dial_code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
                          { dial_code: '+1', name: 'United States / Canada', flag: '🇺🇸' },
                          { dial_code: '+61', name: 'Australia', flag: '🇦🇺' },
                          { dial_code: '+64', name: 'New Zealand', flag: '🇳🇿' },
                          { dial_code: '+65', name: 'Singapore', flag: '🇸🇬' },
                          { dial_code: '+60', name: 'Malaysia', flag: '🇲🇾' },
                          { dial_code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
                          { dial_code: '+974', name: 'Qatar', flag: '🇶🇦' },
                          { dial_code: '+91', name: 'India', flag: '🇮🇳' },
                        ].map((country, index) => (
                          <li
                            key={`pinned-${index}`}
                            onClick={() => { setSelectedCountry(country); setPhoneNumber(""); setIsDropdownOpen(false); }}
                            className="px-4 py-2 text-sm text-[#1B342B] hover:bg-[#A67C52]/10 cursor-pointer flex items-center space-x-3"
                          >
                            <span className="text-lg leading-none">{country.flag}</span>
                            <span className="font-semibold w-12">{country.dial_code}</span>
                            <span className="text-[#1B342B]/70 truncate">{country.name}</span>
                          </li>
                        ))}
                      </div>
                    )}
                    {!searchQuery && <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[#1B342B]/40 mt-1">All Countries</div>}
                    {filteredCountries.map((country, index) => (
                      <li
                        key={index}
                        onClick={() => { setSelectedCountry(country); setPhoneNumber(""); setIsDropdownOpen(false); setSearchQuery(""); }}
                        className="px-4 py-2.5 text-sm text-[#1B342B] hover:bg-[#A67C52]/10 cursor-pointer flex items-center space-x-3"
                      >
                        <span className="text-lg leading-none">{country.flag}</span>
                        <span className="font-semibold w-12">{country.dial_code}</span>
                        <span className="text-[#1B342B]/70 truncate">{country.name}</span>
                      </li>
                    ))}
                    {filteredCountries.length === 0 && (
                      <li className="px-4 py-4 text-sm text-[#1B342B]/50 text-center italic">No countries found.</li>
                    )}
                  </ul>
                </div>
              )}

              <input
                name="phone"
                type="text"
                required
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength={phoneConfig.max}
                minLength={phoneConfig.min}
                placeholder={`e.g. ${phoneConfig.max} digits`}
                className="w-full p-3 focus:outline-none bg-transparent text-[#1B342B] text-sm tracking-wide"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3 pt-2">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[#1B342B]">What service are you interested in? (Required)</label>
            <div className="flex flex-col space-y-3">
              {['Wedding (Bridal Only)', 'Wedding (Bridal + Party)', 'Special Occasion'].map((service) => (
                <label key={service} className="flex items-center space-x-3 cursor-pointer">
                  <input type="radio" name="service" value={service} required className="w-4 h-4 accent-[#1B342B]" />
                  <span className="text-sm text-[#1B342B]/80">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-2 pt-2">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[#1B342B]">Preferred Date (Required)</label>
            <p className="text-[11px] text-[#1B342B]/60 mb-1">It is recommended to schedule your henna 2-3 days before your event.</p>
            <input name="date" type="date" required className="border border-[#1B342B]/20 p-3 focus:outline-none focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm" />
          </div>

          <div className="flex flex-col space-y-2 pt-2">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[#1B342B]">How did you hear about us? (Required)</label>
            <input name="source" required className="border border-[#1B342B]/20 p-3 focus:outline-none focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm" />
          </div>

          <div className="flex flex-col space-y-2 pt-2">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[#1B342B]">Message (Required)</label>
            <textarea name="message" required rows={4} className="border border-[#1B342B]/20 p-3 focus:outline-none focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm resize-none" />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="border border-[#1B342B] text-[#1B342B] px-8 py-3 rounded-full hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-colors duration-300 uppercase text-xs tracking-widest font-bold disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}