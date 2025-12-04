'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, Star } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-100/40 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-100/40 dark:bg-sky-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Minimal grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb20_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb20_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="container relative z-10 mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-5 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Propulsé par IA
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              <span className="text-slate-900 dark:text-white">Plateforme RH </span>
              <span className="text-blue-600 dark:text-blue-400">tout-en-un</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-normal">
              Centralisez vos processus RH et prenez des décisions basées sur la data.
            </p>

            {/* Trust indicators above CTA */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Essai 14j gratuit</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Sans CB</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Setup 5 min</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/sign-up">
                <button className="daisy-btn daisy-btn-primary w-full sm:w-auto text-sm px-6 shadow-lg shadow-blue-600/20 dark:shadow-blue-500/20 transition-all duration-200 group font-semibold">
                  Démarrer gratuitement
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/auth/sign-in">
                <button className="daisy-btn daisy-btn-outline w-full sm:w-auto text-sm px-6 border-2 transition-all duration-200 font-semibold">
                  Se connecter
                </button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-blue-200 dark:bg-blue-800 border-2 border-white dark:border-slate-950 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-300">JD</div>
                <div className="w-7 h-7 rounded-full bg-emerald-200 dark:bg-emerald-800 border-2 border-white dark:border-slate-950 flex items-center justify-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">MK</div>
                <div className="w-7 h-7 rounded-full bg-purple-200 dark:bg-purple-800 border-2 border-white dark:border-slate-950 flex items-center justify-center text-xs font-semibold text-purple-700 dark:text-purple-300">SL</div>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium ml-1">10,000+ équipes</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-lg">
              {/* Main dashboard mockup - clean card */}
              <div className="relative rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-3 transform hover:scale-[1.02] transition-transform duration-300">
                <div className="w-full h-[280px] rounded-lg bg-gradient-to-br from-blue-50 to-sky-50 dark:from-slate-900 dark:to-blue-950/30 flex items-center justify-center overflow-hidden">
                  {/* Placeholder - Replace with actual dashboard screenshot */}
                  <div className="text-center space-y-3 p-6">
                    <div className="w-12 h-12 mx-auto rounded-lg bg-blue-600 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">Tableau de bord</div>
                      <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                        <div className="h-14 rounded-md bg-white dark:bg-slate-700 shadow-sm"></div>
                        <div className="h-14 rounded-md bg-white dark:bg-slate-700 shadow-sm"></div>
                        <div className="h-14 rounded-md bg-white dark:bg-slate-700 shadow-sm col-span-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating success badge */}
              <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-emerald-200 dark:border-emerald-800 animate-float">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">IA Active</span>
                </div>
              </div>

              {/* Floating metric card */}
              <div className="absolute -bottom-3 -left-3 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-blue-200 dark:border-blue-800 animate-float-delayed">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Productivité</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">+127%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </section>
  );
}
