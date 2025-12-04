'use client';

import React, { memo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MapPin, Save } from 'lucide-react';
import {
  organizationAddressSchema,
  type OrganizationAddressInput
} from '@/lib/validations/organization.schemas';

interface OrganizationAddressFormProps {
  initialData?: Partial<OrganizationAddressInput>;
  onSave: (data: OrganizationAddressInput) => void;
  isLoading?: boolean;
}

function OrganizationAddressForm({
  initialData,
  onSave,
  isLoading = false
}: OrganizationAddressFormProps) {
  const form = useForm<OrganizationAddressInput>({
    resolver: zodResolver(organizationAddressSchema),
    defaultValues: {
      street: initialData?.street || '',
      city: initialData?.city || '',
      postalCode: initialData?.postalCode || '',
      country: initialData?.country || 'France',
      region: initialData?.region || '',
    },
  });

  const onSubmit = useCallback(
    (data: OrganizationAddressInput) => {
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
              <MapPin className="h-5 w-5" />
              Adresse
            </CardTitle>
            <CardDescription className="mt-1">
              Adresse physique de l&apos;organisation
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
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rue *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 123 Avenue des Champs-Élysées"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code postal *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="75008"
                        maxLength={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville *</FormLabel>
                    <FormControl>
                      <Input placeholder="Paris" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Région</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Île-de-France"
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
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays *</FormLabel>
                    <FormControl>
                      <Input placeholder="France" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

export default memo(OrganizationAddressForm);
