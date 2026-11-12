import { describe, expect, it } from "vitest";
import { MOVIE_TITLE_MAX, movieInputSchema } from "@/contracts/movie";

describe("movieInputSchema", () => {
  it("trims surrounding whitespace", () => {
    expect(movieInputSchema.parse({ title: "  Arrival  " })).toEqual({ title: "Arrival" });
  });

  it("rejects an empty or whitespace-only title", () => {
    expect(movieInputSchema.safeParse({ title: "" }).success).toBe(false);
    expect(movieInputSchema.safeParse({ title: "   " }).success).toBe(false);
  });

  it("enforces the maximum length after trimming", () => {
    expect(movieInputSchema.safeParse({ title: "a".repeat(MOVIE_TITLE_MAX) }).success).toBe(true);
    expect(movieInputSchema.safeParse({ title: "a".repeat(MOVIE_TITLE_MAX + 1) }).success).toBe(false);
    expect(movieInputSchema.safeParse({ title: ` ${"a".repeat(MOVIE_TITLE_MAX)} ` }).success).toBe(true);
  });

  it("rejects a missing or non-string title", () => {
    expect(movieInputSchema.safeParse({}).success).toBe(false);
    expect(movieInputSchema.safeParse({ title: 42 }).success).toBe(false);
  });
});
