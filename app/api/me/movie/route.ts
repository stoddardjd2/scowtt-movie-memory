import { NextResponse } from "next/server";
import { z } from "zod";
import { movieInputSchema } from "@/contracts/movie";
import { jsonError, withUser } from "@/server/http";
import { setFavoriteMovie } from "@/server/users";

export const PUT = withUser(async (userId, request) => {
  const body = await request.json().catch(() => null);
  const parsed = movieInputSchema.safeParse(body);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return jsonError(400, "VALIDATION_ERROR", "Please check the movie title.", fieldErrors);
  }

  const profile = await setFavoriteMovie(userId, parsed.data.title);
  return NextResponse.json(profile);
});
