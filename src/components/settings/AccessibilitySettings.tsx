'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getUserSettings, updateAccessibilitySettings } from '@/src/actions/settings';
import {
  updateAccessibilitySettingsSchema,
  type UpdateAccessibilitySettings,
} from '@/src/lib/validations/settings.schemas';

export function AccessibilitySettings() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateAccessibilitySettings>({
    resolver: zodResolver(updateAccessibilitySettingsSchema),
    defaultValues: {
      accessibility_high_contrast: false,
      accessibility_reduce_motion: false,
      accessibility_screen_reader_mode: false,
      accessibility_font_size: 'medium',
      accessibility_keyboard_shortcuts: true,
    },
  });

  const fontSize = watch('accessibility_font_size');

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const result = await getUserSettings();

        if (result.success && result.data) {
          setValue('accessibility_high_contrast', result.data.accessibility_high_contrast || false);
          setValue('accessibility_reduce_motion', result.data.accessibility_reduce_motion || false);
          setValue('accessibility_screen_reader_mode', result.data.accessibility_screen_reader_mode || false);
          setValue('accessibility_font_size', result.data.accessibility_font_size || 'medium');
          setValue('accessibility_keyboard_shortcuts', result.data.accessibility_keyboard_shortcuts ?? true);
        }
      } catch (error) {
        toast.error('Failed to load accessibility settings');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [setValue]);

  const onSubmit = async (data: UpdateAccessibilitySettings) => {
    startTransition(async () => {
      const result = await updateAccessibilitySettings(data);

      if (result.success) {
        toast.success('Accessibility settings updated successfully');
      } else {
        toast.error(result.error?.message || 'Failed to update accessibility settings');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Accessibility Settings
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Customize the interface to meet your accessibility needs
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high_contrast">High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast between text and background
              </p>
            </div>
            <Switch
              id="high_contrast"
              {...register('accessibility_high_contrast')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduce_motion">Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              id="reduce_motion"
              {...register('accessibility_reduce_motion')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="screen_reader">Screen Reader Mode</Label>
              <p className="text-sm text-muted-foreground">
                Optimize interface for screen readers
              </p>
            </div>
            <Switch
              id="screen_reader"
              {...register('accessibility_screen_reader_mode')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="keyboard_shortcuts">Keyboard Shortcuts</Label>
              <p className="text-sm text-muted-foreground">
                Enable keyboard navigation shortcuts
              </p>
            </div>
            <Switch
              id="keyboard_shortcuts"
              {...register('accessibility_keyboard_shortcuts')}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="font_size">Font Size</Label>
            <Select
              value={fontSize}
              onValueChange={(value) => setValue('accessibility_font_size', value as any)}
            >
              <SelectTrigger id="font_size">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium (Default)</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="x-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
            {errors.accessibility_font_size && (
              <p className="text-sm text-destructive">
                {errors.accessibility_font_size.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Adjust the default text size throughout the application
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
