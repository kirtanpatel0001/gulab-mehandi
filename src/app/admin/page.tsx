"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Order {
  id: string;
  customer_name: string;
  created_at: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  total: number;
}

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  
  // Live Data States
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchLiveDashboardData = async () => {
      setLoading(true);

      const { count: customerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');
      setTotalCustomers(customerCount || 0);

      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      setTotalOrders(orderCount || 0);

      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending'); 
      setTotalBookings(bookingCount || 0);

      const { data: latestOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (latestOrders) {
        setRecentOrders(latestOrders as Order[]);
      }

      setLoading(false);
    };

    fetchLiveDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-[#A67C52] text-xs uppercase tracking-widest font-bold animate-pulse">Syncing Live Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* HEADER */}
      <header className="mb-10">
        <h1 className="text-4xl font-serif text-[#1B342B] mb-2">Command Center</h1>
        <p className="text-[#1B342B]/60 text-sm">Welcome back. Here is the live pulse of your business.</p>
      </header>
      
      {/* --- PREMIUM METRICS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* Total Orders Card */}
        <div className="bg-white border border-[#1B342B]/5 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#A67C52]/5 to-transparent rounded-bl-full -z-0"></div>
          
          <div className="w-12 h-12 rounded-full bg-[#1B342B]/5 flex items-center justify-center text-[#A67C52] mb-6 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <h3 className="text-[#1B342B]/60 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Total Orders</h3>
          <p className="text-4xl font-serif text-[#1B342B]">{totalOrders}</p>
        </div>

        {/* Total Bookings Card */}
        <div className="bg-white border border-[#1B342B]/5 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-500 group relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#A67C52]/5 to-transparent rounded-bl-full -z-0"></div>

           <div className="w-12 h-12 rounded-full bg-[#1B342B]/5 flex items-center justify-center text-[#A67C52] mb-6 group-hover:scale-110 transition-transform duration-500">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-[#1B342B]/60 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Pending Bookings</h3>
          <p className="text-4xl font-serif text-[#1B342B]">{totalBookings}</p>
        </div>

        {/* Total Customers Card */}
        <div className="bg-white border border-[#1B342B]/5 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-500 group relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#A67C52]/5 to-transparent rounded-bl-full -z-0"></div>

           <div className="w-12 h-12 rounded-full bg-[#1B342B]/5 flex items-center justify-center text-[#A67C52] mb-6 group-hover:scale-110 transition-transform duration-500">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <h3 className="text-[#1B342B]/60 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Total Clients</h3>
          <p className="text-4xl font-serif text-[#1B342B]">{totalCustomers}</p>
        </div>

      </div>

      {/* --- RECENT ORDERS SECTION --- */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-serif text-[#1B342B]">Recent Orders</h2>
        <Link href="/admin/orders">
          <button className="text-[10px] uppercase tracking-widest font-bold text-[#A67C52] hover:text-[#1B342B] transition-colors flex items-center">
            View All
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </Link>
      </div>

      {/* PREMIUM TABLE */}
      <div className="bg-white border border-[#1B342B]/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFBF7] border-b border-[#1B342B]/5">
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-[#1B342B]/50 font-bold">Order ID</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-[#1B342B]/50 font-bold">Customer</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-[#1B342B]/50 font-bold">Date</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-[#1B342B]/50 font-bold">Status</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-[#1B342B]/50 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-[#1B342B]/40 italic text-sm">
                    No orders have been placed yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, index) => (
                  <tr key={order.id} className={`border-b border-[#1B342B]/5 hover:bg-[#FDFBF7]/50 transition-colors ${index === recentOrders.length - 1 ? 'border-none' : ''}`}>
                    <td className="px-6 py-5 font-mono text-[#1B342B]/60 text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-5 text-[#1B342B] text-sm font-bold">{order.customer_name}</td>
                    <td className="px-6 py-5 text-[#1B342B]/60 text-sm">
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5">
                      {/* Fully rounded pill badges */}
                      <span className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold rounded-full 
                        ${order.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' : 
                          order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 
                          order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                          'bg-red-50 text-red-700 border border-red-200'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-[#1B342B]">${order.total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}