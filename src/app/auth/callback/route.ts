import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const userId = data.session.user.id

      // ✅ Check if Google OAuth user needs to complete their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', userId)
        .maybeSingle()

      // ✅ If no phone number → send to complete-profile, else home
      if (!profile?.phone_number) {
        return NextResponse.redirect(new URL('/complete-profile', origin))
      }

      return NextResponse.redirect(new URL('/', origin))
    }
  }

  // Auth failed → back to login
  return NextResponse.redirect(new URL('/login', origin))
}