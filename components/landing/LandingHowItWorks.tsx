import { Plug, LineChart, Zap, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    icon: Plug,
    step: '1',
    title: 'Connect Your Tools',
    description: 'Seamlessly integrate SharePoint, Microsoft Teams, and Asana in minutes with our secure OAuth connection.',
  },
  {
    icon: LineChart,
    step: '2',
    title: 'Sync Your Data',
    description: 'Our AI automatically collects and synchronizes workforce data from all your platforms in real-time.',
  },
  {
    icon: Zap,
    step: '3',
    title: 'Get AI Insights',
    description: 'Receive intelligent analytics, predictive insights, and automated alerts tailored to your organization.',
  },
  {
    icon: CheckCircle,
    step: '4',
    title: 'Make Decisions',
    description: 'Act on actionable insights to optimize team performance, reduce costs, and boost productivity.',
  },
];

export function LandingHowItWorks() {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Comment ça marche
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Démarrez en quelques minutes
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Desktop view - horizontal layout */}
          <div className="hidden md:grid md:grid-cols-4 gap-5">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative">
                  {/* Connecting line */}
                  {index < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary to-primary/30 z-0" />
                  )}

                  <div className="relative z-10 text-center">
                    {/* Icon circle */}
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                      <Icon className="w-10 h-10 text-primary-foreground" />
                    </div>

                    {/* Step number */}
                    <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1 bg-background border-2 border-primary rounded-full w-7 h-7 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">{step.step}</span>
                    </div>

                    {/* Content */}
                    <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-xs leading-normal">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile view - vertical layout */}
          <div className="md:hidden space-y-5">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg relative">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                      <div className="absolute -top-1 -right-1 bg-background border-2 border-primary rounded-full w-6 h-6 flex items-center justify-center">
                        <span className="text-primary font-bold text-xs">{step.step}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow pt-1">
                    <h3 className="text-base font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-normal">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground mb-4">
            Prêt à transformer votre RH ?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg text-sm">
              Essai gratuit
            </button>
            <button className="px-6 py-3 bg-background text-primary font-semibold rounded-lg border-2 border-primary hover:bg-secondary transition-colors text-sm">
              Démo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
