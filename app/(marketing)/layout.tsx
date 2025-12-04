'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from "@/components/theme-toggle";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
              Targetym
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tarifs</a>
            <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/sign-in">
              <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300">
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/sign-in">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                Démarrer
              </Button>
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-4 block">
                Targetym
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                Analyses RH unifiées pour entreprises modernes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-900 dark:text-white">Produit</h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li><a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tarifs</a></li>
                <li><a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-900 dark:text-white">Entreprise</h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Carrières</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-900 dark:text-white">Légal</h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Conditions</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sécurité</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 text-center text-slate-600 dark:text-slate-400">
            <p>&copy; 2025 Targetym AI. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
