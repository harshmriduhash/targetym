'use client';

import { useState } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const PRICING_TIERS = [
  {
    name: 'Starter',
    monthlyPrice: 99,
    yearlyPrice: 990,
    description: 'Parfait pour les petites équipes qui débutent',
    features: [
      'Jusqu\'à 50 employés',
      'Objectifs & OKRs',
      'Tableau de bord basique',
      'Support email',
      'Rapports mensuels',
    ],
    cta: 'Commencer gratuitement',
    popular: false,
    gradient: 'from-slate-600 to-slate-700'
  },
  {
    name: 'Professional',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    description: 'Analytics avancés pour organisations en croissance',
    features: [
      'Jusqu\'à 200 employés',
      'Toutes les fonctionnalités Starter',
      'Recrutement intelligent avec IA',
      'Analytics & insights IA',
      'Support prioritaire',
      'Rapports hebdomadaires',
      'Tableaux de bord personnalisés',
      'Accès API',
    ],
    cta: 'Commencer gratuitement',
    popular: true,
    gradient: 'from-purple-600 to-blue-600'
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    yearlyPrice: null,
    description: 'Solution complète pour grandes entreprises',
    features: [
      'Employés illimités',
      'Toutes les fonctionnalités Pro',
      'Analytics prédictifs IA',
      'Account manager dédié',
      'Rapports temps réel',
      'Intégrations personnalisées',
      'Garantie SLA',
      'Sécurité avancée',
      'Formation sur mesure',
    ],
    cta: 'Contacter les ventes',
    popular: false,
    gradient: 'from-fuchsia-600 to-pink-600'
  },
];

export function LandingPricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="relative py-12 lg:py-16 overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div className="container relative z-10 mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-8 lg:mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Tarification
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
            Plans simples et transparents
          </h2>

          <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Essai gratuit 14 jours inclus.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-sm font-semibold transition-colors ${!isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              Mensuel
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 shadow-md transition-transform duration-300 ${isYearly ? 'translate-x-6' : ''}`}></div>
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-semibold transition-colors ${isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                Annuel
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                -15%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-5 max-w-5xl mx-auto">
          {PRICING_TIERS.map((tier, index) => (
            <div
              key={tier.name}
              className={`relative group ${tier.popular ? 'lg:-mt-2' : ''}`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <div className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg">
                    ⭐ Populaire
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`relative h-full p-4 lg:p-5 rounded-xl border-2 transition-all duration-200 ${
                tier.popular
                  ? 'bg-white dark:bg-slate-800 border-blue-600 dark:border-blue-500 shadow-lg hover:shadow-xl'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg'
              }`}>
                {/* Content */}
                <div className="space-y-4">
                  {/* Header */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{tier.name}</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-normal">
                      {tier.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="py-2">
                    {tier.monthlyPrice ? (
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-slate-900 dark:text-white">
                            €{isYearly ? Math.floor(tier.yearlyPrice / 12) : tier.monthlyPrice}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 text-sm">/mois</span>
                        </div>
                        {isYearly && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Facturé €{tier.yearlyPrice}/an
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        Sur mesure
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                          <Check className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 text-xs leading-normal">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="pt-2">
                    <Link href={tier.monthlyPrice ? '/auth/sign-up' : '/contact'}>
                      <button
                        className={`daisy-btn w-full text-sm py-3 font-semibold transition-all duration-200 group/btn ${
                          tier.popular
                            ? 'daisy-btn-primary shadow-md hover:shadow-lg'
                            : 'daisy-btn-outline border-2'
                        }`}
                      >
                        {tier.cta}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust indicators */}
        <div className="text-center mt-12 lg:mt-16 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Essai gratuit 14 jours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Annulation à tout moment</span>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Des questions sur nos tarifs ?
            <Link href="/contact" className="ml-2 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
              Contactez notre équipe
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
