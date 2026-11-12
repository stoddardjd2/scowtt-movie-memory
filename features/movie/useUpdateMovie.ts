import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/contracts/profile";
import { api } from "@/lib/api";
import { queryKeys } from "./queryKeys";

/**
 * Saves the favorite movie with an optimistic update.
 *
 * - Before the request: show the new title right away and remember the old profile.
 * - On failure: put the old profile back. The old movie's fact is still cached, so it reappears.
 * - On success: trust the server's title and drop cached facts for any other movie.
 *
 * While the save is pending the dashboard pauses the fact query, because the server
 * would still generate a fact for the old movie.
 */
export function useUpdateMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => api.updateMovie(title),

    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.me });
      const previous = queryClient.getQueryData<Profile>(queryKeys.me);
      if (previous) {
        queryClient.setQueryData<Profile>(queryKeys.me, { ...previous, favoriteMovie: title.trim() });
      }
      return { previous };
    },

    onError: (_error, _title, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.me, context.previous);
    },

    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.me, profile);
      queryClient.removeQueries({
        queryKey: queryKeys.facts(profile.id),
        predicate: (query) => query.queryKey[2] !== profile.favoriteMovie,
      });
    },
  });
}
