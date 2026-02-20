/**
 * store/cartStore.ts
 *
 * Global Zustand store for cart state.
 *
 * Why this beats useState in Navbar:
 * ─────────────────────────────────
 * Before: cart was fetched on auth init, auth change, cartUpdated event,
 *         and every time the drawer opened → 4–6 Supabase calls per session.
 *
 * After:  cart is fetched at most once every 2 minutes (CACHE_MS).
 *         Any component can read or mutate cart without prop drilling.
 *         Optimistic updates (update local state first, then DB) keep UI snappy.
 *
 * Usage in any component:
 *   const items    = useCartStore(s => s.items)
 *   const fetch    = useCartStore(s => s.fetchCart)
 */

import { create } from 'zustand'
import { getSupabaseClient } from '@/lib/supabase/client'

export type CartItem = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image_url: string
    stain_color?: string
    weight_volume?: string
  } | null
}

const CACHE_MS = 1000 * 60 * 2  // 2 minutes — prevents redundant DB hits

export interface CartStore {
  items: CartItem[]
  loading: boolean
  lastFetch: number   // timestamp of last successful fetch

  fetchCart:      (userId: string, force?: boolean) => Promise<void>
  updateQuantity: (cartId: string, currentQty: number, delta: number) => Promise<void>
  removeItem:     (cartId: string) => Promise<void>
  clearCart:      () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  loading: false,
  lastFetch: 0,

  // ── fetchCart ─────────────────────────────────────────────────────────────
  fetchCart: async (userId, force = false) => {
    const age = Date.now() - get().lastFetch
    if (!force && age < CACHE_MS) return   // ✅ Cache hit — skip DB call

    const supabase = getSupabaseClient()
    set({ loading: true })

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product:products (
            id, name, price, image_url, stain_color, weight_volume
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        set({ items: data as CartItem[], lastFetch: Date.now() })
      }
    } finally {
      set({ loading: false })
    }
  },

  // ── updateQuantity ────────────────────────────────────────────────────────
  updateQuantity: async (cartId, currentQty, delta) => {
    const newQty = currentQty + delta
    if (newQty < 1) return

    // Optimistic update first — UI feels instant
    set(state => ({
      items: state.items.map(i =>
        i.id === cartId ? { ...i, quantity: newQty } : i
      )
    }))

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', cartId)

    // Rollback on DB failure
    if (error) {
      set(state => ({
        items: state.items.map(i =>
          i.id === cartId ? { ...i, quantity: currentQty } : i
        )
      }))
    }
  },

  // ── removeItem ────────────────────────────────────────────────────────────
  removeItem: async (cartId) => {
    // Snapshot for rollback
    const snapshot = get().items

    // Optimistic removal
    set(state => ({ items: state.items.filter(i => i.id !== cartId) }))

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartId)

    if (error) set({ items: snapshot })
  },

  // ── clearCart ─────────────────────────────────────────────────────────────
  clearCart: () => set({ items: [], lastFetch: 0 }),
}))