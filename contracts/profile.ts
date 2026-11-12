import { z } from "zod";

/** Response of GET /api/me and PUT /api/me/movie. */
export const profileSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string(),
  photoUrl: z.string().nullable(),
  favoriteMovie: z.string().nullable(),
});

export type Profile = z.infer<typeof profileSchema>;
