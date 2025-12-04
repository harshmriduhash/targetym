import type { Database } from '@/src/types/database.types'
import { BaseRepository } from './base.repository'
import type { TypedSupabaseClient, FindOptions } from './types'

type Goal = Database['public']['Tables']['goals']['Row']
type GoalInsert = Database['public']['Tables']['goals']['Insert']

/**
 * Goals Repository
 * 
 * Handles all database operations for goals.
 * Provides specialized methods beyond basic CRUD.
 */
export class GoalsRepository extends BaseRepository<Goal> {
  protected tableName = 'goals'

  constructor(client: TypedSupabaseClient) {
    super(client)
  }

  /**
   * Find goals by organization with optional filters
   */
  async findByOrganization(
    organizationId: string,
    filters?: {
      owner_id?: string
      status?: string
      period?: string
    }
  ): Promise<Goal[]> {
    const where: Record<string, unknown> = {
      organization_id: organizationId,
      ...filters,
    }

    return this.findAll({
      where,
      orderBy: { column: 'created_at', ascending: false },
    })
  }

  /**
   * Find goals with progress calculation
   */
  async findWithProgress(organizationId: string): Promise<Goal[]> {
    const { data, error } = await this.client
      .from('goals_with_progress')
      .select()
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch goals with progress: ${error.message}`)
    }

    return (data as Goal[]) || []
  }

  /**
   * Find goals by owner (user)
   */
  async findByOwner(ownerId: string, options?: FindOptions): Promise<Goal[]> {
    return this.findAll({
      ...options,
      where: {
        ...options?.where,
        owner_id: ownerId,
      },
    })
  }

  /**
   * Find child goals (sub-goals)
   */
  async findChildren(parentGoalId: string): Promise<Goal[]> {
    return this.findAll({
      where: { parent_goal_id: parentGoalId },
      orderBy: { column: 'created_at', ascending: true },
    })
  }

  /**
   * Count goals by status for an organization
   */
  async countByStatus(organizationId: string): Promise<Record<string, number>> {
    const { data, error } = await this.client
      .from('goals')
      .select('status')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)

    if (error) {
      throw new Error(`Failed to count goals by status: ${error.message}`)
    }

    const counts: Record<string, number> = {}
    data?.forEach((row: any) => {
      const status = row.status || 'unknown'
      counts[status] = (counts[status] || 0) + 1
    })

    return counts
  }

  /**
   * Find goals ending soon (within days)
   */
  async findEndingSoon(organizationId: string, days: number = 7): Promise<Goal[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    const { data, error } = await this.client
      .from('goals')
      .select()
      .eq('organization_id', organizationId)
      .lte('end_date', futureDate.toISOString())
      .gte('end_date', new Date().toISOString())
      .is('deleted_at', null)
      .order('end_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch ending goals: ${error.message}`)
    }

    return (data as Goal[]) || []
  }

  /**
   * Search goals by title or description
   */
  async search(organizationId: string, query: string): Promise<Goal[]> {
    const { data, error } = await this.client
      .from('goals')
      .select()
      .eq('organization_id', organizationId)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      throw new Error(`Failed to search goals: ${error.message}`)
    }

    return (data as Goal[]) || []
  }
}

/**
 * Factory function to create GoalsRepository
 */
export function createGoalsRepository(client: TypedSupabaseClient): GoalsRepository {
  return new GoalsRepository(client)
}
