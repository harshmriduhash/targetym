'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Award } from 'lucide-react';

interface CreateCertificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function CreateCertificationModal({ open, onOpenChange, onSave }: CreateCertificationModalProps) {
  const [certification, setCertification] = useState({
    title: '',
    provider: '',
    certificationNumber: '',
    issueDate: '',
    expiryDate: '',
    renewalRequired: false,
    description: '',
    skills: '',
  });

  const resetForm = () => {
    setCertification({
      title: '',
      provider: '',
      certificationNumber: '',
      issueDate: '',
      expiryDate: '',
      renewalRequired: false,
      description: '',
      skills: '',
    });
  };

  const handleSave = () => {
    const newCertification = {
      ...certification,
      id: Date.now().toString(),
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    };

    const existingCertifications = JSON.parse(localStorage.getItem('certifications') || '[]');
    const updatedCertifications = [...existingCertifications, newCertification];
    localStorage.setItem('certifications', JSON.stringify(updatedCertifications));

    resetForm();
    onSave();
    onOpenChange(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCertification(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center"><Award className="mr-2" /> Ajouter une certification</DialogTitle>
          <DialogDescription>Enregistrez une nouvelle certification professionnelle</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Titre *</Label>
            <Input 
              id="title" 
              name="title" 
              value={certification.title} 
              onChange={handleChange} 
              className="col-span-3" 
              required 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="provider" className="text-right">Organisme *</Label>
            <Input 
              id="provider" 
              name="provider" 
              value={certification.provider} 
              onChange={handleChange} 
              className="col-span-3" 
              required 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="certificationNumber" className="text-right">Numéro de certification</Label>
            <Input 
              id="certificationNumber" 
              name="certificationNumber" 
              value={certification.certificationNumber} 
              onChange={handleChange} 
              className="col-span-3" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="issueDate" className="text-right">Date d&apos;émission *</Label>
            <Input 
              id="issueDate" 
              name="issueDate" 
              type="date" 
              value={certification.issueDate} 
              onChange={handleChange} 
              className="col-span-3" 
              required 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expiryDate" className="text-right">Date d&apos;expiration</Label>
            <Input 
              id="expiryDate" 
              name="expiryDate" 
              type="date" 
              value={certification.expiryDate} 
              onChange={handleChange} 
              className="col-span-3" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="renewalRequired" className="text-right">Renouvellement</Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Checkbox 
                id="renewalRequired"
                checked={certification.renewalRequired}
                onCheckedChange={(checked) => setCertification(prev => ({ ...prev, renewalRequired: !!checked }))}
              />
              <label htmlFor="renewalRequired" className="text-sm">Renouvellement requis</label>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={certification.description} 
              onChange={handleChange} 
              className="col-span-3" 
              placeholder="Description détaillée de la certification" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="skills" className="text-right">Compétences</Label>
            <Input 
              id="skills" 
              name="skills" 
              value={certification.skills} 
              onChange={handleChange} 
              className="col-span-3" 
              placeholder="Ex: Python, Data Science, Cloud Computing" 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} disabled={!certification.title || !certification.provider || !certification.issueDate}>
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
