import { z } from 'zod';

// Notice type and priority enums
export const noticeTypeSchema = z.enum(['urgent', 'info', 'announcement', 'event']);
export const noticePrioritySchema = z.enum(['high', 'medium', 'low']);

// Create notice schema
export const createNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  type: noticeTypeSchema,
  priority: noticePrioritySchema.default('medium'),
  department: z.string().optional(),
  expires_at: z.string().or(z.date()).optional(),
});

// Update notice schema
export const updateNoticeSchema = z.object({
  id: z.string().uuid('Invalid notice ID'),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  type: noticeTypeSchema.optional(),
  priority: noticePrioritySchema.optional(),
  department: z.string().optional(),
  expires_at: z.string().or(z.date()).optional().nullable(),
});

// Delete notice schema
export const deleteNoticeSchema = z.object({
  id: z.string().uuid('Invalid notice ID'),
});

// Get notices filters
export const getNoticesSchema = z.object({
  type: noticeTypeSchema.optional(),
  priority: noticePrioritySchema.optional(),
  department: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// Increment views schema
export const incrementNoticeViewsSchema = z.object({
  id: z.string().uuid('Invalid notice ID'),
});

// Type exports
export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;
export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;
export type DeleteNoticeInput = z.infer<typeof deleteNoticeSchema>;
export type GetNoticesInput = z.infer<typeof getNoticesSchema>;
export type NoticeType = z.infer<typeof noticeTypeSchema>;
export type NoticePriority = z.infer<typeof noticePrioritySchema>;
