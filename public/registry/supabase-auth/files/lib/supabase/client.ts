import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/src/types/database.types'

/**
 * Supabase client for browser (Client Components)
 * Avec Realtime activé pour la synchronisation temps réel
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          eventsPerSecond: 10, // Rate limiting pour éviter les abus
        },
      },
    }
  )
}
