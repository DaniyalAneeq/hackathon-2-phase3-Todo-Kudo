/**
 * Task TypeScript interfaces matching backend schema
 */

export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  priority: PriorityLevel;
  due_date: string | null;
  category: string | null;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  is_completed?: boolean;
  priority?: PriorityLevel;
  due_date?: string | null;
  category?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
  priority?: PriorityLevel;
  due_date?: string | null;
  category?: string | null;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
}
