"use client";

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client'; // ✅ Updated import
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface Address {
  id: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '', phone: '', street_address: '', city: '', state: '', postal_code: '', country: 'India'
  });

  // ✅ Stable supabase singleton
  const supabase = getSupabaseClient(); 

  useEffect(() => {
    const initializeCheckout = async () => {
      const { data: { user } } = await supabase.auth.getUser(); 

      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: cart } = await supabase
        .from('cart_items')
        .select(`quantity, product:products ( id, name, price, image_url )`)
        .eq('user_id', user.id);

      if (!cart || cart.length === 0) {
        router.push('/shop');
        return;
      }
      setCartItems(cart);

      const { data: userAddresses } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (userAddresses) {
        setAddresses(userAddresses);
        if (userAddresses.length > 0) setSelectedAddressId(userAddresses[0].id);
      }

      setLoading(false);
    };

    initializeCheckout();
  }, [router, supabase]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingId) {
      const { error } = await supabase.from('user_addresses').update(formData).eq('id', editingId);
      if (!error) setAddresses(prev => prev.map(a => a.id === editingId ? { ...formData, id: editingId } : a));
    } else {
      const { data, error } = await supabase.from('user_addresses').insert([{ ...formData, user_id: user.id }]).select().single();
      if (!error && data) {
        setAddresses(prev => [...prev, data]);
        setSelectedAddressId(data.id);
      }
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ full_name: '', phone: '', street_address: '', city: '', state: '', postal_code: '', country: 'India' });
  };

  const openEditForm = (address: Address) => {
    setFormData({
      full_name: address.full_name, phone: address.phone, street_address: address.street_address,
      city: address.city, state: address.state, postal_code: address.postal_code, country: address.country
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const total = subtotal;

  const handlePayment = async () => {
    if (!selectedAddressId) return alert("Please select a shipping address.");
    if (!user) return;
    setIsPaying(true);

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    const customerName = selectedAddress?.full_name || user.user_metadata?.full_name || 'Client';

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);

    script.onload = async () => {
      try {
        const orderRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, addressId: selectedAddressId, customerName, currency: 'INR' })
        });

        const orderData = await orderRes.json();
        if (orderData.error) throw new Error(orderData.error);

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Gulab Mehndi",
          description: "Order Checkout",
          order_id: orderData.id,
          handler: async function (response: any) {
            const verifyRes = await fetch('/api/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              router.push(`/success?order_id=${orderData.db_order_id}`);
            } else {
              alert("Payment verification failed.");
            }
          },
          prefill: { name: customerName, email: user.email, contact: selectedAddress?.phone || "" },
          theme: { color: "#1B342B" },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
      } catch (error: any) {
        alert(`Could not start payment: ${error.message}`);
      } finally {
        setIsPaying(false);
      }
    };
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-[#FDFBF7]">
      <div className="w-8 h-8 border-2 border-[#1B342B]/20 border-t-[#A67C52] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif text-[#1B342B] mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-[#1B342B]/10">
              <h2 className="text-lg font-bold text-[#1B342B] uppercase tracking-widest mb-6 border-b border-[#1B342B]/10 pb-4">Shipping Address</h2>

              {!showForm ? (
                <div className="space-y-4">
                  {addresses.length === 0 && <p className="text-sm text-[#1B342B]/60 italic">No saved addresses.</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 border rounded-sm cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-[#A67C52] bg-[#A67C52]/5 ring-1 ring-[#A67C52]' : 'border-[#1B342B]/20 hover:border-[#1B342B]/40'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-[#1B342B] text-sm">{addr.full_name}</span>
                          <button onClick={(e) => { e.stopPropagation(); openEditForm(addr); }} className="text-[#A67C52] text-xs font-bold uppercase hover:underline">Edit</button>
                        </div>
                        <p className="text-xs text-[#1B342B]/70 leading-relaxed">
                          {addr.street_address}<br/>
                          {addr.city}, {addr.state} {addr.postal_code}<br/>
                          {addr.country}<br/>
                          <span className="mt-2 block font-medium">Phone: {addr.phone}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  {addresses.length < 2 && (
                    <button onClick={() => setShowForm(true)} className="mt-4 border border-[#1B342B] text-[#1B342B] px-6 py-3 rounded-sm hover:bg-[#1B342B] hover:text-[#FDFBF7] transition-all duration-300 uppercase text-xs tracking-[0.2em] font-bold w-full md:w-auto">
                      + Add New Address
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="Full Name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="border border-[#1B342B]/15 p-3 text-sm outline-none rounded-sm" />
                    <input required type="tel" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="border border-[#1B342B]/15 p-3 text-sm outline-none rounded-sm" />
                  </div>
                  <input required placeholder="Street Address" value={formData.street_address} onChange={e => setFormData({...formData, street_address: e.target.value})} className="w-full border border-[#1B342B]/15 p-3 text-sm outline-none rounded-sm" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="border border-[#1B342B]/15 p-3 text-sm outline-none rounded-sm" />
                    <input required placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="border border-[#1B342B]/15 p-3 text-sm outline-none rounded-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="PIN / Postal Code" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} className="border border-[#1B342B]/15 p-3 text-sm outline-none rounded-sm" />
                    <input required placeholder="Country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="border border-[#1B342B]/15 p-3 text-sm outline-none rounded-sm" />
                  </div>
                  <div className="flex space-x-4 pt-4 border-t border-[#1B342B]/10">
                    <button type="submit" className="bg-[#1B342B] text-white px-6 py-3 rounded-sm hover:bg-[#A67C52] text-xs font-bold uppercase tracking-widest transition-colors">Save Address</button>
                    <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-[#1B342B]/60 hover:text-[#1B342B] text-xs font-bold uppercase tracking-widest transition-colors">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-sm shadow-sm border border-[#1B342B]/10 sticky top-24">
              <h2 className="text-lg font-bold text-[#1B342B] uppercase tracking-widest mb-6 border-b border-[#1B342B]/10 pb-4">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-bold text-[#1B342B]">{item.product.name}</p>
                      <p className="text-xs text-[#1B342B]/60 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#1B342B]">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#1B342B]/10 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm text-[#1B342B]/80"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-[#1B342B]/80"><span>Shipping</span><span className="text-green-600 font-medium">Free</span></div>
                <div className="flex justify-between text-lg font-bold text-[#1B342B] pt-4 border-t border-[#1B342B]/10 mt-4"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>
              <button onClick={handlePayment} disabled={isPaying || !selectedAddressId} className="w-full bg-[#1B342B] text-[#FDFBF7] py-4 rounded-sm hover:bg-[#A67C52] transition-colors duration-300 uppercase text-xs tracking-[0.2em] font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                {isPaying ? "Connecting to Bank..." : "Proceed to Pay"}
              </button>
              {!selectedAddressId && !showForm && (
                <p className="text-[10px] text-red-500 text-center mt-3 uppercase tracking-widest font-bold">Please select an address</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}