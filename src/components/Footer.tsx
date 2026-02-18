"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // --- THE FIX: Hide Footer on Admin Pages ---
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="w-full bg-[#1B342B] text-[#FDFBF7] pt-20 pb-10 border-t border-[#FDFBF7]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* Top Section: 3-Column Luxury Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-16">
          
          {/* Column 1: Brand Story */}
          <div className="flex flex-col space-y-6 lg:pr-8">
            <Link href="/">
              <Image 
                src="/LOGO/LOGO.png" 
                alt="Gulab Mehndi Logo" 
                width={80} 
                height={50} 
                className="object-contain brightness-0 invert" 
              />
            </Link>
            <p className="text-[#FDFBF7]/70 leading-relaxed font-light text-sm max-w-sm">
              Elevating the art of Mehndi for the modern, international bride. We blend timeless tradition with contemporary elegance using 100% organic, hand-mixed henna.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-5 pt-4">
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/gulab_mehandi?igsh=djIyaDJoZWt6aThn" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#FDFBF7]/70 hover:text-[#A67C52] hover:-translate-y-1 transition-all duration-300"
              >
                <span className="sr-only">Instagram</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
              {/* Facebook */}
              <a 
                href="https://www.facebook.com/share/1AdKpNeKzP/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#FDFBF7]/70 hover:text-[#A67C52] hover:-translate-y-1 transition-all duration-300"
              >
                <span className="sr-only">Facebook</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Elegant Navigation Grid */}
          <div className="grid grid-cols-2 gap-8 lg:px-8">
            <div>
              <h4 className="text-[#A67C52] font-semibold text-xs uppercase tracking-[0.2em] mb-6">Explore</h4>
              <ul className="space-y-4 text-sm font-light">
                <li><Link href="/services" className="text-[#FDFBF7]/80 hover:text-[#A67C52] hover:translate-x-1 inline-block transition-transform duration-300">Bridal Services</Link></li>
                <li><Link href="/shop" className="text-[#FDFBF7]/80 hover:text-[#A67C52] hover:translate-x-1 inline-block transition-transform duration-300">Shop Cones</Link></li>
                <li><Link href="/portfolio" className="text-[#FDFBF7]/80 hover:text-[#A67C52] hover:translate-x-1 inline-block transition-transform duration-300">Portfolio</Link></li>
                <li><Link href="/reviews" className="text-[#FDFBF7]/80 hover:text-[#A67C52] hover:translate-x-1 inline-block transition-transform duration-300">Reviews</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#A67C52] font-semibold text-xs uppercase tracking-[0.2em] mb-6">Support</h4>
              <ul className="space-y-4 text-sm font-light">
                <li><Link href="/faq" className="text-[#FDFBF7]/80 hover:text-[#A67C52] hover:translate-x-1 inline-block transition-transform duration-300">FAQs</Link></li>
                <li><Link href="/contact" className="text-[#FDFBF7]/80 hover:text-[#A67C52] hover:translate-x-1 inline-block transition-transform duration-300">Contact Us</Link></li>
                <li><Link href="/shipping" className="text-[#FDFBF7]/80 hover:text-[#A67C52] hover:translate-x-1 inline-block transition-transform duration-300">Shipping Info</Link></li>
                <li><Link href="/terms" className="text-[#FDFBF7]/80 hover:text-[#A67C52] hover:translate-x-1 inline-block transition-transform duration-300">Terms & Policies</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 3: Booking Card */}
          <div className="flex flex-col bg-[#FDFBF7]/5 border border-[#FDFBF7]/10 p-8 rounded-sm h-fit">
            <h4 className="text-[#A67C52] font-semibold text-xs uppercase tracking-[0.2em] mb-3">Book Your Consultation</h4>
            <p className="text-[#FDFBF7]/80 text-sm font-light leading-relaxed mb-6">
              Currently accepting bridal bookings for the upcoming wedding seasons. Worldwide travel available upon request.
            </p>
            
            <a href="mailto:hello@gulabmehndi.com" className="flex items-center space-x-3 text-sm text-[#FDFBF7] hover:text-[#A67C52] transition-colors mb-6">
              <svg className="w-5 h-5 text-[#A67C52]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span>hello@gulabmehndi.com</span>
            </a>

            <Link href="/book" className="w-full">
              <button className="w-full bg-[#A67C52] text-[#1B342B] font-medium tracking-wide py-3 px-4 hover:bg-[#FDFBF7] transition-colors duration-300">
                Inquire Now
              </button>
            </Link>
          </div>

        </div>

        {/* Bottom Section: Copyright & Developer Credit */}
        <div className="pt-8 border-t border-[#FDFBF7]/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-[#FDFBF7]/50 tracking-wider">
          <p>© {new Date().getFullYear()} GULAB MEHNDI. ALL RIGHTS RESERVED.</p>
          <p>DESIGNED & DEVELOPED BY KIRTAN</p>
        </div>

      </div>
    </footer>
  );
}