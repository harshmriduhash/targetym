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

import { updateOrganizationNotificationSettings } from '@/src/actions/settings';
import { logger } from '@/src/lib/monitoring/logger'
import {
  updateNotificationSettingsSchema,
  UpdateNotificationSettings
} from '@/src/lib/validations/settings.schemas';

export function NotificationSettings() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<UpdateNotificationSettings>({
    resolver: zodResolver(updateNotificationSettingsSchema),
    defaultValues: {
      email_notifications_enabled: true,
      notify_new_goal: true,
      notify_goal_update: true,
      notify_goal_completion: true,
      notify_new_candidate: true,
      notify_interview_scheduled: true,
      notify_performance_review_due: true,
      notify_performance_review_submitted: true,
      notify_team_member_joined: true,
    },
  });

  const onSubmit = async (data: UpdateNotificationSettings) => {
    startTransition(async () => {
      setIsLoading(true);
      try {
        const result = await updateOrganizationNotificationSettings(data);
        
        if (result.success) {
          toast.success('Notification settings updated successfully');
        } else {
          toast.error(result.error.message || 'Failed to update notification settings');
        }
      } catch (error) {
        toast.error('An unexpected error occurred');
        logger.error(error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const fieldConfigurations = [
    {
      name: 'notify_new_goal',
      label: 'New Goal Created',
      description: 'Get notified when a new goal is created in the organization',
    },
    {
      name: 'notify_goal_update',
      label: 'Goal Updates',
      description: 'Receive updates about changes to existing goals',
    },
    // Add more notification categories...
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Controller
              name="email_notifications_enabled"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="flex items-center space-x-4 mb-6">
                  <Switch 
                    id="email_notifications" 
                    checked={value} 
                    onCheckedChange={onChange}
                    aria-label="Enable Email Notifications"
                  />
                  <Label htmlFor="email_notifications">
                    Enable Email Notifications
                  </Label>
                </div>
              )}
            />
          </div>

          <div className="grid gap-4">
            {fieldConfigurations.map((field) => (
              <div 
                key={field.name} 
                className="flex justify-between items-center border-b pb-4"
              >
                <div>
                  <Label>{field.label}</Label>
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                </div>
                <Controller
                  name={field.name as keyof UpdateNotificationSettings}
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

export default NotificationSettings;
