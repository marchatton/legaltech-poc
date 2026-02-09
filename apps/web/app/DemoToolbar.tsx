"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "./ui/Button";
import { Select } from "./ui/Input";

const PACK_OPTIONS = [
  { id: "pack_01_clean", label: "pack_01_clean" },
  { id: "pack_02_missing_rea", label: "pack_02_missing_rea" },
] as const;

type PackId = (typeof PACK_OPTIONS)[number]["id"];

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export function DemoToolbar() {
  const router = useRouter();
  const [packId, setPackId] = useState<PackId>("pack_01_clean");
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
    <section className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-end gap-3 p-3">
        <div className="text-xs font-semibold tracking-wide text-muted-foreground">DEMO MODE</div>

        <label className="grid gap-1 text-xs">
          <span className="text-muted-foreground">Pack</span>
          <Select
            className="min-w-56"
            uiSize="sm"
            value={packId}
            onChange={(e) => setPackId(e.currentTarget.value as PackId)}
            disabled={state.kind === "loading"}
          >
            {PACK_OPTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </label>

        <Button
          size="sm"
          onClick={loadPack}
          disabled={state.kind === "loading"}
        >
          {state.kind === "loading" ? "Loading…" : "Load demo pack"}
        </Button>

        {state.kind === "error" ? <div className="text-xs font-medium text-destructive">{state.message}</div> : null}
      </div>
    </section>
  );
}
