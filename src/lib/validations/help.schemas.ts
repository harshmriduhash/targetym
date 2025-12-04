import { z } from 'zod';

// Support ticket status and priority enums
export const supportTicketStatusSchema = z.enum(['open', 'in-progress', 'resolved']);
export const supportTicketPrioritySchema = z.enum(['low', 'medium', 'high']);

// Create support ticket schema
export const createSupportTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  priority: supportTicketPrioritySchema.default('medium'),
});

// Update support ticket schema
export const updateSupportTicketSchema = z.object({
  id: z.string().uuid('Invalid ticket ID'),
  status: supportTicketStatusSchema.optional(),
  assigned_to_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1).optional(),
});

// Get support tickets filters
export const getSupportTicketsSchema = z.object({
  status: supportTicketStatusSchema.optional(),
  category: z.string().optional(),
  priority: supportTicketPrioritySchema.optional(),
  user_id: z.string().uuid().optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// Get FAQs filters
export const getFAQsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// Increment FAQ helpful count
export const incrementFAQHelpfulSchema = z.object({
  id: z.string().uuid('Invalid FAQ ID'),
});

// Type exports
export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;
export type UpdateSupportTicketInput = z.infer<typeof updateSupportTicketSchema>;
export type GetSupportTicketsInput = z.infer<typeof getSupportTicketsSchema>;
export type GetFAQsInput = z.infer<typeof getFAQsSchema>;
export type SupportTicketStatus = z.infer<typeof supportTicketStatusSchema>;
export type SupportTicketPriority = z.infer<typeof supportTicketPrioritySchema>;
