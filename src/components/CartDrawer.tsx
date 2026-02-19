"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  authLoading?: boolean; // ✅ NEW — tells drawer auth hasn't resolved yet
  cartItems: any[];
  isCartLoading: boolean;
  updateQuantity: (id: string, current: number, change: number) => void;
  removeItem: (id: string) => void;
  cartSubtotalUSD: number;
  formatPrice: (price: number) => string;
};

export default function CartDrawer({
  isOpen,
  onClose,
  user,
  authLoading = false,
  cartItems,
  isCartLoading,
  updateQuantity,
  removeItem,
  cartSubtotalUSD,
  formatPrice
}: CartDrawerProps) {
  const router = useRouter();

  // ✅ While auth is resolving, show a neutral spinner
  // This prevents the "Please Log In" flash on hard refresh for logged-in users
  const isResolvingAuth = authLoading && !user;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-[400px] bg-[#FDFBF7] z-50 transform transition-transform duration-500 ease-in-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="p-6 border-b border-[#1B342B]/10 flex justify-between items-center bg-white shrink-0">
          <h2 className="text-xl md:text-2xl font-serif text-[#1B342B] flex items-center tracking-wide">
            Your Cart
            {!isResolvingAuth && (
              <span className="ml-3 bg-[#1B342B]/5 text-[#1B342B] text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm font-semibold">
                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
              </span>
            )}
            {(isCartLoading && cartItems.length > 0) && (
              <span className="ml-3 w-3.5 h-3.5 border border-[#1B342B]/20 border-t-[#A67C52] rounded-full animate-spin" />
            )}
          </h2>
          <button onClick={onClose} className="text-[#1B342B]/40 hover:text-[#1B342B] transition-transform hover:rotate-90 duration-300">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* ✅ State 1: Auth still resolving — show neutral spinner, not "Please Log In" */}
          {isResolvingAuth ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-2 border-[#1B342B]/10 border-t-[#A67C52] rounded-full animate-spin" />
                <p className="text-[#1B342B]/40 text-xs uppercase tracking-[0.2em] font-semibold">Loading...</p>
              </div>
            </div>

          ) : !user ? (
            /* State 2: Auth resolved, genuinely not logged in */
            <div className="h-full p-8 flex flex-col justify-center items-center text-center">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-[#1B342B]/10 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-[#1B342B] font-serif text-lg md:text-xl mb-2 tracking-wide">Please Log In</p>
              <p className="text-[#1B342B]/50 text-xs md:text-sm mb-8 font-light">Log in to view your saved items.</p>
              <Link
                href="/login"
                onClick={onClose}
                className="bg-[#1B342B] text-[#FDFBF7] px-8 py-3.5 rounded-sm hover:bg-[#A67C52] transition-colors text-[11px] font-semibold uppercase tracking-widest shadow-md"
              >
                Sign In
              </Link>
            </div>

          ) : isCartLoading && cartItems.length === 0 ? (
            /* State 3: Logged in, cart is fetching */
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#1B342B]/10 border-t-[#A67C52] rounded-full animate-spin" />
            </div>

          ) : cartItems.length === 0 ? (
            /* State 4: Logged in, cart is empty */
            <div className="h-full p-8 flex flex-col justify-center items-center text-center">
              <svg className="w-16 h-16 md:w-20 md:h-20 text-[#1B342B]/10 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-[#1B342B]/50 text-xs md:text-sm mb-8 leading-relaxed font-light px-4">
                Your shopping cart is currently empty.<br />Explore our organic henna cones and sealants.
              </p>
              <button
                onClick={() => { onClose(); router.push('/shop'); }}
                className="border border-[#A67C52] text-[#A67C52] px-8 py-3.5 rounded-sm hover:bg-[#A67C52] hover:text-[#FDFBF7] transition-all duration-300 text-[11px] font-semibold uppercase tracking-widest"
              >
                Browse Boutique
              </button>
            </div>

          ) : (
            /* State 5: Logged in, has items */
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 md:gap-5 items-center bg-white p-3 md:p-4 border border-[#1B342B]/5 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <Link href={`/shop/${item.product?.id || '#'}`} onClick={onClose} className="relative w-20 h-24 md:w-24 md:h-28 bg-[#F4F1ED] shrink-0 block overflow-hidden rounded-sm">
                    <Image
                      src={item.product?.image_url || '/placeholder.png'}
                      alt={item.product?.name || 'Product'}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col h-full py-1">
                    <div className="flex justify-between items-start mb-1">
                      <Link href={`/shop/${item.product?.id || '#'}`} onClick={onClose} className="text-sm md:text-base font-serif text-[#1B342B] hover:text-[#A67C52] leading-snug pr-4 transition-colors">
                        {item.product?.name || 'Item Unavailable'}
                      </Link>
                      <button onClick={() => removeItem(item.id)} className="text-[#1B342B]/30 hover:text-red-700 transition-colors p-1 -mt-1 -mr-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <span className="text-[9px] md:text-[10px] text-[#1B342B]/40 uppercase tracking-[0.2em] font-medium mb-3 md:mb-4">
                      {item.product?.weight_volume || 'Standard'}
                    </span>

                    <div className="flex justify-between items-end mt-auto">
                      <div className="flex items-center border border-[#1B342B]/15 rounded-sm h-7 md:h-8 bg-[#FDFBF7]">
                        <button onClick={() => updateQuantity(item.id, item.quantity, -1)} className="w-7 md:w-8 h-full flex items-center justify-center text-[#1B342B]/60 hover:text-[#1B342B] hover:bg-[#1B342B]/5 transition-colors text-sm font-medium">−</button>
                        <span className="w-6 md:w-8 text-center text-[11px] md:text-xs font-medium text-[#1B342B] tabular-nums">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity, 1)} className="w-7 md:w-8 h-full flex items-center justify-center text-[#1B342B]/60 hover:text-[#1B342B] hover:bg-[#1B342B]/5 transition-colors text-sm font-medium">+</button>
                      </div>

                      <span className="font-sans text-sm md:text-base text-[#1B342B] font-medium tracking-wide tabular-nums">
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — only shown when logged in and has items */}
        {user && !isResolvingAuth && cartItems.length > 0 && (
          <div className="p-6 bg-white border-t border-[#1B342B]/10 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold text-[#1B342B]/50 pb-1">
                Estimated Total
              </span>
              <span className="text-xl md:text-2xl font-sans text-[#1B342B] font-medium tracking-wider tabular-nums">
                {formatPrice(cartSubtotalUSD)}
              </span>
            </div>

            <button
              onClick={() => { onClose(); router.push('/checkout'); }}
              className="w-full bg-[#1B342B] text-[#FDFBF7] py-4 rounded-sm hover:bg-[#A67C52] transition-colors duration-300 uppercase text-[11px] md:text-xs font-semibold tracking-[0.2em] shadow-lg hover:shadow-xl"
            >
              Proceed to Checkout
            </button>

            <p className="text-center text-[#1B342B]/40 text-[9px] mt-4 tracking-wider uppercase">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}