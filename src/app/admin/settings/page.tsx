"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate saving settings
    setTimeout(() => {
      setLoading(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      <header className="mb-10">
        <h1 className="text-4xl font-serif text-[#1B342B] mb-2">Store Settings</h1>
        <p className="text-[#1B342B]/60 text-sm">Manage your admin preferences and business details.</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Business Details Section */}
        <div className="bg-white border border-[#1B342B]/5 rounded-2xl shadow-sm p-8 md:p-10">
          <h2 className="text-xl font-serif text-[#1B342B] mb-6">Business Profile</h2>
          
          <form onSubmit={handleSave} className="flex flex-col space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Store Name</label>
                <input type="text" defaultValue="Gulab Mehndi" className="border border-[#1B342B]/15 p-3 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-lg outline-none transition-colors" />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Support Email</label>
                <input type="email" defaultValue="hello@gulabmehndi.com" className="border border-[#1B342B]/15 p-3 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-lg outline-none transition-colors" />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Business Address / Location</label>
              <input type="text" defaultValue="Surat, Gujarat, India" className="border border-[#1B342B]/15 p-3 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-lg outline-none transition-colors" />
            </div>

            <div className="pt-4 border-t border-[#1B342B]/5 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#1B342B] text-[#FDFBF7] px-8 py-3 rounded-lg hover:bg-[#A67C52] transition-colors duration-300 uppercase text-xs tracking-[0.2em] font-bold disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-100 rounded-2xl shadow-sm p-8 md:p-10 mb-12">
           <h2 className="text-xl font-serif text-red-700 mb-2">Danger Zone</h2>
           <p className="text-red-600/70 text-sm mb-6">These actions are permanent and cannot be undone.</p>
           
           <button onClick={() => alert("Please contact developer to clear database.")} className="bg-white border border-red-200 text-red-600 px-6 py-3 rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-300 uppercase text-xs tracking-widest font-bold shadow-sm">
             Clear Test Data
           </button>
        </div>

      </div>
    </div>
  );
}