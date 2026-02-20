// src/app/(marketing)/shop/page.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'; // ✅ Added imports

/* ─── Types ─── */
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  tag: string | null;
  in_stock: boolean;
  image_url: string;
  gallery_images: string[];
  stain_color: string | null;
  weight_volume: string | null;
  created_at: string;
};

/* ─── Color Swatches ─── */
const colorSwatches: Record<string, string> = {
  "Deep Burgundy":    "#4A0404",
  "Crimson Red":      "#8B0000",
  "Natural Brown":    "#5C3A21",
  "Midnight Black":   "#1A1A1A",
  "Clear (Aftercare)":"#D4C5A9",
  "Deep Mahogany":    "#4E1C0C",
  "Auburn":           "#922724",
  "Terracotta":       "#C45C3A",
};

const COLLECTIONS = ["All", "Organic Cones", "Henna Powder", "Essential Oils", "Aftercare", "Bridal Kits"];
const FORMS       = ["All Types", "Ready-to-use Cone", "Raw Powder", "Bulk Paste", "Liquid / Spray"];
const RATINGS     = [
  { label: "All Ratings", value: 0 },
  { label: "4★ & Above",  value: 4 },
  { label: "4.5★ & Above",value: 4.5 },
  { label: "5★ Only",     value: 5 },
];

/* ─── High-End Accordion ─── */
function Accordion({
  title, children, defaultOpen = true, badge,
}: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#1B342B]/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left group"
      >
        <span className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1B342B] group-hover:text-[#A67C52] transition-colors">
            {title}
          </span>
          {!!badge && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#A67C52] text-white text-[7px] font-extrabold leading-none">
              {badge}
            </span>
          )}
        </span>
        <span className="text-[#A67C52] text-lg font-light leading-none select-none">
          {open ? '−' : '+'}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-[600px] pb-6 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Radio Row ─── */
