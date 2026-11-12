import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export const FACT_FRESH_MS = 30_000;

function factQuery(userId: string, movieTitle: string) {
  return queryOptions({
    queryKey: queryKeys.fact(userId, movieTitle),
    queryFn: api.getFact,
    staleTime: FACT_FRESH_MS,
    retry: false,
  });
}

/**
 * The fact for one user + movie.
 *
 * Generating a fact costs an OpenAI call, so a fact stays fresh for 30 seconds and a revisit
 * in that window reuses it. Retries and focus refetches are off so nothing generates facts
 * the user didn't ask for.
 */
export function useFact(userId: string, movieTitle: string, { paused }: { paused: boolean }) {
  return useQuery({
    ...factQuery(userId, movieTitle),
    enabled: Boolean(movieTitle) && !paused,
    refetchOnWindowFocus: false,
  });
}

/**
 * "Get fact": reuses the cached fact while it's younger than 30 seconds, otherwise generates one.
 * "New fact" is the query's own `refetch()`, which ignores freshness.
 */
export function useGetFact(userId: string, movieTitle: string) {
  const queryClient = useQueryClient();
  return () => {
    // A failure is already stored on the query and shown by the card.
    queryClient.fetchQuery(factQuery(userId, movieTitle)).catch(() => {});
  };
}
