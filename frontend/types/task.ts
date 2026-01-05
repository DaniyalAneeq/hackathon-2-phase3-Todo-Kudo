/**
 * Task TypeScript interfaces matching backend schema
 */

export interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  is_completed?: boolean;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
}
