"use client";

/**
 * CreateTaskForm component for adding new tasks
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskCreateSchema, type TaskCreateFormData } from "@/schemas/task";
import { useCreateTask } from "@/hooks/useCreateTask";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function CreateTaskForm() {
  const createTask = useCreateTask();
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const form = useForm<TaskCreateFormData>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "",
    },
  });

  const titleValue = form.watch("title");
  const descriptionValue = form.watch("description");

  const onSubmit = async (data: TaskCreateFormData) => {
    await createTask.mutateAsync({
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      due_date: dueDate ? dueDate.toISOString() : null,
      category: data.category || null,
    });
    form.reset();
    setDueDate(undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task title..."
                      {...field}
                      disabled={createTask.isPending}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground">
                      {titleValue?.length || 0}/255
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task description..."
                      {...field}
                      disabled={createTask.isPending}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground">
                      {descriptionValue?.length || 0}/2000
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={createTask.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Due Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                    disabled={createTask.isPending}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={createTask.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="School">School</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={createTask.isPending || !titleValue?.trim()}
            >
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
