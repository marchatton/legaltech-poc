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
    <section className="sticky top-0 z-50 border-b border-orange-400/40 bg-primary text-primary-foreground shadow-ui-sm">
      <div className="flex min-h-12 w-full items-center gap-3 px-4 lg:px-6">
        <span className="rounded-ui-sm bg-white/20 px-2 py-0.5 font-mono text-2xs font-semibold uppercase tracking-widest">
          Demo Mode
        </span>
        <span className="text-sm font-medium text-primary-foreground/90">Operator Controls</span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Select
            className="min-w-52 border-orange-200/40 bg-primary/20 text-primary-foreground ring-offset-primary [&>option]:text-foreground"
            uiSize="sm"
            value={packId}
            onChange={(e) => setPackId(e.currentTarget.value as PackId)}
            disabled={state.kind === "loading"}
            aria-label="Demo pack"
          >
            {PACK_OPTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
          <Button size="sm" variant="secondary" onClick={loadPack} loading={state.kind === "loading"} className="border-white/40 bg-white text-primary hover:bg-orange-50">
            Load Demo Pack
          </Button>
        </div>
      </div>

      {state.kind === "error" ? (
        <div className="border-t border-orange-300/50 px-4 py-1 text-xs font-medium text-orange-50 lg:px-6">{state.message}</div>
      ) : null}
    </section>
  );
}
