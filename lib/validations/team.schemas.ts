import { z } from 'zod';
import { DEPARTMENTS } from '@/lib/constants/departments';
import { TEAM_MEMBER_STATUS } from '@/lib/constants/team-status';

/**
 * Team member validation schema
 */
export const teamMemberSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),

  email: z
    .string()
    .email('Email invalide')
    .toLowerCase()
    .trim(),

  position: z
    .string()
    .min(2, 'Le poste doit contenir au moins 2 caractères')
    .max(100, 'Le poste ne peut pas dépasser 100 caractères')
    .trim(),

  department: z.enum(
    [
      DEPARTMENTS.TECH,
      DEPARTMENTS.HR,
      DEPARTMENTS.SALES,
      DEPARTMENTS.MARKETING,
      DEPARTMENTS.FINANCE,
      DEPARTMENTS.OPERATIONS,
      DEPARTMENTS.SUPPORT,
    ],
    {
      errorMap: () => ({ message: 'Veuillez sélectionner un département valide' }),
    }
  ),

  role: z.enum(['employee', 'manager', 'hr', 'admin'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un rôle valide' }),
  }),

  phone: z
    .string()
    .regex(
      /^(\+?\d{1,4}[\s-]?)?(\(?\d{1,4}\)?[\s-]?)?[\d\s-]{6,}$/,
      'Numéro de téléphone invalide (format international accepté)'
    )
    .refine(
      (val) => {
        if (!val) return true;
        // Remove all non-digit characters
        const cleaned = val.replace(/\D/g, '');
        // Check if it has at least 8 digits (minimum for most countries)
        return cleaned.length >= 8 && cleaned.length <= 15;
      },
      { message: 'Le numéro doit contenir entre 8 et 15 chiffres' }
    )
    .optional()
    .or(z.literal('')),

  location: z
    .string()
    .max(200, 'La localisation ne peut pas dépasser 200 caractères')
    .trim()
    .optional()
    .or(z.literal('')),

  joinDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format: YYYY-MM-DD)')
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime()) && d <= new Date();
      },
      { message: "La date d'arrivée ne peut pas être dans le futur" }
    ),

  status: z
    .enum([
      TEAM_MEMBER_STATUS.ACTIVE,
      TEAM_MEMBER_STATUS.ON_LEAVE,
      TEAM_MEMBER_STATUS.INACTIVE,
    ])
    .optional()
    .default(TEAM_MEMBER_STATUS.ACTIVE),
});

/**
 * Type inference from schema
 */
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;

/**
 * Partial schema for updates
 */
export const teamMemberUpdateSchema = teamMemberSchema.partial();

export type TeamMemberUpdateInput = z.infer<typeof teamMemberUpdateSchema>;
