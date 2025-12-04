/**
 * @jest-environment node
 */

import {
  normalizePagination,
  getPaginationOffset,
  createPaginationMeta,
  createPaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '@/src/lib/utils/pagination'

describe('Pagination Utilities', () => {
  describe('normalizePagination', () => {
    it('should return defaults when no params provided', () => {
      const result = normalizePagination()

      expect(result).toEqual({
        page: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
      })
    })

    it('should use provided valid params', () => {
      const result = normalizePagination({ page: 3, pageSize: 50 })

      expect(result).toEqual({
        page: 3,
        pageSize: 50,
      })
    })

    it('should enforce minimum page of 1', () => {
      const result = normalizePagination({ page: 0, pageSize: 20 })

      expect(result.page).toBe(1)
    })

    it('should enforce minimum page of 1 for negative values', () => {
      const result = normalizePagination({ page: -5, pageSize: 20 })

      expect(result.page).toBe(1)
    })

    it('should enforce maximum page size', () => {
      const result = normalizePagination({ page: 1, pageSize: 200 })

      expect(result.pageSize).toBe(MAX_PAGE_SIZE)
    })

    it('should enforce minimum page size of 1', () => {
      const result = normalizePagination({ page: 1, pageSize: 0 })

      expect(result.pageSize).toBe(1)
    })

    it('should handle edge case of exactly MAX_PAGE_SIZE', () => {
      const result = normalizePagination({ page: 1, pageSize: MAX_PAGE_SIZE })

      expect(result.pageSize).toBe(MAX_PAGE_SIZE)
    })
  })

  describe('getPaginationOffset', () => {
    it('should calculate offset for first page', () => {
      const offset = getPaginationOffset(1, 20)

      expect(offset).toBe(0)
    })

    it('should calculate offset for second page', () => {
      const offset = getPaginationOffset(2, 20)

      expect(offset).toBe(20)
    })

    it('should calculate offset for third page', () => {
      const offset = getPaginationOffset(3, 25)

      expect(offset).toBe(50)
    })

    it('should handle page 1 with custom page size', () => {
      const offset = getPaginationOffset(1, 50)

      expect(offset).toBe(0)
    })

    it('should handle large page numbers', () => {
      const offset = getPaginationOffset(100, 20)

      expect(offset).toBe(1980)
    })
  })

  describe('createPaginationMeta', () => {
    it('should create meta for first page with items', () => {
      const meta = createPaginationMeta(1, 20, 100)

      expect(meta).toEqual({
        page: 1,
        pageSize: 20,
        totalItems: 100,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: false,
      })
    })

    it('should create meta for middle page', () => {
      const meta = createPaginationMeta(3, 20, 100)

      expect(meta).toEqual({
        page: 3,
        pageSize: 20,
        totalItems: 100,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true,
      })
    })

    it('should create meta for last page', () => {
      const meta = createPaginationMeta(5, 20, 100)

      expect(meta).toEqual({
        page: 5,
        pageSize: 20,
        totalItems: 100,
        totalPages: 5,
        hasNextPage: false,
        hasPreviousPage: true,
      })
    })

    it('should handle empty results', () => {
      const meta = createPaginationMeta(1, 20, 0)

      expect(meta).toEqual({
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      })
    })

    it('should handle partial last page', () => {
      const meta = createPaginationMeta(3, 20, 55)

      expect(meta).toEqual({
        page: 3,
        pageSize: 20,
        totalItems: 55,
        totalPages: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      })
    })

    it('should handle single page of results', () => {
      const meta = createPaginationMeta(1, 20, 15)

      expect(meta).toEqual({
        page: 1,
        pageSize: 20,
        totalItems: 15,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      })
    })

    it('should calculate total pages correctly with exact division', () => {
      const meta = createPaginationMeta(1, 25, 100)

      expect(meta.totalPages).toBe(4)
    })

    it('should round up total pages for partial pages', () => {
      const meta = createPaginationMeta(1, 25, 101)

      expect(meta.totalPages).toBe(5)
    })
  })

  describe('createPaginatedResponse', () => {
    it('should create paginated response with data and meta', () => {
      const data = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]

      const response = createPaginatedResponse(data, 1, 20, 50)

      expect(response).toEqual({
        data,
        meta: {
          page: 1,
          pageSize: 20,
          totalItems: 50,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      })
    })

    it('should handle empty data array', () => {
      const response = createPaginatedResponse([], 1, 20, 0)

      expect(response).toEqual({
        data: [],
        meta: {
          page: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      })
    })

    it('should preserve data types', () => {
      interface TestItem {
        id: string
        value: number
        nested: { key: string }
      }

      const data: TestItem[] = [
        { id: '1', value: 100, nested: { key: 'test' } },
      ]

      const response = createPaginatedResponse(data, 1, 10, 1)

      expect(response.data[0].nested.key).toBe('test')
      expect(typeof response.data[0].value).toBe('number')
    })
  })

  describe('Integration scenarios', () => {
    it('should work correctly for typical API use case', () => {
      // Simulate API request: page=2, pageSize=25
      const params = normalizePagination({ page: 2, pageSize: 25 })
      const offset = getPaginationOffset(params.page, params.pageSize)

      // Simulate database query
      const totalItems = 100
      const mockData = Array.from({ length: 25 }, (_, i) => ({
        id: String(i + offset),
      }))

      const response = createPaginatedResponse(
        mockData,
        params.page,
        params.pageSize,
        totalItems
      )

      expect(response.meta).toEqual({
        page: 2,
        pageSize: 25,
        totalItems: 100,
        totalPages: 4,
        hasNextPage: true,
        hasPreviousPage: true,
      })
      expect(response.data.length).toBe(25)
      expect(response.data[0].id).toBe('25')
    })

    it('should handle edge case of requesting beyond available pages', () => {
      const params = normalizePagination({ page: 10, pageSize: 20 })
      const offset = getPaginationOffset(params.page, params.pageSize)

      // Only 50 items total, page 10 would be at offset 180
      const totalItems = 50
      const mockData: any[] = [] // No data returned

      const response = createPaginatedResponse(
        mockData,
        params.page,
        params.pageSize,
        totalItems
      )

      expect(response.meta.totalPages).toBe(3)
      expect(response.meta.hasNextPage).toBe(false)
      expect(response.data.length).toBe(0)
    })
  })
})
