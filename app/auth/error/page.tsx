'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { AuthLayout, AuthCard } from '../components/AuthLayout'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: 'Erreur de configuration',
      description: 'Il y a un problème avec la configuration du serveur. Veuillez contacter le support.'
    },
    AccessDenied: {
      title: 'Accès refusé',
      description: 'Vous n\'avez pas la permission d\'accéder à cette ressource.'
    },
    Verification: {
      title: 'Erreur de vérification',
      description: 'Le lien de vérification a expiré ou est invalide. Veuillez en demander un nouveau.'
    },
    OAuthSignin: {
      title: 'Erreur OAuth',
      description: 'Erreur lors de la connexion avec le fournisseur OAuth.'
    },
    OAuthCallback: {
      title: 'Erreur OAuth',
      description: 'Erreur lors du retour depuis le fournisseur OAuth.'
    },
    OAuthCreateAccount: {
      title: 'Erreur OAuth',
      description: 'Impossible de créer un compte avec ce fournisseur OAuth.'
    },
    EmailCreateAccount: {
      title: 'Erreur de création de compte',
      description: 'Impossible de créer un compte avec cette adresse email.'
    },
    Callback: {
      title: 'Erreur de callback',
      description: 'Une erreur s\'est produite lors de l\'authentification.'
    },
    OAuthAccountNotLinked: {
      title: 'Compte non lié',
      description: 'Cette adresse email est déjà utilisée avec un autre compte. Veuillez vous connecter avec la méthode d\'origine.'
    },
    EmailSignin: {
      title: 'Erreur d\'envoi d\'email',
      description: 'Impossible d\'envoyer l\'email de connexion. Veuillez réessayer.'
    },
    CredentialsSignin: {
      title: 'Identifiants invalides',
      description: 'L\'email ou le mot de passe est incorrect. Veuillez réessayer.'
    },
    SessionRequired: {
      title: 'Session requise',
      description: 'Vous devez être connecté pour accéder à cette page.'
    },
    Default: {
      title: 'Erreur d\'authentification',
      description: 'Une erreur s\'est produite lors de l\'authentification. Veuillez réessayer.'
    }
  }

  const errorInfo = errorMessages[error || 'Default'] || errorMessages.Default

  return (
    <AuthLayout
      title="Une erreur est survenue"
      subtitle="Ne vous inquiétez pas, vous pouvez réessayer ou contacter notre support."
      gradientFrom="from-red-600"
      gradientVia="via-orange-600"
      gradientTo="to-red-600"
    >
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </Link>

      <AuthCard>
        <div className="text-center space-y-6">
          {/* Error icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-500/10 dark:bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
            </div>
          </div>

          {/* Error message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {errorInfo.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {errorInfo.description}
            </p>
          </div>

          {/* Error code */}
          {error && (
            <div className="inline-block px-4 py-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400 font-mono">
                Code: {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Link href="/auth/sign-in" className="block">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12">
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full h-12">
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>

          {/* Help text */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Besoin d'aide ?{' '}
              <Link
                href="/contact"
                className="font-semibold text-blue-600 dark:text-purple-400 hover:text-blue-700 dark:hover:text-purple-300 transition-colors"
              >
                Contactez notre support
              </Link>
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Chargement...</p>
          </div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  )
}
