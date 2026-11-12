import "server-only";
import { NextResponse } from "next/server";
import type { ApiErrorBody, ApiErrorCode } from "@/contracts/error";
import { getSessionUserId } from "./auth";

export function jsonError(
  status: number,
  code: ApiErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>,
) {
  const body: ApiErrorBody = { error: { code, message, fieldErrors } };
  return NextResponse.json(body, { status });
}

type AuthedHandler = (userId: string, request: Request) => Promise<Response>;

/**
 * Wraps a route handler so it only runs for a signed-in user.
 * The user id always comes from the server session, never from the request.
 */
export function withUser(handler: AuthedHandler) {
  return async (request: Request) => {
    const userId = await getSessionUserId();
    if (!userId) return jsonError(401, "UNAUTHORIZED", "Please sign in again.");

    try {
      return await handler(userId, request);
    } catch (error) {
      console.error("Unhandled API error", error);
      return jsonError(500, "INTERNAL", "Something went wrong. Please try again.");
    }
  };
}
