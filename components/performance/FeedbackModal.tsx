'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFeedbackCreated?: (feedback: any) => void;
}

export function FeedbackModal({ open, onOpenChange, onFeedbackCreated }: FeedbackModalProps) {
  const [recipientName, setRecipientName] = useState('');
  const [type, setType] = useState<'peer' | 'manager' | 'subordinate' | 'self'>('peer');
  const [category, setCategory] = useState<'positive' | 'constructive' | 'developmental'>('positive');
  const [content, setContent] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [examples, setExamples] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const feedbackData = {
      id: Date.now().toString(),
      recipientName,
      type,
      category,
      content,
      strengths,
      improvements,
      examples,
      isAnonymous,
      createdAt: new Date().toISOString(),
    };

    // Sauvegarder dans localStorage
    const existingFeedback = JSON.parse(localStorage.getItem('performanceFeedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('performanceFeedback', JSON.stringify(existingFeedback));

    if (onFeedbackCreated) {
      onFeedbackCreated(feedbackData);
    }

    onOpenChange(false);

    // Reset form
    setRecipientName('');
    setType('peer');
    setCategory('positive');
    setContent('');
    setStrengths('');
    setImprovements('');
    setExamples('');
    setIsAnonymous(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Feedback 360°
          </DialogTitle>
          <DialogDescription>
            Donner un feedback constructif et bienveillant à un collègue
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">
                  Nom du destinataire <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="recipientName"
                  placeholder="Ex: Marie Dupont"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                  disabled={isAnonymous}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type de relation</Label>
                <select
                  id="type"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="peer">Collègue (Peer)</option>
                  <option value="manager">Manager</option>
                  <option value="subordinate">Subordonné</option>
                  <option value="self">Auto-évaluation</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="anonymous" className="cursor-pointer">
                Feedback anonyme
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie de feedback</Label>
              <select
                id="category"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <option value="positive">Positif / Reconnaissance</option>
                <option value="constructive">Constructif / Amélioration</option>
                <option value="developmental">Développement / Coaching</option>
              </select>
            </div>
          </div>

          {/* Contenu du feedback */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="font-semibold text-sm">Contenu du feedback</h3>

            <div className="space-y-2">
              <Label htmlFor="content">
                Message principal <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Décrivez votre feedback de manière claire et constructive..."
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strengths">Points forts observés</Label>
              <Textarea
                id="strengths"
                placeholder="Quels sont les points forts que vous avez remarqués ?"
                rows={3}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="improvements">Suggestions d'amélioration</Label>
              <Textarea
                id="improvements"
                placeholder="Quelles suggestions constructives pouvez-vous proposer ?"
                rows={3}
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="examples">Exemples concrets (optionnel)</Label>
              <Textarea
                id="examples"
                placeholder="Donnez des exemples spécifiques pour illustrer vos points..."
                rows={3}
                value={examples}
                onChange={(e) => setExamples(e.target.value)}
              />
            </div>
          </div>

          {/* Guide pour un bon feedback */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">💡 Conseils pour un feedback efficace</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Soyez spécifique et donnez des exemples concrets</li>
              <li>• Concentrez-vous sur les comportements, pas sur la personne</li>
              <li>• Équilibrez positif et constructif</li>
              <li>• Proposez des solutions et du soutien</li>
              <li>• Restez respectueux et bienveillant</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Envoyer le feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
