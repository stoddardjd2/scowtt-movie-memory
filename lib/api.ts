import type { z } from "zod";
import { apiErrorSchema } from "@/contracts/error";
import { factSchema, type Fact } from "@/contracts/fact";
import type { MovieInput } from "@/contracts/movie";
import { profileSchema, type Profile } from "@/contracts/profile";

/**
 * What a component needs to decide what to show:
 * - unauthorized: session expired, send the user to sign in
 * - validation: the input was rejected, show fieldErrors next to the field
 * - server: temporary failure, offer a retry
 * - network: the request never reached the server
 * - invalid_response: the server answered with a shape we don't understand
 */
export type ApiErrorKind = "unauthorized" | "validation" | "server" | "network" | "invalid_response";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: { status?: number | null; fieldErrors?: Record<string, string[]> } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = options.status ?? null;
    this.fieldErrors = options.fieldErrors ?? {};
  }
}

function kindForStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 400 || status === 422) return "validation";
  return "server";
}

async function toApiError(response: Response): Promise<ApiError> {
  const kind = kindForStatus(response.status);
  const body = await response.json().catch(() => null);
  const parsed = apiErrorSchema.safeParse(body);

  if (parsed.success) {
    return new ApiError(kind, parsed.data.error.message, {
      status: response.status,
      fieldErrors: parsed.data.error.fieldErrors,
    });
  }

  const fallback =
    kind === "unauthorized" ? "Please sign in again." : "Something went wrong. Please try again.";
  return new ApiError(kind, fallback, { status: response.status });
}

async function request<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: "same-origin",
      headers: { Accept: "application/json", "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("network", "Can't reach the server. Check your connection.");
  }

  if (!response.ok) throw await toApiError(response);

  const body = await response.json().catch(() => undefined);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError("invalid_response", "The server sent an unexpected response.", {
      status: response.status,
    });
  }
  return parsed.data;
}

export const api = {
  getMe: (): Promise<Profile> => request("/api/me", profileSchema),

  updateMovie: (title: string): Promise<Profile> =>
    request("/api/me/movie", profileSchema, {
      method: "PUT",
      body: JSON.stringify({ title } satisfies MovieInput),
    }),

  getFact: (): Promise<Fact> => request("/api/fact", factSchema),
};

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
