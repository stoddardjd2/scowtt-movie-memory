"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Spinner } from "@/components/Spinner";
import { styles } from "@/components/styles";
import { MovieTitleField } from "./MovieTitleField";
import { saveErrorMessage } from "./saveErrorMessage";
import { useUpdateMovie } from "./useUpdateMovie";

export function OnboardingForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const saveMovie = useUpdateMovie();
  const isBusy = saveMovie.isPending || saveMovie.isSuccess;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMovie.mutate(title, { onSuccess: () => router.replace("/dashboard") });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MovieTitleField
        id="onboarding-movie"
        value={title}
        onChange={setTitle}
        error={saveErrorMessage(saveMovie.error)}
        disabled={isBusy}
      />
      <button type="submit" disabled={isBusy || !title.trim()} className={styles.primaryButtonLarge}>
        {isBusy && <Spinner />}
        {isBusy ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
