// LoginPage
"use client";

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client'; // ✅ Updated import
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();

  const [view, setView] = useState<'LOGIN' | 'SIGNUP' | 'VERIFY'>('LOGIN');
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const routeUser = async (userId: string) => {
    const supabase = getSupabaseClient(); // ✅ Updated initialization
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, phone_number')
      .eq('id', userId)
      .maybeSingle();

    if (error) console.error("Profile fetch error:", error.message);

    if (!profile || !profile.phone_number) {
      router.push('/complete-profile');
      return;
    }
    if (profile.role === 'admin') {
      router.push('/admin');
      return;
    }
    router.push('/');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    const supabase = getSupabaseClient(); // ✅ Updated initialization

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, phone_number: phone } }
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setView('VERIFY');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    const supabase = getSupabaseClient(); // ✅ Updated initialization

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    });

    if (error) {
      setErrorMsg("Invalid code. Please check your email and try again.");
    } else if (data.session) {
      await routeUser(data.session.user.id);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    const supabase = getSupabaseClient(); // ✅ Updated initialization

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg("Invalid email or password.");
    } else if (data.session) {
      await routeUser(data.session.user.id);
    }
    setLoading(false);
  };

  const handleOAuthLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    const supabase = getSupabaseClient(); // ✅ Updated initialization

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center px-6 relative py-20">
      <div className="absolute top-0 left-0 w-full h-1/3 bg-[#1B342B] -z-10"></div>

      <div className="w-full max-w-md bg-white border border-[#1B342B]/10 rounded-sm shadow-2xl p-8 md:p-10">
        <div className="flex flex-col items-center mb-8">
          <Link href="/"><Image src="/LOGO/LOGO.png" alt="Gulab Mehndi" width={100} height={30} className="mb-6 object-contain" /></Link>
          <h1 className="text-2xl font-serif text-[#1B342B]">
            {view === 'LOGIN' && "Welcome Back"}
            {view === 'SIGNUP' && "Create an Account"}
            {view === 'VERIFY' && "Verify Your Email"}
          </h1>
          <p className="text-[#A67C52] text-[10px] uppercase tracking-widest mt-2 font-bold text-center">
            {view === 'VERIFY' ? "Check your inbox for the code" : "Client & Admin Portal"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs text-center rounded-sm">
            {errorMsg}
          </div>
        )}

        {(view === 'LOGIN' || view === 'SIGNUP') && (
          <>
            <div className="mb-6">
              <button
                onClick={handleOAuthLogin}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-[#1B342B]/20 text-[#1B342B] py-3.5 rounded-sm hover:bg-[#1B342B]/5 transition-colors duration-300 shadow-sm disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-[11px] uppercase tracking-widest font-bold">Continue with Google</span>
              </button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 h-px bg-[#1B342B]/10"></div>
              <span className="text-[#1B342B]/40 text-[10px] uppercase tracking-widest font-bold">Or</span>
              <div className="flex-1 h-px bg-[#1B342B]/10"></div>
            </div>

            <form onSubmit={view === 'LOGIN' ? handleLogin : handleSignUp} className="flex flex-col space-y-4">
              {view === 'SIGNUP' && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Full Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Doe" className="border border-[#1B342B]/15 p-3 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm outline-none" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Phone Number</label>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 00000 00000" className="border border-[#1B342B]/15 p-3 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm outline-none" />
                  </div>
                </>
              )}

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="border border-[#1B342B]/15 p-3 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm outline-none" />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80">Password</label>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="border border-[#1B342B]/15 p-3 focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] text-sm rounded-sm outline-none" />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#1B342B] text-[#FDFBF7] py-4 mt-2 rounded-sm hover:bg-[#A67C52] transition-colors duration-500 uppercase text-xs tracking-[0.2em] font-bold disabled:opacity-50 shadow-md">
                {loading ? 'Processing...' : (view === 'LOGIN' ? 'Login' : 'Create Account')}
              </button>
            </form>
          </>
        )}

        {view === 'VERIFY' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col space-y-5">
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B342B]/80 text-center">Enter 6-Digit Code</label>
              <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="• • • • • •" className="border border-[#1B342B]/15 p-4 text-center text-2xl tracking-[0.5em] focus:ring-1 focus:ring-[#A67C52] focus:border-[#A67C52] bg-white text-[#1B342B] rounded-sm outline-none font-mono" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#A67C52] text-[#FDFBF7] py-4 mt-4 rounded-sm hover:bg-[#1B342B] transition-colors duration-500 uppercase text-xs tracking-[0.2em] font-bold disabled:opacity-50 shadow-md">
              {loading ? 'Verifying...' : 'Verify & Enter'}
            </button>
          </form>
        )}

        {view !== 'VERIFY' && (
          <div className="mt-8 text-center border-t border-[#1B342B]/10 pt-6">
            <p className="text-[#1B342B]/70 text-xs">
              {view === 'LOGIN' ? "New client?" : "Already verified?"}
              <button onClick={() => setView(view === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="ml-2 text-[#A67C52] font-bold uppercase tracking-widest hover:text-[#1B342B] transition-colors">
                {view === 'LOGIN' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}