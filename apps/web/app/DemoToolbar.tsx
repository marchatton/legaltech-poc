"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { DEMO_PACK_ALLOWLIST, type DemoPackId } from "../lib/demoPackAllowlist";

import { Button } from "./ui/Button";
import { Select } from "./ui/Input";
import { ThemeToggle } from "./ui/ThemeToggle";

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export function DemoToolbar() {
  const router = useRouter();
  const [packId, setPackId] = useState<DemoPackId>(DEMO_PACK_ALLOWLIST[0]);
  const [state, setState] = useState<LoadState>({ kind: "idle" });

  async function loadPack() {
    setState({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch("/demo/load-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: packId }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    if (!res.ok) {
      const json: unknown = await res.json().catch(() => null);
      const env = isRecord(json) && isRecord(json.error) ? json.error : null;
      const code = env && typeof env.code === "string" ? env.code : "UNKNOWN_ERROR";
      const message = env && typeof env.message === "string" ? env.message : `Request failed (${res.status})`;
      setState({ kind: "error", message: `${code}: ${message}` });
      return;
    }

    const json: unknown = await res.json().catch(() => null);
    const folder = isRecord(json) && isRecord(json.folder) ? json.folder : null;
    const folderId = folder && typeof folder.id === "string" ? folder.id : null;
    if (!folderId) {
      setState({ kind: "error", message: "Missing folder.id in response." });
      return;
    }

    // Re-enable the toolbar for subsequent loads (e.g. switching packs).
    setState({ kind: "idle" });
    router.push(`/matters/${encodeURIComponent(folderId)}`);
  }

  return (
    <section className="sticky top-0 z-50 h-12 border-b border-border bg-card/95 text-foreground backdrop-blur">
      <div className="flex h-full w-full items-center gap-3 px-4 lg:px-6">
        <span className="rounded-ui-sm border border-orange-400/40 bg-orange-500/15 px-2 py-0.5 font-mono text-2xs font-semibold uppercase tracking-widest text-orange-600 dark:text-orange-300">
          DEMO MODE
        </span>
        <span className="text-sm font-medium text-muted-foreground">Operator Controls</span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Allowlisted packs</span>
          <Select
            className="min-w-52 border-border bg-background text-foreground"
            uiSize="sm"
            value={packId}
            onChange={(e) => setPackId(e.currentTarget.value as DemoPackId)}
            disabled={state.kind === "loading"}
            aria-label="Allowlisted demo pack"
          >
            {DEMO_PACK_ALLOWLIST.map((packIdOption) => (
              <option key={packIdOption} value={packIdOption}>
                {packIdOption}
              </option>
            ))}
          </Select>
          <Button size="sm" variant="primary" onClick={loadPack} loading={state.kind === "loading"}>
            Load Demo Pack
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {state.kind === "error" ? (
        <div className="border-t border-border px-4 py-1 text-xs font-medium text-destructive lg:px-6">{state.message}</div>
      ) : null}
    </section>
  );
}
