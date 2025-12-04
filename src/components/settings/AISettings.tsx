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

import { updateAISettings } from '@/src/actions/settings';
import { logger } from '@/src/lib/monitoring/logger'
import {
  updateAISettingsSchema,
  UpdateAISettings
} from '@/src/lib/validations/settings.schemas';

export function AISettings() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const { 
    control, 
    handleSubmit, 
    register,
    formState: { errors, isSubmitting } 
  } = useForm<UpdateAISettings>({
    resolver: zodResolver(updateAISettingsSchema),
    defaultValues: {
      ai_provider: 'openai',
      ai_enabled: false,
      ai_cv_scoring_enabled: false,
      ai_performance_synthesis_enabled: false,
      ai_career_recommendations_enabled: false,
      ai_model: 'gpt-4o',
      ai_max_tokens: 2000,
      ai_temperature: 0.7,
    },
  });

  const onSubmit = async (data: UpdateAISettings) => {
    startTransition(async () => {
      setIsLoading(true);
      try {
        const result = await updateAISettings(data);
        
        if (result.success) {
          toast.success('AI settings updated successfully');
        } else {
          toast.error(result.error.message || 'Failed to update AI settings');
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
        <CardTitle>AI & Insights Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Controller
              name="ai_enabled"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="flex items-center space-x-4 mb-6">
                  <Switch 
                    id="ai_enabled" 
                    checked={value} 
                    onCheckedChange={onChange}
                    aria-label="Enable AI Features"
                  />
                  <Label htmlFor="ai_enabled">
                    Enable AI Features
                  </Label>
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                name: 'ai_cv_scoring_enabled', 
                label: 'CV Scoring', 
                description: 'Automatically score candidate CVs using AI' 
              },
              { 
                name: 'ai_performance_synthesis_enabled', 
                label: 'Performance Insights', 
                description: 'Generate AI-powered performance summaries' 
              },
              { 
                name: 'ai_career_recommendations_enabled', 
                label: 'Career Recommendations', 
                description: 'AI-driven career path suggestions' 
              },
            ].map((field) => (
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
                  name={field.name as keyof UpdateAISettings}
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

          <div className="mt-6">
            <Label>AI Provider</Label>
            <Controller
              name="ai_provider"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Select onValueChange={onChange} defaultValue={value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
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

export default AISettings;
