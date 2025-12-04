/**
 * Supabase Type Helpers
 *
 * Utilities to handle Supabase type issues and provide type-safe database operations
 */

import type { Database } from '@/src/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Type-safe insert helper for Supabase
 * Handles the type mismatch between Insert types and actual data
 */
export type SafeInsert<T> = Omit<T, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

/**
 * Type-safe update helper for Supabase
 * Makes all fields optional except the ones you explicitly want to require
 */
export type SafeUpdate<T> = Partial<Omit<T, 'id' | 'created_at'>> & {
  updated_at?: string
}

/**
 * Helper to insert data with proper typing
 * @param client Supabase client
 * @param table Table name
 * @param data Data to insert
 * @returns Promise with inserted data
 */
export async function safeInsert<
  TableName extends keyof Database['public']['Tables'],
  Row = Database['public']['Tables'][TableName]['Row']
>(
  client: SupabaseClient<Database>,
  table: TableName,
  data: SafeInsert<Database['public']['Tables'][TableName]['Insert']>
) {
  const { data: insertedData, error } = await client
    .from(table)
    .insert(data as any)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to insert into ${String(table)}: ${error.message}`)
  }

  if (!insertedData) {
    throw new Error(`Failed to insert into ${String(table)}: No data returned`)
  }

  return insertedData as Row
}

/**
 * Helper to update data with proper typing
 * @param client Supabase client
 * @param table Table name
 * @param id Record ID
 * @param data Data to update
 * @returns Promise with updated data
 */
export async function safeUpdate<
  TableName extends keyof Database['public']['Tables'],
  Row = Database['public']['Tables'][TableName]['Row']
>(
  client: SupabaseClient<Database>,
  table: TableName,
  id: string,
  data: SafeUpdate<Database['public']['Tables'][TableName]['Update']>
) {
  const { data: updatedData, error } = await client
    .from(table)
    .update(data as any)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update ${String(table)}: ${error.message}`)
  }

  if (!updatedData) {
    throw new Error(`Failed to update ${String(table)}: No data returned`)
  }

  return updatedData as Row
}

/**
 * Helper to soft delete a record (set deleted_at)
 * @param client Supabase client
 * @param table Table name
 * @param id Record ID
 */
export async function safeSoftDelete<
  TableName extends keyof Database['public']['Tables']
>(
  client: SupabaseClient<Database>,
  table: TableName,
  id: string
) {
  const { error } = await client
    .from(table)
    .update({ deleted_at: new Date().toISOString() } as any)
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete ${String(table)}: ${error.message}`)
  }
}

/**
 * Helper to query with relations (prevents N+1)
 * @param client Supabase client
 * @param table Table name
 * @param select Select query string
 * @param filters Optional filters
 */
export async function safeQuery<
  TableName extends keyof Database['public']['Tables'],
  Row = Database['public']['Tables'][TableName]['Row']
>(
  client: SupabaseClient<Database>,
  table: TableName,
  select: string,
  filters?: Record<string, any>
) {
  let query = client.from(table).select(select)

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to query ${String(table)}: ${error.message}`)
  }

  return (data as Row[]) || []
}

/**
 * Helper to get a single record by ID
 * @param client Supabase client
 * @param table Table name
 * @param id Record ID
 * @param select Optional select query (default: '*')
 * @returns Promise with record or null
 */
export async function safeGetById<
  TableName extends keyof Database['public']['Tables'],
  Row = Database['public']['Tables'][TableName]['Row']
>(
  client: SupabaseClient<Database>,
  table: TableName,
  id: string,
  select: string = '*'
) {
  const { data, error } = await client
    .from(table)
    .select(select)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get ${String(table)}: ${error.message}`)
  }

  return data as Row | null
}
