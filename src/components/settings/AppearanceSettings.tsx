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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { updateThemeSettings } from '@/src/actions/settings';
import { logger } from '@/src/lib/monitoring/logger'
import {
  updateThemeSettingsSchema,
  UpdateThemeSettings
} from '@/src/lib/validations/settings.schemas';

export function AppearanceSettings() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<UpdateThemeSettings>({
    resolver: zodResolver(updateThemeSettingsSchema),
    defaultValues: {
      theme: 'system',
      theme_custom_colors: {},
    },
  });

  const onSubmit = async (data: UpdateThemeSettings) => {
    startTransition(async () => {
      setIsLoading(true);
      try {
        const result = await updateThemeSettings(data);
        
        if (result.success) {
          toast.success('Appearance settings updated successfully');
        } else {
          toast.error(result.error.message || 'Failed to update appearance settings');
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
        <CardTitle>Appearance & Theme</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <Label>Theme Mode</Label>
            <Controller
              name="theme"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Select 
                  onValueChange={onChange} 
                  defaultValue={value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Advanced Customization
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fine-tune your color preferences. These will override the default theme.
            </p>
            
            {/* Placeholder for color customization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Example custom color inputs could go here */}
              <div>
                <Label>Primary Color</Label>
                <input 
                  type="color" 
                  className="w-full h-10 border rounded" 
                />
              </div>
              <div>
                <Label>Secondary Color</Label>
                <input 
                  type="color" 
                  className="w-full h-10 border rounded" 
                />
              </div>
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

export default AppearanceSettings;
