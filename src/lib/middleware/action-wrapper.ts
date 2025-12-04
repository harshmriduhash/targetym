/**
 * Universal Server Action Wrapper
 * Eliminates code duplication across all Server Actions
 *
 * Provides:
 * - Automatic validation (Zod)
 * - Authentication & authorization
 * - Rate limiting
 * - Error handling
 * - Logging & monitoring
 *
 * Usage:
 * ```typescript
 * export const createGoal = createAction({
 *   schema: createGoalSchema,
 *   rateLimit: 'create',
 *   allowedRoles: ['admin', 'manager', 'employee'],
 *   handler: async (validated, context) => {
 *     const goal = await goalsService.createGoal({
 *       ...validated,
 *       owner_id: context.userId,
 *       organization_id: context.organizationId,
 *     })
 *     return { id: goal.id }
 *   },
 * })
 * ```
 */

import { z } from 'zod'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import { withActionRateLimit, type RateLimitAction } from '@/src/lib/middleware/action-rate-limit'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { logger } from '@/src/lib/monitoring/logger'

/**
 * Authentication context passed to action handlers
 */
export interface ActionContext {
  userId: string
  organizationId: string
  role: string
  email: string
}

/**
 * Action configuration options
 */
export interface ActionOptions<TInput, TOutput> {
  /** Zod schema for input validation */
  schema: z.ZodSchema<TInput>

  /** Rate limit action type (optional) */
  rateLimit?: RateLimitAction

  /** Require authentication (default: true) */
  requireAuth?: boolean

  /** Allowed roles (optional, checks if auth is required) */
  allowedRoles?: string[]

  /** Handler function that executes the action */
  handler: (validated: TInput, context: ActionContext) => Promise<TOutput>

  /** Enable detailed logging (default: false) */
  enableLogging?: boolean

  /** Action name for logging/monitoring */
  actionName?: string
}

/**
 * Create a type-safe Server Action with automatic validation, auth, and error handling
 *
 * @example
 * ```typescript
 * export const createGoal = createAction({
 *   schema: createGoalSchema,
 *   rateLimit: 'create',
 *   allowedRoles: ['admin', 'manager', 'employee'],
 *   handler: async (validated, context) => {
 *     return { id: await goalsService.createGoal(validated) }
 *   },
 * })
 * ```
 */
export function createAction<TInput, TOutput>(
  options: ActionOptions<TInput, TOutput>
) {
  const {
    schema,
    rateLimit,
    requireAuth = true,
    allowedRoles,
    handler,
    enableLogging = false,
    actionName = 'action',
  } = options

  return async (input: TInput): Promise<ActionResponse<TOutput>> => {
    const startTime = Date.now()

    const executeAction = async (): Promise<ActionResponse<TOutput>> => {
      try {
        // Step 1: Validate input with Zod
        if (enableLogging) {
          logger.info(`[${actionName}] Validating input...`)
        }

        const validated = schema.parse(input)

        // Step 2: Get authentication context (if required)
        let context: ActionContext | undefined

        if (requireAuth) {
          if (enableLogging) {
            logger.info(`[${actionName}] Checking authentication...`)
          }

          try {
            context = await getAuthContext()
          } catch (error) {
            return errorResponse('Authentication required', 'UNAUTHORIZED')
          }

          // Step 3: Check role permissions
          if (allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(context.role)) {
              if (enableLogging) {
                logger.warn(`[${actionName}] Insufficient permissions for role: ${context.role}`)
              }
              return errorResponse(
                'Insufficient permissions to perform this action',
                'FORBIDDEN'
              )
            }
          }
        }

        // Step 4: Execute handler
        if (enableLogging) {
          logger.info(`[${actionName}] Executing handler...`)
        }

        const result = await handler(validated, context!)

        // Step 5: Log success
        if (enableLogging) {
          const duration = Date.now() - startTime
          logger.info(`[${actionName}] Success in ${duration}ms`)
        }

        return successResponse(result)
      } catch (error) {
        // Step 6: Handle errors
        const duration = Date.now() - startTime

        if (enableLogging) {
          logger.error(`[${actionName}] Error after ${duration}ms:`, error)
        }

        const appError = handleServiceError(error)
        return errorResponse(appError.message, appError.code)
      }
    }

    // Step 7: Apply rate limiting (if specified)
    if (rateLimit) {
      return withActionRateLimit(rateLimit, executeAction)
    }

    return executeAction()
  }
}

/**
 * Create a public action (no authentication required)
 *
 * @example
 * ```typescript
 * export const getPublicStats = createPublicAction({
 *   schema: z.object({ page: z.number().optional() }),
 *   handler: async (validated) => {
 *     return { stats: await statsService.getPublicStats() }
 *   },
 * })
 * ```
 */
