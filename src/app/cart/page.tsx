"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const fetchCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }
    
    setUser(session.user);

    // Fetch cart items AND join the related product details
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product:products (
          id,
          name,
          price,
          image_url,
          stain_color,
          weight_volume
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true });

    if (data) setCartItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (cartId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return; // Use delete instead

    // Optimistic UI update for instant feel
    setCartItems(prev => prev.map(item => item.id === cartId ? { ...item, quantity: newQuantity } : item));

    await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', cartId);
  };

  const removeItem = async (cartId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== cartId));
    await supabase.from('cart_items').delete().eq('id', cartId);
  };

  // Calculations
  const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 15.00; // Free shipping over $100

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1B342B]/20 border-t-[#A67C52] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-serif text-[#1B342B] mb-4">Your Bag</h1>
        <p className="text-[#1B342B]/60 mb-8 text-sm max-w-md">Please log in to view your saved items and complete your purchase.</p>
        <Link href="/login" className="bg-[#1B342B] text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#A67C52] transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#FDFBF7] w-full pb-32 pt-12 md:pt-16">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        
        {/* BREADCRUMBS */}
        <div className="text-[8px] uppercase tracking-[0.3em] font-medium text-[#1B342B]/40 mb-12 flex items-center space-x-3">
          <Link href="/" className="hover:text-[#A67C52] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#A67C52] transition-colors">Boutique</Link>
          <span>/</span>
          <span className="text-[#1B342B]">Bag</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif text-[#1B342B] tracking-tight mb-16">Your Ritual Bag</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 border-t border-[#1B342B]/10">
            <p className="text-[#1B342B]/50 font-serif italic text-xl mb-8">Your bag is currently empty.</p>
            <Link href="/shop" className="border border-[#1B342B] text-[#1B342B] px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#1B342B] hover:text-white transition-colors">
              Continue Exploring
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start">
            
            {/* LEFT: CART ITEMS LIST */}
            <div className="w-full lg:w-[60%] flex flex-col">
              
              {/* Header Row */}
              <div className="hidden md:grid grid-cols-12 gap-4 border-b border-[#1B342B]/10 pb-4 mb-8 text-[9px] uppercase tracking-widest font-bold text-[#1B342B]/50">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              {/* Items */}
              {cartItems.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-[#1B342B]/10 pb-8 mb-8">
                  
                  {/* Image & Details */}
                  <div className="col-span-1 md:col-span-6 flex items-start space-x-6">
                    <Link href={`/shop/${item.product.id}`} className="relative w-24 h-32 bg-[#1B342B]/5 shrink-0 block group overflow-hidden">
                      <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    </Link>
                    <div className="flex flex-col pt-1">
                      <Link href={`/shop/${item.product.id}`} className="text-lg font-serif text-[#1B342B] hover:text-[#A67C52] transition-colors mb-2">
                        {item.product.name}
                      </Link>
                      <span className="text-xs text-[#1B342B]/60 mb-1">{item.product.stain_color}</span>
                      <span className="text-xs text-[#1B342B]/60 mb-4">{item.product.weight_volume}</span>
                      
                      <button onClick={() => removeItem(item.id)} className="text-[9px] uppercase tracking-widest font-bold text-[#1B342B]/40 hover:text-red-800 transition-colors text-left w-fit underline underline-offset-4">
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-1 md:col-span-3 flex justify-start md:justify-center">
                    <div className="flex items-center border border-[#1B342B]/20 w-28 h-10">
                      <button onClick={() => updateQuantity(item.id, item.quantity, -1)} className="w-8 h-full flex items-center justify-center text-[#1B342B] hover:bg-[#1B342B]/5 transition-colors">−</button>
                      <span className="flex-1 text-center text-xs font-bold text-[#1B342B]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity, 1)} className="w-8 h-full flex items-center justify-center text-[#1B342B] hover:bg-[#1B342B]/5 transition-colors">+</button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-1 md:col-span-3 text-left md:text-right font-serif text-[#1B342B] text-lg">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: ORDER SUMMARY (STICKY) */}
            <div className="w-full lg:w-[40%] bg-[#1B342B]/5 p-8 md:p-12 lg:sticky lg:top-32">
              <h2 className="text-2xl font-serif text-[#1B342B] border-b border-[#1B342B]/10 pb-6 mb-6">Order Summary</h2>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-[#1B342B]/70">Subtotal</span>
                <span className="text-sm font-serif text-[#1B342B]">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-[#1B342B]/70">Estimated Shipping</span>
                <span className="text-sm font-serif text-[#1B342B]">{shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}</span>
              </div>

              {shipping > 0 && (
                <p className="text-[10px] text-[#A67C52] font-medium tracking-wide mb-6">
                  Add ${(100 - subtotal).toFixed(2)} more to unlock complimentary shipping.
                </p>
              )}

              <div className="flex justify-between items-center border-t border-[#1B342B]/10 pt-6 mb-10">
                <span className="text-base font-bold text-[#1B342B] uppercase tracking-widest">Total</span>
                <span className="text-3xl font-serif text-[#1B342B]">${(subtotal + shipping).toFixed(2)}</span>
              </div>

              <button className="w-full bg-[#1B342B] text-[#FDFBF7] py-5 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#A67C52] transition-colors duration-300 shadow-xl mb-4">
                Secure Checkout
              </button>

              <div className="flex items-center justify-center space-x-2 text-[#1B342B]/40 mt-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                <span className="text-[9px] uppercase tracking-widest font-bold">Secure Encrypted Payment</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}