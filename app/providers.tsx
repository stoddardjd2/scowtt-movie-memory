"use client";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState, type ReactNode } from "react";
import { isApiError } from "@/lib/api";

const CACHE_TIME = 5 * 60_000;

function redirectIfSignedOut(error: unknown) {
  if (isApiError(error) && error.kind === "unauthorized") {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a full reload discards all client state from the expired session
    window.location.assign("/");
  }
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: redirectIfSignedOut }),
    mutationCache: new MutationCache({ onError: redirectIfSignedOut }),
    defaultOptions: {
      queries: { gcTime: CACHE_TIME, refetchOnWindowFocus: false },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  // Facts survive a page reload in this tab, so the 30-second reuse window holds across visits.
  // On the server there is no sessionStorage and the persister is a no-op.
  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window === "undefined" ? undefined : window.sessionStorage,
      key: "movie-memory-cache",
    }),
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: CACHE_TIME,
        dehydrateOptions: {
          // The profile always comes fresh from the server; only facts are worth keeping.
          shouldDehydrateQuery: (query) =>
            query.queryKey[0] === "fact" && query.state.status === "success",
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
