import * as z from "zod";

export const createUpdateSchema = z.object({
  did: z.string().min(1, "Please share what you did").max(500),
  willDo: z.string().min(1, "Please share what you'll do next").max(500),
  blockers: z.string().max(500).optional(),
});

export type CreateUpdateInput = z.infer<typeof createUpdateSchema>;
