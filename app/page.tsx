import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { styles } from "@/components/styles";
import { SignInButton } from "@/features/auth/AuthButtons";
import { getCurrentProfile, homeFor } from "@/server/session";

export default async function LandingPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect(homeFor(profile));

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)]"
      />

      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className={styles.panel}>
          <div className="mb-6 space-y-1.5 text-center">
            <h1 className={`text-xl ${styles.heading}`}>Welcome</h1>
            <p className={styles.muted}>
              Save your favorite movie and get a fun fact about it whenever you visit.
            </p>
          </div>

          <SignInButton />

          <p className="mt-6 text-center text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            New here? Signing in with Google creates your account automatically.
          </p>
        </div>
      </div>
    </main>
  );
}
