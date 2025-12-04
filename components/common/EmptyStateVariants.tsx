'use client';

import React, { memo } from 'react';
import {
  Inbox,
  Search,
  AlertCircle,
  FileQuestion,
  Users,
  Calendar,
  BookOpen,
  Target,
  Building2,
} from 'lucide-react';
import EmptyState, { EmptyStateAction } from './EmptyState';

interface EmptyStateVariantProps {
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'card' | 'plain';
  className?: string;
}

/**
 * Empty inbox state
 */
export const EmptyInbox = memo(function EmptyInbox(props: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={Inbox}
      title="Aucun élément"
      description="Aucun élément à afficher pour le moment"
      iconColor="text-blue-500"
      {...props}
    />
  );
});

/**
 * No search results state
 */
export const NoSearchResults = memo(function NoSearchResults(props: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={Search}
      title="Aucun résultat"
      description="Essayez de modifier vos critères de recherche ou vos filtres"
      iconColor="text-amber-500"
      {...props}
    />
  );
});

/**
 * Error state
 */
export const ErrorState = memo(function ErrorState(
  props: EmptyStateVariantProps & { title?: string; description?: string }
) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={props.title || "Une erreur s'est produite"}
      description={props.description || "Impossible de charger les données. Veuillez réessayer."}
      iconColor="text-red-500"
      {...props}
    />
  );
});

/**
 * Not found / 404 state
 */
export const NotFoundState = memo(function NotFoundState(props: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Page introuvable"
      description="La page que vous recherchez n'existe pas ou a été déplacée"
      iconColor="text-gray-500"
      {...props}
    />
  );
});

/**
 * No team members state
 */
export const NoTeamMembers = memo(function NoTeamMembers(props: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={Users}
      title="Aucun membre d'équipe"
      description="Commencez par ajouter des membres à votre équipe"
      iconColor="text-indigo-500"
      {...props}
    />
  );
});

/**
 * No events/calendar state
 */
export const NoEvents = memo(function NoEvents(props: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={Calendar}
      title="Aucun événement"
      description="Aucun événement planifié pour le moment"
      iconColor="text-green-500"
      {...props}
    />
  );
});

/**
 * No learning content state
 */
export const NoLearningContent = memo(function NoLearningContent(props: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={BookOpen}
      title="Aucun contenu de formation"
      description="Explorez notre catalogue de formations pour commencer à apprendre"
      iconColor="text-purple-500"
      {...props}
    />
  );
});

/**
 * No goals state
 */
export const NoGoals = memo(function NoGoals(props: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={Target}
      title="Aucun objectif défini"
      description="Définissez vos objectifs pour suivre vos progrès"
      iconColor="text-orange-500"
      {...props}
    />
  );
});

/**
 * No organization data state
 */
export const NoOrganizationData = memo(function NoOrganizationData(props: EmptyStateVariantProps) {
  return (
    <EmptyState
      icon={Building2}
      title="Aucune donnée organisationnelle"
      description="Configurez votre organisation pour commencer"
      iconColor="text-cyan-500"
      {...props}
    />
  );
});
