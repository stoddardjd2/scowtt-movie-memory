import "server-only";
import type { Fact } from "@/contracts/fact";
import { db } from "./db";
import { requestMovieFact } from "./openai";

export class NoMovieError extends Error {}
export class FactGenerationError extends Error {}

/**
 * Generates a fact for the user's *saved* movie and stores it.
 * The movie is read from the database, never from the request.
 */
export async function generateFact(userId: string): Promise<Fact> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { favoriteMovie: true },
  });
  const movieTitle = user?.favoriteMovie;
  if (!movieTitle) throw new NoMovieError();

  let content: string;
  try {
    content = await requestMovieFact(movieTitle);
  } catch (error) {
    console.error("Fact generation failed", error);
    throw new FactGenerationError();
  }

  const fact = await db.fact.create({ data: { userId, movieTitle, content } });
  return {
    id: fact.id,
    movieTitle: fact.movieTitle,
    content: fact.content,
    createdAt: fact.createdAt.toISOString(),
  };
}
