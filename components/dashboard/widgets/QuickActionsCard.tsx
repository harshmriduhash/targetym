'use client';

import { Button } from '@/components/ui/button';
import { Plus, UserPlus, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  {
    label: 'Nouvelle demande',
    icon: Plus,
    href: '/dashboard/requests/new',
    color: 'bg-blue-500',
  },
  {
    label: 'Ajouter employé',
    icon: UserPlus,
    href: '/dashboard/employees/new',
    color: 'bg-purple-500',
  },
  {
    label: 'Créer annonce',
    icon: FileText,
    href: '/dashboard/notices/new',
    color: 'bg-green-500',
  },
  {
    label: 'Planifier événement',
    icon: Calendar,
    href: '/dashboard/events/new',
    color: 'bg-orange-500',
  },
];

export function QuickActionsCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Button
                variant="outline"
                className="w-full h-auto flex-col gap-2 py-4 hover:bg-accent"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium text-center">{action.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
