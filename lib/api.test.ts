import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "./api";

function mockFetch(response: Response | Error) {
  const fetchMock =
    response instanceof Error ? vi.fn().mockRejectedValue(response) : vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function caught(promise: Promise<unknown>): Promise<ApiError> {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

const profile = { id: "u1", name: "Ada", email: "ada@example.com", photoUrl: null, favoriteMovie: "Alien" };

afterEach(() => vi.unstubAllGlobals());

describe("api client", () => {
  it("parses a successful response", async () => {
    mockFetch(json(profile));
    await expect(api.getMe()).resolves.toEqual(profile);
  });

  it("sends the movie as JSON with PUT", async () => {
    const fetchMock = mockFetch(json(profile));
    await api.updateMovie("Alien");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/me/movie",
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ title: "Alien" }) }),
    );
  });

  it("turns a 401 JSON error into an unauthorized error with the server message", async () => {
    mockFetch(json({ error: { code: "UNAUTHORIZED", message: "Please sign in again." } }, 401));
    const error = await caught(api.getMe());
    expect(error.kind).toBe("unauthorized");
    expect(error.status).toBe(401);
    expect(error.message).toBe("Please sign in again.");
  });

  it("turns a 500 with a non-JSON body into a server error without crashing", async () => {
    mockFetch(new Response("<html>Internal Server Error</html>", { status: 500 }));
    const error = await caught(api.getFact());
    expect(error.kind).toBe("server");
    expect(error.status).toBe(500);
    expect(error.message).toBe("Something went wrong. Please try again.");
  });

  it("keeps field errors from a 400 validation error", async () => {
    mockFetch(
      json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Please check the movie title.",
            fieldErrors: { title: ["Enter a movie title."] },
          },
        },
        400,
      ),
    );
    const error = await caught(api.updateMovie("   "));
    expect(error.kind).toBe("validation");
    expect(error.fieldErrors.title).toEqual(["Enter a movie title."]);
  });

  it("rejects a 2xx response that doesn't match the contract", async () => {
    mockFetch(json({ id: "f1", content: "no movie title or date" }));
    const error = await caught(api.getFact());
    expect(error.kind).toBe("invalid_response");
  });

  it("reports a network failure", async () => {
    mockFetch(new TypeError("Failed to fetch"));
    const error = await caught(api.getMe());
    expect(error.kind).toBe("network");
    expect(error.status).toBeNull();
  });
});
