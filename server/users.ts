import "server-only";
import type { Profile } from "@/contracts/profile";
import { db } from "./db";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  favoriteMovie: string | null;
};

function toProfile(user: UserRow): Profile {
  return {
    id: user.id,
    name: user.name?.trim() || null,
    // Sign-in rejects accounts without an email, so this fallback is defensive only.
    email: user.email ?? "",
    photoUrl: user.image || null,
    favoriteMovie: user.favoriteMovie,
  };
}

const profileFields = {
  id: true,
  name: true,
  email: true,
  image: true,
  favoriteMovie: true,
} as const;

export async function getProfile(userId: string): Promise<Profile | null> {
  const user = await db.user.findUnique({ where: { id: userId }, select: profileFields });
  return user ? toProfile(user) : null;
}

/** Expects an already-validated, trimmed title. */
export async function setFavoriteMovie(userId: string, title: string): Promise<Profile> {
  const user = await db.user.update({
    where: { id: userId },
    data: { favoriteMovie: title },
    select: profileFields,
  });
  return toProfile(user);
}
