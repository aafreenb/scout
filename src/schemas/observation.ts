import { z } from "zod";

export const createObservationSchema = z.object({
  type: z.string().min(1),
  content: z.string().min(1),
});

export const updateObservationSchema =
  createObservationSchema.partial();

export type CreateObservationBody = z.infer<
  typeof createObservationSchema
>;

export type UpdateObservationBody = z.infer<
  typeof updateObservationSchema
>;

export type ObservationParams = {
  id: string;
};