import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Lazy load components for faster initial page load
const LandingHero = dynamic(() => import('@/components/landing/LandingHero').then(mod => ({ default: mod.LandingHero })), {
  loading: () => <div className="h-screen" />, // Placeholder while loading
});

const LandingSocialProof = dynamic(() => import('@/components/landing/LandingSocialProof').then(mod => ({ default: mod.LandingSocialProof })));

const LandingFeatures = dynamic(() => import('@/components/landing/LandingFeatures').then(mod => ({ default: mod.LandingFeatures })));

const LandingHowItWorks = dynamic(() => import('@/components/landing/LandingHowItWorks').then(mod => ({ default: mod.LandingHowItWorks })));

const LandingPricing = dynamic(() => import('@/components/landing/LandingPricing').then(mod => ({ default: mod.LandingPricing })));

const LandingFAQ = dynamic(() => import('@/components/landing/LandingFAQ').then(mod => ({ default: mod.LandingFAQ })));

const LandingCTA = dynamic(() => import('@/components/landing/LandingCTA').then(mod => ({ default: mod.LandingCTA })));

export const metadata: Metadata = {
  title: 'Targetym AI - Plateforme RH Intelligente pour Entreprises Modernes',
  description: 'Insights RH alimentés par IA pour SharePoint, Teams et Asana. Transformez votre stratégie RH avec des analyses en temps réel.',
  keywords: ['Analyses RH', 'Intelligence workforce', 'Écosystème Microsoft', 'Productivité', 'Performance équipe'],
  openGraph: {
    title: 'Targetym AI - Analyses RH Unifiées',
    description: 'Insights RH alimentés par IA pour SharePoint, Teams et Asana',
    type: 'website',
    url: 'https://targetym.ai',
  },
};

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      <LandingHero />
      <LandingSocialProof />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingPricing />
      <LandingFAQ />
      <LandingCTA />
    </main>
  );
}
