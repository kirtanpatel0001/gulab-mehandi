/**
 * components/navbar/Logo.tsx
 *
 * React.memo — this never re-renders unless onClose changes.
 * In practice: never re-renders at all during a session.
 */

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  onClose: () => void
  inverted?: boolean
}

const Logo = React.memo(function Logo({ onClose, inverted = false }: Props) {
  return (
    <Link href="/" onClick={onClose}>
      <Image
        src="/LOGO/LOGO.png"
        alt="Gulab Mehndi Logo"
        width={85}
        height={20}
        priority                             // ✅ LCP optimization — above the fold
        className={`cursor-pointer object-contain ${inverted ? 'invert' : ''}`}
      />
    </Link>
  )
})

export default Logo