'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { Target, Shield } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Subtle background accents */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>

      {/* Main centered content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Compact Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:scale-105">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Targetym</h1>
          </Link>
        </div>

        {/* Sign In Card */}
        <div className="daisy-card bg-slate-900/90 backdrop-blur-md border border-slate-800/80 shadow-2xl shadow-black/30 overflow-hidden">
          <div className="daisy-card-body p-8">
            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Connexion
              </h2>
              <p className="text-sm text-slate-400">
                Accédez à votre espace professionnel
              </p>
            </div>

            {/* Clerk Sign In Component */}
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none p-0 border-0',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton:
                    'bg-slate-800/80 border border-slate-700 text-slate-100 hover:bg-slate-700 hover:border-slate-600 rounded-lg font-semibold transition-all duration-200 h-11 shadow-sm hover:shadow-md',
                  socialButtonsBlockButtonText: 'font-semibold text-sm',
                  socialButtonsIconButton:
                    'border-slate-700 hover:border-slate-600',
                  dividerLine: 'bg-slate-700',
                  dividerText: 'text-slate-500 text-xs uppercase tracking-widest font-bold',
                  formButtonPrimary:
                    'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-bold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200 h-11 hover:scale-[1.02]',
                  formFieldInput:
                    'bg-slate-800/50 border-2 border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-11 hover:border-slate-600',
                  formFieldLabel: 'text-slate-300 font-semibold text-sm',
                  footerActionLink:
                    'text-blue-400 hover:text-blue-300 font-semibold text-sm underline-offset-4 hover:underline',
                  identityPreviewEditButton:
                    'text-blue-400 hover:text-blue-300 font-medium',
                  formResendCodeLink:
                    'text-blue-400 hover:text-blue-300 font-semibold',
                  otpCodeFieldInput:
                    'border-2 border-slate-700 bg-slate-800/50 text-white rounded-lg focus:border-blue-500',
                  formFieldInputShowPasswordButton:
                    'text-slate-400 hover:text-slate-300',
                  formFieldAction:
                    'text-blue-400 hover:text-blue-300 font-medium',
                  footerActionText: 'text-slate-400 text-sm',
                  footer: 'hidden',
                  formFieldSuccessText: 'text-emerald-400 text-sm font-medium',
                  formFieldErrorText: 'text-red-400 text-sm font-bold',
                  identityPreviewText: 'text-slate-300',
                },
                layout: {
                  socialButtonsPlacement: 'top',
                  socialButtonsVariant: 'blockButton',
                },
              }}
              routing="path"
                 path="/auth/sign-in"
                 signUpUrl="/auth/sign-up"
              afterSignInUrl="/dashboard"
              redirectUrl="/dashboard"
            />
          </div>

          {/* Sign up prompt */}
          <div className="bg-slate-800/60 backdrop-blur-sm px-8 py-4 border-t border-slate-700/60">
            <p className="text-center text-sm text-slate-300">
              Nouveau sur Targetym ?{' '}
              <Link
                   href="/auth/sign-up"
                className="font-bold text-blue-400 hover:text-blue-300 transition-colors underline-offset-4 hover:underline"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Minimal trust indicator */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400/60" />
            <span>Connexion sécurisée</span>
          </div>
          <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
          <span>© 2025 Targetym</span>
        </div>
      </div>
    </div>
  )
}
