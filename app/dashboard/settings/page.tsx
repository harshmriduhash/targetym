import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Zap,
  Globe,
  Clock,
  Eye,
  Building2
} from 'lucide-react';

// Import settings sections
import { ProfileSettings } from '@/src/components/settings/ProfileSettings';
import { NotificationSettings } from '@/src/components/settings/NotificationSettings';
import { SecuritySettings } from '@/src/components/settings/SecuritySettings';
import { AppearanceSettings } from '@/src/components/settings/AppearanceSettings';
import { IntegrationSettings } from '@/src/components/settings/IntegrationSettings';
import { AISettings } from '@/src/components/settings/AISettings';
import { LocalizationSettings } from '@/src/components/settings/LocalizationSettings';
import { WorkPreferencesSettings } from '@/src/components/settings/WorkPreferencesSettings';
import { AccessibilitySettings } from '@/src/components/settings/AccessibilitySettings';
import { OrganizationSettings } from '@/src/components/settings/OrganizationSettings';

export const metadata = {
  title: 'Settings - Targetym AI',
  description: 'Manage your account and platform settings',
};

function SettingsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Customize your Targetym AI experience and manage organization settings
        </p>
      </div>

      <Suspense fallback={<SettingsLoading />}>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">AI Features</span>
            </TabsTrigger>
            <TabsTrigger value="localization" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Localization</span>
            </TabsTrigger>
            <TabsTrigger value="work" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Work</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Accessibility</span>
            </TabsTrigger>
            <TabsTrigger value="organization" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
          </TabsList>

          <Card className="p-6">
            <TabsContent value="profile" className="mt-0">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value="appearance" className="mt-0">
              <AppearanceSettings />
            </TabsContent>

            <TabsContent value="integrations" className="mt-0">
              <IntegrationSettings />
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              <AISettings />
            </TabsContent>

            <TabsContent value="localization" className="mt-0">
              <LocalizationSettings />
            </TabsContent>

            <TabsContent value="work" className="mt-0">
              <WorkPreferencesSettings />
            </TabsContent>

            <TabsContent value="accessibility" className="mt-0">
              <AccessibilitySettings />
            </TabsContent>

            <TabsContent value="organization" className="mt-0">
              <OrganizationSettings />
            </TabsContent>
          </Card>
        </Tabs>
      </Suspense>
    </div>
  );
}
