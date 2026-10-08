import { z } from "zod";

export const createOpportunitySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z
    .enum(["identified", "pitched", "won", "lost"])
    .default("identified"),
});

export const updateOpportunitySchema =
  createOpportunitySchema.partial();

export type CreateOpportunityBody = z.infer<
  typeof createOpportunitySchema
>;

export type UpdateOpportunityBody = z.infer<
  typeof updateOpportunitySchema
>;

export type OpportunityParams = {
  id: string;
};