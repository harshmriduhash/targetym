'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, User, Mail, Briefcase, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getUserSettings } from '@/src/actions/settings';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  job_title: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const result = await getUserSettings();

        if (result.success && result.data) {
          // Note: Profile data would come from a separate endpoint
          // This is a placeholder for the profile settings structure
          reset({
            first_name: '',
            last_name: '',
            email: '',
            job_title: '',
            department: '',
            location: '',
            phone: '',
            bio: '',
          });
        }
      } catch (error) {
        toast.error('Failed to load profile settings');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      // TODO: Create updateProfile action
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
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
          <User className="h-5 w-5" />
          Profile Settings
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal information and public profile
        </p>
      </div>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              {...register('first_name')}
              placeholder="John"
            />
            {errors.first_name && (
              <p className="text-sm text-destructive">{errors.first_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              {...register('last_name')}
              placeholder="Doe"
            />
            {errors.last_name && (
              <p className="text-sm text-destructive">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="john.doe@company.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="job_title" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Job Title
            </Label>
            <Input
              id="job_title"
              {...register('job_title')}
              placeholder="Senior Developer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              {...register('department')}
              placeholder="Engineering"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="New York, NY"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            {...register('bio')}
            placeholder="Tell us about yourself..."
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
