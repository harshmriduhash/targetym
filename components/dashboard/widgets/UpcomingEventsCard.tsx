'use client';

import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  type: 'meeting' | 'interview' | 'training' | 'social';
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Réunion d\'équipe',
    date: 'Demain',
    time: '10:00 AM',
    location: 'Salle de conférence A',
    attendees: 12,
    type: 'meeting',
  },
  {
    id: '2',
    title: 'Entretien candidat',
    date: '15 Nov',
    time: '2:00 PM',
    location: 'Visio',
    attendees: 3,
    type: 'interview',
  },
  {
    id: '3',
    title: 'Formation TypeScript',
    date: '18 Nov',
    time: '9:00 AM',
    location: 'Salle de formation',
    attendees: 8,
    type: 'training',
  },
];

const getEventColor = (type: Event['type']) => {
  switch (type) {
    case 'meeting':
      return 'default';
    case 'interview':
      return 'default';
    case 'training':
      return 'secondary';
    case 'social':
      return 'outline';
  }
};

const getEventLabel = (type: Event['type']) => {
  switch (type) {
    case 'meeting':
      return 'Réunion';
    case 'interview':
      return 'Entretien';
    case 'training':
      return 'Formation';
    case 'social':
      return 'Social';
  }
};

export function UpcomingEventsCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Événements à venir</h3>
        <button className="text-sm text-primary hover:underline">
          Calendrier
        </button>
      </div>
      <div className="space-y-4">
        {mockEvents.map((event) => (
          <div key={event.id} className="border-l-4 border-primary pl-4 py-2 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm">{event.title}</h4>
              <Badge variant={getEventColor(event.type)} className="shrink-0">
                {getEventLabel(event.type)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{event.attendees} participants</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
