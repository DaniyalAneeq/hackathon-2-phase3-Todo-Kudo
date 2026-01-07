/**
 * Zod validation schemas for task forms
 */

import { z } from "zod";

const priorityEnum = z.enum(['low', 'medium', 'high']);

export const taskCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .or(z.literal("")),
  priority: priorityEnum.optional(),
  due_date: z.string().optional(),
  category: z
    .string()
    .max(100, "Category must be less than 100 characters")
    .optional()
    .or(z.literal("")),
});

export const taskUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .or(z.literal("")),
  is_completed: z.boolean().optional(),
  priority: priorityEnum.optional(),
  due_date: z.string().optional(),
  category: z
    .string()
    .max(100, "Category must be less than 100 characters")
    .optional()
    .or(z.literal("")),
});

export type TaskCreateFormData = z.infer<typeof taskCreateSchema>;
export type TaskUpdateFormData = z.infer<typeof taskUpdateSchema>;
