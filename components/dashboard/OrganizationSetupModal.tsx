'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Users, MapPin, Globe } from 'lucide-react';

interface OrganizationSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationSetupModal({ open, onOpenChange }: OrganizationSetupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    country: '',
    city: '',
    description: '',
    website: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter la sauvegarde de l'organisation
    console.log('Organisation data:', formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Configurer votre organisation
          </DialogTitle>
          <DialogDescription>
            Renseignez les informations de votre entreprise pour personnaliser votre expérience
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations de base</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'organisation *</Label>
              <Input
                id="name"
                placeholder="Ex: TechCorp France"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Secteur d'activité *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Sélectionnez un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Technologie</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="health">Santé</SelectItem>
                    <SelectItem value="retail">Commerce</SelectItem>
                    <SelectItem value="education">Éducation</SelectItem>
                    <SelectItem value="manufacturing">Industrie</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Taille de l'entreprise *</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value })}
                >
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Nombre d'employés" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employés</SelectItem>
                    <SelectItem value="11-50">11-50 employés</SelectItem>
                    <SelectItem value="51-200">51-200 employés</SelectItem>
                    <SelectItem value="201-500">201-500 employés</SelectItem>
                    <SelectItem value="501-1000">501-1000 employés</SelectItem>
                    <SelectItem value="1000+">1000+ employés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Localisation
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Pays *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Sélectionnez un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="BE">Belgique</SelectItem>
                    <SelectItem value="CH">Suisse</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="LU">Luxembourg</SelectItem>
                    <SelectItem value="MA">Maroc</SelectItem>
                    <SelectItem value="SN">Sénégal</SelectItem>
                    <SelectItem value="CI">Côte d'Ivoire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  placeholder="Ex: Paris"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Informations complémentaires
            </h3>

            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez brièvement votre organisation..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              <Building2 className="mr-2 h-4 w-4" />
              Enregistrer l'organisation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
