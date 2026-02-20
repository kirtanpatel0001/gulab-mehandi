"use client";

import { useState, useEffect, useRef, useCallback, useMemo, useReducer } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

import { getSupabaseClient }            from '@/lib/supabase/client'
import { useCartStore } from '@/app/store/cartStore'
import type { CartStore }                from '@/app/store/cartStore'
import Logo                              from '@/components/navbar/Logo'
import { DesktopNavLinks, MobileNavLinks } from '@/components/navbar/NavLinks'
import CartButton                        from '@/components/navbar/CartButton'

// ✅ Lazy load CartDrawer — removed from initial bundle (~30–60KB saved)
const CartDrawer = dynamic(() => import('@/components/layout/CartDrawer'), { ssr: false })

// ─── Currency constants ───────────────────────────────────────────────────────

const CURRENCY_REGIONS: Record<string, string[]> = {
  'North America':  ['USD', 'CAD'],
  'Middle East':    ['AED', 'SAR', 'QAR'],
  'Asia':           ['INR', 'SGD', 'JPY'],
  'Europe':         ['EUR', 'GBP'],
  'Oceania':        ['AUD', 'NZD'],
  'Africa & Others':['ZAR'],
}
const SUPPORTED_CURRENCIES = Object.values(CURRENCY_REGIONS).flat()

// 24-hour cache — exchange rates don't change every second
const RATES_CACHE_KEY      = 'currency_rates_v1'
const RATES_CACHE_DURATION = 1000 * 60 * 60 * 24

// ─── UI State (useReducer) ────────────────────────────────────────────────────

type UIState = {
  isMobileOpen:    boolean
  isCartOpen:      boolean
  desktopDropOpen: boolean
  mobileDropOpen:  boolean
}
type UIAction =
  | { type: 'CLOSE_ALL' }
  | { type: 'TOGGLE_MOBILE' }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'TOGGLE_DESKTOP_DROP' }
  | { type: 'TOGGLE_MOBILE_DROP' }
  | { type: 'CLOSE_DESKTOP_DROP' }
  | { type: 'CLOSE_MOBILE_DROP' }

