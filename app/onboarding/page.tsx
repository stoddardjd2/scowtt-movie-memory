import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { styles } from "@/components/styles";
import { SignOutButton } from "@/features/auth/AuthButtons";
import { OnboardingForm } from "@/features/movie/OnboardingForm";
import { getCurrentProfile } from "@/server/session";

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/");
  if (profile.favoriteMovie) redirect("/dashboard");

  const firstName = profile.name?.split(" ")[0];

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Logo />
        <SignOutButton />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <div className={`w-full max-w-sm ${styles.panel}`}>
          <div className="mb-6 space-y-1.5">
            <h1 className={`text-xl ${styles.heading}`}>Welcome{firstName ? `, ${firstName}` : ""}</h1>
            <p className={styles.muted}>
              One quick question before you start: what&apos;s your favorite movie?
            </p>
          </div>
          <OnboardingForm />
        </div>
      </main>
    </div>
  );
}
