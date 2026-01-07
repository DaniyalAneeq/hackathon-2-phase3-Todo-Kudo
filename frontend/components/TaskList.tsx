/**
 * TaskList component to display all tasks
 * Empty state is now handled by the parent component (DashboardClient)
 */

import type { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
