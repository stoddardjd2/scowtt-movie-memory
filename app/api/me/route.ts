import { NextResponse } from "next/server";
import { jsonError, withUser } from "@/server/http";
import { getProfile } from "@/server/users";

export const GET = withUser(async (userId) => {
  const profile = await getProfile(userId);
  if (!profile) return jsonError(401, "UNAUTHORIZED", "Please sign in again.");
  return NextResponse.json(profile);
});
