import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPattern,
  CachePrefix,
  CacheTTL,
  cacheKey,
} from './redis'
import { logger } from '@/src/lib/monitoring/logger'

/**
 * Cache Wrapper pour les Services
 * Ajoute automatiquement du caching à n'importe quelle méthode de service
 */

export interface CacheOptions {
  /** Prefix du cache (goals, recruitment, etc.) */
  prefix: string
  /** TTL en secondes */
  ttl?: number
  /** Générer la clé de cache personnalisée */
  keyGenerator?: (...args: unknown[]) => string
  /** Conditions pour bypasser le cache */
  shouldCache?: (...args: unknown[]) => boolean
}

/**
 * Decorator pour cacher les résultats d'une méthode
 */
export function cached(options: CacheOptions) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      // Vérifier si on doit cacher
      if (options.shouldCache && !options.shouldCache(...args)) {
        return originalMethod.apply(this, args)
      }

      // Générer la clé de cache
      const key = options.keyGenerator
        ? options.keyGenerator(...args)
        : `${options.prefix}:${propertyKey}:${JSON.stringify(args)}`

      // Essayer de récupérer du cache
      const cached = await cacheGet(key)
      if (cached !== null) {
        logger.debug({ key, method: propertyKey }, 'Cache hit')
        return cached
      }

      // Exécuter la méthode originale
      logger.debug({ key, method: propertyKey }, 'Cache miss')
      const result = await originalMethod.apply(this, args)

      // Mettre en cache
      const ttl = options.ttl || CacheTTL.MEDIUM
      await cacheSet(key, result, ttl)

      return result
    }

    return descriptor
  }
}

/**
 * Helper pour wrapper une fonction avec du cache
 */
export async function withServiceCache<T>(
  options: {
    key: string
    ttl?: number
    organizationId: string
  },
  fn: () => Promise<T>
): Promise<T> {
  const fullKey = cacheKey(options.key.split(':')[0], options.organizationId, ...options.key.split(':').slice(1))

  // Try cache
  const cached = await cacheGet<T>(fullKey)
  if (cached !== null) {
    logger.debug({ key: fullKey }, 'Service cache hit')
    return cached
  }

  // Execute function
  logger.debug({ key: fullKey }, 'Service cache miss')
  const result = await fn()

  // Cache result
  await cacheSet(fullKey, result, options.ttl || CacheTTL.MEDIUM)

  return result
}

/**
 * Invalidation de cache par organisation et préfixe
 */
export async function invalidateServiceCache(
  organizationId: string,
  prefix: typeof CachePrefix[keyof typeof CachePrefix]
): Promise<void> {
  const pattern = `${prefix}:${organizationId}:*`
  await cacheDelPattern(pattern)
  logger.info({ organizationId, prefix }, 'Service cache invalidated')
}

/**
 * Invalidation de cache pour une clé spécifique
 */
export async function invalidateCacheKey(
  organizationId: string,
  prefix: string,
  ...keyParts: string[]
): Promise<void> {
  const key = cacheKey(prefix, organizationId, ...keyParts)
  await cacheDel(key)
  logger.debug({ key }, 'Cache key invalidated')
}

/**
 * Helper pour les méthodes CRUD avec cache auto-invalidation
 */
export class ServiceCacheManager {
  constructor(
    private organizationId: string,
    private prefix: typeof CachePrefix[keyof typeof CachePrefix]
  ) {}

  /**
   * Get avec cache
   */
  async get<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    return withServiceCache(
      {
        key: `${this.prefix}:${key}`,
        organizationId: this.organizationId,
        ttl,
      },
      fn
    )
  }

  /**
   * List avec cache
   */
  async list<T>(
    key: string,
    fn: () => Promise<T[]>,
    ttl: number = CacheTTL.MEDIUM
  ): Promise<T[]> {
    return withServiceCache(
      {
        key: `${this.prefix}:${key}`,
        organizationId: this.organizationId,
        ttl,
      },
      fn
    )
  }

  /**
   * Invalidate après mutation
   */
  async invalidate(pattern?: string): Promise<void> {
    if (pattern) {
      await invalidateCacheKey(this.organizationId, this.prefix, pattern)
    } else {
      await invalidateServiceCache(this.organizationId, this.prefix)
    }
  }

  /**
   * Create avec invalidation auto
   */
  async create<T>(fn: () => Promise<T>): Promise<T> {
    const result = await fn()
    await this.invalidate() // Invalider tout le cache du module
    return result
  }

  /**
   * Update avec invalidation auto
   */
  async update<T>(id: string, fn: () => Promise<T>): Promise<T> {
    const result = await fn()
    await this.invalidate(`detail:${id}`) // Invalider l'item spécifique
    await this.invalidate('list') // Invalider les listes
    return result
  }

  /**
   * Delete avec invalidation auto
   */
  async delete(id: string, fn: () => Promise<void>): Promise<void> {
    await fn()
    await this.invalidate(`detail:${id}`)
    await this.invalidate('list')
  }
}
