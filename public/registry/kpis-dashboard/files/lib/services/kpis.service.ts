
import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database.types'
import { NotFoundError, ForbiddenError } from '@/src/lib/utils/errors'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  type PaginationParams,
  type PaginatedResponse,
  normalizePagination,
  getPaginationOffset,
  createPaginatedResponse,
} from '@/src/lib/utils/pagination'
import { safeInsert, safeUpdate, safeSoftDelete } from '@/src/lib/utils/supabase-helpers'

type Tables = Database['public']['Tables']
type Kpi = Tables['kpis']['Row']
type KpiInsert = Tables['kpis']['Insert']
type KpiUpdate = Tables['kpis']['Update']
type KpiMeasurement = Tables['kpi_measurements']['Row']
type KpiMeasurementInsert = Tables['kpi_measurements']['Insert']
type KpiAlert = Tables['kpi_alerts']['Row']
type KpiAlertInsert = Tables['kpi_alerts']['Insert']
type KpiAlertUpdate = Tables['kpi_alerts']['Update']
type TypedSupabaseClient = SupabaseClient<Database>

// ============================================================================
// Data Interfaces
// ============================================================================

export interface CreateKpiData {
  name: string
  description?: string | null
  category: string
  metric_type?: string
  unit?: string | null
  target_value?: number | null
  current_value?: number
  baseline_value?: number | null
  target_min?: number | null
  target_max?: number | null
  measurement_frequency?: string
  department?: string | null
  aligned_goal_id?: string | null
  priority?: string
  visibility?: string
  data_source?: string | null
  auto_update_enabled?: boolean
  tags?: string[] | null
  metadata?: Record<string, any> | null
  owner_id: string
  organization_id: string
}

export interface UpdateKpiData {
  name?: string
  description?: string | null
  category?: string
  metric_type?: string
  unit?: string | null
  target_value?: number | null
  current_value?: number
  baseline_value?: number | null
  target_min?: number | null
  target_max?: number | null
  status?: string
  measurement_frequency?: string
  department?: string | null
  aligned_goal_id?: string | null
  priority?: string
  visibility?: string
  data_source?: string | null
  auto_update_enabled?: boolean
  tags?: string[] | null
  metadata?: Record<string, any> | null
  is_active?: boolean
}

export interface CreateKpiMeasurementData {
  kpi_id: string
  measured_value: number
  measured_at?: string | null
  measurement_period_start?: string | null
  measurement_period_end?: string | null
  notes?: string | null
  measured_by?: string | null
  measurement_source?: string
  metadata?: Record<string, any> | null
  organization_id: string
}

export interface CreateKpiAlertData {
  kpi_id: string
  alert_type: string
  condition: string
  threshold_value?: number | null
  notify_users: string[]
  notification_channels?: string[]
  is_active?: boolean
  created_by?: string | null
  organization_id: string
}

export interface KpiFilters {
  category?: string
  status?: string
  owner_id?: string
  department?: string
  is_active?: boolean
  aligned_goal_id?: string
  visibility?: string
  priority?: string
  search?: string
}

// ============================================================================
// KPIs Service
// ============================================================================

export class KpisService {
  private async getClient(): Promise<TypedSupabaseClient> {
    return createClient()
  }

  // --------------------------------------------------------------------------
  // KPI CRUD Operations
  // --------------------------------------------------------------------------

  async createKpi(data: CreateKpiData): Promise<Kpi> {
    const supabase = await this.getClient()

    const kpiData: KpiInsert = {
      name: data.name,
      description: data.description ?? null,
      category: data.category,
      metric_type: data.metric_type || 'number',
      unit: data.unit ?? null,
      target_value: data.target_value ?? null,
      current_value: data.current_value ?? 0,
      baseline_value: data.baseline_value ?? null,
      target_min: data.target_min ?? null,
      target_max: data.target_max ?? null,
      measurement_frequency: data.measurement_frequency || 'monthly',
      department: data.department ?? null,
      aligned_goal_id: data.aligned_goal_id ?? null,
      priority: data.priority || 'medium',
      visibility: data.visibility || 'team',
      data_source: data.data_source ?? null,
      auto_update_enabled: data.auto_update_enabled ?? false,
      tags: data.tags ?? null,
      metadata: data.metadata ?? {},
      owner_id: data.owner_id,
      organization_id: data.organization_id,
    }

    return await safeInsert(supabase, 'kpis', kpiData)
  }

