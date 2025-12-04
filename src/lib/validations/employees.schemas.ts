import { z } from 'zod';

// Employee status enum
export const employeeStatusSchema = z.enum(['active', 'on-leave', 'inactive']);

// Create employee schema
export const createEmployeeSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  status: employeeStatusSchema.default('active'),
  hire_date: z.string().or(z.date()),
  location: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

// Update employee schema (all fields optional except id)
export const updateEmployeeSchema = z.object({
  id: z.string().uuid('Invalid employee ID'),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  status: employeeStatusSchema.optional(),
  hire_date: z.string().or(z.date()).optional(),
  location: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

// Delete employee schema
export const deleteEmployeeSchema = z.object({
  id: z.string().uuid('Invalid employee ID'),
});

// Get employees filters
export const getEmployeesSchema = z.object({
  department: z.string().optional(),
  status: employeeStatusSchema.optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// Type exports
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type DeleteEmployeeInput = z.infer<typeof deleteEmployeeSchema>;
export type GetEmployeesInput = z.infer<typeof getEmployeesSchema>;
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>;
