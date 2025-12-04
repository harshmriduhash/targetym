/**
 * Example: Cache Invalidation Strategies
 *
 * Demonstrates various cache invalidation patterns to keep
 * cached data in sync with database changes.
 *
 * @package cache-manager
 */

import { cacheManager } from '@/public/registry/cache-manager/files/lib/cache/cache-manager'

/**
 * Strategy 1: Tag-based Invalidation
 *
 * Invalidate multiple related cache entries using tags.
 */
export class TaggedCacheService {
  // Cache goal with tags
  async cacheGoal(goal: any) {
    const tags = [
      'goals',
      `goal:${goal.id}`,
      `owner:${goal.owner_id}`,
      `organization:${goal.organization_id}`,
    ]

    await cacheManager.setWithTags(
      `goal:${goal.id}`,
      goal,
      tags,
      300
    )
  }

  // Invalidate all goals for a user
  async invalidateUserGoals(userId: string) {
    await cacheManager.invalidateByTags([`owner:${userId}`])
  }

  // Invalidate all goals in organization
  async invalidateOrgGoals(orgId: string) {
    await cacheManager.invalidateByTags([`organization:${orgId}`])
  }

  // Invalidate specific goal and related data
  async invalidateGoal(goalId: string) {
    await cacheManager.invalidateByTags([`goal:${goalId}`])
  }
}

/**
 * Strategy 2: Time-based Invalidation (TTL)
 *
 * Different TTLs for different data types based on change frequency.
 */
export class TTLBasedCacheService {
  // Frequently changing data: Short TTL (1-5 minutes)
  async cacheCandidateStatus(candidateId: string, status: any) {
    await cacheManager.set(
      `candidate:${candidateId}:status`,
      status,
      60 // 1 minute
    )
  }

  // Semi-static data: Medium TTL (5-30 minutes)
  async cacheJobPosting(job: any) {
    await cacheManager.set(
      `job:${job.id}`,
      job,
      900 // 15 minutes
    )
  }

  // Rarely changing data: Long TTL (1+ hours)
  async cacheOrganizationSettings(orgId: string, settings: any) {
    await cacheManager.set(
      `org:${orgId}:settings`,
      settings,
      3600 // 1 hour
    )
  }

  // Static reference data: Very long TTL (24+ hours)
  async cacheCountriesList(countries: any[]) {
    await cacheManager.set(
      'reference:countries',
      countries,
      86400 // 24 hours
    )
  }
}

/**
 * Strategy 3: Event-driven Invalidation
 *
 * Invalidate cache in response to data modification events.
 */
export class EventDrivenCacheService {
  // Hook into Server Actions to invalidate on changes
  async createGoal(data: any) {
    // Create goal in database
    const goal = await saveGoalToDB(data)

    // Invalidate affected caches
    await this.invalidateGoalLists(goal.owner_id, goal.organization_id)

    return goal
  }

  async updateGoal(id: string, data: any) {
    const goal = await updateGoalInDB(id, data)

    // Invalidate specific goal
    await cacheManager.delete(`goal:${id}`)

    // Invalidate lists
    await this.invalidateGoalLists(goal.owner_id, goal.organization_id)

    return goal
  }

  async deleteGoal(id: string) {
    const goal = await deleteGoalFromDB(id)

    // Invalidate everything related to this goal
    await cacheManager.invalidateByTags([`goal:${id}`])
    await this.invalidateGoalLists(goal.owner_id, goal.organization_id)

    return goal
  }

  private async invalidateGoalLists(ownerId: string, orgId: string) {
    await Promise.all([
      cacheManager.delete(`goals:owner:${ownerId}`),
      cacheManager.delete(`goals:org:${orgId}`),
      cacheManager.delete('goals:all'),
    ])
  }
}

/**
 * Strategy 4: Lazy Invalidation
 *
 * Validate cache freshness on read, refresh if stale.
 */
export class LazyInvalidationService {
  async getGoalWithFreshness(goalId: string) {
    const cacheKey = `goal:${goalId}`
    const timestampKey = `goal:${goalId}:timestamp`

    // Get cached data and timestamp
    const [cached, cachedAt] = await Promise.all([
      cacheManager.get(cacheKey),
      cacheManager.get(timestampKey),
    ])

    if (cached && cachedAt) {
      // Check if data is fresh (< 5 minutes old)
      const age = Date.now() - Number(cachedAt)
      if (age < 300000) {
        return cached
      }
    }

    // Fetch fresh data
    const goal = await fetchGoalFromDB(goalId)

    // Cache with timestamp
    await Promise.all([
      cacheManager.set(cacheKey, goal, 600),
      cacheManager.set(timestampKey, Date.now(), 600),
    ])

    return goal
  }
}

