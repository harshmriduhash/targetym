'use client';

import { Clock, FileText, UserCheck, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'leave' | 'hire' | 'meeting' | 'announcement' | 'review';
  title: string;
  description: string;
  time: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'leave',
    title: 'Demande de congé',
    description: 'John Doe a demandé 3 jours de congé',
    time: 'Il y a 2h',
  },
  {
    id: '2',
    type: 'hire',
    title: 'Nouvelle embauche',
    description: 'Sarah Williams a rejoint l\'équipe Dev',
    time: 'Il y a 4h',
  },
  {
    id: '3',
    type: 'meeting',
    title: 'Réunion planifiée',
    description: 'Revue trimestrielle demain à 10h',
    time: 'Il y a 5h',
  },
  {
    id: '4',
    type: 'announcement',
    title: 'Nouvelle annonce',
    description: 'Politique de télétravail mise à jour',
    time: 'Il y a 1j',
  },
];

const getIcon = (type: Activity['type']) => {
  switch (type) {
    case 'leave':
      return Calendar;
    case 'hire':
      return UserCheck;
    case 'meeting':
      return Clock;
    case 'announcement':
      return FileText;
    case 'review':
      return MessageSquare;
  }
};

const getColor = (type: Activity['type']) => {
  switch (type) {
    case 'leave':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    case 'hire':
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
    case 'meeting':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
    case 'announcement':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
    case 'review':
      return 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400';
  }
};

export function RecentActivityCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Activité récente</h3>
        <button className="text-sm text-primary hover:underline">
          Voir tout
        </button>
      </div>
      <div className="space-y-4">
        {mockActivities.map((activity) => {
          const Icon = getIcon(activity.type);
          return (
            <div key={activity.id} className="flex gap-3">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', getColor(activity.type))}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
