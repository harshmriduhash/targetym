'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Users, Edit, Trash2, DollarSign, Calendar } from 'lucide-react';

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string[];
  responsibilities: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  status: 'draft' | 'active' | 'closed';
  createdAt: string;
  candidatesCount: number;
}

interface JobCardProps {
  job: JobPosting;
  onEdit?: (job: JobPosting) => void;
  onDelete?: (id: string) => void;
}

export function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  const statusLabels = {
    'draft': 'Brouillon',
    'active': 'Active',
    'closed': 'Fermée'
  };

  const statusColors = {
    'draft': 'bg-gray-500',
    'active': 'bg-green-500',
    'closed': 'bg-red-500'
  };

  const employmentTypeLabels = {
    'full-time': 'Temps plein',
    'part-time': 'Temps partiel',
    'contract': 'Contrat',
    'internship': 'Stage'
  };

  const typeColors = {
    'full-time': 'bg-blue-100 text-blue-700',
    'part-time': 'bg-purple-100 text-purple-700',
    'contract': 'bg-orange-100 text-orange-700',
    'internship': 'bg-pink-100 text-pink-700'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: statusColors[job.status] }}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{job.title}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{job.department}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className={typeColors[job.employmentType]}>
              {employmentTypeLabels[job.employmentType]}
            </Badge>
            <Badge variant="outline" className="text-white" style={{ backgroundColor: statusColors[job.status] }}>
              {statusLabels[job.status]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Localisation et candidats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{job.candidatesCount || 0} candidat{job.candidatesCount > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>
        </div>

        {/* Exigences */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Exigences principales:</p>
            <div className="flex flex-wrap gap-2">
              {job.requirements.slice(0, 3).map((req, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {req}
                </Badge>
              ))}
              {job.requirements.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.requirements.length - 3} autres
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Salaire */}
        {job.salaryMin && job.salaryMax && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {job.salaryMin.toLocaleString()}€ - {job.salaryMax.toLocaleString()}€ / an
            </span>
          </div>
        )}

        {/* Date de création */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>Créée le {new Date(job.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(job)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onDelete?.(job.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
