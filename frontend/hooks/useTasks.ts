/**
 * React Query hook for fetching tasks with optional filters
 * Automatically refetches when filters change
 */

import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/lib/api-client";
import type { TaskFilters } from "@/types/filters";

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters], // React Query will refetch when filters change
    queryFn: () => fetchTasks(filters),
  });
}
