import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
      <span className="grid size-8 place-items-center rounded-lg bg-zinc-950 text-sm text-white dark:bg-white dark:text-zinc-950">
        M
      </span>
      <span className="text-zinc-950 dark:text-zinc-50">Movie Memory</span>
    </Link>
  );
}