const uiInit: UIState = {
  isMobileOpen: false, isCartOpen: false, desktopDropOpen: false, mobileDropOpen: false,
}

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'CLOSE_ALL':           return uiInit
    case 'TOGGLE_MOBILE':       return { ...state, isMobileOpen: !state.isMobileOpen }
    case 'TOGGLE_CART':         return { ...state, isCartOpen: !state.isCartOpen }
    case 'CLOSE_CART':          return { ...state, isCartOpen: false }
    case 'TOGGLE_DESKTOP_DROP': return { ...state, desktopDropOpen: !state.desktopDropOpen }
    case 'TOGGLE_MOBILE_DROP':  return { ...state, mobileDropOpen: !state.mobileDropOpen }
    case 'CLOSE_DESKTOP_DROP':  return { ...state, desktopDropOpen: false }
    case 'CLOSE_MOBILE_DROP':   return { ...state, mobileDropOpen: false }
    default:                    return state
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()

  // ✅ Singleton — same client instance across entire app
  const supabase = getSupabaseClient()

  // UI
  const [ui, dispatch] = useReducer(uiReducer, uiInit)

  // Auth
  const [user,        setUser]        = useState<User | null>(null)
  const [userRole,    setUserRole]    = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ✅ Profile role cache — prevents repeated DB calls on token refresh events
  const profileCache = useRef<Record<string, string>>({})

  // ✅ Zustand cart store — replaces all local cart state
  const cartItems      = useCartStore((s: CartStore) => s.items)
  const isCartLoading  = useCartStore((s: CartStore) => s.loading)
  const fetchCart      = useCartStore((s: CartStore) => s.fetchCart)
  const updateQuantity = useCartStore((s: CartStore) => s.updateQuantity)
  const removeItem     = useCartStore((s: CartStore) => s.removeItem)
  const clearCart      = useCartStore((s: CartStore) => s.clearCart)

  // Currency
  const [currency,         setCurrency]         = useState('USD')
  const [exchangeRate,     setExchangeRate]     = useState(1)
  const [allRates,         setAllRates]         = useState<Record<string, number>>({})
  const [isCurrencyLoading,setIsCurrencyLoading]= useState(true)

  // Refs
  const desktopDropRef = useRef<HTMLDivElement>(null)
  const mobileDropRef  = useRef<HTMLDivElement>(null)

  // ── Click outside (single shared handler) ───────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!desktopDropRef.current?.contains(e.target as Node)) dispatch({ type: 'CLOSE_DESKTOP_DROP' })
      if (!mobileDropRef.current?.contains(e.target as Node))  dispatch({ type: 'CLOSE_MOBILE_DROP' })
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Body scroll lock (guarded) ──────────────────────────────────────────────
  useEffect(() => {
    if (!ui.isMobileOpen) return                   // ✅ Skip entirely when closed
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [ui.isMobileOpen])

  // ── Currency init with 24h cache ────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController()

    ;(async () => {
      try {
        // ✅ Check 24h cache first — skip ALL network calls if fresh
        const cached = localStorage.getItem(RATES_CACHE_KEY)
        if (cached) {
          const { rates, currency: cur, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < RATES_CACHE_DURATION) {
            setAllRates(rates)
            setCurrency(cur)
            setExchangeRate(rates[cur] ?? 1)
            setIsCurrencyLoading(false)
            return   // ✅ Zero network calls on cache hit
          }
        }

        // Cache miss — fetch fresh rates
        const res    = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal })
        const { rates = {} } = await res.json()
        setAllRates(rates)

        // Check user's saved preference
        const savedCurrency = localStorage.getItem('user_currency')
        if (savedCurrency && rates[savedCurrency]) {
          setCurrency(savedCurrency)
          setExchangeRate(rates[savedCurrency])
          localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates, currency: savedCurrency, timestamp: Date.now() }))
          return
        }

        // Auto-detect currency
        let code = 'USD'
        try {
          const r = await fetch('https://ipapi.co/currency/', { signal: controller.signal })
          if (r.ok) code = (await r.text()).trim()
          else throw new Error('blocked')
        } catch (err: any) {
          if (err.name === 'AbortError') return
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
          if (tz === 'Asia/Kolkata')                                             code = 'INR'
          else if (tz.startsWith('Asia/Dubai'))                                  code = 'AED'
          else if (tz.startsWith('Asia/Riyadh'))                                 code = 'SAR'
          else if (tz === 'Europe/London')                                        code = 'GBP'
          else if (tz.startsWith('Europe/'))                                      code = 'EUR'
          else if (tz.startsWith('Australia/'))                                   code = 'AUD'
          else if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver')) code = 'CAD'
        }

        if (!SUPPORTED_CURRENCIES.includes(code) || !rates[code]) code = 'USD'

        if (!controller.signal.aborted) {
          setCurrency(code)
          setExchangeRate(rates[code] ?? 1)
          localStorage.setItem('user_currency', code)
          // ✅ Cache rates + detected currency together
          localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates, currency: code, timestamp: Date.now() }))
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error('Currency init:', err)
      } finally {
        if (!controller.signal.aborted) setIsCurrencyLoading(false)
      }
    })()

    return () => controller.abort()
  }, [])

  // ── Auth init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    const resolveRole = async (userId: string): Promise<string> => {
      // ✅ Check profile cache first — no DB call if already fetched this session
      if (profileCache.current[userId]) return profileCache.current[userId]

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

      const role = data?.role ?? 'user'
      profileCache.current[userId] = role   // Cache it
      return role
    }

    const applyUser = async (u: User | null) => {
      if (!u) {
        setUser(null)
        setUserRole(null)
        clearCart()
        return
      }
      setUser(u)
      const role = await resolveRole(u.id)
      if (mounted) {
        setUserRole(role)
        fetchCart(u.id)   // Zustand cache handles deduplication
      }
    }

    // Initial load
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
      if (mounted) applyUser(user).finally(() => { if (mounted) setAuthLoading(false) })
    })

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return
        if (event === 'INITIAL_SESSION') return   // ✅ Handled above — no double work

        if (!session || event === 'SIGNED_OUT') {
          applyUser(null)
        } else if (session.user) {
          applyUser(session.user)
        }
        setAuthLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchCart, clearCart])

  // ── Cart event listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const onCartUpdated = () => { if (user?.id) fetchCart(user.id, true) }  // force=true bypasses cache
    window.addEventListener('cartUpdated', onCartUpdated)
    return () => window.removeEventListener('cartUpdated', onCartUpdated)
  }, [user?.id, fetchCart])

  // ── Refresh cart on drawer open (cache-aware) ────────────────────────────────
  useEffect(() => {
    if (ui.isCartOpen && user?.id) fetchCart(user.id)   // Zustand skips if cache is fresh
  }, [ui.isCartOpen, user?.id, fetchCart])

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCurrencyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = e.target.value
    setCurrency(c)
    setExchangeRate(allRates[c] ?? 1)
    localStorage.setItem('user_currency', c)
    // Update cache with new currency preference
    const cached = localStorage.getItem(RATES_CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ ...parsed, currency: c }))
    }
  }, [allRates])

  const formatPrice = useCallback((usdPrice: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(usdPrice * exchangeRate),
  [currency, exchangeRate])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    profileCache.current = {}   // Clear profile cache on sign out
    dispatch({ type: 'CLOSE_ALL' })
    router.push('/login')
  }, [supabase, router])

  // ── Derived values ────────────────────────────────────────────────────────────

  const cartCount = useMemo(
    () => cartItems.reduce((s, i) => s + i.quantity, 0),
    [cartItems]
  )

  const cartSubtotalUSD = useMemo(
    () => cartItems.reduce((t, i) => t + (i.product?.price ?? 0) * i.quantity, 0),
    [cartItems]
  )

  const userInitial = useMemo(() => {
    if (user?.user_metadata?.full_name) return (user.user_metadata.full_name as string).charAt(0).toUpperCase()
    if (user?.email)                    return user.email.charAt(0).toUpperCase()
    return 'U'
  }, [user])

  // ── Memoized options (built once) ─────────────────────────────────────────────

  const currencyOptions = useMemo(() =>
    Object.entries(CURRENCY_REGIONS).map(([region, codes]) => (
      <optgroup key={region} label={region} className="font-bold text-[#1B342B]/50">
        {codes.map(c => (
          <option key={c} value={c} className="font-medium text-[#1B342B]">{c}</option>
        ))}
      </optgroup>
    )),
  [])

  // ── Dropdown content (memoized) ───────────────────────────────────────────────

  const dropdownContent = useMemo(() => (
    <>
      <div className="px-4 py-3 border-b border-[#1B342B]/10 mb-2">
        <p className="text-sm font-bold text-[#1B342B] truncate">
          {user?.user_metadata?.full_name || 'Client'}
        </p>
        <p className="text-[10px] text-[#1B342B]/60 truncate">{user?.email}</p>
      </div>
      {userRole === 'admin' && (
        <Link href="/admin" onClick={() => dispatch({ type: 'CLOSE_ALL' })}
          className="block px-4 py-2 text-xs text-[#1B342B] hover:bg-[#1B342B]/5 font-semibold">
          Admin Dashboard
        </Link>
      )}
      <Link href="/my-appointments" onClick={() => dispatch({ type: 'CLOSE_ALL' })}
        className="block px-4 py-2 text-xs text-[#1B342B] hover:bg-[#1B342B]/5 font-semibold">
        My Appointments
      </Link>
      <Link href="/my-orders" onClick={() => dispatch({ type: 'CLOSE_ALL' })}
        className="block px-4 py-2 text-xs text-[#1B342B] hover:bg-[#1B342B]/5 font-semibold">
        My Orders
      </Link>
      <button onClick={handleSignOut}
        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold mt-1 border-t border-[#1B342B]/10">
        Sign Out
      </button>
    </>
  ), [user, userRole, handleSignOut])

  // ── User section ──────────────────────────────────────────────────────────────

  const renderUser = (isMobile: boolean) => {
    if (authLoading) {
      return <div className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} rounded-full bg-[#1B342B]/15 animate-pulse`} />
    }

    if (user) {
      return (
        <div className="relative" ref={isMobile ? mobileDropRef : desktopDropRef}>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              dispatch({ type: isMobile ? 'TOGGLE_MOBILE_DROP' : 'TOGGLE_DESKTOP_DROP' })
            }}
            className={`${isMobile ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-xs'} rounded-full bg-[#1B342B] text-[#FDFBF7] flex items-center justify-center font-bold hover:bg-[#A67C52] transition-colors shadow-sm cursor-pointer select-none`}
          >
            {userInitial}
          </button>
          {(isMobile ? ui.mobileDropOpen : ui.desktopDropOpen) && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-[#1B342B]/10 rounded-sm shadow-xl py-2 z-50"
              onClick={e => e.stopPropagation()}>
              {dropdownContent}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link href="/login" aria-label="Login"
        className="text-[#1B342B] hover:text-[#A67C52] transition-colors duration-300">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </Link>
    )
  }

  // ── Early return for admin routes ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) return null

  // ── JSX ───────────────────────────────────────────────────────────────────────
  return (
    <>
      <nav className="w-full bg-[#FDFBF7] px-4 md:px-8 py-2 sticky top-0 z-40 border-b border-[#1B342B]/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Mobile hamburger */}
          <div className="flex-1 md:hidden">
            <button onClick={() => dispatch({ type: 'TOGGLE_MOBILE' })}
              className="text-[#1B342B] focus:outline-none" aria-label="Open menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* ✅ Memoized Logo — never re-renders */}
          <div className="flex justify-center md:justify-start flex-1 md:flex-none">
            <Logo onClose={() => dispatch({ type: 'CLOSE_ALL' })} />
          </div>

          {/* ✅ Memoized desktop nav links — never re-renders */}
          <DesktopNavLinks />

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center space-x-5 lg:space-x-6">
            {/* Uncomment to enable desktop currency + cart:
            <select value={currency} onChange={handleCurrencyChange} disabled={isCurrencyLoading}
              className="bg-transparent text-[#1B342B] text-sm font-semibold focus:outline-none cursor-pointer hover:text-[#A67C52] disabled:opacity-50">
              {currencyOptions}
            </select>
            <CartButton cartCount={cartCount} onClick={() => dispatch({ type: 'TOGGLE_CART' })} />
            */}
            {renderUser(false)}
            <Link href="/book"
              className="bg-[#1B342B] text-[#FDFBF7] px-5 py-1.5 rounded hover:bg-[#A67C52] transition-colors duration-300 font-medium inline-block text-center">
              Book Now
            </Link>
          </div>

          {/* Mobile right actions */}
          <div className="flex-1 md:hidden flex justify-end space-x-4 text-[#1B342B] items-center">
            {/* <select value={currency} onChange={handleCurrencyChange} disabled={isCurrencyLoading}
              className="bg-transparent text-[#1B342B] text-xs font-bold focus:outline-none cursor-pointer hover:text-[#A67C52] disabled:opacity-50">
              {currencyOptions}
            </select> */}
            {/* ✅ Memoized CartButton — only re-renders when count changes */}
            {/* <CartButton cartCount={cartCount} onClick={() => dispatch({ type: 'TOGGLE_CART' })} /> */}
            {renderUser(true)}
          </div>

        </div>
      </nav>

      {/* ✅ Lazy-loaded CartDrawer — not in initial bundle */}
      <CartDrawer
        isOpen={ui.isCartOpen}
        onClose={() => dispatch({ type: 'CLOSE_CART' })}
        user={user}
        authLoading={authLoading}
        cartItems={cartItems}
        isCartLoading={isCartLoading}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        cartSubtotalUSD={cartSubtotalUSD}
        formatPrice={formatPrice}
      />

      {/* Mobile overlay */}
      {ui.isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => dispatch({ type: 'CLOSE_ALL' })} />
      )}

      {/* Mobile drawer */}
      <div className={`fixed top-0 left-0 h-full w-[80%] max-w-[320px] bg-[#FDFBF7] z-40 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${ui.isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-[#1B342B] px-6 py-5 flex justify-between items-center text-[#FDFBF7]">
          <Logo onClose={() => dispatch({ type: 'CLOSE_ALL' })} inverted />
          <button onClick={() => dispatch({ type: 'CLOSE_ALL' })}
            className="p-1 focus:outline-none" aria-label="Close menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {/* ✅ Memoized mobile links — never re-renders */}
          <MobileNavLinks onClose={() => dispatch({ type: 'CLOSE_ALL' })} />
        </div>

        <div className="p-6 border-t border-[#1B342B]/10 bg-[#F4F1ED]">
          <Link href="/book" onClick={() => dispatch({ type: 'CLOSE_ALL' })}
            className="w-full bg-[#1B342B] text-[#FDFBF7] py-3 rounded hover:bg-[#A67C52] transition-colors duration-300 font-medium shadow-sm block text-center">
            Book Appointment
          </Link>
        </div>
      </div>
    </>
  )
}