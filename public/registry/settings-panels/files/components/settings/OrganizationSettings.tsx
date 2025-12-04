'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Building2, Palette, Shield, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getOrganizationSettings,
  updateBrandingSettings,
  updateOrganizationSettings,
} from '@/src/actions/settings';
import { z } from 'zod';

const brandingSchema = z.object({
  brand_logo_url: z.string().url().optional().or(z.literal('')),
  brand_primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional().or(z.literal('')),
  brand_secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional().or(z.literal('')),
  brand_accent_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional().or(z.literal('')),
  company_tagline: z.string().optional(),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

export function OrganizationSettings() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isAdmin, setIsAdmin] = useState(false);
  const [gdprEnabled, setGdprEnabled] = useState(false);
  const [dataRegion, setDataRegion] = useState('us-east');
  const [retentionDays, setRetentionDays] = useState({
    audit_logs: 365,
    deleted_records: 90,
    candidate_data: 0,
    completed_goals: 0,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const result = await getOrganizationSettings();

        if (result.success && result.data) {
          setIsAdmin(true);
          reset({
            brand_logo_url: result.data.brand_logo_url || '',
            brand_primary_color: result.data.brand_primary_color || '',
            brand_secondary_color: result.data.brand_secondary_color || '',
            brand_accent_color: result.data.brand_accent_color || '',
            company_tagline: result.data.company_tagline || '',
          });
          setGdprEnabled(result.data.gdpr_enabled || false);
          setDataRegion(result.data.data_processing_region || 'us-east');
          setRetentionDays({
            audit_logs: result.data.retention_audit_logs_days || 365,
            deleted_records: result.data.retention_deleted_records_days || 90,
            candidate_data: result.data.retention_candidate_data_days || 0,
            completed_goals: result.data.auto_archive_completed_goals_days || 0,
          });
        } else {
          setIsAdmin(false);
          toast.error(result.error?.message || 'Only admins can access organization settings');
        }
      } catch (error) {
        toast.error('Failed to load organization settings');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [reset]);

  const onSubmitBranding = async (data: BrandingFormData) => {
    startTransition(async () => {
      const result = await updateBrandingSettings(data);

      if (result.success) {
        toast.success('Branding settings updated successfully');
      } else {
        toast.error(result.error?.message || 'Failed to update branding settings');
      }
    });
  };

  const updateComplianceSettings = async () => {
    startTransition(async () => {
      const result = await updateOrganizationSettings({
        gdpr_enabled: gdprEnabled,
        data_processing_region: dataRegion as any,
        retention_audit_logs_days: retentionDays.audit_logs,
        retention_deleted_records_days: retentionDays.deleted_records,
        retention_candidate_data_days: retentionDays.candidate_data || undefined,
        auto_archive_completed_goals_days: retentionDays.completed_goals || undefined,
      });

      if (result.success) {
        toast.success('Compliance settings updated successfully');
      } else {
        toast.error(result.error?.message || 'Failed to update compliance settings');
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

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Only organization administrators can manage organization settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Organization Settings
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage organization-wide settings and branding
        </p>
      </div>

      {/* Branding Settings */}
      <Card className="p-6">
        <h4 className="text-base font-medium flex items-center gap-2 mb-4">
          <Palette className="h-4 w-4" />
          Branding
        </h4>
        <form onSubmit={handleSubmit(onSubmitBranding)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand_logo_url">Logo URL</Label>
            <Input
              id="brand_logo_url"
              type="url"
              {...register('brand_logo_url')}
              placeholder="https://example.com/logo.png"
            />
            {errors.brand_logo_url && (
              <p className="text-sm text-destructive">{errors.brand_logo_url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand_primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="brand_primary_color"
                  type="color"
                  {...register('brand_primary_color')}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  {...register('brand_primary_color')}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
              {errors.brand_primary_color && (
                <p className="text-sm text-destructive">{errors.brand_primary_color.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand_secondary_color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="brand_secondary_color"
                  type="color"
                  {...register('brand_secondary_color')}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  {...register('brand_secondary_color')}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
              {errors.brand_secondary_color && (
                <p className="text-sm text-destructive">{errors.brand_secondary_color.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand_accent_color">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="brand_accent_color"
                  type="color"
                  {...register('brand_accent_color')}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  {...register('brand_accent_color')}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
              {errors.brand_accent_color && (
                <p className="text-sm text-destructive">{errors.brand_accent_color.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_tagline">Company Tagline</Label>
            <Input
              id="company_tagline"
              {...register('company_tagline')}
              placeholder="Your company's tagline"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Branding
            </Button>
          </div>
        </form>
      </Card>

      {/* Compliance & Privacy */}
      <Card className="p-6">
        <h4 className="text-base font-medium flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4" />
          Compliance & Privacy
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="gdpr_enabled">GDPR Compliance</Label>
              <p className="text-sm text-muted-foreground">
                Enable GDPR-compliant data handling
              </p>
            </div>
            <Switch
              id="gdpr_enabled"
              checked={gdprEnabled}
              onCheckedChange={setGdprEnabled}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="data_region">Data Processing Region</Label>
            <Select value={dataRegion} onValueChange={setDataRegion}>
              <SelectTrigger id="data_region">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us-east">US East</SelectItem>
                <SelectItem value="us-west">US West</SelectItem>
                <SelectItem value="eu-west">EU West</SelectItem>
                <SelectItem value="eu-central">EU Central</SelectItem>
                <SelectItem value="ap-southeast">Asia Pacific Southeast</SelectItem>
                <SelectItem value="ap-northeast">Asia Pacific Northeast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={updateComplianceSettings} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Compliance Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Retention */}
      <Card className="p-6">
        <h4 className="text-base font-medium flex items-center gap-2 mb-4">
          <Database className="h-4 w-4" />
          Data Retention Policies
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retention_audit">Audit Logs (days)</Label>
              <Input
                id="retention_audit"
                type="number"
                min="30"
                value={retentionDays.audit_logs}
                onChange={(e) =>
                  setRetentionDays({ ...retentionDays, audit_logs: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">Minimum: 30 days</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention_deleted">Deleted Records (days)</Label>
              <Input
                id="retention_deleted"
                type="number"
                min="0"
                value={retentionDays.deleted_records}
                onChange={(e) =>
                  setRetentionDays({ ...retentionDays, deleted_records: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">0 for immediate deletion</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention_candidates">Candidate Data (days)</Label>
              <Input
                id="retention_candidates"
                type="number"
                min="180"
                value={retentionDays.candidate_data}
                onChange={(e) =>
                  setRetentionDays({ ...retentionDays, candidate_data: parseInt(e.target.value) })
                }
                placeholder="Leave empty for indefinite"
              />
              <p className="text-xs text-muted-foreground">Minimum: 180 days if set</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention_goals">Archive Completed Goals (days)</Label>
              <Input
                id="retention_goals"
                type="number"
                min="90"
                value={retentionDays.completed_goals}
                onChange={(e) =>
                  setRetentionDays({ ...retentionDays, completed_goals: parseInt(e.target.value) })
                }
                placeholder="Leave empty to keep indefinitely"
              />
              <p className="text-xs text-muted-foreground">Minimum: 90 days if set</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={updateComplianceSettings} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Retention Policies
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
