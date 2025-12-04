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
import { Award, Star, Calendar, User, FileText } from 'lucide-react';

interface ReviewsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviews: any[];
}

export function ReviewsListModal({ open, onOpenChange, reviews }: ReviewsListModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Complétée';
      case 'submitted': return 'Soumise';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Toutes les évaluations ({reviews.length})
          </DialogTitle>
          <DialogDescription>
            Liste complète de toutes les évaluations de performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Aucune évaluation disponible</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{review.employeeName}</h3>
                        <p className="text-sm text-muted-foreground">{review.employeeRole}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(review.status)}>
                      {getStatusLabel(review.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(review.reviewDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Période: {review.reviewPeriod}
                      </span>
                    </div>

                    {review.overallRating > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.overallRating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                        <span className="font-medium">{review.overallRating}/5</span>
                      </div>
                    )}
                  </div>

                  {/* Compétences */}
                  {review.competencies && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Compétences</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(review.competencies).map(([key, value]: [string, any]) => (
                          value > 0 && (
                            <div key={key} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <span className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: value }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sections de texte */}
                  <div className="space-y-2">
                    {review.achievements && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs font-semibold text-green-900 mb-1">✅ Réalisations</p>
                        <p className="text-sm text-green-800">{review.achievements}</p>
                      </div>
                    )}

                    {review.strengths && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs font-semibold text-blue-900 mb-1">💪 Points forts</p>
                        <p className="text-sm text-blue-800">{review.strengths}</p>
                      </div>
                    )}

                    {review.areasForImprovement && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-xs font-semibold text-orange-900 mb-1">📈 Axes d'amélioration</p>
                        <p className="text-sm text-orange-800">{review.areasForImprovement}</p>
                      </div>
                    )}

                    {review.goals && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                        <p className="text-xs font-semibold text-purple-900 mb-1">🎯 Objectifs</p>
                        <p className="text-sm text-purple-800">{review.goals}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    Créée le {new Date(review.createdAt).toLocaleDateString('fr-FR')} à {new Date(review.createdAt).toLocaleTimeString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