function RadioRow({
  label, active, onClick,
}: {
  label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex items-center space-x-3 text-left group w-full">
      <div
        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
          active ? 'border-[#1B342B]' : 'border-[#1B342B]/30 group-hover:border-[#A67C52]'
        }`}
      >
        {active && <div className="w-1.5 h-1.5 bg-[#1B342B] rounded-full" />}
      </div>
      <span
        className={`text-sm tracking-wide transition-colors ${
          active ? 'text-[#1B342B] font-semibold' : 'text-[#1B342B]/70 group-hover:text-[#1B342B]'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

/* ─── Toggle Switch ─── */
function ToggleRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <span className="text-sm tracking-wide text-[#1B342B]/70">{label}</span>
      <button
        onClick={onToggle}
        className={`w-10 h-5 rounded-full relative transition-colors duration-300 focus:outline-none shrink-0 ${
          on ? 'bg-[#A67C52]' : 'bg-[#1B342B]/20'
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
            on ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

/* ─── Skeleton Card ─── */
function ProductSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-[3/4] w-full bg-[#1B342B]/8 mb-5" />
      <div className="px-2 space-y-2.5">
        <div className="h-4 bg-[#1B342B]/8 rounded w-3/4" />
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1B342B]/10" />
          <div className="h-2.5 bg-[#1B342B]/6 rounded w-1/3" />
        </div>
        <div className="h-3 bg-[#1B342B]/5 rounded w-1/2" />
        <div className="h-4 bg-[#1B342B]/8 rounded w-1/4 mt-2" />
      </div>
    </div>
  );
}

/* ─── Active Filter Chip ─── */
function Chip({ label, dot, onRemove }: { label: string; dot?: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1.5 bg-[#1B342B] text-[#FDFBF7] px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold rounded-full hover:bg-[#A67C52] transition-colors"
    >
      {dot && (
        <div className="w-2 h-2 rounded-full shrink-0 border border-white/30" style={{ backgroundColor: dot }} />
      )}
      <span>{label}</span>
      <svg className="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

export default function ShopPage() {
  /* ─── Supabase (Stable Singleton) ─── */
  const supabase = getSupabaseClient();

  /* ─── Auth ─── */
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* ─── Data ─── */
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ─── Filters ─── */
  const [category, setCategory]     = useState("All");
  const [form, setForm]             = useState("All Types");
  const [stainColor, setStainColor] = useState("All Colors");
  const [minRating, setMinRating]   = useState(0);
  const [maxPrice, setMaxPrice]     = useState(200);
  const [priceMax, setPriceMax]     = useState(200);   // ceiling from DB
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [hasPhoto, setHasPhoto]     = useState(false);
  const [sortBy, setSortBy]         = useState("featured");

  /* ─── UI ─── */
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [cartNotification, setCartNotification]     = useState("");
  const [addingId, setAddingId]                     = useState<string | null>(null);
  const [wishlist, setWishlist]                     = useState<string[]>([]);

  /* ─── Init ─── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => { // ✅ Added type
      setUser(user);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: AuthChangeEvent, session: Session | null) => { // ✅ Added type
      setUser(session?.user ?? null);
    });

    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, tag, in_stock, image_url, gallery_images, stain_color, weight_volume, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data as Product[]);
        const ceil = Math.ceil(Math.max(...data.map((p: Product) => p.price), 100) / 10) * 10;
        setMaxPrice(ceil);
        setPriceMax(ceil);
      }
      setIsLoading(false);
    };
    fetchProducts();

    return () => subscription.unsubscribe();
  }, [supabase]);

  /* ─── Derived ─── */
  const uniqueColors = useMemo(() => {
    const all = products.map(p => p.stain_color).filter(Boolean) as string[];
    return [...new Set(all)];
  }, [products]);

  /* ─── Filter + Sort ─── */
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      if (stainColor !== "All Colors" && p.stain_color !== stainColor) return false;
      if (p.price > maxPrice) return false;
      if (onSaleOnly && p.tag !== 'Sale') return false;
      if (inStockOnly && !p.in_stock) return false;
      if (hasPhoto && !p.image_url) return false;
      return true;
    });
    if (sortBy === "price-low")  result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "newest")     result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sortBy === "in-stock")   result = [...result].sort((a, b) => (b.in_stock ? 1 : 0) - (a.in_stock ? 1 : 0));
    return result;
  }, [products, stainColor, maxPrice, onSaleOnly, inStockOnly, hasPhoto, sortBy]);

  const activeFilters: { label: string; dot?: string; clear: () => void }[] = [
    ...(category !== "All"           ? [{ label: category,            clear: () => setCategory("All") }] : []),
    ...(form !== "All Types"         ? [{ label: form,                clear: () => setForm("All Types") }] : []),
    ...(stainColor !== "All Colors"  ? [{ label: stainColor, dot: colorSwatches[stainColor], clear: () => setStainColor("All Colors") }] : []),
    ...(maxPrice < priceMax          ? [{ label: `Under $${maxPrice}`, clear: () => setMaxPrice(priceMax) }] : []),
    ...(minRating > 0                ? [{ label: `${minRating}★+`,     clear: () => setMinRating(0) }] : []),
    ...(onSaleOnly                   ? [{ label: "On Sale",            clear: () => setOnSaleOnly(false) }] : []),
    ...(inStockOnly                  ? [{ label: "In Stock",           clear: () => setInStockOnly(false) }] : []),
    ...(hasPhoto                     ? [{ label: "Has Photo",          clear: () => setHasPhoto(false) }] : []),
  ];

  const clearAll = () => {
    setCategory("All"); setForm("All Types"); setStainColor("All Colors");
    setMinRating(0); setMaxPrice(priceMax); setOnSaleOnly(false);
    setInStockOnly(false); setHasPhoto(false); setSortBy("featured");
  };

  /* ─── Add to Cart ─── */
  const handleAddToCart = useCallback(async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (authLoading) return;
    if (!user) {
      setCartNotification("Please log in to add items to your bag.");
      setTimeout(() => setCartNotification(""), 3500);
      return;
    }
    if (!product.in_stock || addingId) return;
    setAddingId(product.id);
    try {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert([{ user_id: user.id, product_id: product.id, quantity: 1 }]);
      }
      window.dispatchEvent(new Event('cartUpdated'));
      setCartNotification(`${product.name} added to your bag.`);
      setTimeout(() => setCartNotification(""), 3000);
    } catch (err) {
      console.error("Cart error:", err);
    } finally {
      setAddingId(null);
    }
  }, [user, authLoading, addingId, supabase]);

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  };

  /* ═══════════════════════════════════════════ */
  /* FILTER PANEL                                */
  /* ═══════════════════════════════════════════ */
  const FilterPanel = () => (
    <div className="flex flex-col w-full">

      {/* Panel header */}
      <div className="flex justify-between items-end mb-6 pb-4 border-b border-[#1B342B]/10">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-[#1B342B]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#1B342B]">Refine By</h3>
        </div>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAll}
            className="text-[9px] uppercase tracking-widest font-bold text-[#A67C52] hover:text-[#1B342B] underline underline-offset-4 transition-colors"
          >
            Clear All ({activeFilters.length})
          </button>
        )}
      </div>

      {/* Active chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {activeFilters.map(f => (
            <Chip key={f.label} label={f.label} dot={f.dot} onRemove={f.clear} />
          ))}
        </div>
      )}

      {/* ── COLLECTION ── */}
      <Accordion title="Collection" badge={category !== "All" ? 1 : 0}>
        <div className="flex flex-col space-y-3">
          {COLLECTIONS.map(cat => (
            <RadioRow key={cat} label={cat} active={category === cat} onClick={() => setCategory(cat)} />
          ))}
        </div>
      </Accordion>

      {/* ── STAIN COLOR ── */}
      <Accordion
        title="Stain Color Result"
        defaultOpen={false}
        badge={stainColor !== "All Colors" ? 1 : 0}
      >
        <div className="flex flex-col space-y-3.5">
          <button onClick={() => setStainColor("All Colors")} className="flex items-center space-x-3 text-left group">
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                stainColor === "All Colors" ? 'border-[#1B342B]' : 'border-[#1B342B]/30 group-hover:border-[#A67C52]'
              }`}
            >
              {stainColor === "All Colors" && <div className="w-2 h-2 bg-[#1B342B] rounded-full" />}
            </div>
            <span className={`text-sm tracking-wide ${stainColor === "All Colors" ? 'text-[#1B342B] font-semibold' : 'text-[#1B342B]/70 group-hover:text-[#1B342B]'}`}>
              All Colors
            </span>
          </button>

          {/* DB colors first */}
          {uniqueColors.map(colorName => (
            <button key={colorName} onClick={() => setStainColor(colorName)} className="flex items-center space-x-3 text-left group">
              <div
                className={`w-5 h-5 rounded-full border shadow-inner transition-all ${
                  stainColor === colorName
                    ? 'ring-2 ring-offset-2 ring-[#A67C52] scale-110'
                    : 'border-[#1B342B]/20 group-hover:scale-110'
                }`}
                style={{ backgroundColor: colorSwatches[colorName] || '#5C3A21' }}
              />
              <span className={`text-sm tracking-wide ${stainColor === colorName ? 'text-[#1B342B] font-semibold' : 'text-[#1B342B]/70 group-hover:text-[#1B342B]'}`}>
                {colorName}
              </span>
            </button>
          ))}

          {/* Static fallback swatches if DB has none */}
          {uniqueColors.length === 0 &&
            Object.entries(colorSwatches).map(([colorName, hex]) => (
              <button key={colorName} onClick={() => setStainColor(colorName)} className="flex items-center space-x-3 text-left group">
                <div
                  className={`w-5 h-5 rounded-full border shadow-inner transition-all ${
                    stainColor === colorName ? 'ring-2 ring-offset-2 ring-[#A67C52] scale-110' : 'border-[#1B342B]/20 group-hover:scale-110'
                  }`}
                  style={{ backgroundColor: hex }}
                />
                <span className={`text-sm tracking-wide ${stainColor === colorName ? 'text-[#1B342B] font-semibold' : 'text-[#1B342B]/70 group-hover:text-[#1B342B]'}`}>
                  {colorName}
                </span>
              </button>
            ))}
        </div>
      </Accordion>

      {/* ── PRODUCT TYPE ── */}
      <Accordion title="Product Type" defaultOpen={false} badge={form !== "All Types" ? 1 : 0}>
        <div className="flex flex-col space-y-3">
          {FORMS.map(f => (
            <RadioRow key={f} label={f} active={form === f} onClick={() => setForm(f)} />
          ))}
        </div>
      </Accordion>

      {/* ── PRICE RANGE ── */}
      <Accordion title="Price Range" defaultOpen={false} badge={maxPrice < priceMax ? 1 : 0}>
        <div className="flex flex-col pt-2 space-y-4">
          <div className="flex justify-between text-xs font-bold text-[#1B342B]/70 tracking-widest">
            <span>$0</span>
            <span className="text-[#1B342B]">Up to ${maxPrice}</span>
          </div>
          <input
            type="range" min="0" max={priceMax} step="5" value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full appearance-none h-0.5 bg-[#1B342B]/15 rounded-full outline-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:bg-[#1B342B] [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
          />
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5">
            {[25, 50, 75, 100, 150].filter(v => v <= priceMax).map(preset => (
              <button
                key={preset}
                onClick={() => setMaxPrice(preset)}
                className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold border rounded-full transition-all duration-200 ${
                  maxPrice === preset
                    ? 'bg-[#1B342B] text-[#FDFBF7] border-[#1B342B]'
                    : 'border-[#1B342B]/20 text-[#1B342B]/60 hover:border-[#1B342B]/40 hover:text-[#1B342B]'
                }`}
              >
                Under ${preset}
              </button>
            ))}
          </div>
        </div>
      </Accordion>

      {/* ── RATING ── */}
      <Accordion title="Minimum Rating" defaultOpen={false} badge={minRating > 0 ? 1 : 0}>
        <div className="flex flex-col space-y-3">
          {RATINGS.map(r => (
            <button
              key={r.value}
              onClick={() => setMinRating(r.value)}
              className="flex items-center space-x-3 text-left group"
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                  minRating === r.value ? 'border-[#1B342B]' : 'border-[#1B342B]/30 group-hover:border-[#A67C52]'
                }`}
              >
                {minRating === r.value && <div className="w-1.5 h-1.5 bg-[#1B342B] rounded-full" />}
              </div>
              <span className={`text-sm tracking-wide flex items-center gap-1.5 ${minRating === r.value ? 'text-[#1B342B] font-semibold' : 'text-[#1B342B]/70 group-hover:text-[#1B342B]'}`}>
                {r.label}
                {r.value > 0 && (
                  <span className="flex">
                    {[...Array(Math.floor(r.value))].map((_, i) => (
                      <svg key={i} className="w-3 h-3 text-[#A67C52]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </Accordion>

      {/* ── AVAILABILITY TOGGLES ── */}
      <Accordion title="Availability" defaultOpen={false} badge={(onSaleOnly ? 1 : 0) + (inStockOnly ? 1 : 0) + (hasPhoto ? 1 : 0)}>
        <div className="flex flex-col divide-y divide-[#1B342B]/8">
          <ToggleRow label="In Stock Only"          on={inStockOnly} onToggle={() => setInStockOnly(!inStockOnly)} />
          <ToggleRow label="On Sale Only"           on={onSaleOnly}  onToggle={() => setOnSaleOnly(!onSaleOnly)} />
          <ToggleRow label="Has Product Photo"      on={hasPhoto}    onToggle={() => setHasPhoto(!hasPhoto)} />
        </div>
      </Accordion>

    </div>
  );

  /* ═══════════════════════════════════════════ */
  /* PAGE                                        */
  /* ═══════════════════════════════════════════ */
  return (
    <section className="min-h-screen bg-[#FDFBF7] w-full pb-24 relative pt-32">

      {/* ── CART TOAST ── */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${cartNotification ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-[#1B342B] text-[#FDFBF7] px-8 py-4 rounded-sm shadow-2xl flex items-center space-x-4 border border-[#FDFBF7]/10">
          <svg className="w-4 h-4 text-[#A67C52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold">{cartNotification}</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">

        {/* ── EDITORIAL HEADER ── */}
        <div className="mb-16 border-b border-[#1B342B]/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#1B342B]/40 mb-4 flex items-center">
              <Link href="/" className="hover:text-[#A67C52] transition-colors">Home</Link>
              <span className="mx-3">—</span>
              <span className="text-[#1B342B]">The Boutique</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#1B342B] tracking-tight">
              Curated <span className="italic font-light text-[#A67C52]">Essentials</span>
            </h1>
          </div>
          <p className="text-[#1B342B]/60 text-sm italic font-serif max-w-sm mt-4 md:mt-0 md:text-right">
            Professional-grade, organically sourced henna crafted for the world's most discerning artists.
          </p>
        </div>

        {/* ── LOADING ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 w-full">
            <div className="w-8 h-8 border-2 border-[#1B342B]/20 border-t-[#A67C52] rounded-full animate-spin mb-4" />
            <p className="text-[#1B342B]/50 font-serif italic text-lg">Curating the boutique...</p>
          </div>
        ) : (
          <>
            {/* ── TOP BAR ── */}
            <div className="flex justify-between items-center mb-10">
              {/* Mobile filter button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="text-[#1B342B] text-[10px] uppercase tracking-[0.2em] font-bold flex items-center border border-[#1B342B]/20 px-5 py-2.5 rounded-sm hover:border-[#1B342B] transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
                </button>
              </div>

              {/* Desktop result count */}
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm font-serif italic text-[#1B342B]/60">
                  Showing {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
                </span>
                {activeFilters.length > 0 && (
                  <span className="text-[9px] text-[#A67C52] font-bold uppercase tracking-widest">
                    · {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} active
                  </span>
                )}
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-3">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B342B]/50 hidden sm:block">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[#1B342B] text-xs font-bold uppercase tracking-widest focus:outline-none cursor-pointer border-b border-[#1B342B]/20 pb-1 appearance-none pr-4"
                  style={{
                    backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,<svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="%231B342B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right center',
                  }}
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="top-rated">Top Rated</option>
                  <option value="in-stock">In Stock First</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start">

              {/* ── DESKTOP SIDEBAR ── */}
              <div className="hidden md:block w-72 shrink-0 pr-16 sticky top-32">
                <FilterPanel />
              </div>

              {/* ── MOBILE DRAWER ── */}
              {isMobileFilterOpen && (
                <div
                  className="fixed inset-0 bg-[#1B342B]/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
                  onClick={() => setIsMobileFilterOpen(false)}
                />
              )}
              <div className={`fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#FDFBF7] z-50 transform transition-transform duration-500 ease-in-out md:hidden flex flex-col shadow-2xl ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-[#1B342B]/10 flex justify-between items-center bg-[#FDFBF7]">
                  <h3 className="text-lg font-serif text-[#1B342B]">Refine Collection</h3>
                  <button onClick={() => setIsMobileFilterOpen(false)} className="text-[#1B342B]/40 hover:text-[#1B342B] transition-colors p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <FilterPanel />
                </div>
                <div className="p-6 border-t border-[#1B342B]/10 bg-[#FDFBF7]">
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full bg-[#1B342B] text-[#FDFBF7] py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#A67C52] transition-colors shadow-lg"
                  >
                    View {filteredProducts.length} Results
                  </button>
                </div>
              </div>

              {/* ── PRODUCT GRID ── */}
              <div className="flex-1 w-full">

                {/* Skeleton loading */}
                {isLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
                  </div>
                )}

                {!isLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    {filteredProducts.map((product) => {
                      const hoverImg = product.gallery_images?.length > 1 ? product.gallery_images[1] : null;
                      const wishlisted = wishlist.includes(product.id);
                      const adding = addingId === product.id;

                      return (
                        <Link
                          href={`/shop/${product.id}`}
                          key={product.id}
                          className="flex flex-col group cursor-pointer relative"
                        >
                          {/* Image Box */}
                          <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1B342B]/5 mb-5 shadow-sm group-hover:shadow-2xl transition-all duration-700">

                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className={`object-cover transition-opacity duration-700 ${!product.in_stock ? 'opacity-60 grayscale' : ''} ${hoverImg ? 'group-hover:opacity-0' : ''}`}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-10 h-10 text-[#1B342B]/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}

                            {hoverImg && (
                              <Image
                                src={hoverImg}
                                alt={`${product.name} alternative view`}
                                fill
                                className={`absolute inset-0 object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform group-hover:scale-105 ${!product.in_stock ? 'grayscale' : ''}`}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            )}

                            {/* Wishlist */}
                            <button
                              onClick={(e) => toggleWishlist(e, product.id)}
                              className={`absolute top-4 right-4 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-500 ${wishlisted ? 'bg-[#1B342B] text-white opacity-100' : 'bg-white/80 text-[#1B342B] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:text-[#A67C52]'}`}
                            >
                              <svg className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>

                            {/* Tag */}
                            {product.tag && product.in_stock && (
                              <div className="absolute top-4 left-4 z-10">
                                <span className="bg-white/95 text-[#1B342B] px-3 py-1 text-[9px] uppercase tracking-widest font-bold shadow-sm rounded-sm">
                                  {product.tag}
                                </span>
                              </div>
                            )}

                            {/* Sold Out */}
                            {!product.in_stock && (
                              <div className="absolute top-4 left-4 z-10">
                                <span className="bg-[#1B342B]/80 text-[#FDFBF7] px-3 py-1 text-[9px] uppercase tracking-widest font-bold shadow-sm backdrop-blur-sm">
                                  Sold Out
                                </span>
                              </div>
                            )}

                            {/* Quick Add */}
                            <div className={`absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out ${!product.in_stock ? 'hidden' : ''}`}>
                              <button
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={adding}
                                className="w-full bg-[#FDFBF7]/95 backdrop-blur-sm border border-[#1B342B]/10 text-[#1B342B] py-4 rounded-sm hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-colors duration-300 uppercase text-[10px] tracking-[0.2em] font-bold shadow-xl disabled:opacity-60"
                              >
                                {adding ? (
                                  <span className="flex items-center justify-center space-x-2">
                                    <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                    <span>Adding...</span>
                                  </span>
                                ) : 'Quick Add'}
                              </button>
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex flex-col text-left px-2">
                            <h3 className="text-base font-serif text-[#1B342B] mb-1 group-hover:text-[#A67C52] transition-colors duration-300 line-clamp-1">
                              {product.name}
                            </h3>

                            {/* Stain color swatch */}
                            {product.stain_color && (
                              <div className="flex items-center space-x-2 mb-2">
                                <div
                                  className="w-2.5 h-2.5 rounded-full border border-[#1B342B]/20 shadow-inner shrink-0"
                                  style={{ backgroundColor: colorSwatches[product.stain_color] || '#5C3A21' }}
                                />
                                <span className="text-[#1B342B]/50 text-[10px] uppercase tracking-widest">
                                  {product.stain_color}
                                </span>
                              </div>
                            )}

                            <p className="text-[#1B342B]/60 text-xs font-light mb-3 truncate">
                              {product.description}
                            </p>

                            <div className="flex items-center space-x-3 mt-auto">
                              <span className="text-[#1B342B] font-medium text-sm tracking-wide">
                                ${product.price.toFixed(2)}
                              </span>
                              {!product.in_stock && (
                                <span className="text-[9px] text-[#A67C52]/80 uppercase tracking-widest font-bold">
                                  Notify Me
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Empty state */}
                {!isLoading && filteredProducts.length === 0 && (
                  <div className="py-32 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border border-[#1B342B]/10 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-6 h-6 text-[#1B342B]/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-[#1B342B] font-serif text-2xl mb-3">No Essentials Found</p>
                    <p className="text-[#1B342B]/50 text-sm max-w-md mb-8">
                      Try adjusting your filters to discover more of our premium collection.
                    </p>
                    <button
                      onClick={clearAll}
                      className="border border-[#1B342B]/20 px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-[#1B342B] hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-all duration-300"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}

                {/* Footer */}
                {!isLoading && filteredProducts.length > 0 && (
                  <div className="mt-24 flex flex-col items-center justify-center border-t border-[#1B342B]/10 pt-16">
                    <p className="text-xs font-serif italic text-[#1B342B]/50 mb-6">
                      Viewing {filteredProducts.length} of {products.length} pieces
                    </p>
                    {filteredProducts.length < products.length && (
                      <button
                        onClick={clearAll}
                        className="border border-[#1B342B]/20 bg-transparent text-[#1B342B] px-12 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:border-[#1B342B] hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-all duration-500 shadow-sm"
                      >
                        Show All Products
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}