export const queryKeys = {
  me: ["me"] as const,
  /** Every cached fact for a user, across movies. */
  facts: (userId: string) => ["fact", userId] as const,
  /** A fact belongs to one user and one movie, so a fact for an old movie can't show for a new one. */
  fact: (userId: string, movieTitle: string) => ["fact", userId, movieTitle] as const,
};
