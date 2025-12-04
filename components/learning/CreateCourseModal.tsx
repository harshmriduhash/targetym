'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Book, Clock, Star } from 'lucide-react';

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function CreateCourseModal({ open, onOpenChange, onSave }: CreateCourseModalProps) {
  const [course, setCourse] = useState({
    title: '',
    category: '',
    provider: '',
    type: '',
    duration: '',
    level: '',
    description: '',
    objectives: '',
    deadline: '',
  });

  const resetForm = () => {
    setCourse({
      title: '',
      category: '',
      provider: '',
      type: '',
      duration: '',
      level: '',
      description: '',
      objectives: '',
      deadline: '',
    });
  };

  const handleSave = () => {
    const newCourse = {
      ...course,
      id: Date.now().toString(),
      status: 'not_started',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const updatedCourses = [...existingCourses, newCourse];
    localStorage.setItem('courses', JSON.stringify(updatedCourses));

    resetForm();
    onSave();
    onOpenChange(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center"><Book className="mr-2" /> Créer une formation</DialogTitle>
          <DialogDescription>Ajoutez une nouvelle formation à votre parcours d&apos;apprentissage</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Titre *</Label>
            <Input 
              id="title" 
              name="title" 
              value={course.title} 
              onChange={handleChange} 
              className="col-span-3" 
              required 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Catégorie *</Label>
            <Select 
              value={course.category} 
              onValueChange={(value) => setCourse(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technique">Technique</SelectItem>
                <SelectItem value="management">Management</SelectItem>
                <SelectItem value="soft-skills">Soft Skills</SelectItem>
                <SelectItem value="autres">Autres</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="provider" className="text-right">Organisme</Label>
            <Input 
              id="provider" 
              name="provider" 
              value={course.provider} 
              onChange={handleChange} 
              className="col-span-3" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Type</Label>
            <Select 
              value={course.type} 
              onValueChange={(value) => setCourse(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">En ligne</SelectItem>
                <SelectItem value="presentiel">Présentiel</SelectItem>
                <SelectItem value="hybride">Hybride</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">Durée</Label>
            <Input 
              id="duration" 
              name="duration" 
              value={course.duration} 
              onChange={handleChange} 
              className="col-span-3" 
              placeholder="Ex: 10h, 2 jours" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="level" className="text-right">Niveau</Label>
            <Select 
              value={course.level} 
              onValueChange={(value) => setCourse(prev => ({ ...prev, level: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez un niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debutant"><Star /> Débutant</SelectItem>
                <SelectItem value="intermediaire"><Star /><Star /> Intermédiaire</SelectItem>
                <SelectItem value="avance"><Star /><Star /><Star /> Avancé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deadline" className="text-right">Date limite</Label>
            <Input 
              id="deadline" 
              name="deadline" 
              type="date" 
              value={course.deadline} 
              onChange={handleChange} 
              className="col-span-3" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={course.description} 
              onChange={handleChange} 
              className="col-span-3" 
              placeholder="Description détaillée de la formation" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="objectives" className="text-right">Objectifs</Label>
            <Textarea 
              id="objectives" 
              name="objectives" 
              value={course.objectives} 
              onChange={handleChange} 
              className="col-span-3" 
              placeholder="Objectifs pédagogiques de la formation" 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} disabled={!course.title || !course.category}>
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
