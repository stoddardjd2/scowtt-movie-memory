import "server-only";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [Google],
  session: { strategy: "database" },
  callbacks: {
    // The profile contract requires an email, so reject accounts without one.
    signIn: ({ user }) => Boolean(user.email),
  },
});

/** The signed-in user's id, or null. Every guard and route handler goes through this. */
export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
