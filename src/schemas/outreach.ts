import { z } from "zod";

export const createOutreachSchema = z.object({
  contact_id: z.number().int().positive().optional(),
  channel: z.enum(["email", "linkedin", "instagram", "phone", "other"]),
  status: z
    .enum([
      "not_contacted",
      "contacted",
      "replied",
      "meeting",
      "won",
      "lost",
    ])
    .default("not_contacted"),
  notes: z.string().optional(),
  contacted_at: z.string().datetime().optional(),
});

export const updateOutreachSchema =
  createOutreachSchema.partial();

export type CreateOutreachBody = z.infer<
  typeof createOutreachSchema
>;

export type UpdateOutreachBody = z.infer<
  typeof updateOutreachSchema
>;

export type OutreachParams = {
  id: string;
};