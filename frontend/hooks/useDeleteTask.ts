/**
 * React Query mutation hook for deleting tasks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "@/lib/api-client";
import { toast } from "sonner";

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      // Invalidate and refetch tasks query to update the list
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });
}