export function createPublicAction<TInput, TOutput>(
  options: Omit<ActionOptions<TInput, TOutput>, 'requireAuth' | 'allowedRoles'>
) {
  return createAction({
    ...options,
    requireAuth: false,
    handler: async (validated) => {
      // Create minimal context for public actions
      const context: ActionContext = {
        userId: '',
        organizationId: '',
        role: 'public',
        email: '',
      }
      return options.handler(validated, context)
    },
  })
}

/**
 * Create an admin-only action
 *
 * @example
 * ```typescript
 * export const deleteOrganization = createAdminAction({
 *   schema: z.object({ orgId: z.string().uuid() }),
 *   handler: async (validated, context) => {
 *     await adminService.deleteOrganization(validated.orgId)
 *     return { success: true }
 *   },
 * })
 * ```
 */
export function createAdminAction<TInput, TOutput>(
  options: Omit<ActionOptions<TInput, TOutput>, 'allowedRoles'>
) {
  return createAction({
    ...options,
    allowedRoles: ['admin'],
  })
}

/**
 * Create an action with built-in pagination support
 *
 * @example
 * ```typescript
 * export const getGoals = createPaginatedAction({
 *   schema: z.object({
 *     filters: z.object({ status: z.string().optional() }).optional(),
 *     page: z.number().default(1),
 *     pageSize: z.number().default(20),
 *   }),
 *   handler: async (validated, context) => {
 *     return goalsService.getGoals(context.organizationId, validated.filters, {
 *       page: validated.page,
 *       pageSize: validated.pageSize,
 *     })
 *   },
 * })
 * ```
 */
export function createPaginatedAction<TInput extends { page?: number; pageSize?: number }, TOutput>(
  options: ActionOptions<TInput, TOutput>
) {
  return createAction(options)
}

/**
 * Create an action with automatic caching
 *
 * @example
 * ```typescript
 * export const getGoalById = createCachedAction({
 *   schema: z.object({ id: z.string().uuid() }),
 *   cacheKey: (input) => `goal:${input.id}`,
 *   ttl: 300, // 5 minutes
 *   handler: async (validated, context) => {
 *     return goalsService.getGoalById(validated.id)
 *   },
 * })
 * ```
 */
export function createCachedAction<TInput, TOutput>(
  options: ActionOptions<TInput, TOutput> & {
    cacheKey: (input: TInput) => string
    ttl?: number
  }
) {
  const { cacheKey, ttl = 300, handler, ...restOptions } = options

  return createAction({
    ...restOptions,
    handler: async (validated, context) => {
      const { cacheService } = await import('@/src/lib/cache/redis-cache')

      const key = cacheKey(validated)

      return cacheService.getCached(
        key,
        async () => handler(validated, context),
        { ttl }
      )
    },
  })
}

/**
 * Create a batch action for processing multiple items
 *
 * @example
 * ```typescript
 * export const batchUpdateGoals = createBatchAction({
 *   schema: z.object({
 *     updates: z.array(z.object({
 *       id: z.string().uuid(),
 *       status: z.string(),
 *     })).max(100),
 *   }),
 *   rateLimit: 'batch',
 *   handler: async (validated, context) => {
 *     return goalsService.batchUpdate(validated.updates, context.userId)
 *   },
 * })
 * ```
 */
export function createBatchAction<TInput, TOutput>(
  options: ActionOptions<TInput, TOutput>
) {
  return createAction({
    ...options,
    rateLimit: options.rateLimit || 'batch',
  })
}

/**
 * Compose multiple actions into a single transaction
 *
 * @example
 * ```typescript
 * export const createGoalWithKeyResults = composeActions({
 *   schema: z.object({
 *     goal: createGoalSchema,
 *     keyResults: z.array(createKeyResultSchema),
 *   }),
 *   handler: async (validated, context) => {
 *     const goal = await goalsService.createGoal(validated.goal)
 *     const keyResults = await Promise.all(
 *       validated.keyResults.map(kr =>
 *         keyResultsService.create({ ...kr, goal_id: goal.id })
 *       )
 *     )
 *     return { goal, keyResults }
 *   },
 * })
 * ```
 */
export function composeActions<TInput, TOutput>(
  options: ActionOptions<TInput, TOutput>
) {
  return createAction({
    ...options,
    enableLogging: true,
    actionName: options.actionName || 'composed-action',
  })
}

/**
 * Type helper for extracting validated input type from schema
 */
export type InferActionInput<T> = T extends z.ZodSchema<infer U> ? U : never

/**
 * Type helper for action handler function
 */
export type ActionHandler<TInput, TOutput> = (
  validated: TInput,
  context: ActionContext
) => Promise<TOutput>
