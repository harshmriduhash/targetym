/**
 * Example: Basic Cache Manager Usage
 *
 * Demonstrates simple caching patterns for API responses
 * and database queries using the cache manager utility.
 *
 * @package cache-manager
 */

import { cacheManager } from '@/public/registry/cache-manager/files/lib/cache/cache-manager'

/**
 * Example 1: Cache API Response
 *
 * Cache expensive API calls to reduce latency and API costs.
 */
export async function getCachedUserProfile(userId: string) {
  const cacheKey = `user:profile:${userId}`

  // Try to get from cache first
  const cached = await cacheManager.get(cacheKey)
  if (cached) {
    console.log('Cache hit:', cacheKey)
    return cached
  }

  console.log('Cache miss:', cacheKey)

  // Fetch from database/API
  const profile = await fetchUserProfileFromDB(userId)

  // Store in cache for 5 minutes
  await cacheManager.set(cacheKey, profile, 300)

  return profile
}

/**
 * Example 2: Cache Database Query
 *
 * Cache frequently accessed database queries.
 */
export async function getCachedJobPostings() {
  const cacheKey = 'job:postings:active'

  return cacheManager.get(cacheKey) || await cacheManager.set(
    cacheKey,
    await fetchActiveJobPostingsFromDB(),
    600 // Cache for 10 minutes
  )
}

/**
 * Example 3: Cache with Tags for Invalidation
 *
 * Use tags to invalidate related cache entries together.
 */
export async function getCachedCandidates(jobId: string) {
  const cacheKey = `candidates:job:${jobId}`
  const tags = ['candidates', `job:${jobId}`]

  const cached = await cacheManager.getWithTags(cacheKey, tags)
  if (cached) return cached

  const candidates = await fetchCandidatesFromDB(jobId)
  await cacheManager.setWithTags(cacheKey, candidates, tags, 300)

  return candidates
}

/**
 * Example 4: Invalidate Cache on Update
 *
 * Clear cache when data changes.
 */
export async function updateCandidate(candidateId: string, data: any) {
  // Update in database
  const updated = await updateCandidateInDB(candidateId, data)

  // Invalidate related caches
  await cacheManager.delete(`candidate:${candidateId}`)
  await cacheManager.invalidateByTags(['candidates', `job:${updated.job_posting_id}`])

  return updated
}

/**
 * Example 5: Cache with Fallback
 *
 * Automatically fetch and cache if not found.
 */
export async function getOrFetchGoal(goalId: string) {
  return cacheManager.getOrSet(
    `goal:${goalId}`,
    async () => {
      // This function only runs on cache miss
      return fetchGoalFromDB(goalId)
    },
    300 // TTL in seconds
  )
}

/**
 * Example 6: Batch Cache Operations
 *
 * Get multiple cache entries at once.
 */
export async function getCachedGoalsBatch(goalIds: string[]) {
  const cacheKeys = goalIds.map(id => `goal:${id}`)
  const cached = await cacheManager.getBatch(cacheKeys)

  // Find missing entries
  const missing = goalIds.filter((id, idx) => !cached[idx])

  if (missing.length > 0) {
    // Fetch missing goals
    const goals = await fetchGoalsFromDB(missing)

    // Cache them
    await Promise.all(
      goals.map(goal =>
        cacheManager.set(`goal:${goal.id}`, goal, 300)
      )
    )
  }

  return cached
}

// Mock database functions (replace with actual implementations)
async function fetchUserProfileFromDB(userId: string) {
  return { id: userId, name: 'John Doe', email: 'john@example.com' }
}

async function fetchActiveJobPostingsFromDB() {
  return [{ id: '1', title: 'Software Engineer' }]
}

async function fetchCandidatesFromDB(jobId: string) {
  return [{ id: '1', name: 'Jane Doe', job_posting_id: jobId }]
}

async function updateCandidateInDB(candidateId: string, data: any) {
  return { id: candidateId, ...data, job_posting_id: 'job-123' }
}

async function fetchGoalFromDB(goalId: string) {
  return { id: goalId, title: 'Sample Goal' }
}

async function fetchGoalsFromDB(goalIds: string[]) {
  return goalIds.map(id => ({ id, title: `Goal ${id}` }))
}

/**
 * Usage Summary:
 *
 * 1. Simple get/set:
 *    - cacheManager.get(key)
 *    - cacheManager.set(key, value, ttl)
 *
 * 2. With tags:
 *    - cacheManager.getWithTags(key, tags)
 *    - cacheManager.setWithTags(key, value, tags, ttl)
 *    - cacheManager.invalidateByTags(tags)
 *
 * 3. Batch operations:
 *    - cacheManager.getBatch(keys)
 *    - cacheManager.setBatch(entries)
 *
 * 4. Automatic fetch:
 *    - cacheManager.getOrSet(key, fetchFn, ttl)
 *
 * 5. Cache invalidation:
 *    - cacheManager.delete(key)
 *    - cacheManager.clear() // Clear all
 *
 * TTL (Time To Live):
 * - Short-lived (60-300s): Frequently changing data
 * - Medium (300-3600s): Semi-static data
 * - Long (3600+s): Rarely changing data
 */
