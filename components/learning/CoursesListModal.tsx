'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Book, Calendar } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  provider: string;
  status: string;
  progress: number;
  deadline?: string;
}

interface CoursesListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses?: Course[];
}

export default function CoursesListModal({
  open,
  onOpenChange,
  courses = []
}: CoursesListModalProps) {
  const [filter, setFilter] = useState<string>('all');

  const groupedCourses = useMemo(() => {
    const sortedCourses = [...courses].sort((a, b) => a.title.localeCompare(b.title));
    
    const groups = {
      'not_started': sortedCourses.filter(course => course.status === 'not_started'),
      'in_progress': sortedCourses.filter(course => course.status === 'in_progress'),
      'completed': sortedCourses.filter(course => course.status === 'completed'),
    };

    return groups;
  }, [courses]);

  const renderCourseList = (courseList: Course[]) => {
    return courseList.map(course => (
      <div 
        key={course.id} 
        className="flex flex-col border-b pb-3 mb-3 last:border-b-0"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">{course.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <span>{course.category}</span>
              <span>•</span>
              <span>{course.provider}</span>
            </div>
          </div>
          <Badge variant={getBadgeVariant(course.status)}>
            {getStatusLabel(course.status)}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2 mt-2">
          <Progress value={course.progress} className="flex-grow" />
          <span className="text-sm font-semibold">{course.progress}%</span>
        </div>
        
        {course.deadline && (
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Date limite : {new Date(course.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    ));
  };

  const getBadgeVariant = (status: string) => {
    switch(status) {
      case 'not_started': return 'secondary';
      case 'in_progress': return 'outline';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'not_started': return 'Non commencé';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Book className="mr-2" /> Liste des formations
          </DialogTitle>
          <DialogDescription>
            Vue d&apos;ensemble de vos parcours de formation
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-2 mb-4">
          {['all', 'not_started', 'in_progress', 'completed'].map(status => (
            <Badge 
              key={status} 
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status)}
              className="cursor-pointer"
            >
              {status === 'all' ? 'Toutes' : getStatusLabel(status)}
            </Badge>
          ))}
        </div>

        {filter === 'all' || filter === 'not_started' && groupedCourses.not_started.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mt-4 mb-2">Non commencées</h2>
            {renderCourseList(groupedCourses.not_started)}
          </>
        )}

        {filter === 'all' || filter === 'in_progress' && groupedCourses.in_progress.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mt-4 mb-2">En cours</h2>
            {renderCourseList(groupedCourses.in_progress)}
          </>
        )}

        {filter === 'all' || filter === 'completed' && groupedCourses.completed.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mt-4 mb-2">Terminées</h2>
            {renderCourseList(groupedCourses.completed)}
          </>
        )}

        {courses.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Aucune formation enregistrée
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
