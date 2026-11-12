"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import type { Fact } from "@/contracts/fact";
import type { Profile } from "@/contracts/profile";
import { FavoriteMovieEditor } from "@/features/movie/FavoriteMovieEditor";
import { MovieFactCard, type FactState } from "@/features/movie/MovieFactCard";
import { saveErrorMessage } from "@/features/movie/saveErrorMessage";
import { useFact, useGetFact } from "@/features/movie/useFact";
import { useProfile } from "@/features/movie/useProfile";
import { useUpdateMovie } from "@/features/movie/useUpdateMovie";
import { ProfileSummary } from "@/features/profile/ProfileSummary";

function toFactState(query: UseQueryResult<Fact>, isSavingMovie: boolean): FactState {
  // While a save is pending the server still has the old movie, so show a loading state, not a stale fact.
  if (isSavingMovie) return { status: "loading" };
  if (query.isError) return { status: "error", message: query.error.message };
  if (query.data) return { status: "success", fact: query.data, isRefreshing: query.isFetching };
  return { status: "loading" };
}

/** The interactive part of the dashboard. Owns all server state; children only render it. */
export function DashboardClient({ initialProfile }: { initialProfile: Profile }) {
  const { data: profile } = useProfile(initialProfile);
  const saveMovie = useUpdateMovie();
  const movieTitle = profile.favoriteMovie ?? "";
  const factQuery = useFact(profile.id, movieTitle, { paused: saveMovie.isPending });
  const getFact = useGetFact(profile.id, movieTitle);

  async function handleSave(title: string) {
    await saveMovie.mutateAsync(title);
  }

  return (
    <div className="space-y-6">
      <ProfileSummary name={profile.name} email={profile.email} photoUrl={profile.photoUrl} />
      <FavoriteMovieEditor
        savedTitle={movieTitle}
        isSaving={saveMovie.isPending}
        error={saveErrorMessage(saveMovie.error)}
        onSave={handleSave}
      />
      <MovieFactCard
        movieTitle={movieTitle}
        state={toFactState(factQuery, saveMovie.isPending)}
        onGetFact={getFact}
        onNewFact={() => void factQuery.refetch()}
      />
    </div>
  );
}
