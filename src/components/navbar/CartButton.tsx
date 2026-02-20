/**
 * components/navbar/CartButton.tsx
 *
 * React.memo with custom comparator — only re-renders when cartCount changes.
 * Previously: re-rendered on EVERY Navbar state change (auth, currency, menus).
 */

import React from 'react'

interface Props {
  cartCount: number
  onClick: () => void
}

const CartButton = React.memo(
  function CartButton({ cartCount, onClick }: Props) {
    return (
      <button
        onClick={onClick}
        className="relative text-[#1B342B] hover:text-[#A67C52] transition-colors"
        aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#A67C52] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>
    )
  },
  // Custom comparator — skip re-render if cartCount unchanged
  (prev, next) => prev.cartCount === next.cartCount && prev.onClick === next.onClick
)

export default CartButton