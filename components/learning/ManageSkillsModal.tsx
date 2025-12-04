'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Trash2, Plus } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  description?: string;
  createdAt: string;
}

interface ManageSkillsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function ManageSkillsModal({ open, onOpenChange, onSave }: ManageSkillsModalProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: '',
    level: 1,
    description: '',
  });

  useEffect(() => {
    const storedSkills = JSON.parse(localStorage.getItem('skills') || '[]');
    setSkills(storedSkills);
  }, [open]);

  const handleAddSkill = () => {
    if (!newSkill.name || !newSkill.category) return;

    const skill: Skill = {
      ...newSkill,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const updatedSkills = [...skills, skill];
    setSkills(updatedSkills);
    localStorage.setItem('skills', JSON.stringify(updatedSkills));
    onSave();

    // Reset new skill form
    setNewSkill({
      name: '',
      category: '',
      level: 1,
      description: '',
    });
  };

  const handleUpdateSkillLevel = (id: string, newLevel: number) => {
    const updatedSkills = skills.map(skill =>
      skill.id === id ? { ...skill, level: newLevel } : skill
    );
    setSkills(updatedSkills);
    localStorage.setItem('skills', JSON.stringify(updatedSkills));
    onSave();
  };

  const handleDeleteSkill = (id: string) => {
    const updatedSkills = skills.filter(skill => skill.id !== id);
    setSkills(updatedSkills);
    localStorage.setItem('skills', JSON.stringify(updatedSkills));
    onSave();
  };

  const skillCategories = ['Technique', 'Soft Skills', 'Leadership', 'Communication', 'Autres'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center"><Plus className="mr-2" /> Gérer les compétences</DialogTitle>
          <DialogDescription>Ajoutez et gérez vos compétences professionnelles</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* New Skill Form */}
          <div className="grid grid-cols-4 items-center gap-4 mb-4 border-b pb-4">
            <Label htmlFor="newSkillName" className="text-right">Nom *</Label>
            <Input 
              id="newSkillName" 
              value={newSkill.name} 
              onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))} 
              className="col-span-3" 
            />

            <Label htmlFor="newSkillCategory" className="text-right">Catégorie *</Label>
            <Select 
              value={newSkill.category}
              onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {skillCategories.map(category => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label htmlFor="newSkillLevel" className="text-right">Niveau</Label>
            <div className="col-span-3 flex items-center space-x-4">
              <Slider
                defaultValue={[1]}
                min={1}
                max={5}
                step={1}
                value={[newSkill.level]}
                onValueChange={(value) => setNewSkill(prev => ({ ...prev, level: value[0] }))}
              />
              <span className="text-sm font-semibold">{newSkill.level}/5</span>
            </div>

            <Label htmlFor="newSkillDescription" className="text-right">Description</Label>
            <Input 
              id="newSkillDescription" 
              value={newSkill.description}
              onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))} 
              className="col-span-3" 
              placeholder="Description optionnelle" 
            />

            <div className="col-span-4 flex justify-end">
              <Button onClick={handleAddSkill} disabled={!newSkill.name || !newSkill.category}>
                <Plus className="mr-2" /> Ajouter
              </Button>
            </div>
          </div>

          {/* Existing Skills List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Compétences existantes</h3>
            {skills.length === 0 && (
              <p className="text-center text-gray-500">Aucune compétence enregistrée</p>
            )}
            {skills.map(skill => (
              <div key={skill.id} className="flex items-center gap-4 mb-2 border-b pb-2">
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <span className="font-semibold">{skill.name}</span>
                    <span className="text-sm text-gray-500">{skill.category}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Slider
                      value={[skill.level]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(value) => handleUpdateSkillLevel(skill.id, value[0])}
                    />
                    <span className="ml-2 text-sm font-semibold">{skill.level}/5</span>
                  </div>
                  {skill.description && (
                    <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                  )}
                </div>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteSkill(skill.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
