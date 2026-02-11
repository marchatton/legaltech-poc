"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "../../ui/Button";
import { InlineStatus, type InlineStatusKind } from "../../ui/InlineStatus";

type Props = {
  href: string;
  filename: string;
};

type DownloadState =
  | { kind: "idle" }
  | { kind: "loading"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

type FreshnessState =
  | { kind: "fresh"; hint: string }
  | { kind: "stale"; hint: string };

function parseFreshnessState(href: string): FreshnessState {
  const base = typeof window === "undefined" ? "http://localhost" : window.location.origin;

  try {
    const url = new URL(href, base);
    const expiresAtMs = Number(url.searchParams.get("expires"));
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
      return { kind: "fresh", hint: "Freshness unknown. Refresh this page if download fails." };
    }

    const msRemaining = expiresAtMs - Date.now();
    if (msRemaining <= 0) {
      return { kind: "stale", hint: "Download link is stale. Refresh this page for a fresh link." };
    }

    const minutesRemaining = Math.max(1, Math.ceil(msRemaining / 60_000));
    return {
      kind: "fresh",
      hint: `Signed link fresh for about ${minutesRemaining} minute${minutesRemaining === 1 ? "" : "s"}.`,
    };
  } catch {
    return { kind: "fresh", hint: "Freshness unknown. Refresh this page if download fails." };
  }
}

export function ArtefactDownloadButton(props: Props) {
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<DownloadState>({ kind: "idle" });

  useEffect(
    () => () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    [],
  );

  function resetSoon() {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setState({ kind: "idle" }), 8000);
  }

  async function run() {
    setState({ kind: "loading", message: "Preparing download..." });
    // Keep pending state visible long enough to be perceived before the browser handles the download.
    await new Promise<void>((resolve) => window.setTimeout(() => resolve(), 300));

    const freshness = parseFreshnessState(props.href);
    if (freshness.kind === "stale") {
      setState({ kind: "error", message: freshness.hint });
      resetSoon();
      return;
    }

    const a = document.createElement("a");
    a.href = props.href;
    a.download = props.filename;
    a.click();

    setState({ kind: "success", message: `Download started. ${freshness.hint}` });
    resetSoon();
  }

  const inlineKind: InlineStatusKind =
    state.kind === "loading"
      ? "loading"
      : state.kind === "success"
        ? "success"
        : state.kind === "error"
          ? "error"
          : "idle";

  return (
    <div className="grid justify-items-end gap-1">
      <Button
        variant="secondary"
        size="sm"
        onClick={run}
        loading={state.kind === "loading"}
        loadingLabel="Preparing..."
        aria-label={`Download ${props.filename}`}
      >
        Download
      </Button>
      <InlineStatus kind={inlineKind} className="max-w-56 text-right">
        {state.kind === "idle" ? null : state.message}
      </InlineStatus>
    </div>
  );
}
