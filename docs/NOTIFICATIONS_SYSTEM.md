# Système de Notifications - Targetym

## Vue d'ensemble

Le système de notifications de Targetym est un système complet qui permet d'envoyer des notifications in-app et par email aux utilisateurs en fonction de leurs préférences et des actions effectuées dans l'application.

## Architecture

### 1. Base de données

#### Tables principales

**`notifications`** - Stocke toutes les notifications
- `id`: UUID unique
- `organization_id`: Organisation concernée
- `recipient_id`: Destinataire de la notification
- `type`: Type de notification (goal_created, interview_scheduled, etc.)
- `title`: Titre de la notification
- `message`: Message complet
- `resource_type` & `resource_id`: Ressource liée (goal, candidate, etc.)
- `actor_id`: Utilisateur qui a déclenché la notification
- `is_read` & `read_at`: Statut de lecture
- `is_archived` & `archived_at`: Statut d'archivage
- `email_sent`, `slack_sent`, `teams_sent`: Statut d'envoi multi-canal
- `action_url`: Lien deep link vers la ressource
- `priority`: low | normal | high | urgent
- `expires_at`: Date d'expiration optionnelle

**`notification_templates`** - Templates de notifications
- Templates personnalisables par organisation
- Support de variables ({{variable_name}})
- Configuration des canaux (in-app, email, slack, teams)

**`notification_digests`** - Digests de notifications groupées
- Permet d'envoyer des résumés horaires/quotidiens/hebdomadaires

#### Fonctions SQL

**`should_send_notification(user_id, notification_type, organization_id)`**
- Vérifie les préférences utilisateur avant d'envoyer une notification
- Retourne TRUE/FALSE

**`create_notification(...)`**
- Crée une notification en vérifiant automatiquement les préférences
- Retourne NULL si l'utilisateur a désactivé ce type de notification

### 2. Types de notifications

#### Goals & OKRs
- `goal_created`: Nouveau goal créé
- `goal_updated`: Goal modifié
- `goal_completed`: Goal terminé
- `goal_assigned`: Ajouté comme collaborateur
- `goal_deadline_approaching`: Échéance proche
- `goal_comment`: Commentaire ajouté (à implémenter)

#### Recruitment
- `candidate_applied`: Nouveau candidat
- `interview_scheduled`: Entretien programmé
- `interview_reminder`: Rappel d'entretien (1h avant)
- `candidate_status_changed`: Statut candidat modifié

#### Performance
- `performance_review_due`: Évaluation à faire
- `performance_review_submitted`: Évaluation soumise
- `feedback_received`: Feedback reçu
- `peer_feedback_requested`: Feedback demandé

#### Autres
- `team_member_joined`: Nouveau membre d'équipe
- `direct_report_update`: Update du manager
- `mention`: Mention dans un commentaire
- `system`: Notification système

### 3. Service Layer

**`NotificationsService`** (`src/lib/services/notifications.service.ts`)

Méthodes principales:
- `createNotification(data)`: Créer une notification
- `createBulkNotifications(data)`: Créer plusieurs notifications
- `getNotifications(userId, filters, page, pageSize)`: Récupérer les notifications
- `markAsRead(notificationId)`: Marquer comme lu
- `markAllAsRead(userId)`: Tout marquer comme lu
- `archiveNotification(notificationId)`: Archiver
- `deleteNotification(notificationId)`: Supprimer
- `getUnreadCount(userId)`: Nombre de non lus
- `getNotificationStats(userId)`: Statistiques

### 4. Helpers de notification par module

**Goals** (`src/lib/notifications/goals-notifications.ts`)
```typescript
await notifyGoalCreated({
  goalId,
  goalTitle,
  organizationId,
  ownerId,
  actorId,
  recipientIds: [/* collaborators, manager */]
});
```

**Recruitment** (`src/lib/notifications/recruitment-notifications.ts`)
```typescript
await notifyInterviewScheduled({
  interviewId,
  candidateId,
  candidateName,
  jobTitle,
  organizationId,
  interviewerId,
  scheduledAt,
  location,
  actorId
});
```

**Performance** (`src/lib/notifications/performance-notifications.ts`)
```typescript
await notifyPerformanceReviewDue({
  reviewId,
  revieweeId,
  revieweeName,
  reviewerId,
  organizationId,
  dueDate,
  reviewType
});
```

### 5. Server Actions

**`src/actions/notifications/index.ts`**

Actions disponibles:
- `getNotifications(filters, page, pageSize)`: Liste des notifications
- `getNotificationById(id)`: Détail d'une notification
- `markNotificationAsRead(id)`: Marquer comme lu
- `markAllNotificationsAsRead()`: Tout marquer comme lu
- `archiveNotification(id)`: Archiver
- `deleteNotification(id)`: Supprimer
- `getNotificationStats()`: Statistiques
- `getUnreadNotificationCount()`: Nombre de non lus

### 6. UI Components

