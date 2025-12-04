// Customer support helper for helpdesk, tickets, and feedback
export interface SupportTicket {
  id: string;
  user_id: string;
  organization_id: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export async function createSupportTicket(
  userId: string,
  organizationId: string,
  subject: string,
  description: string,
  priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): Promise<SupportTicket> {
  // TODO: Integrate with helpdesk service (Zendesk, Intercom, etc.)
  return {
    id: `ticket_${Date.now()}`,
    user_id: userId,
    organization_id: organizationId,
    subject,
    description,
    priority,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export const supportKnowledgeBase = [
  {
    id: 'kb_1',
    title: 'How to set up team members',
    content: 'Go to Settings > Team and click Add Member. Enter their email and select a role.',
    category: 'team-management',
  },
  {
    id: 'kb_2',
    title: 'How to create goals',
    content: 'Navigate to Goals > New Goal. Set a title, description, and assign owners.',
    category: 'goals',
  },
  {
    id: 'kb_3',
    title: 'How to use AI CV scoring',
    content: 'Upload candidate CVs. Targetym will automatically score them 0-100.',
    category: 'recruitment',
  },
];

export async function searchKnowledgeBase(query: string) {
  return supportKnowledgeBase.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase())
  );
}
