'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Validation schema
const signUpSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export type SignUpInput = z.infer<typeof signUpSchema>

export interface SignUpResponse {
  success: boolean
  error?: {
    message: string
    code?: string
  }
}

/**
 * Sign Up Server Action
 * Creates a new user with Supabase Auth
 * The database trigger will automatically create a profile
 */
export async function signUp(input: SignUpInput): Promise<SignUpResponse> {
  try {
    // Validate input
    const validated = signUpSchema.parse(input)

    const supabase = await createClient()

    // Sign up with email and password
    const { data, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          full_name: validated.name,
          first_name: validated.name.split(' ')[0] || '',
          last_name: validated.name.split(' ').slice(1).join(' ') || '',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      }
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Email confirmation required
      return {
        success: true,
        error: {
          message: 'Un email de confirmation a été envoyé. Veuillez vérifier votre boîte de réception.',
          code: 'EMAIL_CONFIRMATION_REQUIRED',
        },
      }
    }

    // Revalidate the layout to update auth state
    revalidatePath('/', 'layout')

    // Redirect to dashboard
    redirect('/dashboard')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: error.errors[0].message,
          code: 'VALIDATION_ERROR',
        },
      }
    }

    // Re-throw redirect errors (these are Next.js redirects, not actual errors)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return {
      success: false,
      error: {
        message: 'Une erreur est survenue lors de l\'inscription',
        code: 'UNKNOWN_ERROR',
      },
    }
  }
}
