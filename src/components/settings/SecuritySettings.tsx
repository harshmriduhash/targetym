/* eslint-disable no-unused-vars */
'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { updateSecuritySettings } from '@/src/actions/settings';
import { logger } from '@/src/lib/monitoring/logger'
import {
  updateSecuritySettingsSchema,
  UpdateSecuritySettings
} from '@/src/lib/validations/settings.schemas';

export function SecuritySettings() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const { 
    control, 
    handleSubmit, 
    register,
    formState: { errors, isSubmitting } 
  } = useForm<UpdateSecuritySettings>({
    resolver: zodResolver(updateSecuritySettingsSchema),
    defaultValues: {
      enforce_2fa: false,
      password_min_length: 12,
      password_require_uppercase: true,
      password_require_lowercase: true,
      password_require_numbers: true,
      password_require_special_chars: true,
      session_timeout_minutes: 480,
      password_expiry_days: 90,
    },
  });

  const onSubmit = async (data: UpdateSecuritySettings) => {
    startTransition(async () => {
      setIsLoading(true);
      try {
        const result = await updateSecuritySettings(data);
        
        if (result.success) {
          toast.success('Security settings updated successfully');
        } else {
          toast.error(result.error.message || 'Failed to update security settings');
        }
      } catch (error) {
        toast.error('An unexpected error occurred');
        logger.error(error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Security & Authentication</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Controller
              name="enforce_2fa"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="flex items-center space-x-4 mb-6">
                  <Switch 
                    id="enforce_2fa" 
                    checked={value} 
                    onCheckedChange={onChange}
                    aria-label="Enforce Two-Factor Authentication"
                  />
                  <Label htmlFor="enforce_2fa">
                    Require Two-Factor Authentication
                  </Label>
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Minimum Password Length</Label>
              <Input 
                type="number" 
                placeholder="Minimum password length" 
                {...register('password_min_length', { 
                  valueAsNumber: true 
                })}
                min={8}
                max={128}
              />
              {errors.password_min_length && (
                <p className="text-red-500 text-sm">
                  {errors.password_min_length.message}
                </p>
              )}
            </div>

            <div>
              <Label>Session Timeout (minutes)</Label>
              <Input 
                type="number" 
                placeholder="Session timeout" 
                {...register('session_timeout_minutes', { 
                  valueAsNumber: true 
                })}
                min={15}
              />
              {errors.session_timeout_minutes && (
                <p className="text-red-500 text-sm">
                  {errors.session_timeout_minutes.message}
                </p>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Password Complexity Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  name: 'password_require_uppercase', 
                  label: 'Require Uppercase Letters' 
                },
                { 
                  name: 'password_require_lowercase', 
                  label: 'Require Lowercase Letters' 
                },
                { 
                  name: 'password_require_numbers', 
                  label: 'Require Numbers' 
                },
                { 
                  name: 'password_require_special_chars', 
                  label: 'Require Special Characters' 
                },
              ].map((field) => (
                <div 
                  key={field.name} 
                  className="flex justify-between items-center"
                >
                  <Label>{field.label}</Label>
                  <Controller
                    name={field.name as keyof UpdateSecuritySettings}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Switch 
                        checked={value as boolean} 
                        onCheckedChange={onChange}
                        aria-label={field.label}
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isPending || isLoading || isSubmitting}
            >
              {isPending || isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default SecuritySettings;
