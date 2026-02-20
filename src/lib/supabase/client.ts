/**
 * lib/supabase/client.ts
 *
 * TRUE singleton — one client for the entire browser session.
 * Previously: useRef inside Navbar = new logical client per mount.
 * Now: module-level variable = created once, reused everywhere.
 */

import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}