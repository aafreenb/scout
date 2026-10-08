import { z } from "zod";

export const createWebsiteSchema = z.object({
  url: z.string().url(),
});

export const updateWebsiteSchema =
  createWebsiteSchema.partial();

export type CreateWebsiteBody = z.infer<
  typeof createWebsiteSchema
>;

export type UpdateWebsiteBody = z.infer<
  typeof updateWebsiteSchema
>;

export type WebsiteParams = {
  id: string;
};