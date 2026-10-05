import { z } from "zod";

export const createBusinessSchema = z.object({
  name: z.string().min(1),
  industry: z.string().min(1),
  city: z.string().min(1),
});

export const updateBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
});

export type CreateBusinessBody = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessBody = z.infer<typeof updateBusinessSchema>;

export type BusinessParams = {
  id: string;
};
