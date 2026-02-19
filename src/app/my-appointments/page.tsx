"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MyAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Animation States
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null); 
  const [isInviteOpen, setIsInviteOpen] = useState(false); // Controls the 3D doors

useEffect(() => {

  let isMounted = true;

  const fetchMyAppointments = async () => {

    setLoading(true);

    const { data: { session } } =
      await supabase.auth.getSession();

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const { data, error } =
      await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", session.user.id)   // FIXED HERE
        .order("created_at", { ascending: false });

    if (!isMounted) return;

    if (!error && data) {
      setAppointments(data);
    }

    if (!data || data.length === 0) {

      setAppointments([
        {
          id: "APT-DEMO",
          service_type: "Bridal Henna Consultation",
          created_at: new Date().toISOString(),
          status: "Pending",
          phone: session.user.user_metadata?.phone_number,
          email: session.user.email,
          name: session.user.user_metadata?.full_name,
        },
      ]);

    }

    setLoading(false);

  };

  fetchMyAppointments();

  return () => {
    isMounted = false;
  };

}, []);


  // --- TRIGGER INVITATION ANIMATION ---
  const handleOpenAppt = (appt: any) => {
    setSelectedAppt(appt);
    setIsInviteOpen(false); // Start with doors closed
    // Wait half a second, then swing the doors open!
    setTimeout(() => {
      setIsInviteOpen(true);
    }, 500);
  };

  const closeModal = () => {
    setIsInviteOpen(false); // Close doors first
    setTimeout(() => {
      setSelectedAppt(null); // Hide modal after doors close
    }, 800); 
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-serif text-[#1B342B] mb-2">My Appointments</h1>
          <p className="text-[#1B342B]/60 text-sm">Track your bridal and henna consultation requests.</p>
        </header>

        {loading ? (
          <div className="flex justify-center p-20">
            <p className="text-[#A67C52] text-xs uppercase tracking-widest animate-pulse font-bold">Syncing Schedule...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((appt) => (
              <div 
                key={appt.id} 
                onClick={() => handleOpenAppt(appt)}
                className="bg-white border border-[#1B342B]/5 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#1B342B] leading-tight max-w-[200px]">{appt.service_type || 'Henna Consultation'}</h3>
                    <p className="text-xs text-[#1B342B]/50 font-mono mt-2">
                      {new Date(appt.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold rounded-full border shrink-0
                    ${appt.status === 'Confirmed' || appt.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                      appt.status === 'Pending' || !appt.status ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                  >
                    {appt.status || 'Pending'}
                  </span>
                </div>
                <div className="border-t border-[#1B342B]/5 pt-4 mt-2">
                  <p className="text-[10px] text-[#A67C52] font-bold uppercase tracking-widest group-hover:text-[#1B342B] transition-colors flex items-center">
                    Open Invitation <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- THE 3D GATEFOLD INVITATION MODAL --- */}
        {selectedAppt && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-opacity" onClick={closeModal}>
            
            {/* Perspective container for 3D swinging doors */}
            <div 
              className="relative w-full max-w-sm h-[450px] mx-auto perspective-[2000px]" 
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Close Button floating outside */}
              <button onClick={closeModal} className="absolute -top-16 right-0 text-white/50 hover:text-white transition-colors z-50">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              {/* 1. THE INNER INVITATION CARD */}
              <div className="absolute inset-0 bg-[#FDFBF7] shadow-2xl z-0 flex flex-col items-center justify-center p-8 border-4 border-double border-[#A67C52]/30">
                
                {/* Decorative Gold Header */}
                <svg className="w-12 h-12 text-[#A67C52] mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                
                <p className="text-[10px] text-[#A67C52] font-bold uppercase tracking-[0.3em] mb-2">You Are Invited For A</p>
                <h2 className="text-3xl font-serif text-[#1B342B] text-center leading-tight mb-6">Bridal<br/>Consultation</h2>
                
                <div className="w-full space-y-4 mb-8">
                  <div className="text-center border-b border-[#1B342B]/10 pb-4">
                    <p className="text-[10px] text-[#1B342B]/50 font-bold uppercase tracking-widest mb-1">Honored Guest</p>
                    <p className="text-sm font-bold text-[#1B342B]">{selectedAppt.name || selectedAppt.first_name || 'Valued Client'}</p>
                  </div>
                  
                  <div className="text-center border-b border-[#1B342B]/10 pb-4">
                    <p className="text-[10px] text-[#1B342B]/50 font-bold uppercase tracking-widest mb-1">Service Selected</p>
                    <p className="text-sm font-medium text-[#1B342B]">{selectedAppt.service_type || 'Henna Consultation'}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] text-[#1B342B]/50 font-bold uppercase tracking-widest mb-1">RSVP Status</p>
                    <p className={`text-sm font-bold ${selectedAppt.status === 'Confirmed' ? 'text-green-600' : 'text-[#A67C52]'}`}>
                      {selectedAppt.status || 'Pending Review'}
                    </p>
                  </div>
                </div>

                <p className="text-[9px] text-[#1B342B]/40 font-mono tracking-widest">ID: {selectedAppt.id.slice(0, 8).toUpperCase()}</p>
              </div>

              {/* 2. LEFT DOOR */}
              <div 
                className="absolute top-0 left-0 w-1/2 h-full bg-[#1B342B] origin-left border-r border-[#A67C52]/40 shadow-2xl z-20 flex items-center justify-end"
                style={{ 
                  transition: 'transform 1000ms cubic-bezier(0.25, 1, 0.5, 1)',
                  transform: isInviteOpen ? 'rotateY(-110deg)' : 'rotateY(0deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
              </div>

              {/* 3. RIGHT DOOR (Holds the gold wax seal) */}
              <div 
                className="absolute top-0 right-0 w-1/2 h-full bg-[#1B342B] origin-right border-l border-[#A67C52]/40 shadow-2xl z-20 flex items-center justify-start"
                style={{ 
                  transition: 'transform 1000ms cubic-bezier(0.25, 1, 0.5, 1)',
                  transform: isInviteOpen ? 'rotateY(110deg)' : 'rotateY(0deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Gold Seal that splits with the doors */}
                <div className="absolute top-1/2 -left-6 -translate-y-1/2 w-12 h-12 bg-[#A67C52] rounded-full flex items-center justify-center shadow-lg border-2 border-[#825e3b] z-30">
                  <span className="text-[#FDFBF7] font-serif text-lg font-bold">G</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}