import { z } from 'zod';

// Form entry status and priority enums
export const formEntryStatusSchema = z.enum(['submitted', 'in-review', 'approved', 'rejected']);
export const formEntryPrioritySchema = z.enum(['high', 'medium', 'low']);

// Create form entry schema
export const createFormEntrySchema = z.object({
  form_name: z.string().min(1, 'Form name is required').max(200),
  department: z.string().min(1, 'Department is required'),
  priority: formEntryPrioritySchema.default('medium'),
  form_data: z.record(z.any()).optional(),
});

// Update form entry schema
export const updateFormEntrySchema = z.object({
  id: z.string().uuid('Invalid form entry ID'),
  status: formEntryStatusSchema.optional(),
  form_data: z.record(z.any()).optional(),
  reviewed_by_id: z.string().uuid().optional(),
});

// Get form entries filters
export const getFormEntriesSchema = z.object({
  status: formEntryStatusSchema.optional(),
  department: z.string().optional(),
  priority: formEntryPrioritySchema.optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// Type exports
export type CreateFormEntryInput = z.infer<typeof createFormEntrySchema>;
export type UpdateFormEntryInput = z.infer<typeof updateFormEntrySchema>;
export type GetFormEntriesInput = z.infer<typeof getFormEntriesSchema>;
export type FormEntryStatus = z.infer<typeof formEntryStatusSchema>;
export type FormEntryPriority = z.infer<typeof formEntryPrioritySchema>;
