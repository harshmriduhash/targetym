'use client';

import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Grid, Award } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  description?: string;
}

interface SkillsMatrixModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skills?: Skill[];
}

export default function SkillsMatrixModal({
  open,
  onOpenChange,
  skills = []
}: SkillsMatrixModalProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  const skillStats = useMemo(() => {
    const categories = [...new Set(skills.map(skill => skill.category))];

    const stats = {
      total: skills.length,
      byCategory: {},
      globalAverageLevel: skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length || 0,
    };

    categories.forEach(category => {
      const categorySkills = skills.filter(skill => skill.category === category);
      
      const categoryStats = {
        total: categorySkills.length,
        averageLevel: categorySkills.reduce((sum, skill) => sum + skill.level, 0) / categorySkills.length || 0,
        levelDistribution: {
          1: categorySkills.filter(skill => skill.level === 1).length,
          2: categorySkills.filter(skill => skill.level === 2).length,
          3: categorySkills.filter(skill => skill.level === 3).length,
          4: categorySkills.filter(skill => skill.level === 4).length,
          5: categorySkills.filter(skill => skill.level === 5).length,
        },
      };

      stats.byCategory[category] = categoryStats;
    });

    return stats;
  }, [skills]);

  const filteredSkills = useMemo(() => {
    return activeCategory === 'all' 
      ? skills 
      : skills.filter(skill => skill.category === activeCategory);
  }, [skills, activeCategory]);

  const renderSkillCategories = () => {
    const categories = ['all', ...new Set(skills.map(skill => skill.category))];

    return categories.map(category => (
      <TabsTrigger 
        key={category} 
        value={category}
        onClick={() => setActiveCategory(category)}
      >
        {category === 'all' ? 'Toutes' : category}
      </TabsTrigger>
    ));
  };

  const renderSkillItem = (skill: Skill) => {
    const getProgressColor = (level: number) => {
      const colors = {
        1: 'bg-red-500',
        2: 'bg-orange-400',
        3: 'bg-yellow-500',
        4: 'bg-green-500',
        5: 'bg-green-700',
      };
      return colors[level] || 'bg-gray-300';
    };

    return (
      <div key={skill.id} className="flex flex-col mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-lg">{skill.name}</h3>
          <Badge variant="outline">{skill.category}</Badge>
        </div>
        <div className="flex items-center space-x-4">
          <Progress 
            value={skill.level * 20} 
            className="flex-grow" 
            indicatorClassName={getProgressColor(skill.level)}
          />
          <span className="font-semibold text-sm">Niveau {skill.level}/5</span>
        </div>
        {skill.description && (
          <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
        )}
      </div>
    );
  };

  const renderCategoryStats = () => {
    return Object.entries(skillStats.byCategory).map(([category, categoryStats]) => (
      <div key={category} className="mb-4 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">{category}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span>Nombre total</span>
              <span className="font-semibold">{categoryStats.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Niveau moyen</span>
              <span className="font-semibold">
                {categoryStats.averageLevel.toFixed(1)}/5
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Distribution des niveaux</h4>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(level => (
                <Badge 
                  key={level} 
                  variant="outline"
                  className="w-full text-center"
                >
                  {level}: {categoryStats.levelDistribution[level]}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const renderGlobalStats = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Vue d&apos;ensemble</h3>
        <div className="flex justify-between mb-2">
          <span>Nombre total de compétences</span>
          <span className="font-semibold">{skillStats.total}</span>
        </div>
        <div className="flex justify-between">
          <span>Niveau moyen global</span>
          <span className="font-semibold">{skillStats.globalAverageLevel.toFixed(1)}/5</span>
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Progression</h3>
        <div className="flex flex-col space-y-2">
          {Object.entries(skillStats.byCategory).map(([category, categoryStats]) => (
            <div key={category} className="flex items-center">
              <span className="flex-grow">{category}</span>
              <Progress 
                value={(categoryStats.averageLevel / 5) * 100} 
                className="w-1/2 mr-2"
              />
              <span className="font-semibold">
                {categoryStats.averageLevel.toFixed(1)}/5
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Grid className="mr-2" /> Matrice des compétences
          </DialogTitle>
          <DialogDescription>
            Analyse et suivi de vos compétences professionnelles
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-5 mb-4">
            {renderSkillCategories()}
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            {renderGlobalStats()}
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-3">Statistiques par catégorie</h2>
              {renderCategoryStats()}
            </div>
          </TabsContent>

          <TabsContent value={activeCategory} className="space-y-4">
            {filteredSkills.length > 0 ? (
              filteredSkills.map(renderSkillItem)
            ) : (
              <div className="text-center text-gray-500 py-8">
                Aucune compétence dans cette catégorie
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