**NotificationBell** (`src/components/notifications/NotificationBell.tsx`)
- Icône de cloche avec badge de compteur
- Dropdown avec liste des notifications récentes
- Rafraîchissement automatique toutes les 30 secondes

**NotificationList** (`src/components/notifications/NotificationList.tsx`)
- Liste complète des notifications
- Actions: marquer comme lu, archiver, supprimer
- Support du "mark all as read"
- Navigation vers la ressource liée

## Utilisation

### 1. Installation de la migration

```bash
# Appliquer la migration
npm run supabase:reset

# Ou pour production
npm run supabase:push
```

### 2. Ajouter le NotificationBell dans le header

```tsx
// Dans votre layout ou header
import { NotificationBell } from '@/src/components/notifications';

export function DashboardHeader() {
  return (
    <header>
      {/* ... autres éléments ... */}
      <NotificationBell />
    </header>
  );
}
```

### 3. Envoyer une notification depuis une action

```typescript
// Dans src/actions/goals/create-goal.ts
import { notifyGoalCreated, getGoalNotificationRecipients } from '@/src/lib/notifications/goals-notifications';

export async function createGoal(input: CreateGoalInput) {
  // ... logique de création du goal ...

  // Envoyer les notifications
  const recipientIds = await getGoalNotificationRecipients({
    ownerId: goal.owner_id,
    collaboratorIds: [], // À remplir si collaborateurs existants
    managerId: profile.manager_id,
    excludeActorId: user.id, // Ne pas notifier l'acteur
  });

  if (recipientIds.length > 0) {
    await notifyGoalCreated({
      goalId: goal.id,
      goalTitle: goal.title,
      goalDescription: goal.description,
      organizationId: goal.organization_id,
      ownerId: goal.owner_id,
      actorId: user.id,
      recipientIds,
    });
  }

  return successResponse({ id: goal.id });
}
```

### 4. Respecter les préférences utilisateur

Les préférences sont automatiquement vérifiées par la fonction `create_notification()` dans PostgreSQL. Si un utilisateur a désactivé un type de notification dans ses paramètres, elle ne sera pas créée.

Configuration dans `user_settings`:
```typescript
{
  email_notifications_enabled: true,
  notify_new_goal: true,
  notify_goal_update: true,
  notify_goal_completion: true,
  notify_interview_scheduled: true,
  // ... etc
}
```

### 5. Créer une page de notifications complète

```tsx
// app/dashboard/notifications/page.tsx
import { NotificationList } from '@/src/components/notifications';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <NotificationList />
    </div>
  );
}
```

## RLS (Row Level Security)

Les politiques RLS garantissent que:
- Les utilisateurs ne voient que leurs propres notifications
- Seul le destinataire peut modifier/supprimer ses notifications
- Le système peut créer des notifications pour n'importe quel utilisateur
- Les templates sont visibles par tous les membres de l'organisation

## Personnalisation

### Modifier un template

```typescript
// Via l'interface d'administration (à créer)
// Ou directement en SQL
UPDATE notification_templates
SET title_template = 'Nouveau: {{goal_title}}',
    message_template = '{{actor_name}} a créé {{goal_title}}'
WHERE template_key = 'goal_created'
  AND organization_id = 'votre-org-id';
```

### Ajouter un nouveau type de notification

1. Ajouter le type dans la migration SQL (enum `type`)
2. Ajouter le type TypeScript dans `src/types/notifications.types.ts`
3. Créer un helper dans le module approprié
4. Ajouter un template par défaut dans la migration
5. Ajouter la clé de préférence dans `settings.schemas.ts`

## Bonnes pratiques

1. **Toujours exclure l'acteur**: Ne pas notifier la personne qui a fait l'action
2. **Grouper les notifications**: Utiliser `createBulkNotifications` pour plusieurs destinataires
3. **Priorités appropriées**:
   - `urgent`: Rappels d'entretien, échéances imminentes
   - `high`: Assignations, complétion de goals importants
   - `normal`: Créations, updates standard
   - `low`: Notifications informatives
4. **Action URLs**: Toujours fournir un lien direct vers la ressource
5. **Metadata**: Stocker des données supplémentaires pour contexte
6. **Archivage**: Encourager les utilisateurs à archiver plutôt que supprimer

## TODO / Améliorations futures

- [ ] Email sending avec Resend/SendGrid
- [ ] Intégration Slack pour les notifications
- [ ] Intégration Teams pour les notifications
- [ ] Notification digests (emails groupés)
- [ ] Push notifications (PWA)
- [ ] Webhooks pour notifications externes
- [ ] Analytics des notifications (taux d'ouverture, etc.)
- [ ] Notification center page complète
- [ ] Filtres avancés (par type, date, priorité)
- [ ] Search dans les notifications
- [ ] Templates WYSIWYG editor
- [ ] Tests automatisés

## Support

Pour toute question sur le système de notifications, consultez:
- Cette documentation
- Le code dans `src/lib/services/notifications.service.ts`
- Les migrations dans `supabase/migrations/20251012120000_create_notifications_system.sql`
- Les composants dans `src/components/notifications/`
