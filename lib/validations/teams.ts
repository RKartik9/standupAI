import * as z from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
