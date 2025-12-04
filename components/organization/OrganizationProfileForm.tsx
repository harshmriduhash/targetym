'use client';

import React, { memo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Building2, Save } from 'lucide-react';
import {
  organizationProfileSchema,
  type OrganizationProfileInput
} from '@/lib/validations/organization.schemas';
import {
  ORGANIZATION_SIZE,
  ORGANIZATION_SIZE_LABELS,
  INDUSTRY_TYPES,
  INDUSTRY_LABELS
} from '@/lib/constants/organization';

interface OrganizationProfileFormProps {
  initialData?: Partial<OrganizationProfileInput>;
  onSave: (data: OrganizationProfileInput) => void;
  isLoading?: boolean;
}

const INDUSTRY_OPTIONS = Object.entries(INDUSTRY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const SIZE_OPTIONS = Object.entries(ORGANIZATION_SIZE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function OrganizationProfileForm({
  initialData,
  onSave,
  isLoading = false
}: OrganizationProfileFormProps) {
  const form = useForm<OrganizationProfileInput>({
    resolver: zodResolver(organizationProfileSchema),
    defaultValues: {
      name: initialData?.name || '',
      legalName: initialData?.legalName || '',
      industry: initialData?.industry || undefined,
      size: initialData?.size || undefined,
      description: initialData?.description || '',
      website: initialData?.website || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      siret: initialData?.siret || '',
      foundedDate: initialData?.foundedDate || '',
    },
  });

  const onSubmit = useCallback(
    (data: OrganizationProfileInput) => {
      onSave(data);
    },
    [onSave]
  );

  const isDirty = form.formState.isDirty;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Profil de l&apos;organisation
            </CardTitle>
            <CardDescription className="mt-1">
              Informations générales sur votre organisation
            </CardDescription>
          </div>
          {isDirty && (
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading || !form.formState.isValid}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l&apos;organisation *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Tech Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raison sociale</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Tech Corp SAS"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secteur d&apos;activité *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un secteur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDUSTRY_OPTIONS.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taille de l&apos;organisation *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une taille" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contact</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@entreprise.fr"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+33612345678"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site web</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://entreprise.fr"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="foundedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de création</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siret"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Numéro SIRET</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 456 789 00012"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      14 chiffres - Format: 123 456 789 00012
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez votre organisation..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum 500 caractères
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={!isDirty || isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default memo(OrganizationProfileForm);
