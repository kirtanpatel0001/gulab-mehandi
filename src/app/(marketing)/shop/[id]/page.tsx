// src/app/(marketing)/shop/[id]/page.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'; // ✅ Added imports

/* ─── Types ─── */
type Product = {
  id: string;
  name: string;
  description: string;
  long_description: string;
  price: number;
  tag: string | null;
  in_stock: boolean;
  image_url: string;
  gallery_images: string[];
  weight_volume: string | null;
  stain_color: string | null;
  shelf_life: string | null;
  ingredients: string | null;
  how_to_use: string | null;
  created_at: string;
};

type Review = {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  image_url: string | null;
  created_at: string;
};

/* ─── Colour map ─── */
const STAIN_HEX: Record<string, string> = {
  "Deep Burgundy": "#4A0404",
  "Crimson Red": "#8B0000",
  "Natural Brown": "#5C3A21",
  "Midnight Black": "#1A1A1A",
  "Clear (Aftercare)": "#D4C5A9",
  "Deep Mahogany": "#4E1C0C",
  "Auburn": "#922724",
  "Terracotta": "#C45C3A",
};

/* ─── Mehndi design SVG accent ─── */
function MandalaAccent({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 3" />
      <circle cx="60" cy="60" r="42" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="60" cy="60" r="28" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx="60" cy="60" r="6" fill="currentColor" fillOpacity="0.4" />
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 60 + 28 * Math.cos(rad);
        const y1 = 60 + 28 * Math.sin(rad);
        const x2 = 60 + 54 * Math.cos(rad);
        const y2 = 60 + 54 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.5" />;
      })}
      {[0,60,120,180,240,300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 60 + 42 * Math.cos(rad);
        const cy = 60 + 42 * Math.sin(rad);
        return <circle key={i} cx={cx} cy={cy} r="3" stroke="currentColor" strokeWidth="0.5" fill="currentColor" fillOpacity="0.2" />;
      })}
    </svg>
  );
}

/* ─── Paisley divider ─── */
function PaisleyDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#A67C52]/30" />
      <MandalaAccent className="w-8 h-8 text-[#A67C52]/40" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#A67C52]/30" />
    </div>
  );
}

/* ─── Stars ─── */
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`${sz} transition-colors ${i <= rating ? 'text-[#A67C52]' : 'text-[#1B342B]/12'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

/* ─── Accordion ─── */
function Accordion({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#1B342B]/8 last:border-none">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-5 text-left group">
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1B342B]/70 group-hover:text-[#A67C52] transition-colors">{title}</span>
        <span className={`text-[#A67C52] transition-transform duration-300 ${open ? 'rotate-45' : 'rotate-0'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4"/></svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-400 ${open ? 'max-h-[600px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
}

