import { useQuery } from "@tanstack/react-query";
import type { Profile } from "@/contracts/profile";
import { api } from "@/lib/api";
import { queryKeys } from "./queryKeys";

/**
 * The browser's copy of the saved profile. The server page supplies the first value,
 * and after that it only changes through useUpdateMovie, so it never needs a background refetch.
 */
export function useProfile(initialProfile: Profile) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: api.getMe,
    initialData: initialProfile,
    staleTime: Infinity,
  });
}