/**
 * Strategy 5: Write-through Cache
 *
 * Update cache immediately when writing to database.
 */
export class WriteThroughCacheService {
  async updateCandidate(id: string, data: any) {
    // Update database
    const candidate = await updateCandidateInDB(id, data)

    // Immediately update cache (write-through)
    await cacheManager.set(
      `candidate:${id}`,
      candidate,
      300
    )

    // Also invalidate list caches
    await cacheManager.invalidateByTags([
      'candidates',
      `job:${candidate.job_posting_id}`,
    ])

    return candidate
  }
}

/**
 * Strategy 6: Stale-while-revalidate
 *
 * Serve stale data while refreshing in background.
 */
export class StaleWhileRevalidateService {
  async getGoals(userId: string) {
    const cacheKey = `goals:user:${userId}`
    const staleKey = `${cacheKey}:stale`

    // Try fresh cache first
    let goals = await cacheManager.get(cacheKey)
    if (goals) return goals

    // Check for stale cache
    const stale = await cacheManager.get(staleKey)
    if (stale) {
      // Return stale data immediately
      // Refresh in background (don't await)
      this.refreshGoalsInBackground(userId)
      return stale
    }

    // No cache at all, fetch synchronously
    goals = await fetchGoalsFromDB(userId)
    await this.cacheGoals(userId, goals)
    return goals
  }

  private async refreshGoalsInBackground(userId: string) {
    try {
      const goals = await fetchGoalsFromDB(userId)
      await this.cacheGoals(userId, goals)
    } catch (error) {
      console.error('Background refresh failed:', error)
    }
  }

  private async cacheGoals(userId: string, goals: any[]) {
    const cacheKey = `goals:user:${userId}`
    const staleKey = `${cacheKey}:stale`

    await Promise.all([
      cacheManager.set(cacheKey, goals, 300), // Fresh for 5 min
      cacheManager.set(staleKey, goals, 3600), // Stale for 1 hour
    ])
  }
}

/**
 * Strategy 7: Bulk Invalidation
 *
 * Invalidate all caches for a specific entity type.
 */
export class BulkInvalidationService {
  // Invalidate all candidate-related caches
  async invalidateAllCandidates() {
    await cacheManager.invalidateByTags(['candidates'])
  }

  // Invalidate all caches for a job posting
  async invalidateJobPosting(jobId: string) {
    await cacheManager.invalidateByTags([
      `job:${jobId}`,
      'job_postings',
    ])
  }

  // Clear all caches (nuclear option)
  async clearAllCaches() {
    await cacheManager.clear()
    console.log('All caches cleared')
  }
}

// Mock database functions
async function saveGoalToDB(data: any) {
  return { id: 'new-id', ...data, owner_id: 'user-1', organization_id: 'org-1' }
}

async function updateGoalInDB(id: string, data: any) {
  return { id, ...data, owner_id: 'user-1', organization_id: 'org-1' }
}

async function deleteGoalFromDB(id: string) {
  return { id, owner_id: 'user-1', organization_id: 'org-1' }
}

async function fetchGoalFromDB(id: string) {
  return { id, title: 'Sample Goal' }
}

async function fetchGoalsFromDB(userId: string) {
  return [{ id: '1', owner_id: userId }]
}

async function updateCandidateInDB(id: string, data: any) {
  return { id, ...data, job_posting_id: 'job-1' }
}

/**
 * Invalidation Strategy Selection Guide:
 *
 * 1. Tag-based: Best for related data (e.g., all goals for a user)
 * 2. TTL-based: Simple, works well for predictable change patterns
 * 3. Event-driven: Immediate consistency, use for critical data
 * 4. Lazy: Good for read-heavy workloads with infrequent changes
 * 5. Write-through: Ensures cache is always up-to-date
 * 6. Stale-while-revalidate: Best UX, serves stale data while refreshing
 * 7. Bulk: Use sparingly, mainly for admin operations
 *
 * Combine strategies for optimal results:
 * - Use TTL as baseline
 * - Add tags for complex relationships
 * - Event-driven for write operations
 * - Stale-while-revalidate for high-traffic endpoints
 */
