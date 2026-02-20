"use client";

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client'; // ✅ Updated import

export default function AdminAppointmentsPage() {
  // ✅ Removed unnecessary useRef wrapper, initialized directly
  const supabase = getSupabaseClient(); 

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setAppointments(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    // ✅ Optimistic update — no full refetch needed
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-serif text-[#1B342B] mb-2">Bridal Appointments</h1>
          <p className="text-[#1B342B]/60 text-sm font-light">Review consultation requests, contact brides, and confirm bookings.</p>
        </div>
        <div className="bg-white border border-[#1B342B]/10 px-6 py-3 rounded-full shadow-sm">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#A67C52]">
            Pending Requests: <span className="text-[#1B342B]">{appointments.filter(a => a.status === 'Pending' || !a.status).length}</span>
          </p>
        </div>
      </header>

      <div className="bg-white border border-[#1B342B]/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDFBF7] border-b border-[#1B342B]/5">
                {['Client Details', 'Service Type', 'Date Requested', 'Status', 'Action'].map((h, i) => (
                  <th key={h} className={`px-8 py-6 text-[10px] uppercase tracking-widest text-[#1B342B]/50 font-bold ${i === 3 ? 'text-center' : i === 4 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-[#A67C52] text-xs uppercase tracking-widest animate-pulse font-bold">Loading Appointments...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-[#1B342B]/40 italic text-sm">No appointments found.</td></tr>
              ) : appointments.map((appt, index) => (
                <tr key={appt.id} className={`border-b border-[#1B342B]/5 hover:bg-[#FDFBF7]/60 transition-colors duration-300 ${index === appointments.length - 1 ? 'border-none' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#1B342B]/5 flex items-center justify-center text-[#A67C52] font-serif text-sm mr-3 shadow-sm">
                        {appt.first_name?.charAt(0).toUpperCase() ?? 'U'}
                      </div>
                      <p className="text-[#1B342B] text-sm font-bold">{appt.first_name} {appt.last_name}</p>
                    </div>
                    <div className="flex flex-col space-y-1 ml-11">
                      <a href={`mailto:${appt.email}`} className="text-[#1B342B]/70 hover:text-[#A67C52] text-xs flex items-center transition-colors">
                        <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {appt.email || 'No Email'}
                      </a>
                      <a href={`tel:${appt.phone}`} className="text-[#A67C52] hover:text-[#1B342B] text-xs font-mono flex items-center transition-colors">
                        <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {appt.phone || 'No Phone'}
                      </a>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[#1B342B]/80 text-sm font-medium">{appt.service_type || 'General Inquiry'}</td>
                  <td className="px-8 py-6 text-[#1B342B]/60 text-sm font-medium">
                    {appt.created_at ? new Date(appt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold rounded-full ${
                      appt.status === 'Confirmed' || appt.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                      appt.status === 'Pending' || !appt.status ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      'bg-red-50 text-red-700 border border-red-200'}`}>
                      {appt.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <select
                      onChange={(e) => updateStatus(appt.id, e.target.value)}
                      value={appt.status || 'Pending'}
                      className="bg-[#FDFBF7] text-xs font-bold tracking-wider border border-[#1B342B]/10 rounded-full px-4 py-2.5 text-[#1B342B] focus:ring-1 focus:ring-[#A67C52] outline-none cursor-pointer hover:border-[#A67C52] transition-all duration-300 appearance-none text-center shadow-sm"
                    >
                      <option value="Pending">Set Pending</option>
                      <option value="Confirmed">Confirm Booking</option>
                      <option value="Completed">Mark Completed</option>
                      <option value="Cancelled">Cancel Booking</option>
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