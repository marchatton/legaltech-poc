import type { ReactNode } from "react";

import Link from "next/link";

const PLACEHOLDER_DESTINATIONS = ["Runs", "Alerts", "Settings"] as const;

export default function MattersLayout(props: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-6 py-3 sm:px-8">
          <nav aria-label="Primary destinations" className="flex flex-wrap items-center gap-2">
            <Link
              href="/matters"
              aria-current="page"
              className="rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
            >
              Matters
            </Link>

            {PLACEHOLDER_DESTINATIONS.map((label) => (
              <button
                key={label}
                type="button"
                disabled
                className="cursor-not-allowed rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground/80"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {props.children}
    </div>
  );
}
