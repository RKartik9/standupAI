import * as z from "zod";

export const addWorkSchema = z.object({
  input: z
    .string()
    .min(3, "Describe the work in a sentence or two")
    .max(2000),
});

export type AddWorkInput = z.infer<typeof addWorkSchema>;

export const taskDraftSchema = z.object({
  title: z.string().min(1).max(200),
  assigneeId: z.string().min(1, "Pick an assignee"),
  teamId: z.string().uuid().nullable(),
  estimateHours: z.number().positive().max(2000),
  priority: z.number().int().min(1).max(4),
  scheduledStart: z.string().nullable(),
  reason: z.string().max(500).nullable(),
  rawInput: z.string().max(2000).nullable(),
});

export type TaskDraftInput = z.infer<typeof taskDraftSchema>;

export const commitTasksSchema = z.object({
  drafts: z.array(taskDraftSchema).min(1).max(25),
});

export const taskStatusSchema = z.enum(["todo", "in_progress", "done"]);
export const taskPrioritySchema = z.number().int().min(1).max(4);
