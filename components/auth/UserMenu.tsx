'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UserMenu() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  // Don't render if Clerk hasn't loaded or no user
  if (!isLoaded || !user) return null

  // Get user initials for avatar fallback
  const fullName = user.fullName || user.firstName || ''
  const email = user.primaryEmailAddress?.emailAddress || ''

  const initials = fullName
    ? fullName
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : email
        .split('@')[0]
        .split('.')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.imageUrl} alt={fullName || email} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-blue-400 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {fullName || email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleNavigate('/dashboard/settings')}>
          <User className="mr-2 h-4 w-4" />
          <span>Mon profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigate('/dashboard/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isLoading}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? 'Déconnexion...' : 'Se déconnecter'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
