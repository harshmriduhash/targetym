'use client';

import { Target, Users, GraduationCap, TrendingUp, BrainCircuit, Briefcase } from 'lucide-react';

const FEATURES = [
  {
    icon: Target,
    title: "Objectifs & OKRs",
    description: "Alignez vos équipes avec des objectifs clairs, suivez la progression en temps réel et célébrez les réussites ensemble.",
    stat: "85%",
    statLabel: "de réussite en plus",
    color: "blue"
  },
  {
    icon: Users,
    title: "Recrutement Intelligent",
    description: "Trouvez les meilleurs talents 3x plus vite avec l'IA. Scoring automatique des CV et matching parfait candidat-poste.",
    stat: "70%",
    statLabel: "de temps gagné",
    color: "sky"
  },
  {
    icon: GraduationCap,
    title: "Formation & Développement",
    description: "Créez des parcours de formation personnalisés, suivez les compétences et boostez l'engagement de vos talents.",
    stat: "2x",
    statLabel: "plus d'engagement",
    color: "emerald"
  },
  {
    icon: TrendingUp,
    title: "Évaluation Continue",
    description: "Feedback 360°, entretiens structurés et suivi de la performance pour développer vos collaborateurs.",
    stat: "45%",
    statLabel: "de turnover en moins",
    color: "indigo"
  },
  {
    icon: BrainCircuit,
    title: "People Analytics IA",
    description: "Anticipez les départs, identifiez les hauts potentiels et prenez des décisions RH basées sur la data.",
    stat: "92%",
    statLabel: "de précision",
    color: "purple"
  },
  {
    icon: Briefcase,
    title: "Gestion de Carrière",
    description: "Plans de succession, mobilité interne et onboarding digital pour des parcours professionnels enrichissants.",
    stat: "60%",
    statLabel: "de mobilité interne",
    color: "violet"
  }
];

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-12 lg:py-16 overflow-hidden bg-white dark:bg-slate-950">
      <div className="container relative z-10 mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10 lg:mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Plateforme RH complète
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight max-w-3xl mx-auto">
            Tout ce dont votre RH a besoin
          </h2>

          <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-normal">
            Gestion complète du cycle de vie de vos collaborateurs.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            const getColorClasses = (color: string) => {
              const colors = {
                blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', hover: 'hover:border-blue-200 dark:hover:border-blue-800' },
                sky: { bg: 'bg-sky-50 dark:bg-sky-900/20', icon: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400', hover: 'hover:border-sky-200 dark:hover:border-sky-800' },
                emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', hover: 'hover:border-emerald-200 dark:hover:border-emerald-800' },
                indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', hover: 'hover:border-indigo-200 dark:hover:border-indigo-800' },
                purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', hover: 'hover:border-purple-200 dark:hover:border-purple-800' },
                violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', hover: 'hover:border-violet-200 dark:hover:border-violet-800' }
              };
              return colors[color as keyof typeof colors] || colors.blue;
            };
            const colorClasses = getColorClasses(feature.color);

            return (
              <div
                key={feature.title}
                className="group"
              >
                <div className={`h-full p-4 lg:p-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 ${colorClasses.hover} transition-all duration-200 hover:shadow-lg dark:hover:shadow-xl`}>
                  {/* Icon */}
                  <div className={`inline-flex p-2 rounded-lg ${colorClasses.icon} mb-3`}>
                    <Icon className={`w-5 h-5 ${colorClasses.text}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-normal mb-3">
                    {feature.description}
                  </p>

                  {/* Stat */}
                  <div className={`inline-flex items-baseline gap-1 px-2.5 py-1 rounded-md ${colorClasses.bg}`}>
                    <span className={`text-base font-bold ${colorClasses.text}`}>
                      {feature.stat}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {feature.statLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Et bien plus pour gérer vos équipes
          </p>
        </div>
      </div>
    </section>
  );
}
