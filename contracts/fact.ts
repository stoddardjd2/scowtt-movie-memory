import { z } from "zod";

/** Response of GET /api/fact. movieTitle lets the UI confirm which movie the fact describes. */
export const factSchema = z.object({
  id: z.string(),
  movieTitle: z.string(),
  content: z.string(),
  createdAt: z.iso.datetime(),
});

export type Fact = z.infer<typeof factSchema>;
