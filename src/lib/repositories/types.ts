import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/src/types/database.types'

export type TypedSupabaseClient = SupabaseClient<Database>

export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: {
    column: string
    ascending?: boolean
  }
}

export interface FindOptions extends QueryOptions {
  where?: Record<string, unknown>
  include?: string[]
}

export interface Repository<T> {
  findAll(options?: FindOptions): Promise<T[]>
  findById(id: string): Promise<T | null>
  findOne(where: Record<string, unknown>): Promise<T | null>
  create(data: Partial<T>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}