/* ─── Loading skeleton ─── */
function PageSkeleton() {
  return (
    <section className="min-h-screen bg-[#FDFBF7] pt-28 pb-24">
      <div className="max-w-[1300px] mx-auto px-6 md:px-12 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-20">
          <div className="w-full lg:w-[52%] aspect-[3/4] bg-[#1B342B]/6 rounded-sm" />
          <div className="w-full lg:w-[48%] space-y-8 pt-8">
            <div className="h-3 bg-[#A67C52]/20 rounded w-1/4" />
            <div className="h-14 bg-[#1B342B]/8 rounded w-4/5" />
            <div className="h-4 bg-[#1B342B]/5 rounded w-3/5" />
            <div className="h-12 bg-[#1B342B]/8 rounded w-1/3" />
            <div className="h-16 bg-[#1B342B]/6 rounded" />
            <div className="h-16 bg-[#A67C52]/10 rounded" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  /* ─── Supabase Stable Singleton ─── */
  const supabase = getSupabaseClient(); // ✅ Direct call, no useRef

  /* ─── State ─── */
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description'|'details'|'reviews'>('description');
  const [mainImage, setMainImage] = useState('');
  const [zoomImg, setZoomImg] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [cartMsg, setCartMsg] = useState('');
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);

  /* ─── Reviews ─── */
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverStar, setHoverStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [imgFile, setImgFile] = useState<File | null>(null);

  /* ─── Auth ─── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => { // ✅ Added type
      setUser(user);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: AuthChangeEvent, s: Session | null) => { // ✅ Added type
      setUser(s?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  /* ─── Fetch product + related ─── */
  useEffect(() => {
    if (!productId) return;
    (async () => {
      setProductLoading(true);
      const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
      if (error || !data) { router.push('/shop'); return; }
      setProduct(data as Product);
      setMainImage(data.image_url || data.gallery_images?.[0] || '');

      // 8 related for 2-row grid of 4
      const { data: rel } = await supabase
        .from('products')
        .select('id,name,price,image_url,in_stock,stain_color,gallery_images,tag,description')
        .neq('id', productId)
        .order('created_at', { ascending: false })
        .limit(8);
      if (rel) setRelated(rel as Product[]);
      setProductLoading(false);
    })();
  }, [productId, supabase, router]);

  /* ─── Reviews on tab switch ─── */
  useEffect(() => {
    if (activeTab !== 'reviews' || reviews.length > 0) return;
    (async () => {
      setReviewsLoading(true);
      const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(20);
      if (data) setReviews(data as Review[]);
      setReviewsLoading(false);
    })();
  }, [activeTab, supabase, reviews.length]);

  /* ─── Add to cart ─── */
  const handleAddToCart = useCallback(async () => {
    if (authLoading) return;
    if (!user) { setCartMsg('Please sign in to add items to your bag.'); setTimeout(() => setCartMsg(''), 3500); return; }
    if (!product?.in_stock || isAdding) return;
    setIsAdding(true);
    try {
      const { data: ex } = await supabase.from('cart_items').select('id,quantity').eq('user_id', user.id).eq('product_id', product.id).maybeSingle();
      if (ex) await supabase.from('cart_items').update({ quantity: ex.quantity + quantity }).eq('id', ex.id);
      else await supabase.from('cart_items').insert([{ user_id: user.id, product_id: product.id, quantity }]);
      window.dispatchEvent(new Event('cartUpdated'));
      setAddedToBag(true);
      setCartMsg(`${quantity}× ${product.name} added to your bag.`);
      setTimeout(() => { setCartMsg(''); setAddedToBag(false); }, 3000);
    } catch { /* silent */ } finally { setIsAdding(false); }
  }, [user, authLoading, product, quantity, isAdding, supabase]);

  /* ─── Submit review ─── */
  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    let imgUrl: string | null = null;
    if (imgFile && imgFile.size <= 5 * 1024 * 1024) {
      const cfd = new FormData();
      cfd.append('file', imgFile);
      cfd.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      try {
        const r = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: cfd });
        const j = await r.json();
        if (j.secure_url) imgUrl = j.secure_url;
      } catch { /* skip */ }
    }
    const { data: inserted, error } = await supabase.from('reviews').insert([{
      name: fd.get('name'), location: fd.get('location'), quote: fd.get('quote'),
      rating: reviewRating, image_url: imgUrl,
    }]).select().single();
    if (!error && inserted) {
      setReviews(p => [inserted as Review, ...p]);
      setModalOpen(false);
      setReviewRating(5);
      setImgFile(null);
      (e.target as HTMLFormElement).reset();
    }
    setSubmitting(false);
  };

  if (productLoading) return <PageSkeleton />;
  if (!product) return null;

  const allImages = product.gallery_images?.length ? product.gallery_images : (product.image_url ? [product.image_url] : []);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : null;
  const stainHex = product.stain_color ? (STAIN_HEX[product.stain_color] || '#5C3A21') : null;

  /* ═══════════════════════════════════════════════════════ */
  return (
    <section className="min-h-screen bg-[#FDFBF7] pb-32 relative">

      {/* ═══════ DECORATIVE HEADER STRIP ═══════ */}
      <div className="w-full h-1 bg-gradient-to-r from-[#1B342B] via-[#A67C52] to-[#1B342B]" />

      {/* ═══════ CART TOAST ═══════ */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ${cartMsg ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'}`}>
        <div className="bg-[#1B342B] text-[#FDFBF7] pl-4 pr-6 py-3 shadow-2xl flex items-center gap-3 border-l-4 border-[#A67C52]">
          <div className="w-6 h-6 rounded-full bg-[#A67C52] flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold">{cartMsg}</span>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-6 md:px-12 pt-10 md:pt-14">

        {/* BREADCRUMB */}
        <div className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#1B342B]/35 mb-10 flex items-center gap-3 flex-wrap">
          <Link href="/" className="hover:text-[#A67C52] transition-colors">Home</Link>
          <span className="text-[#A67C52]">✦</span>
          <Link href="/shop" className="hover:text-[#A67C52] transition-colors">The Boutique</Link>
          <span className="text-[#A67C52]">✦</span>
          <span className="text-[#1B342B]/60 truncate max-w-[220px]">{product.name}</span>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* HERO: GALLERY + PURCHASE                  */}
        {/* ═══════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row gap-14 xl:gap-24 mb-36 items-start">

          {/* ─── GALLERY ─── */}
          <div className="w-full lg:w-[52%] flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-28 shrink-0">

            {/* Thumbnails strip */}
            {allImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 md:w-[88px] shrink-0">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`relative shrink-0 h-24 md:h-28 w-20 md:w-full overflow-hidden transition-all duration-300 ${mainImage === img ? 'ring-2 ring-[#1B342B] ring-offset-2' : 'opacity-60 hover:opacity-100 hover:ring-1 hover:ring-[#A67C52]/50 hover:ring-offset-1'}`}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="88px" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div
              className="relative flex-1 aspect-[3/4] bg-[#F5EFE6] overflow-hidden cursor-zoom-in shadow-xl shadow-[#1B342B]/10 group"
              onClick={() => setZoomImg(true)}
            >
              {mainImage && (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 52vw"
                />
              )}

              {/* Sold-out veil */}
              {!product.in_stock && (
                <div className="absolute inset-0 bg-[#FDFBF7]/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                  <MandalaAccent className="w-16 h-16 text-[#1B342B]/20" />
                  <span className="bg-[#1B342B] text-[#FDFBF7] px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-bold">Sold Out</span>
                </div>
              )}

              {/* Tag ribbon */}
              {product.tag && product.in_stock && (
                <div className="absolute top-0 left-0 z-10">
                  <div className="bg-[#A67C52] text-[#FDFBF7] text-[9px] uppercase tracking-[0.2em] font-bold px-5 py-2">{product.tag}</div>
                </div>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold text-[#1B342B]/60 flex items-center gap-1.5 shadow-sm">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                  Zoom
                </div>
              </div>
            </div>
          </div>

          {/* ─── PURCHASE PANEL ─── */}
          <div className="w-full lg:w-[48%] flex flex-col lg:pt-2">

            {/* Tag pill */}
            {product.tag && (
              <div className="flex items-center gap-2 mb-5">
                <MandalaAccent className="w-5 h-5 text-[#A67C52]/60" />
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#A67C52]">{product.tag}</span>
              </div>
            )}

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-serif text-[#1B342B] tracking-tight leading-[1.05] mb-4">
              {product.name}
            </h1>
            <p className="font-serif italic text-[#1B342B]/55 text-base leading-relaxed mb-6">{product.description}</p>

            {/* Live rating bar */}
            {avgRating !== null && (
              <button onClick={() => setActiveTab('reviews')} className="flex items-center gap-3 mb-7 group w-fit">
                <Stars rating={Math.round(avgRating)} />
                <span className="text-xs font-bold text-[#1B342B]/50 group-hover:text-[#A67C52] transition-colors tabular-nums">{avgRating.toFixed(1)}</span>
                <span className="text-[10px] text-[#1B342B]/30 uppercase tracking-widest group-hover:text-[#A67C52] transition-colors">
                  ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </button>
            )}

            {/* Price block */}
            <div className="flex items-baseline gap-5 mb-8 pb-8 border-b border-[#1B342B]/10">
              <span className="text-4xl font-serif text-[#1B342B] tabular-nums">${product.price.toFixed(2)}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1B342B]/30">USD · Free shipping $75+</span>
            </div>

            {/* Quick specs grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {stainHex && product.stain_color && (
                <div className="bg-white border border-[#1B342B]/8 p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-md shrink-0" style={{ backgroundColor: stainHex }} />
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#1B342B]/40 mb-0.5">Stain</p>
                    <p className="text-xs font-bold text-[#1B342B]">{product.stain_color}</p>
                  </div>
                </div>
              )}
              {product.weight_volume && (
                <div className="bg-white border border-[#1B342B]/8 p-4">
                  <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#1B342B]/40 mb-1">Size / Weight</p>
                  <p className="text-xs font-bold text-[#1B342B]">{product.weight_volume}</p>
                </div>
              )}
              {product.shelf_life && (
                <div className="bg-white border border-[#1B342B]/8 p-4">
                  <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#1B342B]/40 mb-1">Shelf Life</p>
                  <p className="text-xs font-bold text-[#1B342B]">{product.shelf_life}</p>
                </div>
              )}
              <div className="bg-white border border-[#1B342B]/8 p-4">
                <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#1B342B]/40 mb-1">Availability</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${product.in_stock ? 'bg-emerald-500' : 'bg-[#A67C52]'}`} />
                  <p className="text-xs font-bold text-[#1B342B]">{product.in_stock ? 'In Stock' : 'Sold Out'}</p>
                </div>
              </div>
            </div>

            {/* Quantity + CTA */}
            <div className="flex flex-col gap-3 mb-5">
              <div className="flex gap-3">
                {/* Qty */}
                <div className="flex items-center border border-[#1B342B]/15 bg-white h-14 w-36 shrink-0">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center text-[#1B342B]/60 hover:text-[#1B342B] hover:bg-[#1B342B]/5 transition-colors text-xl font-light">−</button>
                  <span className="flex-1 text-center font-bold text-[#1B342B] tabular-nums">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center text-[#1B342B]/60 hover:text-[#1B342B] hover:bg-[#1B342B]/5 transition-colors text-xl font-light">+</button>
                </div>

                {/* Add to bag */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || isAdding}
                  className={`flex-1 h-14 text-[10px] uppercase tracking-[0.25em] font-bold transition-all duration-300 flex items-center justify-center gap-3
                    ${product.in_stock
                      ? addedToBag
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#1B342B] text-[#FDFBF7] hover:bg-[#A67C52] shadow-lg shadow-[#1B342B]/20'
                      : 'bg-[#1B342B]/8 text-[#1B342B]/30 cursor-not-allowed'
                    }`}
                >
                  {isAdding ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Adding…</span></>
                  ) : addedToBag ? (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg><span>Added!</span></>
                  ) : product.in_stock ? (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg><span>Add to Bag</span></>
                  ) : 'Out of Stock'}
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className={`w-14 h-14 border flex items-center justify-center shrink-0 transition-all duration-300 ${wishlisted ? 'bg-[#1B342B] border-[#1B342B] text-[#FDFBF7]' : 'border-[#1B342B]/15 text-[#1B342B]/40 hover:border-[#1B342B] hover:text-[#1B342B]'}`}
                >
                  <svg className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>
              </div>

              {/* Sign in nudge */}
              {!authLoading && !user && (
                <p className="text-xs text-[#A67C52]/80 font-medium">
                  <Link href="/login" className="underline underline-offset-4 hover:text-[#A67C52]">Sign in</Link> to add items to your bag.
                </p>
              )}
            </div>

            {/* Mehndi trust strip */}
            <div className="bg-gradient-to-br from-[#F5EFE6] to-[#FDFBF7] border border-[#A67C52]/15 p-5 space-y-3.5">
              {[
                { path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", text: "100% Organic — Zero PPD, Zero Chemicals" },
                { path: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", text: "Ships frozen — freshness guaranteed" },
                { path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", text: "Deep stain in 48 hrs · 6-month freezer life" },
                { path: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", text: "30-day satisfaction guarantee" },
              ].map(({ path, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#A67C52]/10 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#A67C52]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path}/></svg>
                  </div>
                  <span className="text-xs text-[#1B342B]/65 font-medium">{text}</span>
                </div>
              ))}
            </div>

            {/* Application guide mini-banner */}
            <div className="mt-4 border border-[#1B342B]/10 p-4 flex items-center gap-4 bg-white">
              <MandalaAccent className="w-10 h-10 text-[#A67C52]/30 shrink-0" />
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#A67C52] mb-0.5">Application Guide</p>
                <p className="text-xs text-[#1B342B]/60 font-light leading-relaxed">
                  Apply on clean, dry skin. Leave paste on <strong className="font-semibold text-[#1B342B]/70">4–8 hours</strong> for deepest colour. Seal with lemon-sugar for best results.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* DECORATIVE SECTION BREAK                               */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-center gap-6 mb-16">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#A67C52]/30 to-[#A67C52]/30" />
          <MandalaAccent className="w-12 h-12 text-[#A67C52]/25" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#A67C52]/30 to-[#A67C52]/30" />
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TABS                                                    */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="mb-36">
          {/* Tab bar */}
          <div className="flex justify-center border-b border-[#1B342B]/10 mb-16 gap-0">
            {(['description','details','reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-8 md:px-14 pb-5 pt-2 text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold transition-all duration-300 ${
                  activeTab === tab
                    ? 'text-[#A67C52]'
                    : 'text-[#1B342B]/35 hover:text-[#1B342B]/60'
                }`}
              >
                {tab}
                {tab === 'reviews' && reviews.length > 0 && (
                  <span className="ml-2 bg-[#A67C52]/15 text-[#A67C52] text-[8px] px-1.5 py-0.5 rounded-full font-extrabold">
                    {reviews.length}
                  </span>
                )}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#A67C52]" />
                )}
                <span className={`absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#A67C52] transition-transform duration-300 ${activeTab === tab ? 'scale-x-100' : 'scale-x-0'}`} />
              </button>
            ))}
          </div>

          {/* ─── DESCRIPTION ─── */}
          {activeTab === 'description' && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#A67C52] block mb-4">The Artistry</span>
                <h3 className="text-4xl font-serif text-[#1B342B] italic mb-8">
                  {product.long_description ? 'Crafted With Intention' : 'The Essence Within'}
                </h3>
                <PaisleyDivider />
              </div>
              <p className="text-[#1B342B]/70 font-serif text-lg leading-loose text-center mt-10">
                {product.long_description || product.description}
              </p>

              {/* Mehndi ritual steps */}
              <div className="mt-16 grid grid-cols-3 gap-px bg-[#1B342B]/8">
                {[
                  { step: "01", label: "Prepare", detail: "Clean, dry skin for maximum absorption" },
                  { step: "02", label: "Apply", detail: "Work from centre outward for even coverage" },
                  { step: "03", label: "Seal", detail: "Lemon-sugar mix locks the design and deepens stain" },
                ].map(({ step, label, detail }) => (
                  <div key={step} className="bg-[#FDFBF7] p-8 text-center group hover:bg-[#F5EFE6] transition-colors duration-300">
                    <div className="text-[9px] uppercase tracking-[0.3em] font-extrabold text-[#A67C52]/60 mb-3">{step}</div>
                    <div className="font-serif text-lg text-[#1B342B] mb-2">{label}</div>
                    <div className="text-xs text-[#1B342B]/50 font-light leading-relaxed">{detail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── DETAILS ─── */}
          {activeTab === 'details' && (
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
                <div>
                  {product.ingredients && (
                    <Accordion title="Full Ingredients">
                      <p className="text-[#1B342B]/65 text-sm leading-relaxed font-light whitespace-pre-line">{product.ingredients}</p>
                    </Accordion>
                  )}
                  {product.stain_color && (
                    <Accordion title="Stain Result">
                      <div className="flex items-center gap-3">
                        {stainHex && <div className="w-8 h-8 rounded-full shadow-md border-2 border-white" style={{ backgroundColor: stainHex }} />}
                        <p className="text-[#1B342B]/65 text-sm font-light">{product.stain_color}</p>
                      </div>
                    </Accordion>
                  )}
                  {product.weight_volume && (
                    <Accordion title="Weight & Volume">
                      <p className="text-[#1B342B]/65 text-sm font-light">{product.weight_volume}</p>
                    </Accordion>
                  )}
                </div>
                <div>
                  {product.how_to_use && (
                    <Accordion title="How To Use">
                      <p className="text-[#1B342B]/65 text-sm leading-relaxed font-light whitespace-pre-line">{product.how_to_use}</p>
                    </Accordion>
                  )}
                  {product.shelf_life && (
                    <Accordion title="Storage & Shelf Life">
                      <p className="text-[#1B342B]/65 text-sm leading-relaxed font-light">{product.shelf_life}</p>
                    </Accordion>
                  )}
                  <Accordion title="Shipping Policy">
                    <p className="text-[#1B342B]/65 text-sm leading-relaxed font-light">
                      All perishable items ship Monday–Tuesday only, ensuring no weekend transit. Ships frozen — thaw 20 minutes at room temperature before use.
                    </p>
                  </Accordion>
                  <Accordion title="PPD-Free Promise" defaultOpen={false}>
                    <p className="text-[#1B342B]/65 text-sm leading-relaxed font-light">
                      We never use para-phenylenediamine (PPD) or any synthetic accelerants. Every cone is safe for sensitive skin and patch-tested by professional artists worldwide.
                    </p>
                  </Accordion>
                </div>
              </div>
            </div>
          )}

          {/* ─── REVIEWS ─── */}
          {activeTab === 'reviews' && (
            <div className="max-w-3xl mx-auto">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-14 gap-6">
                <div>
                  {avgRating !== null ? (
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-7xl font-serif text-[#1B342B] tabular-nums leading-none">{avgRating.toFixed(1)}</div>
                        <Stars rating={Math.round(avgRating)} size="lg" />
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#1B342B]/40 font-bold mt-2">{reviews.length} reviews</p>
                      </div>
                      {/* Distribution */}
                      <div className="flex-1 space-y-1.5">
                        {[5,4,3,2,1].map(star => {
                          const count = reviews.filter(r => r.rating === star).length;
                          const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-[#1B342B]/50 w-3">{star}</span>
                              <svg className="w-3 h-3 text-[#A67C52] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                              <div className="flex-1 h-1.5 bg-[#1B342B]/8 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#A67C52] to-[#C49A6C] rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[9px] text-[#1B342B]/30 w-5 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="font-serif text-2xl text-[#1B342B] mb-2">Be the first to review.</p>
                      <p className="text-sm text-[#1B342B]/45 font-light">Your experience helps other artists choose wisely.</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="border-2 border-[#1B342B] text-[#1B342B] px-8 py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-all duration-300 shrink-0 group"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    Write a Review
                  </span>
                </button>
              </div>

              {/* Skeleton */}
              {reviewsLoading && (
                <div className="space-y-6">
                  {[...Array(3)].map((_,i) => (
                    <div key={i} className="animate-pulse bg-white border border-[#1B342B]/8 p-8">
                      <div className="flex gap-1 mb-4">{[...Array(5)].map((_,j) => <div key={j} className="w-4 h-4 bg-[#1B342B]/8 rounded"/>)}</div>
                      <div className="space-y-2"><div className="h-4 bg-[#1B342B]/6 rounded w-full"/><div className="h-4 bg-[#1B342B]/4 rounded w-3/4"/></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Review cards */}
              {!reviewsLoading && reviews.length > 0 && (
                <div className="space-y-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-white border border-[#1B342B]/8 p-8 hover:border-[#A67C52]/30 hover:shadow-lg transition-all duration-400 group">
                      <div className="flex justify-between items-start mb-5">
                        <Stars rating={rev.rating} />
                        <span className="text-[9px] text-[#1B342B]/30 uppercase tracking-widest font-bold">
                          {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>

                      {rev.image_url && (
                        <div className="relative w-full h-52 mb-6 overflow-hidden bg-[#F5EFE6]">
                          <Image src={rev.image_url} alt={`Review by ${rev.name}`} fill className="object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
                        </div>
                      )}

                      <div className="relative">
                        <svg className="absolute -top-1 -left-1 w-6 h-6 text-[#A67C52]/20" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                        <p className="text-[#1B342B]/75 font-serif text-base leading-loose italic pl-6 pr-2">
                          {rev.quote}
                        </p>
                      </div>

                      <div className="border-t border-[#1B342B]/6 mt-6 pt-5 flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-bold text-[#1B342B] uppercase tracking-[0.15em]">{rev.name}</span>
                          <span className="text-[10px] text-[#A67C52] uppercase tracking-widest font-medium">{rev.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-emerald-700 font-bold">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                          Verified
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* RECOMMENDATIONS — 2 rows × 4 columns                  */}
        {/* ═══════════════════════════════════════════════════════ */}
        {related.length > 0 && (
          <div className="border-t border-[#1B342B]/10 pt-28">

            {/* Section header */}
            <div className="text-center mb-16">
              <MandalaAccent className="w-14 h-14 text-[#A67C52]/20 mx-auto mb-6" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#A67C52] block mb-4">Complete The Ritual</span>
              <h3 className="text-4xl md:text-5xl font-serif text-[#1B342B] italic">You May Also Love</h3>
              <PaisleyDivider />
            </div>

            {/* 2 rows × 4 columns grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
              {related.slice(0, 8).map((rec) => {
                const hoverImg = rec.gallery_images?.length > 1 ? rec.gallery_images[1] : null;
                return (
                  <Link
                    href={`/shop/${rec.id}`}
                    key={rec.id}
                    className="flex flex-col group cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5EFE6] mb-3.5 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                      {rec.image_url && (
                        <Image
                          src={rec.image_url}
                          alt={rec.name}
                          fill
                          className={`object-cover transition-all duration-700 ${!rec.in_stock ? 'grayscale opacity-50' : ''} ${hoverImg ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      )}
                      {hoverImg && (
                        <Image
                          src={hoverImg}
                          alt={`${rec.name} alt`}
                          fill
                          className="absolute inset-0 object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      )}

                      {/* Tag */}
                      {rec.tag && rec.in_stock && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-[#A67C52] text-[#FDFBF7] px-2.5 py-1 text-[8px] uppercase tracking-widest font-bold">{rec.tag}</span>
                        </div>
                      )}
                      {!rec.in_stock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-[#1B342B]/75 text-[#FDFBF7] px-4 py-1.5 text-[8px] uppercase tracking-widest font-bold backdrop-blur-sm">Sold Out</span>
                        </div>
                      )}

                      {/* Quick add on hover */}
                      {rec.in_stock && (
                        <div className="absolute bottom-0 left-0 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out p-3">
                          <div className="bg-white/95 text-[#1B342B] text-[9px] uppercase tracking-widest font-bold py-2.5 text-center backdrop-blur-sm border border-[#1B342B]/10 hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-colors duration-200">
                            View Product
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <h4 className="text-sm font-serif text-[#1B342B] group-hover:text-[#A67C52] transition-colors duration-300 line-clamp-1 mb-1 px-0.5">
                      {rec.name}
                    </h4>
                    {rec.stain_color && (
                      <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
                        <div className="w-2 h-2 rounded-full border border-[#1B342B]/15 shrink-0" style={{ backgroundColor: STAIN_HEX[rec.stain_color] || '#5C3A21' }} />
                        <span className="text-[9px] text-[#1B342B]/40 uppercase tracking-widest">{rec.stain_color}</span>
                      </div>
                    )}
                    <span className="text-sm font-semibold text-[#1B342B] px-0.5">${rec.price.toFixed(2)}</span>
                  </Link>
                );
              })}
            </div>

            {/* CTA to shop all */}
            <div className="flex justify-center mt-16">
              <Link
                href="/shop"
                className="group border border-[#1B342B]/20 px-12 py-4 text-[10px] uppercase tracking-[0.25em] font-bold text-[#1B342B] hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-all duration-400 flex items-center gap-3"
              >
                Explore Full Boutique
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* IMAGE ZOOM LIGHTBOX                                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      {zoomImg && mainImage && (
        <div
          className="fixed inset-0 bg-black/92 z-[70] flex items-center justify-center p-6 cursor-zoom-out backdrop-blur-sm"
          onClick={() => setZoomImg(false)}
        >
          <div className="relative w-full max-w-2xl aspect-[3/4]">
            <Image src={mainImage} alt="Zoomed" fill className="object-contain" sizes="100vw" />
          </div>
          <button className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* REVIEW MODAL                                            */}
      {/* ═══════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#FDFBF7] w-full max-w-xl relative max-h-[92vh] overflow-y-auto shadow-2xl">

            {/* Decorative top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#1B342B] via-[#A67C52] to-[#1B342B]" />

            <div className="p-8 md:p-12">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 text-[#1B342B]/30 hover:text-[#1B342B] hover:rotate-90 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>

              <div className="text-center mb-10">
                <MandalaAccent className="w-12 h-12 text-[#A67C52]/25 mx-auto mb-4" />
                <span className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#A67C52] block mb-3">Share Your Story</span>
                <h2 className="text-3xl font-serif text-[#1B342B]">Write a Review</h2>
              </div>

              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B342B]/50 block mb-2">Full Name *</label>
                    <input name="name" required placeholder="Priya Shah" className="w-full border border-[#1B342B]/12 bg-white p-3.5 text-sm text-[#1B342B] outline-none focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] placeholder:text-[#1B342B]/25" />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B342B]/50 block mb-2">City, Country *</label>
                    <input name="location" required placeholder="Dubai, UAE" className="w-full border border-[#1B342B]/12 bg-white p-3.5 text-sm text-[#1B342B] outline-none focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] placeholder:text-[#1B342B]/25" />
                  </div>
                </div>

                {/* Star picker */}
                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B342B]/50 block mb-3">Your Rating *</label>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star} type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverStar(star)}
                        onMouseLeave={() => setHoverStar(0)}
                        className="transition-all hover:scale-125"
                      >
                        <svg className={`w-9 h-9 transition-colors ${(hoverStar || reviewRating) >= star ? 'text-[#A67C52]' : 'text-[#1B342B]/12'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      </button>
                    ))}
                    <span className="text-xs text-[#1B342B]/40 ml-2 font-medium min-w-[80px]">
                      {['','Poor','Fair','Good','Very Good','Excellent'][hoverStar || reviewRating]}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B342B]/50 block mb-2">Your Experience *</label>
                  <textarea name="quote" required rows={4} placeholder="Tell us about the stain depth, consistency, or how your clients reacted…" className="w-full border border-[#1B342B]/12 bg-white p-3.5 text-sm text-[#1B342B] outline-none focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] resize-none placeholder:text-[#1B342B]/25" />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#1B342B]/50 flex justify-between mb-2">
                    <span>Add a Photo</span>
                    <span className="font-normal text-[#1B342B]/30 normal-case tracking-normal">Optional · Max 5MB</span>
                  </label>
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setImgFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-[#1B342B]/50 file:mr-4 file:py-2.5 file:px-5 file:border-0 file:text-[9px] file:font-bold file:uppercase file:tracking-[0.2em] file:bg-[#1B342B]/6 file:text-[#1B342B] hover:file:bg-[#1B342B]/12 cursor-pointer border border-[#1B342B]/12 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 bg-[#1B342B] text-[#FDFBF7] text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#A67C52] transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
                >
                  {submitting ? (
                    <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/><span>Publishing…</span></>
                  ) : (
                    <><MandalaAccent className="w-5 h-5 text-white/30"/><span>Publish Review</span></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}