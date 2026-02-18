"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';

export default function ProductDetailsPage() {
  const params = useParams();
  const id = Number(params.id);

  // UI States
  const [quantity, setQuantity] = useState(1);
  const [activeSection, setActiveSection] = useState('description'); 
  const [cartNotification, setCartNotification] = useState("");

  // Enriched Mock Data
  const products = [
    { id: 1, name: "Signature Bridal Cones", description: "Pack of 5 • Lavender & Eucalyptus", fullDescription: "Our signature blend used on international brides worldwide. Hand-mixed fresh with pure organic Rajasthani henna, therapeutic grade lavender, and eucalyptus essential oils. Achieves a deep, rich burgundy stain within 48 hours. The paste is incredibly stringy, allowing for the finest drape and intricate mandala work without breaking.", price: 25.00, originalPrice: 30.00, form: "Ready-to-use Cone", stainColor: "Deep Burgundy", images: ["/HEROBG/mobile/4.jpg", "/HEROBG/desktop/2.jpg", "/HEROBG/desktop/3.jpg"], inStock: true },
    { id: 2, name: "Lemon-Sugar Sealant Spray", description: "Locks in moisture for the deepest stains", fullDescription: "The ultimate aftercare secret. This delicate mist prevents henna paste from flaking off too early, allowing the dye to penetrate deeper into the skin layers. Infused with pure rose water to calm the skin while the lemon oxidizes the henna.", price: 18.00, originalPrice: 18.00, form: "Liquid / Spray", stainColor: "Clear (Aftercare)", images: ["/HEROBG/desktop/2.jpg", "/HEROBG/desktop/3.jpg"], inStock: true },
    { id: 3, name: "Triple-Sifted Rajasthani Powder", description: "100g • Pure Sojat henna leaves", fullDescription: "The finest, stringiest henna powder sourced directly from the farms of Sojat. Triple-sifted through silk screens to ensure absolute zero clogging in your fine-tip cones. This is the exact powder we use for our own bridal clients.", price: 15.00, originalPrice: 20.00, form: "Raw Powder", stainColor: "Natural Brown", images: ["/HEROBG/desktop/6.jpg", "/HEROBG/desktop/1.jpg"], inStock: true },
    { id: 4, name: "Arabian Night Jagua Blend", description: "Pack of 3 • For intense dark tones", fullDescription: "A luxurious fusion of our organic henna and pure Jagua fruit juice from the Amazon. Yields a striking, midnight black stain entirely free of PPD or dangerous chemicals. Perfect for party guests and modern tribal designs.", price: 28.00, originalPrice: 28.00, form: "Ready-to-use Cone", stainColor: "Midnight Black", images: ["/HEROBG/mobile/2.jpg", "/HEROBG/desktop/4.jpg"], inStock: true },
    { id: 5, name: "Bridal Crimson Paste", description: "Pre-mixed bowl • 200g for full bridal sets", fullDescription: "Perfect for busy artists. 200g of perfectly textured, stringy bridal paste delivered in a sealed piping bag. Just snip the tip and fill your own custom cones. Guaranteed perfect consistency every single time.", price: 45.00, originalPrice: 55.00, form: "Bulk Paste", stainColor: "Crimson Red", images: ["/HEROBG/desktop/1.jpg", "/HEROBG/desktop/2.jpg"], inStock: true },
    { id: 6, name: "Therapeutic Essential Oil Blend", description: "30ml • Cajuput & Tea Tree mix", fullDescription: "Our highly guarded terpene blend. Add just a few drops to your henna paste to unlock the darkest, most enduring stain possible. 100% therapeutic grade, safe for sensitive skin.", price: 22.00, originalPrice: 25.00, form: "Liquid / Spray", stainColor: "Clear (Aftercare)", images: ["/HEROBG/desktop/3.jpg", "/HEROBG/desktop/4.jpg"], inStock: false }
  ];

  const product = products.find(p => p.id === id);
  const [mainImage, setMainImage] = useState(product?.images[0] || "");

  const recommendations = useMemo(() => {
    return products.filter(p => p.id !== id).slice(0, 3);
  }, [id]);

  const handleAddToCart = () => {
    setCartNotification(`${quantity}x ${product?.name} added to bag.`);
    setTimeout(() => setCartNotification(""), 3000);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-[#1B342B]">
        <h1 className="text-3xl font-serif mb-4">Product Not Found</h1>
        <Link href="/shop" className="text-[10px] uppercase tracking-widest font-bold border-b border-[#1B342B] pb-1 hover:text-[#A67C52] hover:border-[#A67C52] transition-colors">
          Return to Boutique
        </Link>
      </div>
    );
  }

  return (
    // FIX: Changed pt-32 to pt-8 md:pt-12 to remove the massive gap at the top!
    <section className="min-h-screen bg-[#FDFBF7] w-full pb-24 relative pt-8 md:pt-12">
      
      {/* FLOATING CART NOTIFICATION */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${cartNotification ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-[#1B342B] text-[#FDFBF7] px-8 py-4 rounded-sm shadow-2xl flex items-center space-x-4 border border-[#FDFBF7]/10">
          <svg className="w-4 h-4 text-[#A67C52]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold">{cartNotification}</span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12">

        {/* ========================================= */}
        {/* TOP HERO SECTION: IMAGE & BUY ACTIONS     */}
        {/* ========================================= */}
         <div className="text-[8px] md:text-[9px] uppercase tracking-widest md:tracking-[0.3em] font-bold text-[#1B342B]/50 mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 leading-loose">
              <Link href="/" className="hover:text-[#A67C52] transition-colors">Home</Link>
              <span>—</span>
              <Link href="/shop" className="hover:text-[#A67C52] transition-colors">The Boutique</Link>
              <span>—</span>
              <span className="text-[#1B342B]">{product.name}</span>
            </div>
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20 mb-24 items-start">
          
          
          {/* LEFT: IMAGE GALLERY */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-32 shrink-0">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible no-scrollbar pb-2 md:pb-0 w-full md:w-24 shrink-0">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setMainImage(img)}
                  className={`relative h-24 md:h-32 w-20 md:w-full flex-shrink-0 border transition-all duration-300 ${mainImage === img ? 'border-[#1B342B]' : 'border-transparent hover:border-[#1B342B]/30'}`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover p-1" />
                </button>
              ))}
            </div>
            {/* Main Image */}
            <div className="relative aspect-[3/4] w-full bg-[#1B342B]/5 shadow-sm">
              <Image src={mainImage} alt={product.name} fill className="object-cover" priority />
            </div>
          </div>

          {/* RIGHT: ESSENTIAL PURCHASE DETAILS */}
          <div className="w-full lg:w-1/2 flex flex-col justify-start pt-0">
            
           

            <h1 className="text-4xl lg:text-5xl font-serif text-[#1B342B] tracking-tight mb-4 leading-tight">
              {product.name}
            </h1>
            
            <p className="text-[#1B342B]/60 text-sm italic font-serif mb-8">
              {product.description}
            </p>

            <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-[#1B342B]/10">
              <span className="text-3xl font-serif text-[#1B342B]">
                ${product.price.toFixed(2)}
              </span>
              {product.price < product.originalPrice && (
                <span className="text-[#1B342B]/40 line-through text-xl font-serif">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div>
                <span className="block text-[9px] uppercase tracking-widest font-bold text-[#1B342B]/50 mb-1">Stain Color</span>
                <span className="text-sm font-bold text-[#1B342B]">{product.stainColor}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest font-bold text-[#1B342B]/50 mb-1">Product Form</span>
                <span className="text-sm font-bold text-[#1B342B]">{product.form}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full">
              
              {/* Quantity Selector */}
              <div className="flex items-center border border-[#1B342B]/20 w-full sm:w-32 h-14 shrink-0">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center text-[#1B342B] hover:bg-[#1B342B]/5 transition-colors">−</button>
                <input type="text" value={quantity} readOnly className="flex-1 h-full bg-transparent text-center font-bold text-[#1B342B] focus:outline-none" />
                <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center text-[#1B342B] hover:bg-[#1B342B]/5 transition-colors">+</button>
              </div>

              {/* Add Button */}
              <button 
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 min-h-[56px] py-4 px-6 text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 shadow-xl flex items-center justify-center ${product.inStock ? 'bg-[#1B342B] text-[#FDFBF7] hover:bg-[#A67C52]' : 'bg-[#1B342B]/10 text-[#1B342B]/40 cursor-not-allowed'}`}
              >
                {product.inStock ? 'Add to Bag' : 'Out of Stock'}
              </button>
            </div>

            <div className="flex items-center space-x-2 text-[#1B342B]/60 text-xs mt-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <span>Ships frozen to preserve peak potency.</span>
            </div>

          </div>
        </div>

        {/* ========================================= */}
        {/* MIDDLE TABS: DESC, DETAILS, REVIEWS       */}
        {/* ========================================= */}
        <div className="mt-24 border-t border-[#1B342B]/10 pt-16">
          
          <div className="flex justify-center space-x-8 md:space-x-16 border-b border-[#1B342B]/10 mb-12">
            {['description', 'details', 'reviews'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveSection(tab)}
                className={`pb-4 text-[10px] md:text-xs uppercase tracking-widest font-bold transition-all duration-300 ${activeSection === tab ? 'text-[#A67C52] border-b-2 border-[#A67C52]' : 'text-[#1B342B]/40 hover:text-[#1B342B]'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="max-w-3xl mx-auto min-h-[250px]">
            {activeSection === 'description' && (
              <div className="animate-fade-in text-center">
                <h3 className="text-3xl font-serif text-[#1B342B] mb-6 italic">The Artistry</h3>
                <p className="text-[#1B342B]/70 font-serif text-lg leading-relaxed">
                  {product.fullDescription}
                </p>
              </div>
            )}

            {activeSection === 'details' && (
              <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1B342B] mb-4 border-b border-[#1B342B]/10 pb-2">Ingredients</h4>
                  <ul className="text-[#1B342B]/70 text-sm space-y-2 font-light">
                    <li>• 100% Organic Sojat Henna Powder</li>
                    <li>• Filtered Water</li>
                    <li>• Organic Cane Sugar</li>
                    <li>• Premium Essential Oils (Eucalyptus & Lavender)</li>
                    <li>• Zero PPD or Chemical Preservatives</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1B342B] mb-4 border-b border-[#1B342B]/10 pb-2">Storage & Shipping</h4>
                  <p className="text-[#1B342B]/70 text-sm font-light leading-relaxed mb-4">
                    This is a perishable item. It must be frozen immediately upon arrival. Keeps fresh in the freezer for up to 6 months. Thaw at room temperature for 20 minutes before use.
                  </p>
                  <p className="text-[#1B342B]/70 text-sm font-light leading-relaxed">
                    Orders ship exclusively on Mondays and Tuesdays to prevent weekend transit delays.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'reviews' && (
              <div className="animate-fade-in space-y-12">
                <div className="flex items-center justify-between border-b border-[#1B342B]/10 pb-6">
                  <div>
                    <span className="text-4xl font-serif text-[#1B342B] mr-4">{product.rating}</span>
                    <span className="text-[#1B342B]/50 text-sm uppercase tracking-widest font-bold">out of 5 Stars</span>
                  </div>
                  <button className="text-[10px] uppercase tracking-widest font-bold text-[#1B342B] border border-[#1B342B] px-6 py-3 hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-colors">
                    Write a Review
                  </button>
                </div>

                <div className="pb-8 border-b border-[#1B342B]/10">
                  <div className="flex text-[#A67C52] mb-3">★★★★★</div>
                  <h4 className="text-lg font-serif text-[#1B342B] mb-2">"The deepest stain I've ever seen."</h4>
                  <p className="text-[#1B342B]/70 text-sm font-light leading-relaxed mb-4">
                    I used this for my bridal clients last weekend and the stain payoff was absolutely incredible. The consistency is so stringy and smooth. Never going back to making my own paste!
                  </p>
                  <span className="text-[10px] uppercase tracking-widest text-[#1B342B]/40 font-bold">— Priya S. (Verified Artist)</span>
                </div>

                <div className="pb-8">
                  <div className="flex text-[#A67C52] mb-3">★★★★★</div>
                  <h4 className="text-lg font-serif text-[#1B342B] mb-2">"Smells divine and works perfectly."</h4>
                  <p className="text-[#1B342B]/70 text-sm font-light leading-relaxed mb-4">
                    Arrived frozen solid, thawed beautifully. The lavender scent is so relaxing for the brides. Highly recommend to any professional artist.
                  </p>
                  <span className="text-[10px] uppercase tracking-widest text-[#1B342B]/40 font-bold">— Amira H. (Verified Buyer)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================= */}
        {/* BOTTOM SECTION: RECOMMENDATIONS           */}
        {/* ========================================= */}
        <div className="mt-32 pt-24 border-t border-[#1B342B]/10">
          <div className="text-center mb-16">
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#A67C52] mb-4 block">Complete The Ritual</span>
            <h3 className="text-4xl font-serif text-[#1B342B] italic">You May Also Like</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((rec) => (
              <Link href={`/shop/${rec.id}`} key={rec.id} className="flex flex-col group cursor-pointer">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1B342B]/5 mb-5 shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <Image src={rec.image} alt={rec.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  {!rec.inStock && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-[#1B342B]/80 text-[#FDFBF7] px-3 py-1 text-[9px] uppercase tracking-widest font-bold shadow-sm">Sold Out</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h4 className="text-base font-serif text-[#1B342B] mb-1 group-hover:text-[#A67C52] transition-colors">{rec.name}</h4>
                  <span className="text-[#1B342B] font-medium text-sm tracking-wide">${rec.price.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}