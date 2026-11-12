import { z } from "zod";

export const MOVIE_TITLE_MAX = 100;

/** Body of PUT /api/me/movie. The server parses with this; the client reuses it for types. */
export const movieInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a movie title.")
    .max(MOVIE_TITLE_MAX, `Keep it under ${MOVIE_TITLE_MAX} characters.`),
});

export type MovieInput = z.infer<typeof movieInputSchema>;
