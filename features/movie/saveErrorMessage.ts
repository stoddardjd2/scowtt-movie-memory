import { isApiError } from "@/lib/api";

/** The message to show next to the movie field after a failed save. */
export function saveErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (isApiError(error)) return error.fieldErrors.title?.[0] ?? error.message;
  return "Something went wrong. Please try again.";
}
