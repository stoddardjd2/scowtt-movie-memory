import "server-only";
import type { Profile } from "@/contracts/profile";
import { getSessionUserId } from "./auth";
import { getProfile } from "./users";

/** The signed-in user's profile, or null when signed out. Used by page guards. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const userId = await getSessionUserId();
  return userId ? getProfile(userId) : null;
}

/** Where a signed-in user belongs: onboarding until they have saved a movie. */
export function homeFor(profile: Profile): "/dashboard" | "/onboarding" {
  return profile.favoriteMovie ? "/dashboard" : "/onboarding";
}
