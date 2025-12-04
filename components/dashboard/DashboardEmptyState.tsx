'use client';

import { useState } from 'react';
import {
  BookOpen,
  LayoutGrid,
  Link2,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrganizationSetupModal } from "./OrganizationSetupModal";
import { DashboardCustomizationModal } from "./DashboardCustomizationModal";

export function DashboardEmptyState() {
  const [showOrgSetup, setShowOrgSetup] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);

  return (
    <>
      <div className="max-w-4xl mx-auto text-center py-16 px-4">
        <h1 className="text-3xl font-bold mb-6">Bienvenue sur Targetym AI</h1>
        <p className="text-gray-600 mb-12">
          Configurons votre plateforme d'analyse RH ensemble !
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <EmptyStateCard
            icon={<Link2 />}
            title="Connecter des intégrations"
            description="Liez vos outils et plateformes RH existants"
            cta="Bientôt disponible"
            badge="Coming Soon"
            disabled
          />
          <EmptyStateCard
            icon={<LayoutGrid />}
            title="Configurer votre organisation"
            description="Ajoutez des membres d'équipe et configurez votre espace"
            cta="Configurer l'organisation"
            onClick={() => setShowOrgSetup(true)}
          />
          <EmptyStateCard
            icon={<BookOpen />}
            title="Découvrir Targetym"
            description="Faites une visite rapide des capacités de la plateforme"
            cta="Bientôt disponible"
            badge="Coming Soon"
            disabled
          />
          <EmptyStateCard
            icon={<Settings />}
            title="Personnaliser le tableau de bord"
            description="Personnalisez vos analyses et rapports"
            cta="Personnaliser la vue"
            onClick={() => setShowCustomization(true)}
          />
        </div>
      </div>

      <OrganizationSetupModal
        open={showOrgSetup}
        onOpenChange={setShowOrgSetup}
      />

      <DashboardCustomizationModal
        open={showCustomization}
        onOpenChange={setShowCustomization}
      />
    </>
  );
}

function EmptyStateCard({
  icon,
  title,
  description,
  cta,
  badge,
  disabled = false,
  onClick
}: {
  icon: React.ReactNode,
  title: string,
  description: string,
  cta: string,
  badge?: string,
  disabled?: boolean,
  onClick?: () => void
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center relative ${disabled ? 'opacity-60' : ''}`}>
      {badge && (
        <Badge className="absolute top-4 right-4 bg-orange-500 text-white">
          {badge}
        </Badge>
      )}
      <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button variant="outline" disabled={disabled} onClick={onClick}>
        {cta}
      </Button>
    </div>
  );
}
