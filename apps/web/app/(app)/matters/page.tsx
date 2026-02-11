import Link from "next/link";

import { assertDevOrDemoProd } from "../../../lib/devOnly";
import { isDemoModeEnabled } from "../../../lib/demoMode.server";
import { formatDemoLoadedAtLabel, parseDemoMatterMetadata } from "../../../lib/demoMatterMetadata";
import { listMatters, parseMatterListFilters, type MatterListFilters, type MatterSavedView } from "../../../lib/mattersList.server";

import { Badge, type BadgeVariant } from "../../ui/Badge";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input, Select } from "../../ui/Input";
import { MonoId } from "../../ui/MonoId";
import { Page, PageHeader, PageSection } from "../../ui/Page";

import { CreateMatterForm } from "./CreateMatterForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchParamRecord = Record<string, string | string[] | undefined>;

type SavedViewOption = {
  label: string;
  value: MatterSavedView;
};

const SAVED_VIEW_OPTIONS: SavedViewOption[] = [
  { label: "Active", value: "active" },
  { label: "Needs Attention", value: "needs_attention" },
  { label: "Demo Packs", value: "demo_packs" },
];

const STATE_OPTIONS = ["empty", "ingesting", "indexed", "ready", "failed"] as const;

function buildQueryString(filters: MatterListFilters): string {
  const params = new URLSearchParams();
  if (filters.q.trim().length > 0) params.set("q", filters.q.trim());
  if (filters.state) params.set("state", filters.state);
  if (filters.view) params.set("view", filters.view);
  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : "";
}

function statusForState(state: string): { label: string; variant: BadgeVariant } {
  if (state === "ready" || state === "indexed") {
    return { label: "Active", variant: "success" };
  }

  if (state === "failed") {
    return { label: "Needs Attention", variant: "destructive" };
  }

  return { label: "Needs Attention", variant: "warning" };
}

function formatTimestamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toISOString().slice(0, 16).replace("T", " ");
}

export default async function MattersPage(props: {
  searchParams?: Promise<SearchParamRecord>;
}) {
  assertDevOrDemoProd();

  const rawSearchParams = (await props.searchParams) ?? {};
  const filters = parseMatterListFilters(rawSearchParams);
  const matters = await listMatters(filters);
  const demoModeEnabled = isDemoModeEnabled();
  const demoHistory = demoModeEnabled
    ? (await listMatters({ q: "", state: null, view: "demo_packs" })).slice(0, 8)
    : [];

  return (
    <Page width="lg">
      <PageHeader title="Matters" subtitle="Search, filter, create, and open matters quickly." right={<CreateMatterForm />} />

      <PageSection>
        <Card className="p-4">
          <div className="grid gap-4">
            <form method="get" className="flex flex-wrap items-end gap-3">
              <label className="grid min-w-64 flex-1 gap-1 text-sm">
                <span className="text-muted-foreground">Search</span>
                <Input
                  name="q"
                  defaultValue={filters.q}
                  placeholder="Search by matter name or ID"
                  aria-label="Search matters"
                />
              </label>

              <label className="grid min-w-48 gap-1 text-sm">
                <span className="text-muted-foreground">State</span>
                <Select name="state" defaultValue={filters.state ?? ""} aria-label="Filter matters by state">
                  <option value="">All states</option>
                  {STATE_OPTIONS.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </Select>
              </label>

              <input type="hidden" name="view" value={filters.view ?? ""} />

              <Button type="submit" variant="secondary">
                Apply
              </Button>

              <Link
                href="/matters"
                className="inline-flex h-9 items-center rounded-ui-md border border-border px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Clear
              </Link>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Saved views</span>
              {SAVED_VIEW_OPTIONS.map((option) => {
                const isActive = filters.view === option.value;
                const nextView = isActive ? null : option.value;
                const href = `/matters${buildQueryString({ ...filters, view: nextView })}`;
                return (
                  <Link
                    key={option.value}
                    href={href}
                    aria-pressed={isActive}
                    className={
                      isActive
                        ? "rounded-full border border-primary bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                        : "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                    }
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </Card>
      </PageSection>

      <PageSection>
        <div className={demoModeEnabled ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]" : ""}>
          <Card className="overflow-hidden">
            {matters.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No matters matched the current filters.
                <Link href="/matters" className="ml-2 font-medium underline hover:text-foreground">
                  Reset filters
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Matter</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">State</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {matters.map((matter) => {
                      const status = statusForState(matter.state);
                      return (
                        <tr key={matter.id} className="bg-card hover:bg-muted/30">
                          <td className="px-4 py-3 align-top">
                            <div className="text-sm font-medium text-foreground">{matter.name}</div>
                            <div className="mt-1">
                              <MonoId>{matter.id}</MonoId>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <Badge variant="muted">{matter.state}</Badge>
                          </td>
                          <td className="px-4 py-3 align-top text-sm text-muted-foreground">{formatTimestamp(matter.created_at)}</td>
                          <td className="px-4 py-3 align-top text-right">
                            <Link
                              href={`/matters/${encodeURIComponent(matter.id)}`}
                              className="inline-flex items-center rounded-ui-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                            >
                              Open
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {demoModeEnabled ? (
            <Card className="h-fit overflow-hidden">
              <div className="border-b border-border bg-muted/40 px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">Recent Demo Matters</h2>
                <p className="mt-1 text-xs text-muted-foreground">Reopen the latest demo contexts without reloading fixtures.</p>
              </div>

              {demoHistory.length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">No demo history yet.</div>
              ) : (
                <ul className="divide-y divide-border">
                  {demoHistory.map((matter) => {
                    const metadata = parseDemoMatterMetadata(matter.name);
                    const packLabel = metadata?.packId ?? "pack not detected";
                    const loadedAtLabel = formatDemoLoadedAtLabel(metadata?.loadedAt ?? matter.created_at);
                    return (
                      <li key={`demo-history-${matter.id}`} className="grid gap-2 px-4 py-3">
                        <div className="text-sm font-medium text-foreground">{matter.name}</div>
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">{packLabel}</span>
                          <span className="font-mono">{loadedAtLabel}</span>
                        </div>
                        <div className="flex justify-end">
                          <Link
                            href={`/matters/${encodeURIComponent(matter.id)}`}
                            className="inline-flex items-center rounded-ui-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                          >
                            Reopen
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          ) : null}
        </div>
      </PageSection>
    </Page>
  );
}
