"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Spinner } from "@/components/Spinner";
import { styles } from "@/components/styles";
import { MovieTitleField } from "./MovieTitleField";

type Props = {
  savedTitle: string;
  isSaving: boolean;
  error: string | null;
  onSave: (title: string) => Promise<void>;
};

/**
 * Inline editor for the favorite movie. It owns only the edit mode and the draft;
 * the saved title and the save itself belong to the parent.
 */
export function FavoriteMovieEditor({ savedTitle, isSaving, error, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const hasOpened = useRef(false);

  useEffect(() => {
    if (isEditing) {
      hasOpened.current = true;
      inputRef.current?.focus();
    } else if (hasOpened.current) {
      editButtonRef.current?.focus();
    }
  }, [isEditing]);

  function startEditing() {
    setDraft(savedTitle);
    setSaveFailed(false);
    setJustSaved(false);
    setIsEditing(true);
  }

  function cancel() {
    setIsEditing(false);
    setDraft("");
    setSaveFailed(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveFailed(false);
    try {
      await onSave(draft);
      setIsEditing(false);
      setJustSaved(true);
    } catch {
      setSaveFailed(true);
    }
  }

  const status = isSaving ? "Saving…" : justSaved ? "Saved." : "";

  return (
    <section className={styles.card}>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <MovieTitleField
            ref={inputRef}
            id="favorite-movie"
            value={draft}
            onChange={setDraft}
            error={saveFailed ? error : null}
            disabled={isSaving}
          />
          <div className="flex gap-2">
            <button type="submit" disabled={isSaving || !draft.trim()} className={styles.primaryButton}>
              {isSaving && <Spinner />}
              {isSaving ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={cancel} disabled={isSaving} className={styles.ghostButton}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <p className={styles.muted}>Favorite movie</p>
            <button ref={editButtonRef} type="button" onClick={startEditing} className={styles.linkButton}>
              Edit
            </button>
          </div>
          <p className={`mt-1 text-2xl break-words ${styles.heading}`}>{savedTitle}</p>
        </>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
    </section>
  );
}
