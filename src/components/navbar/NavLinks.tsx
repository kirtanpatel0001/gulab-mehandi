/**
 * components/navbar/NavLinks.tsx
 *
 * React.memo — these links never change. Without memo, they re-render
 * every time cart count, auth state, or currency changes in Navbar.
 * With memo: zero re-renders after initial mount.
 */

import React from 'react'
import Link from 'next/link'

const DESKTOP_LINKS = [
  { href: '/',         label: 'Home'      },
  { href: '/story',    label: 'Our Story' },
  { href: '/services', label: 'Services'  },
  { href: '/gallery',  label: 'Gallery'   },
  { href: '/reviews',  label: 'Reviews'   },
] as const

const MOBILE_LINKS = [
  { href: '/',         label: 'Home'             },
  { href: '/shop',     label: 'Shop Boutique'     },
  { href: '/services', label: 'Bridal Services'   },
  { href: '/gallery',  label: 'Gallery'           },
  { href: '/story',    label: 'Our Story'         },
  { href: '/reviews',  label: 'Reviews'           },
] as const

interface DesktopProps {
  className?: string
}

interface MobileProps {
  onClose: () => void
}

export const DesktopNavLinks = React.memo(function DesktopNavLinks({ className }: DesktopProps) {
  return (
    <div className={`hidden md:flex space-x-6 ml-10 lg:space-x-8 ${className ?? ''}`}>
      {DESKTOP_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="text-[#1B342B] font-medium hover:text-[#A67C52] transition-colors duration-300 border-b-2 border-transparent hover:border-[#A67C52] pb-0.5"
        >
          {label}
        </Link>
      ))}
    </div>
  )
})

export const MobileNavLinks = React.memo(function MobileNavLinks({ onClose }: MobileProps) {
  return (
    <>
      {MOBILE_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          onClick={onClose}
          className="block px-6 py-4 border-b border-[#1B342B]/10 text-[#1B342B] font-medium hover:bg-[#F4F1ED]"
        >
          {label}
        </Link>
      ))}
    </>
  )
})