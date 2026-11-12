import type { Ref } from "react";
import { styles } from "@/components/styles";
import { MOVIE_TITLE_MAX } from "@/contracts/movie";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  label?: string;
  disabled?: boolean;
  ref?: Ref<HTMLInputElement>;
};

/** Labeled movie title input shared by onboarding and the dashboard editor. */
export function MovieTitleField({ id, value, onChange, error, label = "Favorite movie", disabled, ref }: Props) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        name="title"
        type="text"
        autoComplete="off"
        placeholder="e.g. Spirited Away"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={MOVIE_TITLE_MAX}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={styles.input}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
