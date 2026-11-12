"use client";

import { useState } from "react";

type Props = {
  name: string | null;
  email: string;
  photoUrl: string | null;
  size: number;
};

export function getInitials(name: string | null, email: string): string {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (words.length === 0) return email.charAt(0).toUpperCase();

  const first = words[0]!.charAt(0);
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : "";
  return (first + last).toUpperCase();
}

/** Google photo, or initials when there is no photo or it fails to load. */
export function Avatar({ name, email, photoUrl, size }: Props) {
  const [failed, setFailed] = useState(false);

  if (photoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- small remote avatar; next/image adds config for no benefit
      <img
        src={photoUrl}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      data-testid="avatar-initials"
      className="grid shrink-0 place-items-center rounded-full bg-zinc-200 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {getInitials(name, email)}
    </span>
  );
}
