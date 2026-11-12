// Shared Tailwind class lists so every page uses the same zinc theme.

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-white dark:focus-visible:ring-offset-zinc-950";

const primary = `inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 ${focusRing}`;

export const styles = {
  card: "rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800",
  panel:
    "rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
  skeleton: "animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900",

  heading: "font-semibold tracking-tight text-zinc-950 dark:text-zinc-50",
  muted: "text-sm text-zinc-500 dark:text-zinc-400",
  error: "text-sm text-red-600 dark:text-red-400",

  input:
    "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 shadow-sm transition outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:opacity-70 aria-invalid:border-red-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-300 dark:focus:ring-white/10 dark:aria-invalid:border-red-700",

  primaryButton: `h-9 px-3 ${primary}`,
  primaryButtonLarge: `h-11 w-full px-4 ${primary}`,
  outlineButton: `inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 ${focusRing}`,
  ghostButton: `inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-zinc-600 transition hover:text-zinc-950 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-50 ${focusRing}`,
  linkButton:
    "text-sm font-medium text-zinc-600 underline hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-50",
};
