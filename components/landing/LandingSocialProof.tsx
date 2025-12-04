import { Building2, Users, Star, TrendingUp } from 'lucide-react';

const STATS = [
  {
    icon: Users,
    value: "10,000+",
    label: "Utilisateurs actifs"
  },
  {
    icon: Building2,
    value: "500+",
    label: "Entreprises partenaires"
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Satisfaction client"
  },
  {
    icon: TrendingUp,
    value: "85%",
    label: "Gain de productivité"
  }
];

export function LandingSocialProof() {
  return (
    <section className="py-8 lg:py-10 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="inline-flex p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mb-2">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
