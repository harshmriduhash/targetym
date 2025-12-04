'use client';

import React, { memo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Settings, Save } from 'lucide-react';
import {
  organizationSettingsSchema,
  type OrganizationSettingsInput
} from '@/lib/validations/organization.schemas';
import { TIMEZONE_OPTIONS, CURRENCY_OPTIONS } from '@/lib/constants/organization';

interface OrganizationSettingsFormProps {
  initialData?: Partial<OrganizationSettingsInput>;
  onSave: (data: OrganizationSettingsInput) => void;
  isLoading?: boolean;
}

const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'JJ/MM/AAAA (31/12/2024)' },
  { value: 'MM/DD/YYYY', label: 'MM/JJ/AAAA (12/31/2024)' },
  { value: 'YYYY-MM-DD', label: 'AAAA-MM-JJ (2024-12-31)' },
];

const LANGUAGE_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
];

function OrganizationSettingsForm({
  initialData,
  onSave,
  isLoading = false
}: OrganizationSettingsFormProps) {
  const form = useForm<OrganizationSettingsInput>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      timezone: initialData?.timezone || 'Europe/Paris',
      currency: initialData?.currency || 'EUR',
      language: initialData?.language || 'fr',
      dateFormat: initialData?.dateFormat || 'DD/MM/YYYY',
      fiscalYearStart: initialData?.fiscalYearStart || '01-01',
      workingDays: initialData?.workingDays || [1, 2, 3, 4, 5],
      workingHoursStart: initialData?.workingHoursStart || '09:00',
      workingHoursEnd: initialData?.workingHoursEnd || '18:00',
    },
  });

  const onSubmit = useCallback(
    (data: OrganizationSettingsInput) => {
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
              <Settings className="h-5 w-5" />
              Paramètres
            </CardTitle>
            <CardDescription className="mt-1">
              Configuration régionale et horaires de travail
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
            {/* Regional Settings */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Paramètres régionaux</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuseau horaire *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un fuseau horaire" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMEZONE_OPTIONS.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
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
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Devise *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une devise" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCY_OPTIONS.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
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
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Langue *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une langue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LANGUAGE_OPTIONS.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
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
                  name="dateFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format de date *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DATE_FORMAT_OPTIONS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Fiscal Settings */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Paramètres fiscaux</h3>
              <FormField
                control={form.control}
                name="fiscalYearStart"
                render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormLabel>Début de l&apos;année fiscale *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="01-01"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Format: MM-JJ (ex: 01-01 pour le 1er janvier)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Working Hours */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Horaires de travail</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="workingHoursStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de début *</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workingHoursEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de fin *</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Jours ouvrables: Lundi à Vendredi (par défaut)
              </p>
            </div>

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

export default memo(OrganizationSettingsForm);
