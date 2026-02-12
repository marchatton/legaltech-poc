import Link from "next/link";

import { assertDevOrDemoProd } from "../../../lib/devOnly";
import { isDemoModeEnabled } from "../../../lib/demoMode.server";
import { formatDemoLoadedAtLabel, parseDemoMatterMetadata } from "../../../lib/demoMatterMetadata";
import { listMatters, parseMatterListFilters, type MatterListFilters, type MatterSavedView } from "../../../lib/mattersList.server";

import { Badge, type BadgeVariant } from "../../ui/Badge";
import { buttonClassName } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { EmptyState } from "../../ui/EmptyState";
import { MonoId } from "../../ui/MonoId";
import { Page, PageHeader } from "../../ui/Page";
import { SearchInput } from "../../ui/SearchInput";
import { StatusDot, type StatusDotStatus } from "../../ui/StatusDot";
import { TableFrame, Table, TH, TD, TR } from "../../ui/Table";

import { CreateMatterForm } from "./CreateMatterForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── Constants ── */

type SearchParamRecord = Record<string, string | string[] | undefined>;

const SAVED_VIEW_OPTIONS: { label: string; value: MatterSavedView }[] = [
  { label: "Active", value: "active" },
  { label: "Needs Attention", value: "needs_attention" },
  { label: "Demo Packs", value: "demo_packs" },
];

/* ── Helpers ── */

function buildQueryString(filters: MatterListFilters): string {
  const params = new URLSearchParams();
  if (filters.q.trim().length > 0) params.set("q", filters.q.trim());
  if (filters.state) params.set("state", filters.state);
  if (filters.view) params.set("view", filters.view);
  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : "";
}

function statusForState(state: string): { label: string; variant: BadgeVariant; dot: StatusDotStatus } {
  if (state === "ready" || state === "indexed") return { label: "Active", variant: "success", dot: "success" };
  if (state === "failed") return { label: "Needs Attention", variant: "destructive", dot: "error" };
  return { label: "Needs Attention", variant: "warning", dot: "warning" };
}

function formatTimestamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toISOString().slice(0, 16).replace("T", " ");
}

/* ── Icons ── */

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function SearchEmptyIcon() {
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

/* ── Page ── */

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
    <Page width="xl">
      <PageHeader
        title="Matters"
        subtitle="Manage your legal review projects."
        right={<CreateMatterForm />}
      />

      {/* Search + filter pills toolbar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <form method="get" className="w-full max-w-sm">
          <SearchInput
            name="q"
            defaultValue={filters.q}
            placeholder="Search matters by name or ID..."
            aria-label="Search matters"
          />
          {filters.view ? <input type="hidden" name="view" value={filters.view} /> : null}
          {filters.state ? <input type="hidden" name="state" value={filters.state} /> : null}
          <button type="submit" className="sr-only">Search</button>
        </form>

        <div className="flex flex-wrap gap-2">
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
                    ? "rounded-pill border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors duration-micro ease-brand-standard"
                    : "rounded-pill border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-micro ease-brand-standard hover:bg-muted hover:text-foreground"
                }
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content + optional demo sidebar */}
      <div className={demoModeEnabled ? "mt-6 flex gap-6" : "mt-6"}>
        <div className="min-w-0 flex-1">
          {matters.length === 0 ? (
            <Card className="overflow-hidden">
              <EmptyState
                icon={<SearchEmptyIcon />}
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
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground tabular-nums">{matters.length}</span>{" "}
                matter{matters.length === 1 ? "" : "s"}
              </p>

              <TableFrame className="shadow-ui-sm">
                <Table>
                  <thead>
                    <tr>
                      <TH className="sticky top-0 z-10">Name</TH>
                      <TH className="sticky top-0 z-10">Status</TH>
                      <TH className="sticky top-0 z-10">Created</TH>
                      <TH className="sticky top-0 z-10 w-10" />
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
                            <div className="mt-0.5">
                              <MonoId>{matter.id}</MonoId>
                            </div>
                          </TD>
                          <TD className="align-top">
                            <div className="flex items-center gap-2">
                              <StatusDot status={status.dot} size="sm" />
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </div>
                          </TD>
                          <TD className="align-top text-sm text-muted-foreground tabular-nums">
                            {formatTimestamp(matter.created_at)}
                          </TD>
                          <TD className="align-top text-right">
                            <Link
                              href={`/matters/${encodeURIComponent(matter.id)}`}
                              className="inline-flex items-center justify-center rounded-ui-md p-1.5 text-muted-foreground opacity-0 transition-all duration-micro ease-brand-standard hover:bg-muted hover:text-foreground group-hover:opacity-100"
                              aria-label={`Open ${matter.name}`}
                            >
                              <ArrowRightIcon />
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
        </div>

        {demoModeEnabled ? (
          <div className="w-72 shrink-0">
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-muted/40 px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">Recent Demo Matters</h2>
                <p className="mt-1 text-xs text-muted-foreground">Reopen the latest demo contexts.</p>
              </div>

              {demoHistory.length === 0 ? (
                <EmptyState
                  variant="compact"
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
                        key={`demo-${matter.id}`}
                        className="px-4 py-3 transition-colors duration-micro ease-brand-standard hover:bg-muted/30"
                      >
                        <div className="text-sm font-medium text-foreground">{matter.name}</div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">{packLabel}</span>
                          <span className="font-mono tabular-nums">{loadedAtLabel}</span>
                        </div>
                        <div className="mt-2 flex justify-end">
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
          </div>
        ) : null}
      </div>
    </Page>
  );
}
