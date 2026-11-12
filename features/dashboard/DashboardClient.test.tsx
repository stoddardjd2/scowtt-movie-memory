import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Fact } from "@/contracts/fact";
import type { Profile } from "@/contracts/profile";
import { api, ApiError } from "@/lib/api";
import { DashboardClient } from "./DashboardClient";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return { ...actual, api: { getMe: vi.fn(), updateMovie: vi.fn(), getFact: vi.fn() } };
});

const mockedApi = vi.mocked(api);

const alienProfile: Profile = {
  id: "user-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  photoUrl: null,
  favoriteMovie: "Alien",
};
const arrivalProfile: Profile = { ...alienProfile, favoriteMovie: "Arrival" };

function fact(movieTitle: string, content: string): Fact {
  return { id: content, movieTitle, content, createdAt: new Date().toISOString() };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function renderDashboard(queryClient = new QueryClient()) {
  const view = render(
    <QueryClientProvider client={queryClient}>
      <DashboardClient initialProfile={alienProfile} />
    </QueryClientProvider>,
  );
  return { ...view, queryClient };
}

async function editTitleTo(title: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Edit" }));
  const input = screen.getByLabelText("Favorite movie");
  await user.clear(input);
  await user.type(input, title);
  return user;
}

const factHeading = () => screen.getByRole("heading", { name: /fun fact about/i });

beforeEach(() => {
  mockedApi.getFact.mockResolvedValue(fact("Alien", "Alien fact"));
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("DashboardClient movie edit flow", () => {
  it("shows the profile, saved movie, and its fact", async () => {
    renderDashboard();
    expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByText("Alien", { selector: "p" })).toBeInTheDocument();
    expect(await screen.findByText("Alien fact")).toBeInTheDocument();
  });

  it("shows the new title optimistically, then rolls back and keeps the draft when the save fails", async () => {
    renderDashboard();
    await screen.findByText("Alien fact");

    const save = deferred<Profile>();
    mockedApi.updateMovie.mockReturnValue(save.promise);

    const user = await editTitleTo("Arrival");
    await user.click(screen.getByRole("button", { name: "Save" }));

    // Pending: the new title shows immediately, the old fact is hidden, and no fact is requested.
    expect(factHeading()).toHaveTextContent("Arrival");
    expect(screen.queryByText("Alien fact")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Saving…");
    expect(mockedApi.updateMovie).toHaveBeenCalledWith("Arrival");
    expect(mockedApi.getFact).toHaveBeenCalledTimes(1);

    save.reject(new ApiError("server", "Couldn't save your movie.", { status: 500 }));

    // Rolled back: old title and its cached fact are back, with no new fact request.
    await waitFor(() => expect(factHeading()).toHaveTextContent("Alien"));
    expect(await screen.findByText("Alien fact")).toBeInTheDocument();
    expect(mockedApi.getFact).toHaveBeenCalledTimes(1);

    // The draft is kept for a retry, with the error tied to the field.
    const input = screen.getByLabelText("Favorite movie");
    expect(input).toHaveValue("Arrival");
    expect(input).toHaveAccessibleDescription("Couldn't save your movie.");
  });

  it("shows a server validation message next to the field", async () => {
    renderDashboard();
    mockedApi.updateMovie.mockRejectedValue(
      new ApiError("validation", "Please check the movie title.", {
        status: 400,
        fieldErrors: { title: ["Keep it under 100 characters."] },
      }),
    );

    const user = await editTitleTo("Too long");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Keep it under 100 characters.")).toBeInTheDocument();
    expect(screen.getByLabelText("Favorite movie")).toHaveAttribute("aria-invalid", "true");
  });

  it("discards the draft on Cancel without sending a request", async () => {
    renderDashboard();
    const user = await editTitleTo("Arrival");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockedApi.updateMovie).not.toHaveBeenCalled();
    expect(screen.getByText("Alien", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText("Favorite movie")).toHaveValue("Alien");
  });

  it("replaces the old fact with a fact for the new movie after a successful save", async () => {
    const { queryClient } = renderDashboard();
    await screen.findByText("Alien fact");

    mockedApi.updateMovie.mockResolvedValue(arrivalProfile);
    mockedApi.getFact.mockResolvedValue(fact("Arrival", "Arrival fact"));

    const user = await editTitleTo("  Arrival  ");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Arrival fact")).toBeInTheDocument();
    expect(screen.queryByText("Alien fact")).not.toBeInTheDocument();
    expect(screen.getByText("Arrival", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toHaveFocus();
    expect(mockedApi.getFact).toHaveBeenCalledTimes(2);

    // The old movie's cached fact is gone, so a rollback later can't resurrect it.
    expect(queryClient.getQueryData(["fact", "user-1", "Alien"])).toBeUndefined();
  });

  it("ignores an old-movie fact that finishes generating after the new movie is saved", async () => {
    const { queryClient } = renderDashboard();
    await screen.findByText("Alien fact");

    // "New fact" starts generating an Alien fact that doesn't finish yet.
    const lateAlienFact = deferred<Fact>();
    mockedApi.getFact.mockReturnValueOnce(lateAlienFact.promise);
    await userEvent.setup().click(screen.getByRole("button", { name: "New fact" }));
    expect(mockedApi.getFact).toHaveBeenCalledTimes(2);

    // Meanwhile the user saves Arrival, and Arrival's fact arrives first.
    mockedApi.updateMovie.mockResolvedValue(arrivalProfile);
    mockedApi.getFact.mockResolvedValue(fact("Arrival", "Arrival fact"));
    const user = await editTitleTo("Arrival");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Arrival fact")).toBeInTheDocument();

    await act(async () => {
      lateAlienFact.resolve(fact("Alien", "Late Alien fact"));
      await lateAlienFact.promise;
    });

    expect(factHeading()).toHaveTextContent("Arrival");
    expect(screen.getByText("Arrival fact")).toBeInTheDocument();
    expect(screen.queryByText("Late Alien fact")).not.toBeInTheDocument();
    expect(queryClient.getQueryData(["fact", "user-1", "Alien"])).toBeUndefined();
  });
});

describe("DashboardClient fact cache", () => {
  it("reuses a fact younger than 30 seconds when the dashboard is revisited", async () => {
    const queryClient = new QueryClient();
    const first = renderDashboard(queryClient);
    await screen.findByText("Alien fact");
    first.unmount();

    renderDashboard(queryClient);
    expect(screen.getByText("Alien fact")).toBeInTheDocument();
    expect(mockedApi.getFact).toHaveBeenCalledTimes(1);
  });

  it("fetches a new fact on revisit once the cached one is older than 30 seconds", async () => {
    const queryClient = new QueryClient();
    const first = renderDashboard(queryClient);
    await screen.findByText("Alien fact");
    first.unmount();

    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now + 31_000);
    mockedApi.getFact.mockResolvedValue(fact("Alien", "Fresher Alien fact"));

    renderDashboard(queryClient);
    expect(await screen.findByText("Fresher Alien fact")).toBeInTheDocument();
    expect(mockedApi.getFact).toHaveBeenCalledTimes(2);
    vi.restoreAllMocks();
  });

  it("'New fact' fetches a new fact even inside the 30-second window", async () => {
    renderDashboard();
    await screen.findByText("Alien fact");

    mockedApi.getFact.mockResolvedValue(fact("Alien", "Another Alien fact"));
    await userEvent.setup().click(screen.getByRole("button", { name: "New fact" }));

    expect(await screen.findByText("Another Alien fact")).toBeInTheDocument();
    expect(mockedApi.getFact).toHaveBeenCalledTimes(2);
  });

  it("'Get fact' reuses a fact younger than 30 seconds", async () => {
    renderDashboard();
    await screen.findByText("Alien fact");

    mockedApi.getFact.mockResolvedValue(fact("Alien", "Another Alien fact"));
    await userEvent.setup().click(screen.getByRole("button", { name: "Get fact" }));

    expect(screen.getByText("Alien fact")).toBeInTheDocument();
    expect(mockedApi.getFact).toHaveBeenCalledTimes(1);
  });

  it("'Get fact' fetches a new fact once the cached one is older than 30 seconds", async () => {
    renderDashboard();
    await screen.findByText("Alien fact");

    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now + 31_000);
    mockedApi.getFact.mockResolvedValue(fact("Alien", "Fresher Alien fact"));
    await userEvent.setup().click(screen.getByRole("button", { name: "Get fact" }));

    expect(await screen.findByText("Fresher Alien fact")).toBeInTheDocument();
    expect(mockedApi.getFact).toHaveBeenCalledTimes(2);
    vi.restoreAllMocks();
  });

  it("keeps a fact failure inside the card and retries on request", async () => {
    mockedApi.getFact.mockRejectedValueOnce(new ApiError("server", "We couldn't come up with a fact right now."));
    renderDashboard();

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't come up with a fact right now.");
    expect(mockedApi.getFact).toHaveBeenCalledTimes(1);

    await userEvent.setup().click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Alien fact")).toBeInTheDocument();
  });
});
