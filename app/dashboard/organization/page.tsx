'use client';

import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, MapPin, Settings, Users, Calendar } from "lucide-react";
import OrganizationProfileForm from "@/components/organization/OrganizationProfileForm";
import OrganizationAddressForm from "@/components/organization/OrganizationAddressForm";
import OrganizationSettingsForm from "@/components/organization/OrganizationSettingsForm";
import {
  type OrganizationProfileInput,
  type OrganizationAddressInput,
  type OrganizationSettingsInput
} from '@/lib/validations/organization.schemas';
import { getOrganizationAge, getOrganizationSizeLabel, getIndustryLabel } from '@/lib/utils/organization';
import { useToast } from '@/hooks/use-toast';
import ModuleHeader from "@/components/common/layouts/ModuleHeader";
import StatCard from "@/components/common/stats/StatCard";
import EmptyState from "@/components/common/layouts/EmptyState";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface OrganizationData {
  profile?: OrganizationProfileInput;
  address?: OrganizationAddressInput;
  settings?: OrganizationSettingsInput;
}

export default function OrganizationPage() {
  const { toast } = useToast();
  const [organizationData, setOrganizationData] = useLocalStorage<OrganizationData>('organizationData', {});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Save organization data
  const saveData = useCallback((data: OrganizationData) => {
    setOrganizationData(data);
  }, [setOrganizationData]);

  // Handle profile save
  const handleProfileSave = useCallback(async (data: OrganizationProfileInput) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedData = { ...organizationData, profile: data };
      saveData(updatedData);

      toast({
        title: "Profil enregistré",
        description: "Les informations de l'organisation ont été mises à jour.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [organizationData, saveData, toast]);

  // Handle address save
  const handleAddressSave = useCallback(async (data: OrganizationAddressInput) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedData = { ...organizationData, address: data };
      saveData(updatedData);

      toast({
        title: "Adresse enregistrée",
        description: "L'adresse de l'organisation a été mise à jour.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [organizationData, saveData, toast]);

  // Handle settings save
  const handleSettingsSave = useCallback(async (data: OrganizationSettingsInput) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedData = { ...organizationData, settings: data };
      saveData(updatedData);

      toast({
        title: "Paramètres enregistrés",
        description: "Les paramètres de l'organisation ont été mis à jour.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [organizationData, saveData, toast]);

  const organizationAge = organizationData.profile?.foundedDate
    ? getOrganizationAge(organizationData.profile.foundedDate)
    : null;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <ModuleHeader
        title="Configuration de l'organisation"
        description="Gérez les informations et paramètres de votre organisation"
        icon={Building2}
        badgeText="Module"
        badgeVariant="default"
      />

      {/* Summary Cards */}
      {organizationData.profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Organisation"
            value={organizationData.profile.name}
            description={getIndustryLabel(organizationData.profile.industry)}
            icon={Building2}
            iconColor="text-blue-600"
          />

          <StatCard
            title="Taille"
            value={getOrganizationSizeLabel(organizationData.profile.size)}
            description="Employés"
            icon={Users}
            iconColor="text-green-600"
          />

          {organizationAge !== null && (
            <StatCard
              title="Ancienneté"
              value={organizationAge}
              description={organizationAge > 1 ? 'Années' : 'Année'}
              icon={Calendar}
              iconColor="text-purple-600"
            />
          )}

          {organizationData.address && (
            <StatCard
              title="Localisation"
              value={organizationData.address.city}
              description={organizationData.address.country}
              icon={MapPin}
              iconColor="text-amber-600"
            />
          )}
        </div>
      )}

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Adresse</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <OrganizationProfileForm
            initialData={organizationData.profile}
            onSave={handleProfileSave}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="address" className="space-y-6">
          <OrganizationAddressForm
            initialData={organizationData.address}
            onSave={handleAddressSave}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <OrganizationSettingsForm
            initialData={organizationData.settings}
            onSave={handleSettingsSave}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {!organizationData.profile && (
        <EmptyState
          icon={Building2}
          title="Configurez votre organisation"
          description="Commencez par remplir les informations de profil de votre organisation pour personnaliser votre expérience."
        />
      )}
    </div>
  );
}
