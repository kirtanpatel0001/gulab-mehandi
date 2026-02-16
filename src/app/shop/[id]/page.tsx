"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Geo-Currency logic
const detectUserCurrency = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('Asia/Colombo')) return { code: 'INR', symbol: '₹', rate: 83.15 }; 
    if (tz.includes('London') || tz.includes('Europe')) return { code: 'GBP', symbol: '£', rate: 0.79 };
    if (tz.includes('Dubai') || tz.includes('Asia/Dubai')) return { code: 'AED', symbol: 'د.إ', rate: 3.67 };
    return { code: 'USD', symbol: '$', rate: 1 };
  } catch (error) { return { code: 'USD', symbol: '$', rate: 1 }; }
};

export default function SingleProductPage() {
  const params = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', rate: 1 });
  const [activeTab, setActiveTab] = useState<'details' | 'usage' | 'ingredients'>('details');

  useEffect(() => {
    setCurrency(detectUserCurrency());

    const fetchProductData = async () => {
      setLoading(true);
      const { data: currentProduct, error } = await supabase.from('products').select('*').eq('id', params.id).single();
      if (error || !currentProduct) { router.push('/shop'); return; }
      setProduct(currentProduct);

      const { data: relatedData } = await supabase.from('products').select('*').neq('id', params.id).limit(3);
      if (relatedData) setRecommendations(relatedData);
      setLoading(false);
    };

    fetchProductData();
  }, [params.id, router]);

  const formatPrice = (baseUsdPrice: number) => {
    return `${currency.symbol}${(baseUsdPrice * currency.rate).toFixed(2)} ${currency.code !== 'USD' ? currency.code : ''}`;
  };

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] flex justify-center items-center"><p className="text-[#A67C52] text-xs uppercase tracking-widest animate-pulse font-bold">Curating Product...</p></div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20">
      
      {/* --- 1. PRODUCT HERO SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        {/* Left: Product Image */}
        <div className="relative aspect-[4/5] w-full bg-[#1B342B]/5 rounded-3xl overflow-hidden shadow-lg group">
          {product.tag && (
            <div className="absolute top-6 left-6 z-10 bg-[#A67C52] text-white text-[9px] uppercase tracking-[0.2em] font-bold px-4 py-1.5 rounded-full shadow-md">
              {product.tag}
            </div>
          )}
          {product.image_url ? (
             <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
          ) : (
             <div className="absolute inset-0 flex items-center justify-center text-[#1B342B]/20 font-bold uppercase tracking-widest">No Image</div>
          )}
        </div>

        {/* Right: Product Core Info */}
        <div className="flex flex-col justify-center">
          <Link href="/shop" className="text-[10px] text-[#1B342B]/50 hover:text-[#A67C52] uppercase tracking-widest font-bold mb-8 flex items-center transition-colors w-max">
            <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Back to Boutique
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-serif text-[#1B342B] leading-tight mb-4">{product.name}</h1>
          <p className="text-xl font-bold text-[#A67C52] mb-6">{formatPrice(product.price)}</p>
          <p className="text-[#1B342B]/70 leading-relaxed mb-6 font-medium text-lg">{product.description}</p>
          
          {/* Quick Specs Grid (Only shows if filled out) */}
          <div className="grid grid-cols-2 gap-4 mb-8 bg-white p-6 rounded-2xl border border-[#1B342B]/5 shadow-sm">
            {product.weight_volume && (
              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold text-[#1B342B]/40 mb-1">Size / Weight</p>
                <p className="text-sm font-bold text-[#1B342B]">{product.weight_volume}</p>
              </div>
            )}
            {product.stain_color && (
              <div>
                <p className="text-[9px] uppercase tracking-widest font-bold text-[#1B342B]/40 mb-1">Stain Result</p>
                <p className="text-sm font-bold text-[#1B342B] flex items-center">
                  <span className="w-3 h-3 rounded-full bg-[#4a1c1c] mr-2 block"></span> {product.stain_color}
                </p>
              </div>
            )}
          </div>
          
          <div className="border-t border-[#1B342B]/10 pt-8 mb-8">
             <button disabled={!product.in_stock} className="w-full bg-[#1B342B] text-[#FDFBF7] py-5 rounded-full hover:bg-[#A67C52] transition-colors duration-500 uppercase text-xs tracking-[0.2em] font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
               {product.in_stock ? 'Add to Cart' : 'Currently Sold Out'}
             </button>
          </div>

          <div className="flex items-center space-x-6 text-[#1B342B]/50 text-[10px] uppercase tracking-widest font-bold">
            <span className="flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg> Organic Formula</span>
            <span className="flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Ships Worldwide</span>
          </div>
        </div>
      </div>

      {/* --- 2. LUXURY INFO TABS --- */}
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-16 border-t border-[#1B342B]/10">
        
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12 border-b border-[#1B342B]/10">
          {['details', 'usage', 'ingredients'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold transition-colors relative ${activeTab === tab ? 'text-[#1B342B]' : 'text-[#1B342B]/40 hover:text-[#A67C52]'}`}>
              {tab === 'details' ? 'The Details' : tab === 'usage' ? 'Application & Storage' : 'Ingredients'}
              {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#A67C52]"></span>}
            </button>
          ))}
        </div>

        <div className="min-h-[200px] text-[#1B342B]/80 leading-relaxed font-medium">
          {activeTab === 'details' && (
             <div className="whitespace-pre-line text-center md:text-left max-w-2xl mx-auto">
               {product.long_description || <p className="italic text-center text-[#1B342B]/40">No extended details provided.</p>}
             </div>
          )}
          {activeTab === 'usage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-2xl border border-[#1B342B]/5 shadow-sm">
                <h4 className="text-lg font-serif text-[#1B342B] mb-4 text-[#A67C52]">How to Apply</h4>
                <p className="whitespace-pre-line">{product.how_to_use || "Apply directly to clean, lotion-free skin. Leave paste on for 8-12 hours for maximum stain depth. Scrape off, do not wash."}</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-[#1B342B]/5 shadow-sm">
                <h4 className="text-lg font-serif text-[#1B342B] mb-4 text-[#A67C52]">Storage Instructions</h4>
                <p className="whitespace-pre-line">{product.shelf_life || "This is a perishable, 100% natural product. Place cones in the freezer immediately upon delivery. Thaw at room temperature for 30 minutes before use."}</p>
              </div>
            </div>
          )}
          {activeTab === 'ingredients' && (
            <div className="text-center max-w-2xl mx-auto bg-white p-10 rounded-2xl border border-[#1B342B]/5 shadow-sm">
              <svg className="w-8 h-8 text-[#A67C52] mx-auto mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#1B342B]/40 mb-4">100% Organic Formula</h4>
              <p className="text-lg font-serif italic text-[#1B342B]">
                {product.ingredients || "Organic Rajasthani Henna Powder, Eucalyptus Essential Oil, Raw Cane Sugar, Distilled Water."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- 3. RECOMMENDATIONS SECTION --- */}
      {recommendations.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 border-t border-[#1B342B]/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-[#1B342B] mb-2">Complete the Set</h2>
            <p className="text-[#1B342B]/60 text-sm">Curated additions to perfect your craft.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((rec) => (
              <Link href={`/shop/${rec.id}`} key={rec.id}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#1B342B]/5 rounded-2xl mb-4 shadow-sm border border-[#1B342B]/5">
                    {rec.image_url ? (
                      <Image src={rec.image_url} alt={rec.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[#1B342B]/20 text-xs font-bold uppercase tracking-widest">No Image</div>
                    )}
                  </div>
                  <h3 className="text-lg font-serif text-[#1B342B] mb-1 group-hover:text-[#A67C52] transition-colors">{rec.name}</h3>
                  <p className="text-sm font-bold text-[#1B342B]/70">{formatPrice(rec.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}