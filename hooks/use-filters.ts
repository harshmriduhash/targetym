import { useState, useMemo, useCallback } from 'react';

export interface FilterConfig<T> {
  searchFields?: (keyof T)[];
  filterFields?: {
    field: keyof T;
    value: string | string[];
  }[];
}

export function useFilters<T extends Record<string, any>>(
  items: T[],
  config?: FilterConfig<T>
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply search
    if (searchTerm && config?.searchFields) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) =>
        config.searchFields!.some((field) => {
          const value = item[field];
          return (
            value &&
            String(value).toLowerCase().includes(lowerSearch)
          );
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter((item) => item[key] === value);
      }
    });

    return result;
  }, [items, searchTerm, filters, config?.searchFields]);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({});
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = searchTerm ? 1 : 0;
    count += Object.values(filters).filter((v) => v && v !== 'all').length;
    return count;
  }, [searchTerm, filters]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    resetFilters,
    filteredItems,
    activeFiltersCount,
  };
}
