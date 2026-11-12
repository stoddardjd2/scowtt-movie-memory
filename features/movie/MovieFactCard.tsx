import { useState } from "react";
import { Spinner } from "@/components/Spinner";
import { styles } from "@/components/styles";
import type { Fact } from "@/contracts/fact";

export type FactState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; fact: Fact; isRefreshing: boolean };

type Props = {
  movieTitle: string;
  state: FactState;
  /** Reuses a fact younger than 30 seconds. */
  onGetFact: () => void;
  /** Always generates a new fact. */
  onNewFact: () => void;
};

export function MovieFactCard({ movieTitle, state, onGetFact, onNewFact }: Props) {
  const [lastClicked, setLastClicked] = useState<"get" | "new">("new");
  const isRefreshing = state.status === "success" && state.isRefreshing;

  function factButton(kind: "get" | "new", label: string, onClick: () => void, className: string) {
    const showSpinner = isRefreshing && lastClicked === kind;
    return (
      <button
        type="button"
        onClick={() => {
          setLastClicked(kind);
          onClick();
        }}
        disabled={isRefreshing}
        className={className}
      >
        {showSpinner && <Spinner />}
        {showSpinner ? "Generating…" : label}
      </button>
    );
  }

  return (
    <section
      aria-labelledby="fact-heading"
      aria-busy={state.status === "loading" || isRefreshing}
      className={`space-y-4 ${styles.card}`}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="fact-heading" className={styles.muted}>
          Fun fact about <span className="font-medium text-zinc-950 dark:text-zinc-50">{movieTitle}</span>
        </h2>
        {state.status === "success" && (
          <div className="flex gap-2">
            {factButton("get", "Get fact", onGetFact, styles.outlineButton)}
            {factButton("new", "New fact", onNewFact, styles.primaryButton)}
          </div>
        )}
      </div>

      {state.status === "loading" && (
        <div className={`h-14 ${styles.skeleton}`}>
          <span className="sr-only">Finding a fun fact…</span>
        </div>
      )}

      {state.status === "error" && (
        <div className="flex items-center justify-between gap-4">
          <p role="alert" className={styles.error}>
            {state.message}
          </p>
          <button type="button" onClick={onNewFact} className={styles.outlineButton}>
            Retry
          </button>
        </div>
      )}

      {state.status === "success" && (
        <div className="space-y-1">
          <p className="text-lg text-zinc-950 dark:text-zinc-50">{state.fact.content}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            About {state.fact.movieTitle} · Generated at {new Date(state.fact.createdAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </section>
  );
}
