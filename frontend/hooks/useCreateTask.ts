/**
 * React Query mutation hook for creating tasks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/lib/api-client";
import type { TaskCreate } from "@/types/task";
import { toast } from "sonner";

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskCreate) => createTask(data),
    onSuccess: () => {
      // Invalidate and refetch tasks query to update the list
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });
}
