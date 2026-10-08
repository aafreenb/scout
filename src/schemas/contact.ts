import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedin_url: z.string().url().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactBody = z.infer<
  typeof createContactSchema
>;

export type UpdateContactBody = z.infer<
  typeof updateContactSchema
>;

export type ContactParams = {
  id: string;
};