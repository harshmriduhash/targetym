'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { AuthLayout, AuthCard } from '../components/AuthLayout'

function VerifyContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'votre email'

  return (
    <AuthLayout
      title="Vérifiez votre email"
      subtitle="Nous avons envoyé un lien de vérification à votre adresse email."
      gradientFrom="from-emerald-600"
      gradientVia="via-teal-600"
      gradientTo="to-cyan-600"
    >
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-8 text-sm font-medium"
      >
        <Mail className="w-4 h-4" />
        Retour à l'accueil
      </Link>

      <AuthCard>
        <div className="text-center space-y-6">
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Email envoyé ! ✉️
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Nous avons envoyé un lien de vérification à
            </p>
            <p className="font-semibold text-slate-900 dark:text-white">
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-6 space-y-3 text-left">
            <p className="font-semibold text-blue-900 dark:text-blue-300 text-sm">
              Prochaines étapes :
            </p>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">1.</span>
                <span>Ouvrez votre boîte de réception</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">2.</span>
                <span>Cliquez sur le lien de vérification (expire dans 24h)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">3.</span>
                <span>Vous serez redirigé vers votre dashboard</span>
              </li>
            </ul>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <p className="text-sm text-amber-800 dark:text-amber-400">
              <strong>Email non reçu ?</strong> Vérifiez vos spams ou{' '}
              <button className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-300">
                renvoyez l'email
              </button>
            </p>
          </div>

          {/* Action */}
          <div className="pt-4">
            <Link href="/auth/sign-in" className="block">
              <Button variant="outline" className="w-full h-12">
                Retour à la connexion
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Help text */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Besoin d'aide ?{' '}
              <Link
                href="/contact"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Chargement...</p>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}
