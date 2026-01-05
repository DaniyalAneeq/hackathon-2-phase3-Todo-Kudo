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
import { useUpdateTask } from "@/hooks/useUpdateTask";
import { useDeleteTask } from "@/hooks/useDeleteTask";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
        <p className="text-xs text-muted-foreground">
          {format(new Date(task.created_at), "MMM d, yyyy h:mm a")}
        </p>
      </CardContent>
    </Card>
  );
}