  async getKpis(
    organizationId: string,
    filters?: KpiFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Kpi>> {
    const supabase = await this.getClient()

    // Normalize pagination
    const { page, pageSize } = normalizePagination(pagination)
    const offset = getPaginationOffset(page, pageSize)

    // Build base query with filters
    let baseQuery = supabase
      .from('kpis')
      .select('*', { count: 'exact', head: false })
      .eq('organization_id', organizationId)
      .is('deleted_at', null)

    // Apply filters
    if (filters?.category) {
      baseQuery = baseQuery.eq('category', filters.category)
    }
    if (filters?.status) {
      baseQuery = baseQuery.eq('status', filters.status)
    }
    if (filters?.owner_id) {
      baseQuery = baseQuery.eq('owner_id', filters.owner_id)
    }
    if (filters?.department) {
      baseQuery = baseQuery.eq('department', filters.department)
    }
    if (filters?.is_active !== undefined) {
      baseQuery = baseQuery.eq('is_active', filters.is_active)
    }
    if (filters?.aligned_goal_id) {
      baseQuery = baseQuery.eq('aligned_goal_id', filters.aligned_goal_id)
    }
    if (filters?.visibility) {
      baseQuery = baseQuery.eq('visibility', filters.visibility)
    }
    if (filters?.priority) {
      baseQuery = baseQuery.eq('priority', filters.priority)
    }
    if (filters?.search) {
      baseQuery = baseQuery.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Get total count
    const { count, error: countError } = await baseQuery

    if (countError) {
      throw new Error(`Failed to count KPIs: ${countError.message}`)
    }

    // Fetch with relations and pagination
    let dataQuery = supabase
      .from('kpis')
      .select(`
        *,
        owner:profiles!owner_id(id, email, full_name, avatar_url),
        aligned_goal:goals!aligned_goal_id(id, title)
      `)
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    // Apply same filters to data query
    if (filters?.category) {
      dataQuery = dataQuery.eq('category', filters.category)
    }
    if (filters?.status) {
      dataQuery = dataQuery.eq('status', filters.status)
    }
    if (filters?.owner_id) {
      dataQuery = dataQuery.eq('owner_id', filters.owner_id)
    }
    if (filters?.department) {
      dataQuery = dataQuery.eq('department', filters.department)
    }
    if (filters?.is_active !== undefined) {
      dataQuery = dataQuery.eq('is_active', filters.is_active)
    }
    if (filters?.aligned_goal_id) {
      dataQuery = dataQuery.eq('aligned_goal_id', filters.aligned_goal_id)
    }
    if (filters?.visibility) {
      dataQuery = dataQuery.eq('visibility', filters.visibility)
    }
    if (filters?.priority) {
      dataQuery = dataQuery.eq('priority', filters.priority)
    }
    if (filters?.search) {
      dataQuery = dataQuery.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await dataQuery

    if (error) {
      throw new Error(`Failed to fetch KPIs: ${error.message}`)
    }

    return createPaginatedResponse(
      (data as Kpi[]) || [],
      page,
      pageSize,
      count || 0
    )
  }

  async getKpiById(kpiId: string): Promise<Kpi | null> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from('kpis')
      .select(`
        *,
        owner:profiles!owner_id(id, email, full_name, avatar_url),
        aligned_goal:goals!aligned_goal_id(id, title),
        measurements:kpi_measurements(
          id,
          measured_value,
          measured_at,
          measurement_period_start,
          measurement_period_end,
          notes,
          measured_by:profiles!measured_by(id, email, full_name)
        )
      `)
      .eq('id', kpiId)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch KPI: ${error.message}`)
    }

    return data as Kpi | null
  }

  async updateKpi(kpiId: string, userId: string, data: UpdateKpiData): Promise<Kpi> {
    const supabase = await this.getClient()

    // Check if user is owner
    const { data: existingKpi, error: fetchError } = await supabase
      .from('kpis')
      .select()
      .eq('id', kpiId)
      .maybeSingle()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError('KPI not found')
      }
      throw new Error(`Failed to fetch KPI: ${fetchError.message}`)
    }

    if (!existingKpi) {
      throw new NotFoundError('KPI not found')
    }

    const kpi = existingKpi as Kpi
    if (kpi.owner_id !== userId) {
      throw new ForbiddenError('Only KPI owner can update KPI')
    }

    const updateData: KpiUpdate = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    return await safeUpdate(supabase, 'kpis', kpiId, updateData)
  }

  async deleteKpi(kpiId: string, userId: string): Promise<void> {
    const supabase = await this.getClient()

    // Check if user is owner
    const { data: existingKpi, error: fetchError } = await supabase
      .from('kpis')
      .select()
      .eq('id', kpiId)
      .maybeSingle()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError('KPI not found')
      }
      throw new Error(`Failed to fetch KPI: ${fetchError.message}`)
    }

    if (!existingKpi) {
      throw new NotFoundError('KPI not found')
    }

    const kpi = existingKpi as Kpi
    if (kpi.owner_id !== userId) {
      throw new ForbiddenError('Only KPI owner can delete KPI')
    }

    await safeSoftDelete(supabase, 'kpis', kpiId)
  }

  // --------------------------------------------------------------------------
  // KPI Measurements Operations
  // --------------------------------------------------------------------------

  async addKpiMeasurement(data: CreateKpiMeasurementData): Promise<KpiMeasurement> {
    const supabase = await this.getClient()

    const measurementData: KpiMeasurementInsert = {
      kpi_id: data.kpi_id,
      measured_value: data.measured_value,
      measured_at: data.measured_at ?? new Date().toISOString(),
      measurement_period_start: data.measurement_period_start ?? null,
      measurement_period_end: data.measurement_period_end ?? null,
      notes: data.notes ?? null,
      measured_by: data.measured_by ?? null,
      measurement_source: data.measurement_source || 'manual',
      metadata: data.metadata ?? {},
      organization_id: data.organization_id,
    }

    return await safeInsert(supabase, 'kpi_measurements', measurementData)
  }

  async getKpiMeasurements(
    kpiId: string,
    startDate?: string,
    endDate?: string
  ): Promise<KpiMeasurement[]> {
    const supabase = await this.getClient()

    let query = supabase
      .from('kpi_measurements')
      .select(`
        *,
        measured_by:profiles!measured_by(id, email, full_name)
      `)
      .eq('kpi_id', kpiId)
      .order('measured_at', { ascending: false })

    if (startDate) {
      query = query.gte('measured_at', startDate)
    }
    if (endDate) {
      query = query.lte('measured_at', endDate)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch KPI measurements: ${error.message}`)
    }

    return (data as KpiMeasurement[]) || []
  }

