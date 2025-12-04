import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database.types'

type TypedSupabaseClient = Awaited<ReturnType<typeof createClient>>
type Notice = Database['public']['Tables']['notices']['Row']
type NoticeInsert = Database['public']['Tables']['notices']['Insert']
type NoticeUpdate = Database['public']['Tables']['notices']['Update']

export interface GetNoticesParams {
  type?: string
  priority?: string
  department?: string
  search?: string
  limit?: number
  offset?: number
  includeExpired?: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  hasMore: boolean
  nextOffset: number | null
}

/**
 * Service layer for notice management with optimized algorithms
 */
export class NoticesService {
  private async getClient(): Promise<TypedSupabaseClient> {
    return createClient()
  }

  /**
   * Get notices with optimized filtering and automatic expiry handling
   */
  async getNotices(
    organizationId: string,
    params: GetNoticesParams = {}
  ): Promise<PaginatedResult<Notice>> {
    const supabase = await this.getClient()

    const {
      type,
      priority,
      department,
      search,
      limit = 20,
      offset = 0,
      includeExpired = false
    } = params

    let query = supabase
      .from('notices')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)

    // Filter out expired notices by default
    if (!includeExpired) {
      query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    }

    // Apply indexed filters first
    if (priority) {
      query = query.eq('priority', priority)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (department) {
      query = query.eq('department', department)
    }

    // Apply search with full-text search capability
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // Order by priority first, then created_at
    query = query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch notices: ${error.message}`)
    }

    const total = count || 0
    const hasMore = offset + limit < total

    return {
      data: (data || []) as Notice[],
      total,
      hasMore,
      nextOffset: hasMore ? offset + limit : null
    }
  }

  /**
   * Get single notice and increment views atomically
   */
  async getNoticeById(id: string, organizationId: string, incrementView = true): Promise<Notice | null> {
    const supabase = await this.getClient()

    // Get notice
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch notice: ${error.message}`)
    }

    // Increment views using database function for atomicity
    if (incrementView && data) {
      await supabase.rpc('increment_notice_views', { notice_id: id }).catch(() => {
        // Fallback: manual increment
        supabase
          .from('notices')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', id)
          .then()
      })
    }

    return data as Notice
  }

  /**
   * Create notice with validation
   */
  async createNotice(data: NoticeInsert): Promise<Notice> {
    const supabase = await this.getClient()

    const { data: insertedData, error } = await supabase
      .from('notices')
      .insert([data])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create notice: ${error.message}`)
    }

    return insertedData as Notice
  }

  /**
   * Update notice
   */
  async updateNotice(
    id: string,
    organizationId: string,
    data: NoticeUpdate
  ): Promise<Notice> {
    const supabase = await this.getClient()

    const { data: updatedData, error } = await supabase
      .from('notices')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update notice: ${error.message}`)
    }

    return updatedData as Notice
  }

  /**
   * Delete notice
   */
  async deleteNotice(id: string, organizationId: string): Promise<void> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to delete notice: ${error.message}`)
    }
  }

  /**
   * Get urgent notices for dashboard
   */
  async getUrgentNotices(organizationId: string, limit = 5): Promise<Notice[]> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('type', 'urgent')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch urgent notices: ${error.message}`)
    }

    return (data || []) as Notice[]
  }

  /**
   * Archive expired notices (cleanup job)
   */
  async archiveExpiredNotices(organizationId: string): Promise<number> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from('notices')
      .delete()
      .eq('organization_id', organizationId)
      .lt('expires_at', new Date().toISOString())

    if (error) {
      throw new Error(`Failed to archive notices: ${error.message}`)
    }

    return data?.length || 0
  }

  /**
   * Get notice statistics
   */
  async getNoticeStats(organizationId: string): Promise<{
    total: number
    byType: Record<string, number>
    byPriority: Record<string, number>
    active: number
    expired: number
  }> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from('notices')
      .select('type, priority, expires_at')
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to fetch notice stats: ${error.message}`)
    }

    const notices = data || []
    const now = new Date()

    const stats = notices.reduce(
      (acc, notice) => {
        acc.total++
        acc.byType[notice.type] = (acc.byType[notice.type] || 0) + 1
        acc.byPriority[notice.priority] = (acc.byPriority[notice.priority] || 0) + 1

        if (!notice.expires_at || new Date(notice.expires_at) > now) {
          acc.active++
        } else {
          acc.expired++
        }

        return acc
      },
      {
        total: 0,
        byType: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        active: 0,
        expired: 0
      }
    )

    return stats
  }
}

// Singleton export
export const noticesService = new NoticesService()
