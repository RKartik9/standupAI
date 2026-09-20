import * as z from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(120),
  description: z.string().max(1000).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
