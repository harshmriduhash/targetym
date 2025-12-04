'use client'

import { useUser } from '@clerk/nextjs'
import { Sparkles } from 'lucide-react'

export function WelcomeCard() {
  const { user, isLoaded } = useUser()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bon matin'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  if (!isLoaded) {
    return (
      <div className="bg-primary rounded-xl p-3 sm:p-4 text-white shadow-lg">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
          <div className="h-6 w-32 bg-blue-400/30 rounded animate-pulse"></div>
        </div>
        <div className="h-4 w-48 bg-blue-400/30 rounded animate-pulse"></div>
      </div>
    )
  }

  const firstName = user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Utilisateur'

  return (
    <div className="bg-primary rounded-xl p-3 sm:p-4 text-white shadow-lg">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
        <h2 className="text-lg sm:text-xl font-bold">{getGreeting()}, {firstName}</h2>
        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <p className="text-xs sm:text-sm text-blue-100">
        Bienvenue sur votre tableau de bord Targetym AI
      </p>
    </div>
  )
}
