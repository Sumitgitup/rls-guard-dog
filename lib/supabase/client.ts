
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Define a function to create a client for use in browser components
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}