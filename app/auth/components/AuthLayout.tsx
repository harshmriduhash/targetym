import Link from 'next/link'
import { Target } from 'lucide-react'
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
  gradientFrom?: string
  gradientVia?: string
  gradientTo?: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
  gradientFrom = 'from-blue-600',
  gradientVia = 'via-purple-600',
  gradientTo = 'to-indigo-600'
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} dark:from-blue-700 dark:via-purple-700 dark:to-indigo-700`}>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Targetym</h1>
              <p className="text-sm text-white/70">AI-Powered HR Platform</p>
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black mb-4 leading-tight">
                {title}
              </h2>
              <p className="text-lg text-white/80">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/60">
            © 2025 Targetym. Tous droits réservés.
          </div>
        </div>
      </div>

      {/* Right side - Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">Targetym</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI-Powered HR</p>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

interface AuthCardProps {
  children: ReactNode
  footer?: ReactNode
}

export function AuthCard({ children, footer }: AuthCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-8">
        {children}
      </div>

      {footer && (
        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 border-t border-slate-200 dark:border-slate-700">
          {footer}
        </div>
      )}
    </div>
  )
}
