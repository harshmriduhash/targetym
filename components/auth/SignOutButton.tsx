'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

interface SignOutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  children?: React.ReactNode
}

export function SignOutButton({
  variant = 'ghost',
  size = 'default',
  showIcon = true,
  children
}: SignOutButtonProps) {
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

  return (
    <Button
      onClick={handleSignOut}
      variant={variant}
      size={size}
      disabled={isLoading}
      className="gap-2"
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {children || (isLoading ? 'Déconnexion...' : 'Se déconnecter')}
    </Button>
  )
}
