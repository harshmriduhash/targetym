import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database.types'

type TypedSupabaseClient = Awaited<ReturnType<typeof createClient>>
type PortalResource = Database['public']['Tables']['portal_resources']['Row']
type PortalResourceInsert = Database['public']['Tables']['portal_resources']['Insert']
type PortalResourceUpdate = Database['public']['Tables']['portal_resources']['Update']

export interface GetPortalResourcesParams {
  type?: string
  category?: string
  featured?: boolean
  search?: string
  limit?: number
  offset?: number
  orderBy?: 'published_at' | 'views' | 'title'
  orderDirection?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  hasMore: boolean
  nextOffset: number | null
}

/**
 * Service layer for portal resource management with optimized algorithms
 */
export class PortalService {
  private async getClient(): Promise<TypedSupabaseClient> {
    return createClient()
  }

  /**
   * Get portal resources with optimized filtering and sorting
   */
  async getResources(
    organizationId: string,
    params: GetPortalResourcesParams = {}
  ): Promise<PaginatedResult<PortalResource>> {
    const supabase = await this.getClient()

    const {
      type,
      category,
      featured,
      search,
      limit = 20,
      offset = 0,
      orderBy = 'published_at',
      orderDirection = 'desc'
    } = params

    let query = supabase
      .from('portal_resources')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)

    // Apply indexed filters
    if (type) {
      query = query.eq('type', type)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (featured !== undefined) {
      query = query.eq('featured', featured)
    }

    // Apply search
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    // Apply ordering with featured resources first if not filtering by featured
    if (featured === undefined && orderBy === 'published_at') {
      query = query
        .order('featured', { ascending: false })
        .order(orderBy, { ascending: orderDirection === 'asc' })
    } else {
      query = query.order(orderBy, { ascending: orderDirection === 'asc' })
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch resources: ${error.message}`)
    }

    const total = count || 0
    const hasMore = offset + limit < total

    return {
      data: (data || []) as PortalResource[],
      total,
      hasMore,
      nextOffset: hasMore ? offset + limit : null
    }
  }

  /**
   * Get single resource and increment views atomically
   */
  async getResourceById(
    id: string,
    organizationId: string,
    incrementView = true
  ): Promise<PortalResource | null> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from('portal_resources')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch resource: ${error.message}`)
    }

    // Increment views using optimized database function
    if (incrementView && data) {
      await supabase.rpc('increment_resource_views', { resource_id: id }).catch(() => {
        // Fallback: manual increment
        supabase
          .from('portal_resources')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', id)
          .then()
      })
    }

    return data as PortalResource
  }

  /**
   * Create portal resource
   */
  async createResource(data: PortalResourceInsert): Promise<PortalResource> {
    const supabase = await this.getClient()

    const { data: insertedData, error } = await supabase
      .from('portal_resources')
      .insert([data])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create resource: ${error.message}`)
    }

    return insertedData as PortalResource
  }

  /**
   * Update portal resource
   */
  async updateResource(
    id: string,
    organizationId: string,
    data: PortalResourceUpdate
  ): Promise<PortalResource> {
    const supabase = await this.getClient()

    const { data: updatedData, error } = await supabase
      .from('portal_resources')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update resource: ${error.message}`)
    }

    return updatedData as PortalResource
  }

  /**
   * Delete portal resource
   */
  async deleteResource(id: string, organizationId: string): Promise<void> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from('portal_resources')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to delete resource: ${error.message}`)
    }
  }

  /**
   * Get featured resources for homepage
   */
  async getFeaturedResources(organizationId: string, limit = 6): Promise<PortalResource[]> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from('portal_resources')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch featured resources: ${error.message}`)
    }

    return (data || []) as PortalResource[]
  }

  /**
   * Get popular resources (most viewed)
   */
  async getPopularResources(organizationId: string, limit = 10): Promise<PortalResource[]> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from('portal_resources')
      .select('*')
      .eq('organization_id', organizationId)
      .order('views', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch popular resources: ${error.message}`)
    }

    return (data || []) as PortalResource[]
  }

  /**
   * Get resource statistics
   */
  async getResourceStats(organizationId: string): Promise<{
    total: number
    byType: Record<string, number>
    byCategory: Record<string, number>
    featured: number
    totalViews: number
  }> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from('portal_resources')
      .select('type, category, featured, views')
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to fetch resource stats: ${error.message}`)
    }

    const resources = data || []

    const stats = resources.reduce(
      (acc, resource) => {
        acc.total++
        acc.byType[resource.type] = (acc.byType[resource.type] || 0) + 1
        acc.byCategory[resource.category] = (acc.byCategory[resource.category] || 0) + 1
        if (resource.featured) acc.featured++
        acc.totalViews += resource.views || 0

        return acc
      },
      {
        total: 0,
        byType: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        featured: 0,
        totalViews: 0
      }
    )

    return stats
  }

  /**
   * Bulk update featured status
   */
  async bulkUpdateFeatured(
    resourceIds: string[],
    organizationId: string,
    featured: boolean
  ): Promise<void> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from('portal_resources')
      .update({
        featured,
        updated_at: new Date().toISOString()
      })
      .in('id', resourceIds)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to bulk update resources: ${error.message}`)
    }
  }
}

// Singleton export
export const portalService = new PortalService()
