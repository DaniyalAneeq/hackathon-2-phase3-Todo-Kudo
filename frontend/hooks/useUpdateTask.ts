/**
 * React Query mutation hook for updating tasks with optimistic updates
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "@/lib/api-client";
import type { TaskUpdate, TasksResponse } from "@/types/task";
import { toast } from "sonner";

interface UpdateTaskVariables {
  id: number;
  data: TaskUpdate;
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateTaskVariables) => updateTask(id, data),

    // Optimistic update - update UI immediately before server responds
    onMutate: async ({ id, data }: UpdateTaskVariables) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<TasksResponse>(["tasks"]);

      // Optimistically update the cache
      queryClient.setQueryData<TasksResponse>(["tasks"], (old) => {
        if (!old) return old;

        return {
          ...old,
          tasks: old.tasks.map((task) =>
            task.id === id
              ? { ...task, ...data, updated_at: new Date().toISOString() }
              : task
          ),
        };
      });

      // Return context with the previous value
      return { previousTasks };
    },

    // If mutation fails, rollback to the previous value
    onError: (error: Error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
      toast.error(`Failed to update task: ${error.message}`);
    },

    // Always refetch after error or success to ensure cache is in sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },

    onSuccess: () => {
      toast.success("Task updated successfully!");
    },
  });
}
