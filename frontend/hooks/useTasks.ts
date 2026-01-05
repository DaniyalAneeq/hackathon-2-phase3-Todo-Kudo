/**
 * React Query hook for fetching tasks
 */

import { useQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/lib/api-client";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });
}
