'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getUserSettings, updateUserSettings } from '@/src/actions/settings';
import { z } from 'zod';

const localizationSchema = z.object({
  language: z.enum(['en', 'fr', 'es', 'de', 'pt', 'zh', 'ja']),
  timezone: z.string(),
  date_format: z.enum(['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']),
  time_format: z.enum(['12h', '24h']),
});

type LocalizationFormData = z.infer<typeof localizationSchema>;

const languages = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
];

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

export function LocalizationSettings() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocalizationFormData>({
    resolver: zodResolver(localizationSchema),
    defaultValues: {
      language: 'en',
      timezone: 'UTC',
      date_format: 'YYYY-MM-DD',
      time_format: '24h',
    },
  });

  const language = watch('language');
  const timezone = watch('timezone');
  const dateFormat = watch('date_format');
  const timeFormat = watch('time_format');

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const result = await getUserSettings();

        if (result.success && result.data) {
          setValue('language', result.data.language || 'en');
          setValue('timezone', result.data.timezone || 'UTC');
          setValue('date_format', result.data.date_format || 'YYYY-MM-DD');
          setValue('time_format', result.data.time_format || '24h');
        }
      } catch (error) {
        toast.error('Failed to load localization settings');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [setValue]);

  const onSubmit = async (data: LocalizationFormData) => {
    startTransition(async () => {
      const result = await updateUserSettings(data);

      if (result.success) {
        toast.success('Localization settings updated successfully');
      } else {
        toast.error(result.error?.message || 'Failed to update localization settings');
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
          <Globe className="h-5 w-5" />
          Localization Settings
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Customize language, timezone, and date formats
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={(value) => setValue('language', value as any)}>
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.language && (
            <p className="text-sm text-destructive">{errors.language.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={timezone} onValueChange={(value) => setValue('timezone', value)}>
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timezone && (
            <p className="text-sm text-destructive">{errors.timezone.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date_format">Date Format</Label>
            <Select value={dateFormat} onValueChange={(value) => setValue('date_format', value as any)}>
              <SelectTrigger id="date_format">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
              </SelectContent>
            </Select>
            {errors.date_format && (
              <p className="text-sm text-destructive">{errors.date_format.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="time_format">Time Format</Label>
            <Select value={timeFormat} onValueChange={(value) => setValue('time_format', value as any)}>
              <SelectTrigger id="time_format">
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour (3:00 PM)</SelectItem>
                <SelectItem value="24h">24-hour (15:00)</SelectItem>
              </SelectContent>
            </Select>
            {errors.time_format && (
              <p className="text-sm text-destructive">{errors.time_format.message}</p>
            )}
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
