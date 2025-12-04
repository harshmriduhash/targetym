'use client'

import { useUser } from '@clerk/nextjs'
import { UserProfile } from '@clerk/nextjs'
import { Loader2, User, Camera, ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export function ProfileSettings() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun utilisateur connecté</p>
      </div>
    )
  }

  const fullName = user.fullName || user.firstName || 'Utilisateur'
  const email = user.primaryEmailAddress?.emailAddress || ''

  // Get initials for fallback
  const initials = fullName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <User className="h-5 w-5" />
          Profil Utilisateur
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez vos informations personnelles et vos préférences de compte
        </p>
      </div>

      <Separator />

      {/* Profile Summary Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage
                src={user.imageUrl}
                alt={fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary to-blue-400 text-white text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-2xl font-bold">{fullName}</h4>
                <p className="text-sm text-muted-foreground mt-1">{email}</p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Actif
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Compte créé</p>
                <p className="font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Dernière mise à jour</p>
                <p className="font-medium">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                size="sm"
                onClick={() => {
                  // Open Clerk's user button to manage profile
                  const userButton = document.querySelector('[data-clerk-id]')
                  if (userButton) {
                    (userButton as HTMLElement).click()
                  }
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                Modifier la photo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open('https://dashboard.clerk.com', '_blank')
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Gérer sur Clerk
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Informations supplémentaires */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Informations du compte</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Prénom</p>
            <p className="font-medium">{user.firstName || 'Non renseigné'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Nom</p>
            <p className="font-medium">{user.lastName || 'Non renseigné'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Email principal</p>
            <p className="font-medium">{email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Email vérifié</p>
            <p className="font-medium">
              {user.primaryEmailAddress?.verification?.status === 'verified' ? (
                <Badge variant="default" className="text-xs">
                  ✓ Vérifié
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Non vérifié
                </Badge>
              )}
            </p>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Clerk UserProfile Component */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Gérer le profil complet</h4>
        <p className="text-sm text-muted-foreground mb-6">
          Utilisez l'interface complète de Clerk pour gérer votre profil, sécurité, et paramètres avancés.
        </p>

        <div className="rounded-xl border bg-card overflow-hidden">
          <UserProfile
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-0 bg-transparent',
                navbar: 'hidden',
                pageScrollBox: 'p-6',
                headerTitle: 'text-2xl font-bold',
                headerSubtitle: 'text-muted-foreground',
                formButtonPrimary:
                  'bg-primary hover:bg-primary/90 text-primary-foreground',
                formFieldInput:
                  'border-input bg-background',
                identityPreviewEditButton:
                  'text-primary hover:text-primary/80',
              },
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              💡 Astuce de gestion de profil
            </h5>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Vous pouvez gérer votre photo de profil, nom, email, et paramètres de sécurité directement
              via l'interface Clerk ci-dessus. Tous les changements seront automatiquement synchronisés
              dans l'application.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