  // --------------------------------------------------------------------------
  // KPI Alerts Operations
  // --------------------------------------------------------------------------

  async createKpiAlert(data: CreateKpiAlertData): Promise<KpiAlert> {
    const supabase = await this.getClient()

    const alertData: KpiAlertInsert = {
      kpi_id: data.kpi_id,
      alert_type: data.alert_type,
      condition: data.condition,
      threshold_value: data.threshold_value ?? null,
      notify_users: data.notify_users,
      notification_channels: data.notification_channels || ['in_app'],
      is_active: data.is_active ?? true,
      created_by: data.created_by ?? null,
      organization_id: data.organization_id,
    }

    return await safeInsert(supabase, 'kpi_alerts', alertData)
  }

  async getKpiAlerts(kpiId: string): Promise<KpiAlert[]> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from('kpi_alerts')
      .select(`
        *,
        kpi:kpis!kpi_id(id, name),
        created_by:profiles!created_by(id, email, full_name)
      `)
      .eq('kpi_id', kpiId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch KPI alerts: ${error.message}`)
    }

    return (data as KpiAlert[]) || []
  }

  async updateKpiAlert(alertId: string, data: Partial<KpiAlert>): Promise<KpiAlert> {
    const supabase = await this.getClient()

    const updateData: KpiAlertUpdate = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    return await safeUpdate(supabase, 'kpi_alerts', alertId, updateData)
  }

  // --------------------------------------------------------------------------
  // Analytics & Views
  // --------------------------------------------------------------------------

  async getKpisWithLatestMeasurement(organizationId: string): Promise<Kpi[]> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from('kpis_with_latest_measurement')
      .select()
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch KPIs with latest measurement: ${error.message}`)
    }

    return (data as Kpi[]) || []
  }

  async getKpiPerformanceTrends(organizationId: string): Promise<any[]> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from('kpi_performance_trends')
      .select()
      .eq('organization_id', organizationId)
      .order('last_measurement_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch KPI performance trends: ${error.message}`)
    }

    return data || []
  }
}

export const kpisService = new KpisService()
