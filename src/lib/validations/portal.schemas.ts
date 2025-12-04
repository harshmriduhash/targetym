import { z } from 'zod';

// Portal resource type enum
export const portalResourceTypeSchema = z.enum(['document', 'video', 'guide', 'policy', 'training']);

// Create portal resource schema
export const createPortalResourceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  type: portalResourceTypeSchema,
  category: z.string().min(1, 'Category is required'),
  featured: z.boolean().default(false),
  url: z.string().url().optional().or(z.literal('')),
  file_path: z.string().optional(),
});

// Update portal resource schema
export const updatePortalResourceSchema = z.object({
  id: z.string().uuid('Invalid resource ID'),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  type: portalResourceTypeSchema.optional(),
  category: z.string().min(1).optional(),
  featured: z.boolean().optional(),
  url: z.string().url().optional().or(z.literal('')),
  file_path: z.string().optional(),
});

// Delete portal resource schema
export const deletePortalResourceSchema = z.object({
  id: z.string().uuid('Invalid resource ID'),
});

// Get portal resources filters
export const getPortalResourcesSchema = z.object({
  type: portalResourceTypeSchema.optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// Increment views/downloads schemas
export const incrementResourceViewsSchema = z.object({
  id: z.string().uuid('Invalid resource ID'),
});

export const incrementResourceDownloadsSchema = z.object({
  id: z.string().uuid('Invalid resource ID'),
});

// Type exports
export type CreatePortalResourceInput = z.infer<typeof createPortalResourceSchema>;
export type UpdatePortalResourceInput = z.infer<typeof updatePortalResourceSchema>;
export type DeletePortalResourceInput = z.infer<typeof deletePortalResourceSchema>;
export type GetPortalResourcesInput = z.infer<typeof getPortalResourcesSchema>;
export type PortalResourceType = z.infer<typeof portalResourceTypeSchema>;
