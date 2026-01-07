/**
 * TaskToolbar component
 * Provides search, sort, and filter controls for the task list
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, SortAsc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebounced } from '@/hooks/useDebounced';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { SORT_OPTIONS } from '@/types/filters';

export function TaskToolbar() {
  const { filters, setFilters, clearFilters, hasActiveFilters } = useTaskFilters();

  // Local state for search input (before debouncing)
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounced(searchInput, 300);

  // Update filters when debounced search changes (user typing)
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, filters.search, setFilters]);

  // Find current sort option label
  const currentSortOption = SORT_OPTIONS.find(
    opt => opt.sortBy === filters.sortBy && opt.order === filters.order
  );

  // Count active filters (excluding default sort)
  const activeFilterCount = [
    filters.search,
    filters.priority,
    filters.category,
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort Dropdown */}
      <Select
        value={currentSortOption?.label || SORT_OPTIONS[0].label}
        onValueChange={(label) => {
          const option = SORT_OPTIONS.find(opt => opt.label === label);
          if (option) {
            setFilters({ sortBy: option.sortBy, order: option.order });
          }
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SortAsc className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.label} value={option.label}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filter Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select
                value={filters.priority || 'all'}
                onValueChange={(value: 'high' | 'medium' | 'low' | 'all') =>
                  setFilters({ priority: value === 'all' ? '' : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Input
                placeholder="Enter category..."
                value={filters.category}
                onChange={(e) => setFilters({ category: e.target.value })}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  );
}
