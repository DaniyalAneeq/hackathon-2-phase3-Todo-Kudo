/**
 * Task filtering and sorting types
 */

export interface TaskFilters {
  search: string;
  sortBy: 'created_at' | 'due_date' | 'priority';
  order: 'asc' | 'desc';
  priority: '' | 'low' | 'medium' | 'high';
  category: string;
}

export const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  sortBy: 'created_at',
  order: 'desc',
  priority: '',
  category: '',
};

export interface SortOption {
  label: string;
  sortBy: TaskFilters['sortBy'];
  order: TaskFilters['order'];
}

export const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest', sortBy: 'created_at', order: 'desc' },
  { label: 'Oldest', sortBy: 'created_at', order: 'asc' },
  { label: 'Highest Priority', sortBy: 'priority', order: 'desc' },
  { label: 'Due Soon', sortBy: 'due_date', order: 'asc' },
];
