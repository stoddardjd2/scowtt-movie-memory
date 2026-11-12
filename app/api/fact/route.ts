import { NextResponse } from "next/server";
import { FactGenerationError, generateFact, NoMovieError } from "@/server/facts";
import { jsonError, withUser } from "@/server/http";

// GET because the exercise names it so; each call generates and stores a new fact.
export const GET = withUser(async (userId) => {
  try {
    const fact = await generateFact(userId);
    return NextResponse.json(fact, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof NoMovieError) {
      return jsonError(409, "NO_MOVIE", "Pick a favorite movie first.");
    }
    if (error instanceof FactGenerationError) {
      return jsonError(502, "UPSTREAM_ERROR", "We couldn't come up with a fact right now. Try again.");
    }
    throw error;
  }
});
