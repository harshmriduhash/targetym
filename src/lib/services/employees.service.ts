import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database.types'

type TypedSupabaseClient = Awaited<ReturnType<typeof createClient>>
type Employee = Database['public']['Tables']['employees']['Row']
type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

export interface GetEmployeesParams {
  department?: string
  status?: string
  search?: string
  limit?: number
  offset?: number
  orderBy?: 'created_at' | 'first_name' | 'hire_date'
  orderDirection?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  hasMore: boolean
  nextOffset: number | null
}

/**
 * Service layer for employee management with optimized algorithms
 */
export class EmployeesService {
  private async getClient(): Promise<TypedSupabaseClient> {
    return createClient()
  }

  /**
   * Get employees with optimized pagination and filtering
   * Uses PostgreSQL indexes and selective column fetching
   */
  async getEmployees(
    organizationId: string,
    params: GetEmployeesParams = {}
  ): Promise<PaginatedResult<Employee>> {
    const supabase = await this.getClient()

    const {
      department,
      status,
      search,
      limit = 20,
      offset = 0,
      orderBy = 'created_at',
      orderDirection = 'desc'
    } = params

    // Build optimized query with selective columns
    let query = supabase
      .from('employees')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        role,
        department,
        status,
        hire_date,
        location,
        avatar_url,
        created_at
      `, { count: 'exact' })
      .eq('organization_id', organizationId)

    // Apply filters with indexed columns first for performance
    if (status) {
      query = query.eq('status', status)
    }

    if (department) {
      query = query.eq('department', department)
    }

    // Use full-text search for better performance if search is provided
    if (search) {
      // Fallback to ilike for now, will be replaced with ts_vector
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    // Apply ordering
    query = query.order(orderBy, { ascending: orderDirection === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch employees: ${error.message}`)
    }

    const total = count || 0
    const hasMore = offset + limit < total
    const nextOffset = hasMore ? offset + limit : null

    return {
      data: (data || []) as Employee[],
      total,
      hasMore,
      nextOffset
    }
  }

  /**
   * Get single employee by ID with caching consideration
   */
  async getEmployeeById(id: string, organizationId: string): Promise<Employee | null> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch employee: ${error.message}`)
    }

    return data as Employee
  }

  /**
   * Create employee with optimized insert
   */
  async createEmployee(data: EmployeeInsert): Promise<Employee> {
    const supabase = await this.getClient()

    const { data: insertedData, error } = await supabase
      .from('employees')
      .insert([data])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create employee: ${error.message}`)
    }

    return insertedData as Employee
  }

  /**
   * Update employee with partial data
   */
  async updateEmployee(
    id: string,
    organizationId: string,
    data: EmployeeUpdate
  ): Promise<Employee> {
    const supabase = await this.getClient()

    const { data: updatedData, error } = await supabase
      .from('employees')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update employee: ${error.message}`)
    }

    return updatedData as Employee
  }

  /**
   * Delete employee (soft delete by setting status to inactive)
   */
  async deleteEmployee(id: string, organizationId: string): Promise<void> {
    const supabase = await this.getClient()

    // Soft delete: set status to inactive instead of hard delete
    const { error } = await supabase
      .from('employees')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to delete employee: ${error.message}`)
    }
  }

  /**
   * Hard delete employee (only for admins)
   */
  async hardDeleteEmployee(id: string, organizationId: string): Promise<void> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to permanently delete employee: ${error.message}`)
    }
  }

  /**
   * Get employee statistics for dashboard
   * Uses aggregation for performance
   */
  async getEmployeeStats(organizationId: string): Promise<{
    total: number
    active: number
    onLeave: number
    inactive: number
    byDepartment: Record<string, number>
  }> {
    const supabase = await this.getClient()

    // Get all employees with minimal data
    const { data, error } = await supabase
      .from('employees')
      .select('status, department')
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to fetch employee stats: ${error.message}`)
    }

    const employees = data || []

    // Calculate stats using efficient reduce
    const stats = employees.reduce(
      (acc, emp) => {
        acc.total++
        if (emp.status === 'active') acc.active++
        else if (emp.status === 'on-leave') acc.onLeave++
        else acc.inactive++

        acc.byDepartment[emp.department] = (acc.byDepartment[emp.department] || 0) + 1

        return acc
      },
      {
        total: 0,
        active: 0,
        onLeave: 0,
        inactive: 0,
        byDepartment: {} as Record<string, number>
      }
    )

    return stats
  }

  /**
   * Bulk update employee status (optimized for multiple employees)
   */
  async bulkUpdateStatus(
    employeeIds: string[],
    organizationId: string,
    status: 'active' | 'on-leave' | 'inactive'
  ): Promise<void> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from('employees')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .in('id', employeeIds)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`Failed to bulk update employees: ${error.message}`)
    }
  }
}

// Singleton export
export const employeesService = new EmployeesService()
