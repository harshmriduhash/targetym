import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/src/types/database.types'
import { createClient } from '@/src/lib/supabase/server'

export type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Base Repository Pattern
 * Abstraction layer pour l'accès aux données Supabase
 */
export abstract class BaseRepository<T = unknown> {
  protected supabase: TypedSupabaseClient | null = null
  protected abstract tableName: string

  /**
   * Obtenir le client Supabase (lazy loading)
   */
  protected async getClient(): Promise<TypedSupabaseClient> {
    if (!this.supabase) {
      this.supabase = await createClient()
    }
    return this.supabase
  }

  /**
   * Trouver par ID
   */
  async findById(id: string): Promise<T | null> {
    const client = await this.getClient()
    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data as T
  }

  /**
   * Trouver tous
   */
  async findAll(filters?: Record<string, unknown>): Promise<T[]> {
    const client = await this.getClient()
    let query = client.from(this.tableName).select('*')

    // Appliquer les filtres
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query

    if (error) throw error

    return (data as T[]) || []
  }

  /**
   * Créer un nouvel enregistrement
   */
  async create(data: Partial<T>): Promise<T> {
    const client = await this.getClient()
    const { data: created, error } = await client
      .from(this.tableName)
      .insert(data as never)
      .select()
      .single()

    if (error) throw error

    return created as T
  }

  /**
   * Mettre à jour un enregistrement
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const client = await this.getClient()
    const { data: updated, error } = await client
      .from(this.tableName)
      .update(data as never)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return updated as T
  }

  /**
   * Supprimer un enregistrement
   */
  async delete(id: string): Promise<boolean> {
    const client = await this.getClient()
    const { error } = await client
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw error

    return true
  }

  /**
   * Compter les enregistrements
   */
  async count(filters?: Record<string, unknown>): Promise<number> {
    const client = await this.getClient()
    let query = client.from(this.tableName).select('*', { count: 'exact', head: true })

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { count, error } = await query

    if (error) throw error

    return count || 0
  }

  /**
   * Vérifier l'existence
   */
  async exists(id: string): Promise<boolean> {
    const client = await this.getClient()
    const { count, error } = await client
      .from(this.tableName)
      .select('id', { count: 'exact', head: true })
      .eq('id', id)

    if (error) throw error

    return (count || 0) > 0
  }

  /**
   * Pagination
   */
  async paginate(
    page: number = 1,
    pageSize: number = 10,
    filters?: Record<string, unknown>
  ): Promise<{ data: T[]; total: number; page: number; pageSize: number }> {
    const client = await this.getClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = client.from(this.tableName).select('*', { count: 'exact' })

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, count, error } = await query.range(from, to)

    if (error) throw error

    return {
      data: (data as T[]) || [],
      total: count || 0,
      page,
      pageSize,
    }
  }
}
