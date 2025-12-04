import { TrendingUp, Zap, DollarSign } from 'lucide-react';

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Real-Time Insights",
    description: "Get instant visibility into workforce performance and collaboration.",
    stat: "95% Faster Decision Making"
  },
  {
    icon: Zap,
    title: "Enhanced Productivity",
    description: "Identify bottlenecks and optimize team workflows automatically.",
    stat: "30% Efficiency Gain"
  },
  {
    icon: DollarSign,
    title: "Cost Optimization",
    description: "Reduce overhead by understanding true resource utilization.",
    stat: "25% Resource Savings"
  }
];

export function LandingBenefits() {
  return (
    <section className="py-10 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Résultats Mesurables
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Des décisions RH basées sur l'IA.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-border">
                <div className="mb-3">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1.5">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{benefit.description}</p>
                <div className="text-xl font-bold text-primary">{benefit.stat}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
