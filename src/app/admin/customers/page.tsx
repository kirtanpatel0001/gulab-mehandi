"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true }); // Groups Admins together at the top

      if (!error && data) {
        setCustomers(data);
      }
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-serif text-[#1B342B] mb-2">Client Database</h1>
          <p className="text-[#1B342B]/60 text-sm font-light">View and manage all registered accounts and contact details.</p>
        </div>
        <div className="bg-white border border-[#1B342B]/10 px-6 py-3 rounded-full shadow-sm flex space-x-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#A67C52]">Total Accounts: <span className="text-[#1B342B]">{customers.length}</span></p>
        </div>
      </header>

      <div className="bg-white border border-[#1B342B]/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFBF7] border-b border-[#1B342B]/5">
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-[#1B342B]/50 font-bold">Account Holder</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-[#1B342B]/50 font-bold">Contact Info</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-[#1B342B]/50 font-bold">Access Level</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-[#1B342B]/50 font-bold text-right">System ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-[#A67C52] text-xs uppercase tracking-widest animate-pulse font-bold">Loading Database...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-[#1B342B]/40 italic text-sm">No accounts found.</td>
                </tr>
              ) : (
                customers.map((customer, index) => (
                  <tr key={customer.id} className={`border-b border-[#1B342B]/5 hover:bg-[#FDFBF7]/60 transition-colors duration-300 ${index === customers.length - 1 ? 'border-none' : ''}`}>
                    
                    {/* AVATAR & NAME (Mapped to full_name) */}
                    <td className="px-8 py-6 flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif text-lg mr-4 shadow-sm border 
                        ${customer.role === 'admin' ? 'bg-[#A67C52]/10 text-[#A67C52] border-[#A67C52]/20' : 'bg-[#1B342B]/5 text-[#1B342B]/60 border-[#1B342B]/10'}`}>
                        {customer.full_name ? customer.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="text-[#1B342B] text-sm font-bold">{customer.full_name || 'Incomplete Profile'}</span>
                    </td>
                    
                    {/* EMAIL & PHONE */}
                    <td className="px-8 py-6">
                      <p className="text-[#1B342B]/80 text-sm font-medium mb-1">{customer.email}</p>
                      <p className="text-[#A67C52] text-xs font-mono">{customer.phone_number || 'No Phone Provided'}</p>
                    </td>

                    {/* ROLE BADGE */}
                    <td className="px-8 py-6">
                      {customer.role === 'admin' ? (
                         <span className="px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          Admin
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                          Client User
                        </span>
                      )}
                    </td>

                    {/* ID */}
                    <td className="px-8 py-6 font-mono text-[#1B342B]/30 text-xs uppercase text-right">
                      {customer.id.split('-')[0]}
                    </td>
                    
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