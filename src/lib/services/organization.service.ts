
import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database.types'

type Organization = Database['public']['Tables']['organizations']['Row']
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']
type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface CreateOrganizationData {
  name: string
  slug: string
  logo_url?: string
  settings?: any
}

export interface UpdateProfileData {
  full_name?: string
  avatar_url?: string
  role?: string
  department?: string
  position?: string
  manager_id?: string
}

export class OrganizationService {
  private async getClient() {
    return await createClient()
  }

  async createOrganization(data: CreateOrganizationData): Promise<Organization> {
    const supabase = await this.getClient()
    
    const orgData: OrganizationInsert = {
      name: data.name,
      slug: data.slug,
      logo_url: data.logo_url,
      settings: data.settings || {},
    }

    const { data: organization, error } = await supabase
      .from('organizations')
      .insert(orgData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create organization: ${error.message}`)
    }

    return organization
  }

  async getOrganization(organizationId: string): Promise<Organization | null> {
    const supabase = await this.getClient()
    
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch organization: ${error.message}`)
    }

    return organization
  }

  async updateOrganization(organizationId: string, data: {
    name?: string
    logo_url?: string
    settings?: any
  }): Promise<Organization> {
    const supabase = await this.getClient()
    
    const updateData: OrganizationUpdate = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    const { data: organization, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', organizationId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update organization: ${error.message}`)
    }

    return organization
  }

  async getTeamMembers(organizationId: string, managerId?: string): Promise<Profile[]> {
    const supabase = await this.getClient()
    
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (managerId) {
      query = query.eq('manager_id', managerId)
    }

    const { data: members, error } = await query

    if (error) {
      throw new Error(`Failed to fetch team members: ${error.message}`)
    }

    return members || []
  }

  async getOrganizationHierarchy(organizationId: string): Promise<any[]> {
    const supabase = await this.getClient()
    
    const { data: hierarchy, error } = await supabase.rpc('get_organization_hierarchy', {
      org_id_param: organizationId,
    })

    if (error) {
      throw new Error(`Failed to fetch organization hierarchy: ${error.message}`)
    }

    return hierarchy || []
  }

  async updateProfile(profileId: string, data: UpdateProfileData): Promise<Profile> {
    const supabase = await this.getClient()
    
    const updateData: ProfileUpdate = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profileId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`)
    }

    return profile
  }

  async getProfile(profileId: string): Promise<Profile | null> {
    const supabase = await this.getClient()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    return profile
  }

  async isManagerOf(managerId: string, employeeId: string): Promise<boolean> {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase.rpc('is_manager_of', {
      manager_id_param: managerId,
      employee_id_param: employeeId,
    })

    if (error) {
      throw new Error(`Failed to check manager relationship: ${error.message}`)
    }

    return data || false
  }
}

export const organizationService = new OrganizationService()

