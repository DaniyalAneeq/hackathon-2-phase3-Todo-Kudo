/**
 * Hook to manage task filters in URL query parameters
 * Provides filter state synchronized with URL for persistence and shareability
 */

'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { TaskFilters } from '@/types/filters';

export function useTaskFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse filters from URL query parameters
  const filters: TaskFilters = useMemo(() => {
    return {
      search: searchParams.get('q') || '',
      sortBy: (searchParams.get('sort_by') as TaskFilters['sortBy']) || 'created_at',
      order: (searchParams.get('order') as TaskFilters['order']) || 'desc',
      priority: (searchParams.get('priority') as TaskFilters['priority']) || '',
      category: searchParams.get('category') || '',
    };
  }, [searchParams]);

  // Update URL with new filters
  const setFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    // Only add non-default values to URL
    if (updatedFilters.search) params.set('q', updatedFilters.search);
    if (updatedFilters.sortBy !== 'created_at') params.set('sort_by', updatedFilters.sortBy);
    if (updatedFilters.order !== 'desc') params.set('order', updatedFilters.order);
    if (updatedFilters.priority) params.set('priority', updatedFilters.priority);
    if (updatedFilters.category) params.set('category', updatedFilters.category);

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }, [filters, router, pathname]);

  // Clear all filters and return to default view
  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  // Check if any filters are active (different from defaults)
  const hasActiveFilters = useMemo(() => {
    return filters.search !== '' ||
           filters.priority !== '' ||
           filters.category !== '' ||
           filters.sortBy !== 'created_at' ||
           filters.order !== 'desc';
  }, [filters]);

  return { filters, setFilters, clearFilters, hasActiveFilters };
}
