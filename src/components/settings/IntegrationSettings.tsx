'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import {
  getOrganizationSettings,
  updateIntegrationSettings,
} from '@/src/actions/settings';
import {
  updateIntegrationSettingsSchema,
  type UpdateIntegrationSettings,
} from '@/src/lib/validations/settings.schemas';

const integrations = [
  { id: 'microsoft365_enabled', name: 'Microsoft 365', description: 'Calendar, email, and file integration' },
  { id: 'asana_enabled', name: 'Asana', description: 'Project management and task tracking' },
  { id: 'notion_enabled', name: 'Notion', description: 'Documentation and knowledge base' },
  { id: 'slack_enabled', name: 'Slack', description: 'Team communication and notifications' },
  { id: 'teams_enabled', name: 'Microsoft Teams', description: 'Collaboration and video calls' },
  { id: 'github_enabled', name: 'GitHub', description: 'Code repository integration' },
  { id: 'gitlab_enabled', name: 'GitLab', description: 'DevOps lifecycle management' },
  { id: 'jira_enabled', name: 'Jira', description: 'Issue tracking and agile project management' },
];

export function IntegrationSettings() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isAdmin, setIsAdmin] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm<UpdateIntegrationSettings>({
    resolver: zodResolver(updateIntegrationSettingsSchema),
  });

  const integrationsEnabled = watch('integrations_enabled');

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const result = await getOrganizationSettings();

        if (result.success && result.data) {
          setIsAdmin(true);
          reset({
            integrations_enabled: result.data.integrations_enabled ?? true,
            microsoft365_enabled: result.data.microsoft365_enabled ?? false,
            asana_enabled: result.data.asana_enabled ?? false,
            notion_enabled: result.data.notion_enabled ?? false,
            slack_enabled: result.data.slack_enabled ?? false,
            teams_enabled: result.data.teams_enabled ?? false,
            github_enabled: result.data.github_enabled ?? false,
            gitlab_enabled: result.data.gitlab_enabled ?? false,
            jira_enabled: result.data.jira_enabled ?? false,
          });
        } else {
          setIsAdmin(false);
          toast.error(result.error?.message || 'Only admins can access integration settings');
        }
      } catch (error) {
        toast.error('Failed to load integration settings');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [reset]);

  const onSubmit = async (data: UpdateIntegrationSettings) => {
    startTransition(async () => {
      const result = await updateIntegrationSettings(data);

      if (result.success) {
        toast.success('Integration settings updated successfully');
      } else {
        toast.error(result.error?.message || 'Failed to update integration settings');
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
          Only organization administrators can manage integration settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Integration Settings
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Connect Targetym with your favorite tools and services
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="integrations_enabled">Enable Integrations</Label>
            <p className="text-sm text-muted-foreground">
              Allow integration with third-party services
            </p>
          </div>
          <Switch
            id="integrations_enabled"
            {...register('integrations_enabled')}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Available Integrations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Label
                      htmlFor={integration.id}
                      className="text-base font-medium cursor-pointer"
                    >
                      {integration.name}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {integration.description}
                    </p>
                  </div>
                  <Switch
                    id={integration.id}
                    {...register(integration.id as keyof UpdateIntegrationSettings)}
                    disabled={!integrationsEnabled}
                  />
                </div>
              </Card>
            ))}
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
