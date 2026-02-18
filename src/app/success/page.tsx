"use client";

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { downloadInvoicePDF } from '@/lib/utils/pdf'; 

// 1. Rename your main component and remove 'export default'
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        router.push('/');
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        router.push('/');
        return;
      }
      setOrder(orderData);

      if (orderData.shipping_address_id) {
        const { data: addressData } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('id', orderData.shipping_address_id)
          .single();
        
        if (addressData) setAddress(addressData);
      }

      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderId, router]);

  const handleDownload = async () => {
    setIsDownloading(true);
    // NOTICE: We are now targeting the HIDDEN template!
    await downloadInvoicePDF('invoice-pdf-template', order?.razorpay_order_id || 'receipt');
    setIsDownloading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FDFBF7]">
        <div className="w-8 h-8 border-2 border-[#1B342B]/20 border-t-[#A67C52] rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- TAX MATH ---
  const totalAmount = order?.total_amount || 0;
  const isINR = order?.currency === 'INR';
  const currencySymbol = isINR ? '₹' : '$';
  const subtotal = totalAmount / 1.18; 
  const totalTax = totalAmount - subtotal;
  const isLocalGujarat = address?.state?.toLowerCase().includes('gujarat');
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

  // Reusable Date Formatter
  const formattedDate = new Date(order?.created_at).toLocaleDateString('en-IN', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 md:px-8 flex flex-col items-center relative overflow-hidden">
      
      {/* Success Header */}
      <div className="mb-8 flex flex-col items-center text-center animate-fade-in">
        <div className="w-14 h-14 bg-[#1B342B] rounded-full flex justify-center items-center mb-4 shadow-md">
          <svg className="w-7 h-7 text-[#FDFBF7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-[#1B342B] mb-2">Order Confirmed</h1>
      </div>

      {/* ========================================== */}
      {/* 1. THE VISIBLE INVOICE (Responsive for Mobile/Desktop viewing) */}
      {/* ========================================== */}
      <div className="w-full max-w-3xl bg-white border border-[#1B342B]/20 rounded-sm shadow-2xl p-6 md:p-14 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-[#1B342B] pb-8 mb-8">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-serif text-[#1B342B] tracking-wide mb-2">GULAB MEHNDI</h2>
            <div className="text-xs text-[#1B342B]/80 leading-relaxed space-y-0.5">
              <p>123 Heritage Art Street, Vesu</p>
              <p>Surat, Gujarat 395007, India</p>
              <p className="mt-2"><span className="font-bold text-[#1B342B]">Email:</span> hello@gulabmehndi.com</p>
              <p><span className="font-bold text-[#1B342B]">Phone:</span> +91 98765 43210</p>
              <p className="mt-2"><span className="font-bold text-[#1B342B]">GSTIN:</span> 24ABCDE1234F1Z5</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <h1 className="text-2xl md:text-3xl font-bold text-[#A67C52] uppercase tracking-[0.2em] mb-4">Tax Invoice</h1>
            <div className="text-xs text-[#1B342B]/80 space-y-1">
              <p><span className="font-bold text-[#1B342B] uppercase tracking-wider">Invoice No:</span> {order?.razorpay_order_id}</p>
              <p><span className="font-bold text-[#1B342B] uppercase tracking-wider">Date:</span> {formattedDate}</p>
              <p><span className="font-bold text-[#1B342B] uppercase tracking-wider">Payment Status:</span> <span className="text-green-600 font-bold">PAID</span></p>
            </div>
          </div>
        </div>

        {address && (
          <div className="mb-10 flex flex-col md:flex-row justify-between">
            <div className="w-full md:w-1/2">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A67C52] border-b border-[#1B342B]/10 pb-2 mb-3">Billed To</h3>
              <div className="text-[#1B342B]/80 text-sm leading-relaxed">
                <p className="font-bold text-[#1B342B] text-base mb-1">{address.full_name}</p>
                <p>{address.street_address}</p>
                <p>{address.city}, {address.state} {address.postal_code}</p>
                <p>{address.country}</p>
                <p className="mt-2"><span className="font-bold text-[#1B342B] text-xs uppercase tracking-wider">Phone:</span> {address.phone}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-10 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-[#1B342B]/5 text-[#1B342B]">
                <th className="py-3 px-4 text-xs uppercase tracking-widest font-bold border-b border-[#1B342B]/20">Description</th>
                <th className="py-3 px-4 text-xs uppercase tracking-widest font-bold border-b border-[#1B342B]/20 text-center">HSN/SAC</th>
                <th className="py-3 px-4 text-xs uppercase tracking-widest font-bold border-b border-[#1B342B]/20 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#1B342B]/10 text-sm">
                <td className="py-5 px-4 text-[#1B342B] font-medium">
                  Organic Mehndi Products & Services
                  <br/><span className="text-xs text-[#1B342B]/50 font-normal">Order Ref: {order?.id.substring(0, 8)}</span>
                </td>
                <td className="py-5 px-4 text-[#1B342B]/70 text-center text-xs">3304</td>
                <td className="py-5 px-4 text-right text-[#1B342B] tabular-nums font-medium">{currencySymbol}{subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-12">
          <div className="w-full md:w-1/2 bg-[#FDFBF7] p-6 border border-[#1B342B]/10 rounded-sm">
            <div className="flex justify-between text-sm text-[#1B342B]/80 mb-3">
              <span>Subtotal (Exclusive of Tax)</span>
              <span className="tabular-nums font-medium">{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            {isINR && isLocalGujarat ? (
              <>
                <div className="flex justify-between text-sm text-[#1B342B]/80 mb-2">
                  <span>CGST (9%)</span>
                  <span className="tabular-nums">{currencySymbol}{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#1B342B]/80 mb-3">
                  <span>SGST (9%)</span>
                  <span className="tabular-nums">{currencySymbol}{sgst.toFixed(2)}</span>
                </div>
              </>
            ) : isINR ? (
              <div className="flex justify-between text-sm text-[#1B342B]/80 mb-3">
                <span>IGST (18%)</span>
                <span className="tabular-nums">{currencySymbol}{totalTax.toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-sm text-[#1B342B]/80 mb-3">
                <span>Taxes</span>
                <span className="tabular-nums">{currencySymbol}{totalTax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-[#1B342B] pt-4 border-t border-[#1B342B]/20">
              <span>Grand Total</span>
              <span className="tabular-nums">{currencySymbol}{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pb-12 w-full max-w-3xl justify-center">
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center justify-center space-x-2 bg-[#1B342B] text-[#FDFBF7] px-8 py-3.5 rounded-sm hover:bg-[#A67C52] transition-all duration-300 text-[11px] font-bold uppercase tracking-[0.2em] shadow-md disabled:opacity-70 min-w-[200px]"
        >
          {isDownloading ? (
             <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>Download Invoice</span>
            </>
          )}
        </button>
        <Link href="/shop" className="flex items-center justify-center border border-[#1B342B] text-[#1B342B] px-8 py-3.5 rounded-sm hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-all duration-300 text-[11px] font-bold uppercase tracking-[0.2em] min-w-[200px]">
          Continue Shopping
        </Link>
      </div>


      {/* ========================================== */}
      {/* 2. THE HIDDEN PDF TEMPLATE (Strictly Forced to Desktop Width) */}
      {/* ========================================== */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div 
          id="invoice-pdf-template" 
          className="bg-white p-14" 
          style={{ width: '800px' }} // HARD FORCED DESKTOP WIDTH
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-[#1B342B] pb-8 mb-8">
            <div>
              <h2 className="text-3xl font-serif text-[#1B342B] tracking-wide mb-2">GULAB MEHNDI</h2>
              <div className="text-xs text-[#1B342B]/80 leading-relaxed space-y-0.5">
                <p>123 Heritage Art Street, Vesu</p>
                <p>Surat, Gujarat 395007, India</p>
                <p className="mt-2"><span className="font-bold text-[#1B342B]">Email:</span> hello@gulabmehndi.com</p>
                <p><span className="font-bold text-[#1B342B]">Phone:</span> +91 98765 43210</p>
                <p className="mt-2"><span className="font-bold text-[#1B342B]">GSTIN:</span> 24ABCDE1234F1Z5</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-[#A67C52] uppercase tracking-[0.2em] mb-4">Tax Invoice</h1>
              <div className="text-xs text-[#1B342B]/80 space-y-1">
                <p><span className="font-bold text-[#1B342B] uppercase tracking-wider">Invoice No:</span> {order?.razorpay_order_id}</p>
                <p><span className="font-bold text-[#1B342B] uppercase tracking-wider">Date:</span> {formattedDate}</p>
                <p><span className="font-bold text-[#1B342B] uppercase tracking-wider">Payment Status:</span> <span className="text-green-600 font-bold">PAID</span></p>
              </div>
            </div>
          </div>

          {/* Billed To */}
          {address && (
            <div className="mb-10 w-1/2">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A67C52] border-b border-[#1B342B]/10 pb-2 mb-3">Billed To</h3>
              <div className="text-[#1B342B]/80 text-sm leading-relaxed">
                <p className="font-bold text-[#1B342B] text-base mb-1">{address.full_name}</p>
                <p>{address.street_address}</p>
                <p>{address.city}, {address.state} {address.postal_code}</p>
                <p>{address.country}</p>
                <p className="mt-2"><span className="font-bold text-[#1B342B] text-xs uppercase tracking-wider">Phone:</span> {address.phone}</p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="mb-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1B342B]/5 text-[#1B342B]">
                  <th className="py-3 px-4 text-xs uppercase tracking-widest font-bold border-b border-[#1B342B]/20">Description</th>
                  <th className="py-3 px-4 text-xs uppercase tracking-widest font-bold border-b border-[#1B342B]/20 text-center">HSN/SAC</th>
                  <th className="py-3 px-4 text-xs uppercase tracking-widest font-bold border-b border-[#1B342B]/20 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#1B342B]/10 text-sm">
                  <td className="py-5 px-4 text-[#1B342B] font-medium">
                    Organic Mehndi Products & Services
                    <br/><span className="text-xs text-[#1B342B]/50 font-normal">Order Ref: {order?.id.substring(0, 8)}</span>
                  </td>
                  <td className="py-5 px-4 text-[#1B342B]/70 text-center text-xs">3304</td>
                  <td className="py-5 px-4 text-right text-[#1B342B] tabular-nums font-medium">{currencySymbol}{subtotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-1/2 bg-[#FDFBF7] p-6 border border-[#1B342B]/10 rounded-sm">
              <div className="flex justify-between text-sm text-[#1B342B]/80 mb-3">
                <span>Subtotal (Exclusive of Tax)</span>
                <span className="tabular-nums font-medium">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              {isINR && isLocalGujarat ? (
                <>
                  <div className="flex justify-between text-sm text-[#1B342B]/80 mb-2">
                    <span>CGST (9%)</span>
                    <span className="tabular-nums">{currencySymbol}{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#1B342B]/80 mb-3">
                    <span>SGST (9%)</span>
                    <span className="tabular-nums">{currencySymbol}{sgst.toFixed(2)}</span>
                  </div>
                </>
              ) : isINR ? (
                <div className="flex justify-between text-sm text-[#1B342B]/80 mb-3">
                  <span>IGST (18%)</span>
                  <span className="tabular-nums">{currencySymbol}{totalTax.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-sm text-[#1B342B]/80 mb-3">
                  <span>Taxes</span>
                  <span className="tabular-nums">{currencySymbol}{totalTax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-[#1B342B] pt-4 border-t border-[#1B342B]/20">
                <span>Grand Total</span>
                <span className="tabular-nums">{currencySymbol}{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-[#1B342B] pt-6 flex justify-between items-end">
            <div className="text-[9px] text-[#1B342B]/50 uppercase tracking-widest leading-relaxed">
              <p>Subject to Surat Jurisdiction.</p>
              <p>This is a computer-generated invoice.</p>
              <p>No physical signature is required.</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-serif text-[#1B342B] italic mb-1">For Gulab Mehndi</p>
              <div className="h-px w-32 bg-[#1B342B]/30 mx-auto mt-8 mb-2"></div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1B342B]">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
      {/* ========================================== */}
      
    </div>
  );
}

// 2. Wrap the content in Suspense for Vercel
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-[#FDFBF7]">
        <div className="w-8 h-8 border-2 border-[#1B342B]/20 border-t-[#A67C52] rounded-full animate-spin"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}