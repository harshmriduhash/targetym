import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Link2,
  Settings
} from "lucide-react";
import type { ReactNode } from "react";

type PlaceholderSectionConfig = {
  icon: ReactNode;
  title: string;
  description: string;
  cta: string;
};

type PlaceholderSections = Record<string, PlaceholderSectionConfig>;

export function PlaceholderContent({ sectionName }: { sectionName: string }) {
  const placeholderConfig: PlaceholderSections = {
    team: {
      icon: <Settings />,
      title: "Team Management Coming Soon",
      description: "Advanced team insights and management tools are being developed.",
      cta: "Learn More"
    },
    sharepoint: {
      icon: <Link2 />,
      title: "SharePoint Integration",
      description: "Connect and sync your SharePoint data with Targetym.",
      cta: "Connect SharePoint"
    },
    teams: {
      icon: <Link2 />,
      title: "Microsoft Teams Integration",
      description: "Sync your Teams collaboration data and insights.",
      cta: "Connect Teams"
    },
    asana: {
      icon: <Link2 />,
      title: "Asana Project Management",
      description: "Integrate your Asana workspace for comprehensive project analytics.",
      cta: "Connect Asana"
    },
    reports: {
      icon: <AlertTriangle />,
      title: "Reports Coming Soon",
      description: "Comprehensive HR analytics and reporting tools are under development.",
      cta: "Request Early Access"
    },
    organization: {
      icon: <Settings />,
      title: "Organization Settings",
      description: "Configure your organization's profile and preferences.",
      cta: "Manage Settings"
    },
    settings: {
      icon: <Settings />,
      title: "Account Settings",
      description: "Customize your Targetym AI experience.",
      cta: "Edit Preferences"
    },
    default: {
      icon: <AlertTriangle />,
      title: "Section Under Development",
      description: "We're working hard to bring you more features.",
      cta: "Stay Tuned"
    }
  };

  const config = placeholderConfig[sectionName] ?? placeholderConfig.default;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="text-primary mb-6">
        {config.icon}
      </div>
      <h2 className="text-2xl font-bold mb-4">{config.title}</h2>
      <p className="text-gray-600 mb-6 max-w-md">{config.description}</p>
      <Button variant="outline">
        {config.cta}
      </Button>
    </div>
  );
}
