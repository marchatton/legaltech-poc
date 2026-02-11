import Link from "next/link";

import { assertDevOrDemoProd } from "../../../lib/devOnly";
import { isDemoModeEnabled } from "../../../lib/demoMode.server";
import { formatDemoLoadedAtLabel, parseDemoMatterMetadata } from "../../../lib/demoMatterMetadata";
import { listMatters, parseMatterListFilters, type MatterListFilters, type MatterSavedView } from "../../../lib/mattersList.server";

import { Badge, type BadgeVariant } from "../../ui/Badge";
import { buttonClassName } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { EmptyState } from "../../ui/EmptyState";
import { Input, Select } from "../../ui/Input";
import { MonoId } from "../../ui/MonoId";
import { Page, PageHeader, PageSection } from "../../ui/Page";
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

              <Link href="/matters" className={buttonClassName({ variant: "secondary" })}>
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
                        : "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-micro ease-brand-standard"
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
            <TableFrame>
              <Table>
                <thead>
                  <tr>
                    <TH>Matter</TH>
                    <TH>Status</TH>
                    <TH>State</TH>
                    <TH>Created</TH>
                    <TH className="text-right">Action</TH>
                  </tr>
                </thead>
                <tbody>
                  {matters.map((matter, i) => {
                    const status = statusForState(matter.state);
                    const delay = Math.min(i * 30, 300);
                    return (
                      <TR
                        key={matter.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${delay}ms` }}
                      >
                        <TD className="align-top">
                          <div className="text-sm font-medium text-foreground">{matter.name}</div>
                          <div className="mt-1">
                            <MonoId>{matter.id}</MonoId>
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
                        <TD className="align-top text-sm text-muted-foreground">{formatTimestamp(matter.created_at)}</TD>
                        <TD className="align-top text-right">
                          <Link
                            href={`/matters/${encodeURIComponent(matter.id)}`}
                            className={buttonClassName({ variant: "secondary", size: "sm" })}
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
          )}

          {demoModeEnabled ? (
            <Card className="h-fit overflow-hidden">
              <div className="border-b border-border bg-muted/40 px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">Recent Demo Matters</h2>
                <p className="mt-1 text-xs text-muted-foreground">Reopen the latest demo contexts without reloading fixtures.</p>
              </div>

              {demoHistory.length === 0 ? (
                <EmptyState
                  icon={<ClockIcon />}
                  title="No demo history"
                  description="Run a demo pack to see recent matters here."
                />
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
                          <span className="font-mono">{loadedAtLabel}</span>
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
        </div>
      </PageSection>
    </Page>
  );
}
