"use client";

/**
 * TaskCard component for displaying individual tasks with checkbox, edit, and delete
 */

import { useState } from "react";
import type { Task } from "@/types/task";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useUpdateTask } from "@/hooks/useUpdateTask";
import { useDeleteTask } from "@/hooks/useDeleteTask";
import { cn, getPriorityVariant, formatDueDate, getCategoryBadgeColor } from "@/lib/utils";
import { format } from "date-fns";
import type { PriorityLevel } from "@/types/task";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(
    task.description || ""
  );
  const [editedPriority, setEditedPriority] = useState<PriorityLevel>(task.priority);
  const [editedDueDate, setEditedDueDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );

  // Legacy category handling: normalize and check if it's a standard category
  const normalizedCategory = task.category?.toLowerCase();
  const standardCategories = ['work', 'school', 'personal'];
  const [editedCategory, setEditedCategory] = useState(
    normalizedCategory && standardCategories.includes(normalizedCategory)
      ? task.category
      : ""
  );

  const handleToggleComplete = (checked: boolean) => {
    updateTask.mutate({
      id: task.id,
      data: { is_completed: checked },
    });
  };

  const handleSave = () => {
    updateTask.mutate(
      {
        id: task.id,
        data: {
          title: editedTitle,
          description: editedDescription || null,
          priority: editedPriority,
          due_date: editedDueDate ? editedDueDate.toISOString() : null,
          category: editedCategory || null,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || "");
    setEditedPriority(task.priority);
    setEditedDueDate(task.due_date ? new Date(task.due_date) : undefined);
    setEditedCategory(task.category || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Task title..."
            className="font-semibold text-lg"
          />
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Task description (optional)..."
          />

          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <Select
              value={editedPriority}
              onValueChange={(value) => setEditedPriority(value as PriorityLevel)}
              disabled={updateTask.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Due Date</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !editedDueDate && "text-muted-foreground"
                    )}
                    disabled={updateTask.isPending}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editedDueDate ? format(editedDueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editedDueDate}
                    onSelect={setEditedDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {editedDueDate && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditedDueDate(undefined)}
                  disabled={updateTask.isPending}
                  title="Clear due date"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select
              value={editedCategory || ""}
              onValueChange={setEditedCategory}
              disabled={updateTask.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="School">School</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!editedTitle.trim() || updateTask.isPending}
            >
              {updateTask.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={updateTask.isPending}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.is_completed}
            onCheckedChange={handleToggleComplete}
            className="mt-1"
          />
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              "flex-1 text-lg font-semibold leading-none cursor-pointer",
              task.is_completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </label>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0"
              title="Edit task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteTask.mutate(task.id)}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              title="Delete task"
              disabled={deleteTask.isPending}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pl-12 space-y-2">
        {task.description && (
          <p
            className={cn(
              "text-sm",
              task.is_completed
                ? "text-muted-foreground line-through"
                : "text-muted-foreground"
            )}
          >
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getPriorityVariant(task.priority)}>
            {task.priority}
          </Badge>

          {task.due_date && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {formatDueDate(task.due_date)}
            </span>
          )}

          {task.category && (
            <Badge className={getCategoryBadgeColor(task.category)}>
              {task.category}
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {format(new Date(task.created_at), "MMM d, yyyy h:mm a")}
        </p>
      </CardContent>
    </Card>
  );
}
