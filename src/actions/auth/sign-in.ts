'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Validation schema
const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export type SignInInput = z.infer<typeof signInSchema>

export interface SignInResponse {
  success: boolean
  error?: {
    message: string
    code?: string
  }
}

/**
 * Sign In Server Action
 * Uses Supabase Auth with proper error handling and redirection
 */
export async function signIn(input: SignInInput): Promise<SignInResponse> {
  try {
    // Validate input
    const validated = signInSchema.parse(input)

    const supabase = await createClient()

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
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
        message: 'Une erreur est survenue lors de la connexion',
        code: 'UNKNOWN_ERROR',
      },
    }
  }
}
