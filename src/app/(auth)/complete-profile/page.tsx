// CompleteProfilePage
"use client";

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client'; // ✅ Updated import
import { useRouter } from 'next/navigation';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabaseClient(); // ✅ Updated initialization
      const { data: { user } } = await supabase.auth.getUser(); 
      if (!user) {
        router.push('/login');
      } else {
        setUserId(user.id);
      }
    };
    checkUser();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!userId) {
      router.push('/login');
      return;
    }

    const supabase = getSupabaseClient(); // ✅ Updated initialization
    const normalizedPhone = phone.replace(/\s+/g, '');

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ phone_number: normalizedPhone })
      .eq('id', userId);

    if (profileError) {
      setErrorMsg("Database Error: Could not save phone number.");
      setLoading(false);
      return;
    }

    if (password.length > 0) {
      if (password.length < 6) {
        setErrorMsg("If adding a password, it must be at least 6 characters.");
        setLoading(false);
        return;
      }
      const { error: passwordError } = await supabase.auth.updateUser({ password });
      if (passwordError) console.error("Password link silently failed:", passwordError.message);
    }

    router.push('/');
    setLoading(false);
  };

  return (
    <section className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center px-6 relative py-20">
      <div className="absolute top-0 left-0 w-full h-1/3 bg-[#1B342B] -z-10"></div>

      <div className="w-full max-w-md bg-white border border-[#1B342B]/10 rounded-sm shadow-2xl p-8 md:p-12 text-center">
        <h1 className="text-3xl font-serif text-[#1B342B] mb-2">One Last Step</h1>
        <p className="text-[#1B342B]/70 text-sm mb-8">
          Please provide a contact number for bookings. You may also create an optional password.
        </p>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs text-center rounded-sm font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="flex flex-col space-y-5 text-left">
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Phone Number *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 00000 00000"
              className="border border-[#1B342B]/15 p-3 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col space-y-2 relative">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Account Password (Optional)</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to just use Google"
                className="w-full border border-[#1B342B]/15 p-3 pr-12 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#1B342B]/40 hover:text-[#A67C52] focus:outline-none transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1B342B] text-[#FDFBF7] py-4 mt-4 rounded-sm hover:bg-[#A67C52] transition-colors duration-500 uppercase text-xs tracking-[0.2em] font-bold disabled:opacity-50 shadow-md"
          >
            {loading ? 'Entering Site...' : 'Complete Account'}
          </button>
        </form>
      </div>
    </section>
  );
}