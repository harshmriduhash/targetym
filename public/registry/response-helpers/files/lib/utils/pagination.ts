/**
 * Pagination utilities for list endpoints
 */

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

/**
 * Normalizes pagination parameters with defaults and limits
 */
export function normalizePagination(params?: PaginationParams) {
  const page = Math.max(1, params?.page ?? DEFAULT_PAGE)
  const requestedPageSize = params?.pageSize ?? DEFAULT_PAGE_SIZE
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedPageSize))

  return { page, pageSize }
}

/**
 * Calculates pagination offset for database queries
 */
export function getPaginationOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize
}

/**
 * Creates pagination metadata from query results
 */
export function createPaginationMeta(
  page: number,
  pageSize: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / pageSize)

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

/**
 * Wraps data with pagination metadata
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  totalItems: number
): PaginatedResponse<T> {
  return {
    data,
    meta: createPaginationMeta(page, pageSize, totalItems),
  }
}
