import Link from "next/link";

import { assertDevOrDemoProd } from "../../../lib/devOnly";
import { isDemoModeEnabled } from "../../../lib/demoMode.server";
import { formatDemoLoadedAtLabel, parseDemoMatterMetadata } from "../../../lib/demoMatterMetadata";
import { listMatters, parseMatterListFilters, type MatterListFilters, type MatterSavedView } from "../../../lib/mattersList.server";

import { Badge, type BadgeVariant } from "../../ui/Badge";
import { buttonClassName } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { EmptyState } from "../../ui/EmptyState";
import { Input, Select } from "../../ui/Input";
import { MonoId } from "../../ui/MonoId";
import { StatusDot, type StatusDotStatus } from "../../ui/StatusDot";
import { TableFrame, Table, TH, TD, TR } from "../../ui/Table";

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

function statusForState(state: string): { label: string; variant: BadgeVariant; dot: StatusDotStatus } {
  if (state === "ready" || state === "indexed") {
    return { label: "Active", variant: "success", dot: "success" };
  }

  if (state === "failed") {
    return { label: "Needs Attention", variant: "destructive", dot: "error" };
  }

  return { label: "Needs Attention", variant: "warning", dot: "warning" };
}

function formatTimestamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toISOString().slice(0, 16).replace("T", " ");
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
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
  const activeFilterLabels = [
    filters.q.trim().length > 0 ? `q:${filters.q.trim()}` : null,
    filters.state ? `state:${filters.state}` : null,
    filters.view ? `view:${filters.view}` : null,
  ].filter((value): value is string => value !== null);

  return (
    <div className="min-w-0">
      <section className="border-b border-border/70 bg-background/95">
        <div className="flex h-12 items-center px-6 lg:px-8">
          <span className="text-sm font-medium text-muted-foreground">Matters</span>
        </div>
      </section>

      <div className="px-6 py-8 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-heading-lg font-normal text-balance">Matters</h1>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">Search, filter, create, and open matters quickly.</p>
            </div>
            <CreateMatterForm />
          </div>

          <section className="mt-6 rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
            <form method="get" className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_auto]">
              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Search</span>
                <Input
                  name="q"
                  defaultValue={filters.q}
                  placeholder="Search by matter name or ID"
                  aria-label="Search matters"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">State</span>
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

              <div className="flex items-end gap-2 lg:justify-end">
                <button type="submit" className={buttonClassName({ variant: "secondary", size: "sm" })}>
                  Apply
                </button>
                <Link href="/matters" className={buttonClassName({ variant: "ghost", size: "sm" })}>
                  Clear
                </Link>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2">
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
                        ? "rounded-pill border border-primary bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-ui-sm"
                        : "rounded-pill border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-micro ease-brand-standard"
                    }
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </section>

          <section className={demoModeEnabled ? "mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]" : "mt-6"}>
            {matters.length === 0 ? (
              <Card className="overflow-hidden">
                <EmptyState
                  icon={<SearchIcon />}
                  title="No matters found"
                  description="No matters matched the current filters."
                  action={
                    <Link href="/matters" className={buttonClassName({ variant: "secondary", size: "sm" })}>
                      Reset filters
                    </Link>
                  }
                />
              </Card>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="font-semibold text-foreground tabular-nums">{matters.length}</span>{" "}
                    matter{matters.length === 1 ? "" : "s"}
                  </p>
                  {activeFilterLabels.length > 0 ? (
                    <p className="text-2xs text-muted-foreground">
                      Active filters: <span className="font-mono">{activeFilterLabels.join(" · ")}</span>
                    </p>
                  ) : null}
                </div>

                <TableFrame className="shadow-ui-sm">
                  <Table>
                    <thead>
                      <tr>
                        <TH className="sticky top-0 z-10">Matter</TH>
                        <TH className="sticky top-0 z-10">Status</TH>
                        <TH className="sticky top-0 z-10">State</TH>
                        <TH className="sticky top-0 z-10">Created</TH>
                        <TH className="sticky top-0 z-10 text-right">Action</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {matters.map((matter, i) => {
                        const status = statusForState(matter.state);
                        const delay = Math.min(i * 30, 300);
                        return (
                          <TR key={matter.id} className="group animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
                            <TD className="align-top">
                              <div className="text-sm font-medium text-foreground">{matter.name}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <MonoId>{matter.id}</MonoId>
                                <span className="rounded-pill bg-muted px-2 py-0.5 font-mono text-2xs text-muted-foreground">
                                  index {matter.latest_index_version}
                                </span>
                              </div>
                            </TD>
                            <TD className="align-top">
                              <div className="flex items-center gap-2">
                                <StatusDot status={status.dot} size="sm" />
                                <Badge variant={status.variant}>{status.label}</Badge>
                              </div>
                            </TD>
                            <TD className="align-top">
                              <Badge variant="muted">{matter.state}</Badge>
                            </TD>
                            <TD className="align-top text-sm text-muted-foreground tabular-nums">{formatTimestamp(matter.created_at)}</TD>
                            <TD className="align-top text-right">
                              <Link
                                href={`/matters/${encodeURIComponent(matter.id)}`}
                                className={buttonClassName({
                                  variant: "secondary",
                                  size: "sm",
                                  className: "opacity-90 group-hover:opacity-100",
                                })}
                              >
                                Open
                              </Link>
                            </TD>
                          </TR>
                        );
                      })}
                    </tbody>
                  </Table>
                </TableFrame>
              </div>
            )}

            {demoModeEnabled ? (
              <Card className="h-fit overflow-hidden">
                <div className="border-b border-border bg-muted/40 px-4 py-3">
                  <h2 className="text-sm font-semibold text-foreground">Recent Demo Matters</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Reopen the latest demo contexts without reloading fixtures.</p>
                </div>

                {demoHistory.length === 0 ? (
                  <EmptyState icon={<ClockIcon />} title="No demo history" description="Run a demo pack to see recent matters here." />
                ) : (
                  <ul className="divide-y divide-border">
                    {demoHistory.map((matter) => {
                      const metadata = parseDemoMatterMetadata(matter.name);
                      const packLabel = metadata?.packId ?? "pack not detected";
                      const loadedAtLabel = formatDemoLoadedAtLabel(metadata?.loadedAt ?? matter.created_at);
                      return (
                        <li
                          key={`demo-history-${matter.id}`}
                          className="grid gap-2 px-4 py-3 transition-colors duration-micro ease-brand-standard hover:bg-muted/30"
                        >
                          <div className="text-sm font-medium text-foreground">{matter.name}</div>
                          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">{packLabel}</span>
                            <span className="font-mono tabular-nums">{loadedAtLabel}</span>
                          </div>
                          <div className="flex justify-end">
                            <Link
                              href={`/matters/${encodeURIComponent(matter.id)}`}
                              className={buttonClassName({ variant: "secondary", size: "sm" })}
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
          </section>
        </div>
      </div>
    </div>
  );
}
