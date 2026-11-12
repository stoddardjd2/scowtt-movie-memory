import { z } from "zod";

export const apiErrorCodeSchema = z.enum([
  "UNAUTHORIZED",
  "VALIDATION_ERROR",
  "NO_MOVIE",
  "UPSTREAM_ERROR",
  "INTERNAL",
]);

/** Body of every non-2xx response from our API routes. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;
export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
