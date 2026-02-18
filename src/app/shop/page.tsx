"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';

/* ─── High-End Accordion Helper ─── */
function Accordion({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#1B342B]/10">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-5 text-left group">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1B342B] group-hover:text-[#A67C52] transition-colors">{title}</span>
        <span className="text-[#A67C52] text-lg font-light leading-none">{open ? '−' : '+'}</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
}

export default function ShopPage() {
  // ─── Mehndi-Specific Filter States ───
  const [category, setCategory] = useState("All");
  const [form, setForm] = useState("All Types");
  const [stainColor, setStainColor] = useState("All Colors"); // ✦ NEW
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  // ─── UI States ───
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [cartNotification, setCartNotification] = useState("");
  const [wishlist, setWishlist] = useState<number[]>([]);

  // ─── True Mehndi Product Database ───
  const products = [
    { id: 1, name: "Signature Bridal Cones", description: "Pack of 5 • Lavender & Eucalyptus", price: 25.00, originalPrice: 30.00, rating: 4.9, form: "Ready-to-use Cone", stainColor: "Deep Burgundy", image: "/HEROBG/mobile/4.jpg", hoverImage: "/HEROBG/desktop/2.jpg", tag: "Best Seller", inStock: true, category: "Organic Cones" },
    { id: 2, name: "Lemon-Sugar Sealant Spray", description: "Locks in moisture for the deepest stains", price: 18.00, originalPrice: 18.00, rating: 4.7, form: "Liquid / Spray", stainColor: "Clear (Aftercare)", image: "/HEROBG/desktop/2.jpg", hoverImage: "/HEROBG/desktop/3.jpg", tag: "", inStock: true, category: "Aftercare" },
    { id: 3, name: "Triple-Sifted Rajasthani Powder", description: "100g • Pure Sojat henna leaves", price: 15.00, originalPrice: 20.00, rating: 5.0, form: "Raw Powder", stainColor: "Natural Brown", image: "/HEROBG/desktop/6.jpg", hoverImage: "/HEROBG/desktop/1.jpg", tag: "Pure", inStock: true, category: "Henna Powder" },
    { id: 4, name: "Arabian Night Jagua Blend", description: "Pack of 3 • For intense dark tones", price: 28.00, originalPrice: 28.00, rating: 4.8, form: "Ready-to-use Cone", stainColor: "Midnight Black", image: "/HEROBG/mobile/2.jpg", hoverImage: "/HEROBG/desktop/4.jpg", tag: "New", inStock: true, category: "Organic Cones" },
    { id: 5, name: "Bridal Crimson Paste", description: "Pre-mixed bowl • 200g for full bridal sets", price: 45.00, originalPrice: 55.00, rating: 5.0, form: "Bulk Paste", stainColor: "Crimson Red", image: "/HEROBG/desktop/1.jpg", hoverImage: "/HEROBG/desktop/2.jpg", tag: "Bridal", inStock: true, category: "Bridal Kits" },
    { id: 6, name: "Therapeutic Essential Oil Blend", description: "30ml • Cajuput & Tea Tree mix", price: 22.00, originalPrice: 25.00, rating: 4.9, form: "Liquid / Spray", stainColor: "Clear (Aftercare)", image: "/HEROBG/desktop/3.jpg", hoverImage: "/HEROBG/desktop/4.jpg", tag: "", inStock: false, category: "Essential Oils" }
  ];

  // Map for visual color swatches
  const colorSwatches: Record<string, string> = {
    "Deep Burgundy": "#4A0404",
    "Crimson Red": "#8B0000",
    "Natural Brown": "#5C3A21",
    "Midnight Black": "#1A1A1A",
    "Clear (Aftercare)": "#FDFBF7" // Will have a border in UI
  };

  // ─── Filter & Sort Logic ───
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (form !== "All Types" && p.form !== form) return false;
      if (stainColor !== "All Colors" && p.stainColor !== stainColor) return false;
      if (p.rating < minRating) return false;
      if (p.price > maxPrice) return false;
      if (onSaleOnly && p.price >= p.originalPrice) return false;
      return true;
    });

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "top-rated") result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [category, form, stainColor, minRating, maxPrice, onSaleOnly, sortBy]);

  const activeFilterCount = [
    category !== "All", form !== "All Types", stainColor !== "All Colors", minRating > 0, maxPrice < 100, onSaleOnly
  ].filter(Boolean).length;

  const clearAll = () => {
    setCategory("All"); setForm("All Types"); setStainColor("All Colors"); setMinRating(0); setMaxPrice(100); setOnSaleOnly(false); setSortBy("featured");
  };

  const handleAddToCart = (productName: string) => {
    setCartNotification(`${productName} added to your bag.`);
    setTimeout(() => setCartNotification(""), 3000);
  };

  const toggleWishlist = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]);
  };

  // ─── Reusable Filter Panel ───
  const FilterPanel = () => (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-end mb-6 pb-4 border-b border-[#1B342B]/10">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#1B342B]">Refine By</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="text-[9px] uppercase tracking-widest font-bold text-[#A67C52] hover:text-[#1B342B] underline underline-offset-4 transition-colors">
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* CATEGORY */}
      <Accordion title="Collection">
        <div className="flex flex-col space-y-3">
          {["All", "Organic Cones", "Henna Powder", "Essential Oils", "Aftercare", "Bridal Kits"].map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className="flex items-center space-x-3 text-left group">
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${category === cat ? 'border-[#1B342B]' : 'border-[#1B342B]/30 group-hover:border-[#A67C52]'}`}>
                {category === cat && <div className="w-1.5 h-1.5 bg-[#1B342B] rounded-full"></div>}
              </div>
              <span className={`text-sm tracking-wide ${category === cat ? 'text-[#1B342B] font-semibold' : 'text-[#1B342B]/70 group-hover:text-[#1B342B]'}`}>{cat}</span>
            </button>
          ))}
        </div>
      </Accordion>

      {/* ✦ NEW: VISUAL STAIN COLOR FILTER ✦ */}
      <Accordion title="Stain Color Result">
        <div className="flex flex-col space-y-3">
          <button onClick={() => setStainColor("All Colors")} className="flex items-center space-x-3 text-left group">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${stainColor === "All Colors" ? 'border-[#1B342B]' : 'border-[#1B342B]/30 group-hover:border-[#A67C52]'}`}>
                {stainColor === "All Colors" && <div className="w-2 h-2 bg-[#1B342B] rounded-full"></div>}
              </div>
              <span className={`text-sm tracking-wide ${stainColor === "All Colors" ? 'text-[#1B342B] font-semibold' : 'text-[#1B342B]/70 group-hover:text-[#1B342B]'}`}>All Colors</span>
          </button>

          {Object.entries(colorSwatches).map(([colorName, hex]) => (
            <button key={colorName} onClick={() => setStainColor(colorName)} className="flex items-center space-x-3 text-left group">
              <div 
                className={`w-5 h-5 rounded-full border shadow-inner transition-transform ${stainColor === colorName ? 'ring-2 ring-offset-2 ring-[#A67C52] scale-110' : 'border-[#1B342B]/20 group-hover:scale-110'}`}
                style={{ backgroundColor: hex }}
              ></div>
              <span className={`text-sm tracking-wide ${stainColor === colorName ? 'text-[#1B342B] font-semibold' : 'text-[#1B342B]/70 group-hover:text-[#1B342B]'}`}>{colorName}</span>
            </button>
          ))}
        </div>
      </Accordion>

      {/* PRODUCT FORM */}
      <Accordion title="Product Type" defaultOpen={false}>
        <div className="flex flex-col space-y-3">
          {["All Types", "Ready-to-use Cone", "Raw Powder", "Bulk Paste", "Liquid / Spray"].map(f => (
            <button key={f} onClick={() => setForm(f)} className="flex items-center space-x-3 text-left group">
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${form === f ? 'border-[#1B342B]' : 'border-[#1B342B]/30 group-hover:border-[#A67C52]'}`}>
                {form === f && <div className="w-1.5 h-1.5 bg-[#1B342B] rounded-full"></div>}
              </div>
              <span className={`text-sm tracking-wide ${form === f ? 'text-[#1B342B] font-semibold' : 'text-[#1B342B]/70 group-hover:text-[#1B342B]'}`}>{f}</span>
            </button>
          ))}
        </div>
      </Accordion>

      {/* PRICE RANGE */}
      <Accordion title="Price Range" defaultOpen={false}>
        <div className="flex flex-col pt-2">
          <div className="flex justify-between text-xs font-bold text-[#1B342B]/70 mb-4 tracking-widest">
            <span>$0</span>
            <span className="text-[#1B342B]">Up to ${maxPrice}</span>
          </div>
          <input 
            type="range" min="0" max="100" step="5" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full appearance-none h-1 bg-[#1B342B]/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#1B342B] [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
          />
        </div>
      </Accordion>

      {/* OFFERS */}
      <div className="py-5 flex items-center justify-between border-b border-[#1B342B]/10">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1B342B]">On Sale Only</span>
        <button 
          onClick={() => setOnSaleOnly(!onSaleOnly)}
          className={`w-10 h-5 rounded-full relative transition-colors duration-300 focus:outline-none ${onSaleOnly ? 'bg-[#A67C52]' : 'bg-[#1B342B]/20'}`}
        >
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${onSaleOnly ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </button>
      </div>

    </div>
  );

  return (
    <section className="min-h-screen bg-[#FDFBF7] w-full pb-24 relative pt-32">
      
      {/* FLOATING CART NOTIFICATION */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${cartNotification ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-[#1B342B] text-[#FDFBF7] px-8 py-4 rounded-sm shadow-2xl flex items-center space-x-4 border border-[#FDFBF7]/10">
          <svg className="w-4 h-4 text-[#A67C52]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold">{cartNotification}</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* BREADCRUMBS & EDITORIAL HEADER */}
        <div className="mb-16 border-b border-[#1B342B]/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#1B342B]/40 mb-4 flex items-center">
              <Link href="/" className="hover:text-[#A67C52] transition-colors">Home</Link>
              <span className="mx-3">—</span>
              <span className="text-[#1B342B]">The Boutique</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#1B342B] tracking-tight">Curated <span className="italic font-light text-[#A67C52]">Essentials</span></h1>
          </div>
          <p className="text-[#1B342B]/60 text-sm italic font-serif max-w-sm mt-4 md:mt-0 md:text-right">
            Professional-grade, organically sourced henna crafted for the world's most discerning artists.
          </p>
        </div>

        {/* TOP BAR: MOBILE FILTER & DESKTOP SORTING */}
        <div className="flex justify-between items-center mb-10">
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="text-[#1B342B] text-[10px] uppercase tracking-[0.2em] font-bold flex items-center border border-[#1B342B]/20 px-5 py-2.5 rounded-sm hover:border-[#1B342B] transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
          
          <div className="hidden md:block">
            <span className="text-sm font-serif italic text-[#1B342B]/60">Showing {filteredProducts.length} results</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B342B]/50 hidden sm:block">Sort By</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[#1B342B] text-xs font-bold uppercase tracking-widest focus:outline-none cursor-pointer border-b border-[#1B342B]/20 pb-1 appearance-none pr-4"
              style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,<svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="%231B342B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right center' }}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="top-rated">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start">
          
          {/* DESKTOP LEFT SIDEBAR */}
          <div className="hidden md:block w-72 shrink-0 pr-16 sticky top-32">
            <FilterPanel />
          </div>

          {/* MOBILE SLIDER (DRAWER) */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 bg-[#1B342B]/40 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={() => setIsMobileFilterOpen(false)}></div>
          )}
          <div className={`fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#FDFBF7] z-50 transform transition-transform duration-500 ease-in-out md:hidden flex flex-col shadow-2xl ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 border-b border-[#1B342B]/10 flex justify-between items-center bg-[#FDFBF7]">
              <h3 className="text-lg font-serif text-[#1B342B]">Refine Collection</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-[#1B342B]/40 hover:text-[#1B342B] transition-colors p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <FilterPanel />
            </div>
            <div className="p-6 border-t border-[#1B342B]/10 bg-[#FDFBF7]">
               <button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-[#1B342B] text-[#FDFBF7] py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#A67C52] transition-colors shadow-lg">
                 View {filteredProducts.length} Results
               </button>
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {filteredProducts.map((product) => (
                <Link href={`/shop/${product.id}`} key={product.id} className="flex flex-col group cursor-pointer relative">
                  
                  {/* Product Image Box */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1B342B]/5 mb-5 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                    
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      fill 
                      className={`object-cover transition-opacity duration-700 ${!product.inStock && 'opacity-60 grayscale'} group-hover:opacity-0`}
                    />
                    
                    <Image 
                      src={product.hoverImage} 
                      alt={`${product.name} Alternative View`} 
                      fill 
                      className={`absolute inset-0 object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform group-hover:scale-105 ${!product.inStock && 'grayscale'}`}
                    />

                    {/* Wishlist Heart */}
                    <button 
                      onClick={(e) => toggleWishlist(e, product.id)}
                      className={`absolute top-4 right-4 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-500 ${wishlist.includes(product.id) ? 'bg-[#1B342B] text-white opacity-100' : 'bg-white/80 text-[#1B342B] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:text-[#A67C52]'}`}
                    >
                      <svg className="w-4 h-4" fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>

                    {product.tag && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-white/95 text-[#1B342B] px-3 py-1 text-[9px] uppercase tracking-widest font-bold shadow-sm rounded-sm">
                          {product.tag}
                        </span>
                      </div>
                    )}

                    {!product.inStock && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-[#1B342B]/80 text-[#FDFBF7] px-3 py-1 text-[9px] uppercase tracking-widest font-bold shadow-sm backdrop-blur-sm">
                          Sold Out
                        </span>
                      </div>
                    )}

                    {/* Sliding "Quick Add" */}
                    <div className={`absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out ${!product.inStock && 'hidden'}`}>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product.name);
                        }}
                        className="w-full bg-[#FDFBF7]/95 backdrop-blur-sm border border-[#1B342B]/10 text-[#1B342B] py-4 rounded-sm hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-colors duration-300 uppercase text-[10px] tracking-[0.2em] font-bold shadow-xl"
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col text-left px-2">
                    <h3 className="text-base font-serif text-[#1B342B] mb-1 group-hover:text-[#A67C52] transition-colors duration-300 line-clamp-1">
                      {product.name}
                    </h3>
                    
                    {/* Visual Stain Color Indicator beneath title */}
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full border border-[#1B342B]/20 shadow-inner" style={{ backgroundColor: colorSwatches[product.stainColor] }}></div>
                      <span className="text-[#1B342B]/50 text-[10px] uppercase tracking-widest">{product.stainColor}</span>
                    </div>

                    <p className="text-[#1B342B]/60 text-xs font-light mb-3 truncate">
                      {product.description}
                    </p>

                    <div className="flex items-center space-x-3 mt-auto">
                       <span className="text-[#1B342B] font-medium text-sm tracking-wide">
                         ${product.price.toFixed(2)}
                       </span>
                       {product.price < product.originalPrice && (
                         <span className="text-[#1B342B]/40 line-through text-xs">${product.originalPrice.toFixed(2)}</span>
                       )}
                    </div>
                  </div>

                </Link>
              ))}
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <p className="text-[#1B342B] font-serif text-2xl mb-3">No Essentials Found</p>
                <p className="text-[#1B342B]/50 text-sm max-w-md">Try adjusting your filters to discover more of our premium collection.</p>
                <button onClick={clearAll} className="mt-8 border border-[#1B342B]/20 px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-[#1B342B] hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-all duration-300">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="mt-24 flex flex-col items-center justify-center border-t border-[#1B342B]/10 pt-16">
                <p className="text-xs font-serif italic text-[#1B342B]/50 mb-6">Viewing {filteredProducts.length} of {products.length} pieces</p>
                <button className="border border-[#1B342B]/20 bg-transparent text-[#1B342B] px-12 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:border-[#1B342B] hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-all duration-500 shadow-sm">
                  Discover More
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}