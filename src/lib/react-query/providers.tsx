'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { useState, type ReactNode } from 'react'
import { createQueryClient } from './query-client'

// Lazy load DevTools for faster initial load
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then(mod => mod.ReactQueryDevtools),
  { ssr: false }
)

interface ReactQueryProviderProps {
  children: ReactNode
}

/**
 * Provider React Query pour l'application
 * Crée un nouveau QueryClient par instance pour éviter les problèmes de cache entre requêtes SSR
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Créer un nouveau client par instance (important pour SSR)
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools uniquement en développement */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}
