import { z } from 'zod';
import { ORGANIZATION_SIZE, INDUSTRY_TYPES } from '@/lib/constants/organization';
import { isValidSiret } from '@/lib/utils/organization';

/**
 * Organization profile schema
 */
export const organizationProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom de l'organisation doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim(),

  legalName: z
    .string()
    .min(2, 'La raison sociale doit contenir au moins 2 caractères')
    .max(200, 'La raison sociale ne peut pas dépasser 200 caractères')
    .trim()
    .optional()
    .or(z.literal('')),

  industry: z.enum(
    [
      INDUSTRY_TYPES.TECHNOLOGY,
      INDUSTRY_TYPES.HEALTHCARE,
      INDUSTRY_TYPES.FINANCE,
      INDUSTRY_TYPES.EDUCATION,
      INDUSTRY_TYPES.RETAIL,
      INDUSTRY_TYPES.MANUFACTURING,
      INDUSTRY_TYPES.SERVICES,
      INDUSTRY_TYPES.CONSULTING,
      INDUSTRY_TYPES.OTHER,
    ],
    {
      errorMap: () => ({ message: 'Veuillez sélectionner un secteur valide' }),
    }
  ),

  size: z.enum(
    [
      ORGANIZATION_SIZE.SMALL,
      ORGANIZATION_SIZE.MEDIUM,
      ORGANIZATION_SIZE.LARGE,
      ORGANIZATION_SIZE.ENTERPRISE,
      ORGANIZATION_SIZE.CORPORATION,
    ],
    {
      errorMap: () => ({ message: 'Veuillez sélectionner une taille valide' }),
    }
  ),

  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .trim()
    .optional()
    .or(z.literal('')),

  website: z
    .string()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .email('Email invalide')
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .regex(
      /^(\+?\d{1,4}[\s-]?)?(\(?\d{1,4}\)?[\s-]?)?[\d\s-]{6,}$/,
      'Numéro de téléphone invalide (format international accepté)'
    )
    .refine(
      (val) => {
        if (!val) return true;
        const cleaned = val.replace(/\D/g, '');
        return cleaned.length >= 8 && cleaned.length <= 15;
      },
      { message: 'Le numéro doit contenir entre 8 et 15 chiffres' }
    )
    .optional()
    .or(z.literal('')),

  siret: z
    .string()
    .refine(
      (val) => !val || isValidSiret(val),
      { message: 'Numéro SIRET invalide' }
    )
    .optional()
    .or(z.literal('')),

  foundedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide')
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime()) && d <= new Date();
      },
      { message: 'La date de création ne peut pas être dans le futur' }
    )
    .optional()
    .or(z.literal('')),
});

/**
 * Organization address schema
 */
export const organizationAddressSchema = z.object({
  street: z
    .string()
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .max(200, "L'adresse ne peut pas dépasser 200 caractères")
    .trim(),

  city: z
    .string()
    .min(2, 'La ville doit contenir au moins 2 caractères')
    .max(100, 'La ville ne peut pas dépasser 100 caractères')
    .trim(),

  postalCode: z
    .string()
    .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)')
    .trim(),

  country: z
    .string()
    .min(2, 'Le pays doit contenir au moins 2 caractères')
    .max(100, 'Le pays ne peut pas dépasser 100 caractères')
    .trim()
    .default('France'),

  region: z
    .string()
    .max(100, 'La région ne peut pas dépasser 100 caractères')
    .trim()
    .optional()
    .or(z.literal('')),
});

/**
 * Organization settings schema
 */
export const organizationSettingsSchema = z.object({
  timezone: z
    .string()
    .min(1, 'Veuillez sélectionner un fuseau horaire'),

  currency: z
    .string()
    .length(3, 'Code devise invalide')
    .toUpperCase(),

  language: z
    .string()
    .min(2, 'Code langue invalide')
    .max(5, 'Code langue invalide')
    .default('fr'),

  dateFormat: z
    .enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])
    .default('DD/MM/YYYY'),

  fiscalYearStart: z
    .string()
    .regex(/^\d{2}-\d{2}$/, 'Format invalide (MM-DD)')
    .default('01-01'),

  workingDays: z
    .array(z.number().min(0).max(6))
    .min(1, 'Au moins un jour de travail requis')
    .default([1, 2, 3, 4, 5]), // Monday to Friday

  workingHoursStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Format invalide (HH:MM)')
    .default('09:00'),

  workingHoursEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Format invalide (HH:MM)')
    .default('18:00'),
});

/**
 * Complete organization schema
 */
export const organizationSchema = z.object({
  profile: organizationProfileSchema,
  address: organizationAddressSchema.optional(),
  settings: organizationSettingsSchema.optional(),
});

/**
 * Type inference
 */
export type OrganizationProfileInput = z.infer<typeof organizationProfileSchema>;
export type OrganizationAddressInput = z.infer<typeof organizationAddressSchema>;
export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;
export type OrganizationInput = z.infer<typeof organizationSchema>;

/**
 * Partial schemas for updates
 */
export const organizationProfileUpdateSchema = organizationProfileSchema.partial();
export const organizationAddressUpdateSchema = organizationAddressSchema.partial();
export const organizationSettingsUpdateSchema = organizationSettingsSchema.partial();
