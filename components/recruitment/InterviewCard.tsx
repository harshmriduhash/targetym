'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, MapPin, Video, Edit, X } from 'lucide-react';

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  type: 'phone' | 'technical' | 'behavioral' | 'final';
  scheduledAt: string;
  duration: number;
  location?: string;
  meetingUrl?: string;
  interviewers: string[];
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

interface InterviewCardProps {
  interview: Interview;
  onEdit?: (interview: Interview) => void;
  onCancel?: (id: string) => void;
}

export function InterviewCard({ interview, onEdit, onCancel }: InterviewCardProps) {
  const typeLabels = {
    'phone': 'Entretien téléphonique',
    'technical': 'Entretien technique',
    'behavioral': 'Entretien comportemental',
    'final': 'Entretien final'
  };

  const typeColors = {
    'phone': 'bg-blue-100 text-blue-700',
    'technical': 'bg-purple-100 text-purple-700',
    'behavioral': 'bg-orange-100 text-orange-700',
    'final': 'bg-green-100 text-green-700'
  };

  const statusLabels = {
    'scheduled': 'Planifié',
    'completed': 'Terminé',
    'cancelled': 'Annulé'
  };

  const statusColors = {
    'scheduled': 'bg-blue-500',
    'completed': 'bg-green-500',
    'cancelled': 'bg-red-500'
  };

  const interviewDate = new Date(interview.scheduledAt);
  const now = new Date();
  const isUpcoming = interviewDate > now;
  const isPast = interviewDate < now && interview.status === 'scheduled';

  return (
    <Card className={`hover:shadow-lg transition-shadow border-l-4 ${
      isPast ? 'opacity-75' : ''
    }`} style={{ borderLeftColor: statusColors[interview.status] }}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{interview.candidateName}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{interview.jobTitle}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className={typeColors[interview.type]}>
              {typeLabels[interview.type]}
            </Badge>
            <Badge variant="outline" className="text-white" style={{ backgroundColor: statusColors[interview.status] }}>
              {statusLabels[interview.status]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date et heure */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {interviewDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {interviewDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })} ({interview.duration} min)
            </span>
          </div>
        </div>

        {/* Intervieweurs */}
        <div className="flex items-start gap-2">
          <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Intervieweurs:</p>
            <p className="text-sm text-muted-foreground">
              {interview.interviewers.join(', ')}
            </p>
          </div>
        </div>

        {/* Lieu ou lien */}
        {interview.meetingUrl ? (
          <div className="flex items-center gap-2 text-sm">
            <Video className="h-4 w-4 text-muted-foreground" />
            <a
              href={interview.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Rejoindre la réunion virtuelle
            </a>
          </div>
        ) : interview.location ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{interview.location}</span>
          </div>
        ) : null}

        {/* Notes */}
        {interview.notes && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-1">Notes:</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {interview.notes}
            </p>
          </div>
        )}

        {/* Indicateur de temps */}
        {isUpcoming && interview.status === 'scheduled' && (
          <div className="flex items-center gap-2 text-xs">
            {interviewDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000 ? (
              <Badge variant="destructive" className="animate-pulse">
                Aujourd'hui
              </Badge>
            ) : interviewDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000 ? (
              <Badge variant="secondary">
                Cette semaine
              </Badge>
            ) : (
              <Badge variant="outline">
                Dans {Math.ceil((interviewDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))} jours
              </Badge>
            )}
          </div>
        )}

        {isPast && (
          <Badge variant="destructive" className="text-xs">
            Entretien passé - mise à jour requise
          </Badge>
        )}

        {/* Actions */}
        {interview.status === 'scheduled' && (
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit?.(interview)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onCancel?.(interview.id)}
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
