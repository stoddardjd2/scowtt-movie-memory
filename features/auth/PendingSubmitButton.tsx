"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/Spinner";

type Props = {
  className: string;
  icon?: ReactNode;
  pendingLabel: string;
  children: ReactNode;
};

/** Submit button for a server-action form that shows a spinner while the action runs. */
export function PendingSubmitButton({ className, icon, pendingLabel, children }: Props) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? <Spinner /> : icon}
      {pending ? pendingLabel : children}
    </button>
  );
}
