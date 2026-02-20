"use client";

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client'; // ✅ Updated import

export default function AdminOrdersPage() {
  // ✅ Stable singleton initialized directly without useRef wrapper
  const supabase = getSupabaseClient(); 

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setOrders(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    // ✅ Optimistic update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <header className="mb-10">
        <h1 className="text-4xl font-serif text-[#1B342B] mb-2">Shop Orders</h1>
        <p className="text-[#1B342B]/60 text-sm font-light">Process e-commerce purchases and manage shipping statuses.</p>
      </header>

      <div className="bg-white border border-[#1B342B]/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFBF7] border-b border-[#1B342B]/5">
                {['Order ID', 'Customer', 'Order Date', 'Total', 'Status', 'Action'].map((h, i) => (
                  <th key={h} className={`px-8 py-6 text-[10px] uppercase tracking-widest text-[#1B342B]/50 font-bold ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center text-[#A67C52] text-xs uppercase tracking-widest animate-pulse font-bold">Loading Orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center text-[#1B342B]/40 italic text-sm">No orders found.</td></tr>
              ) : orders.map((o, index) => (
                <tr key={o.id} className={`border-b border-[#1B342B]/5 hover:bg-[#FDFBF7]/60 transition-colors duration-300 ${index === orders.length - 1 ? 'border-none' : ''}`}>
                  <td className="px-8 py-6 font-mono text-[#1B342B]/40 text-xs uppercase">{o.id.split('-')[0]}</td>
                  <td className="px-8 py-6 text-[#1B342B] text-sm font-bold">{o.customer_name}</td>
                  <td className="px-8 py-6 text-[#1B342B]/60 text-sm font-medium">
                    {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-6 text-[#1B342B] text-sm font-bold tracking-wide">${o.total?.toFixed(2)}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold rounded-full ${
                      o.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                      o.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      o.status === 'Processing' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-red-50 text-red-700 border border-red-200'}`}>
                      {o.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <select
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      value={o.status || 'Pending'}
                      className="bg-[#FDFBF7] text-xs font-bold tracking-wider border border-[#1B342B]/10 rounded-full px-4 py-2 text-[#1B342B] focus:ring-1 focus:ring-[#A67C52] outline-none cursor-pointer hover:border-[#A67C52] transition-colors appearance-none text-center"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}