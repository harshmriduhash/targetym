'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Users, Mail, Phone, FileText, Plus, Calendar } from 'lucide-react';
import { useState } from 'react';

interface CandidatePipelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: any[];
  jobs: any[];
  onAddCandidate?: () => void;
  onScheduleInterview?: (candidate: any) => void;
  onUpdateStage?: (candidateId: string, newStage: string) => void;
}

const PIPELINE_STAGES = [
  { id: 'applied', label: 'Candidatures', color: 'bg-blue-100 text-blue-700' },
  { id: 'screening', label: 'Présélection', color: 'bg-purple-100 text-purple-700' },
  { id: 'interview', label: 'Entretiens', color: 'bg-orange-100 text-orange-700' },
  { id: 'offer', label: 'Offres', color: 'bg-green-100 text-green-700' },
  { id: 'hired', label: 'Embauchés', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'rejected', label: 'Refusés', color: 'bg-red-100 text-red-700' }
];

export function CandidatePipelineModal({
  open,
  onOpenChange,
  candidates,
  jobs,
  onAddCandidate,
  onScheduleInterview,
  onUpdateStage
}: CandidatePipelineModalProps) {
  const [draggedCandidate, setDraggedCandidate] = useState<any>(null);

  const getCandidatesByStage = (stage: string) => {
    return candidates.filter(c => c.stage === stage);
  };

  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.title || 'Poste inconnu';
  };

  const handleDragStart = (candidate: any) => {
    setDraggedCandidate(candidate);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: string) => {
    if (draggedCandidate && onUpdateStage) {
      onUpdateStage(draggedCandidate.id, stage);
      setDraggedCandidate(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Pipeline de candidats ({candidates.length})
              </DialogTitle>
              <DialogDescription>
                Gérez le processus de recrutement par étape (glisser-déposer pour changer d'étape)
              </DialogDescription>
            </div>
            <Button onClick={onAddCandidate}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un candidat
            </Button>
          </div>
        </DialogHeader>

        {/* Pipeline Kanban */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {PIPELINE_STAGES.map((stage) => {
              const stageCandidates = getCandidatesByStage(stage.id);
              return (
                <div
                  key={stage.id}
                  className="flex-1 min-w-[280px]"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(stage.id)}
                >
                  {/* En-tête de colonne */}
                  <div className={`p-3 rounded-t-lg ${stage.color} font-semibold flex items-center justify-between`}>
                    <span>{stage.label}</span>
                    <Badge variant="secondary" className="bg-white/50">
                      {stageCandidates.length}
                    </Badge>
                  </div>

                  {/* Liste des candidats */}
                  <div className="bg-muted/30 p-2 rounded-b-lg min-h-[500px] space-y-2">
                    {stageCandidates.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        Aucun candidat
                      </div>
                    ) : (
                      stageCandidates.map((candidate) => (
                        <Card
                          key={candidate.id}
                          className="p-3 cursor-move hover:shadow-md transition-shadow bg-card"
                          draggable
                          onDragStart={() => handleDragStart(candidate)}
                        >
                          <div className="space-y-2">
                            {/* Nom et poste */}
                            <div>
                              <h4 className="font-semibold">{candidate.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {getJobTitle(candidate.jobId)}
                              </p>
                            </div>

                            {/* Contact */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{candidate.email}</span>
                              </div>
                              {candidate.phone && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <span>{candidate.phone}</span>
                                </div>
                              )}
                            </div>

                            {/* Score IA */}
                            {candidate.aiScore && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Score IA:</span>
                                <Badge variant={
                                  candidate.aiScore >= 80 ? 'default' :
                                  candidate.aiScore >= 60 ? 'secondary' : 'outline'
                                }>
                                  {candidate.aiScore}/100
                                </Badge>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t">
                              {candidate.cvUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-1 text-xs"
                                  onClick={() => window.open(candidate.cvUrl, '_blank')}
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  CV
                                </Button>
                              )}
                              {stage.id !== 'hired' && stage.id !== 'rejected' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-1 text-xs"
                                  onClick={() => onScheduleInterview?.(candidate)}
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Entretien
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistiques */}
        <div className="border-t pt-4 grid grid-cols-6 gap-4 text-center text-sm">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id}>
              <div className="font-bold text-lg">{getCandidatesByStage(stage.id).length}</div>
              <div className="text-muted-foreground text-xs">{stage.label}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
