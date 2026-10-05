import { z } from "zod";

export const createWebsiteSchema = z.object({
  url: z.string().url(),
});

export type CreateWebsiteBody =
  z.infer<typeof createWebsiteSchema>;