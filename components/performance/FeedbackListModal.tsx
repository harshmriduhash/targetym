'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, Clock, ThumbsUp, Lightbulb, TrendingUp } from 'lucide-react';

interface FeedbackListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: any[];
}

export function FeedbackListModal({ open, onOpenChange, feedback }: FeedbackListModalProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'peer': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'manager': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'subordinate': return 'bg-green-100 text-green-700 border-green-200';
      case 'self': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'peer': return 'Collègue';
      case 'manager': return 'Manager';
      case 'subordinate': return 'Subordonné';
      case 'self': return 'Auto-évaluation';
      default: return type;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'positive': return <ThumbsUp className="h-4 w-4" />;
      case 'constructive': return <Lightbulb className="h-4 w-4" />;
      case 'developmental': return <TrendingUp className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'positive': return 'bg-green-100 text-green-700 border-green-200';
      case 'constructive': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'developmental': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'positive': return 'Positif';
      case 'constructive': return 'Constructif';
      case 'developmental': return 'Développement';
      default: return category;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Tous les feedbacks 360° ({feedback.length})
          </DialogTitle>
          <DialogDescription>
            Liste complète de tous les retours d'expérience reçus et donnés
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {feedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Aucun feedback disponible</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {item.isAnonymous ? (
                            <>
                              <User className="h-4 w-4 text-muted-foreground" />
                              Anonyme
                            </>
                          ) : (
                            <>Pour: {item.recipientName}</>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString('fr-FR')} à{' '}
                            {new Date(item.createdAt).toLocaleTimeString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={getTypeColor(item.type)}>
                      {getTypeLabel(item.type)}
                    </Badge>
                    <Badge className={getCategoryColor(item.category)}>
                      {getCategoryLabel(item.category)}
                    </Badge>
                    {item.isAnonymous && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-700">
                        🔒 Anonyme
                      </Badge>
                    )}
                  </div>

                  {/* Contenu principal */}
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">💬 Message principal</p>
                      <p className="text-sm">{item.content}</p>
                    </div>

                    {item.strengths && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs font-semibold text-green-900 mb-1 flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          Points forts observés
                        </p>
                        <p className="text-sm text-green-800">{item.strengths}</p>
                      </div>
                    )}

                    {item.improvements && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-xs font-semibold text-orange-900 mb-1 flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" />
                          Suggestions d'amélioration
                        </p>
                        <p className="text-sm text-orange-800">{item.improvements}</p>
                      </div>
                    )}

                    {item.examples && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-900 mb-1">📋 Exemples concrets</p>
                        <p className="text-sm text-blue-800">{item.examples}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Feedback ID: #{item.id.slice(0, 8)}</span>
                      <span>
                        Créé le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
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
