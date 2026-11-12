import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { styles } from "@/components/styles";
import { SignOutButton } from "@/features/auth/AuthButtons";
import { DashboardClient } from "@/features/dashboard/DashboardClient";
import { getCurrentProfile } from "@/server/session";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/");
  if (!profile.favoriteMovie) redirect("/onboarding");

  const firstName = profile.name?.split(" ")[0];

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-600 sm:inline dark:text-zinc-400">{profile.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-6 py-12">
        <div className="space-y-2">
          <h1 className={`text-3xl ${styles.heading}`}>Welcome{firstName ? `, ${firstName}` : ""}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">You&apos;re signed in with Google.</p>
        </div>
        <DashboardClient initialProfile={profile} />
      </main>
    </div>
  );
}
