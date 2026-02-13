import Link from "next/link";

import { assertDevOrDemoProd } from "../../../lib/devOnly";
import {
  listMatters,
  parseMatterListFilters,
  type MatterListFilters,
  type MatterSavedView,
} from "../../../lib/mattersList.server";

import { Badge, type BadgeVariant } from "../../ui/Badge";
import { buttonClassName } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { EmptyState } from "../../ui/EmptyState";
import { Page, PageHeader } from "../../ui/Page";
import { SearchInput } from "../../ui/SearchInput";
import { StatusDot, type StatusDotStatus } from "../../ui/StatusDot";
import { TableFrame, Table, TH, TD, TR } from "../../ui/Table";

import { CreateMatterForm } from "./CreateMatterForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── Constants ── */

type SearchParamRecord = Record<string, string | string[] | undefined>;

const SAVED_VIEW_OPTIONS: { label: string; value: MatterSavedView | null }[] = [
  { label: "All", value: null },
  { label: "Active", value: "active" },
  { label: "Needs Attention", value: "needs_attention" },
];

const PAGE_SIZE = 12;

/* ── Helpers ── */

function firstString(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}

function parsePageNumber(raw: string | string[] | undefined): number {
  const value = Number.parseInt(firstString(raw) ?? "1", 10);
  if (!Number.isFinite(value) || value < 1) return 1;
  return value;
}

function buildQueryString(filters: MatterListFilters, page?: number): string {
  const params = new URLSearchParams();
  if (filters.q.trim().length > 0) params.set("q", filters.q.trim());
  if (filters.state) params.set("state", filters.state);
  if (filters.view) params.set("view", filters.view);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : "";
}

function statusForReadiness(args: {
  readinessState: "runnable" | "blocked";
  folderState: string;
}): { label: string; variant: BadgeVariant; dot: StatusDotStatus } {
  if (args.readinessState === "runnable") return { label: "Active", variant: "success", dot: "success" };
  if (args.folderState === "failed") return { label: "Needs Attention", variant: "destructive", dot: "error" };
  return { label: "Blocked", variant: "warning", dot: "warning" };
}

function formatTimestampParts(iso: string): { date: string; time: string } {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return { date: iso, time: "" };
  const stamp = parsed.toISOString().replace("T", " ").replace(".000Z", "Z");
  return { date: stamp.slice(0, 10), time: stamp.slice(11, 19) };
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

/* ── Page ── */

export default async function MattersPage(props: {
  searchParams?: Promise<SearchParamRecord>;
}) {
  assertDevOrDemoProd();

  const rawSearchParams = (await props.searchParams) ?? {};
  const filters = parseMatterListFilters(rawSearchParams);
  const matters = await listMatters(filters);
  const requestedPage = parsePageNumber(rawSearchParams.page);
  const totalMatters = matters.length;
  const totalPages = Math.max(1, Math.ceil(totalMatters / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const startIndex = (page - 1) * PAGE_SIZE;
  const visibleMatters = matters.slice(startIndex, startIndex + PAGE_SIZE);
  const visibleRangeStart = totalMatters === 0 ? 0 : startIndex + 1;
  const visibleRangeEnd = totalMatters === 0 ? 0 : Math.min(startIndex + visibleMatters.length, totalMatters);

  return (
      <Page width="xl" className="pt-0">
        <section className="sticky top-[var(--app-topbar-height,3rem)] z-20 -mx-6 border-b border-border bg-background/95 px-6 pb-4 pt-4 backdrop-blur sm:-mx-8 sm:px-8">
          <PageHeader title="Matters" right={<CreateMatterForm />} />

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <form method="get" className="w-full max-w-sm sm:max-w-md">
              <SearchInput
                name="q"
                defaultValue={filters.q}
                placeholder="Search matters by name or ID..."
                aria-label="Search matters"
                className="w-full"
              />
              {filters.view ? <input type="hidden" name="view" value={filters.view} /> : null}
              {filters.state ? <input type="hidden" name="state" value={filters.state} /> : null}
              <button type="submit" className="sr-only">Search</button>
            </form>

            <div className="flex flex-wrap gap-2">
              {SAVED_VIEW_OPTIONS.map((option) => {
                const isAll = option.value === null;
                const isActive = isAll ? !filters.view : filters.view === option.value;
                const nextView = isActive ? null : option.value;
                const href = `/matters${buildQueryString({ ...filters, view: nextView }, 1)}`;
                return (
                  <Link
                    key={option.value ?? "all"}
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
        </section>

        <div className="mt-6">
        <div className="min-w-0">
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
              <TableFrame className="shadow-ui-sm">
                <Table>
                  <thead>
                    <tr>
                      <TH className="sticky top-0 z-10">Name</TH>
                      <TH className="sticky top-0 z-10">Status</TH>
                      <TH className="sticky top-0 z-10">State</TH>
                      <TH className="sticky top-0 z-10">Created</TH>
                      <TH className="sticky top-0 z-10 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleMatters.map((matter, i) => {
                      const status = statusForReadiness({
                        readinessState: matter.readiness.state,
                        folderState: matter.state,
                      });
                      const delay = Math.min(i * 30, 300);
                      const createdAt = formatTimestampParts(matter.created_at);
                      const detailHref = `/matters/${encodeURIComponent(matter.id)}`;

                      return (
                        <TR key={matter.id} className="group animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
                          <TD className="p-0 align-top">
                            <Link href={detailHref} className="block px-3 py-2.5">
                              <div className="text-sm font-medium text-foreground">{matter.name}</div>
                              <div className="mt-1 text-2xs text-muted-foreground">{matter.readiness.reason}</div>
                            </Link>
                          </TD>
                          <TD className="p-0 align-top">
                            <Link href={detailHref} className="block px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <StatusDot status={status.dot} size="sm" />
                                <Badge variant={status.variant}>{status.label}</Badge>
                              </div>
                            </Link>
                          </TD>
                          <TD className="p-0 align-top">
                            <Link href={detailHref} className="block px-3 py-2.5">
                              {matter.jurisdiction_state ? (
                                <Badge variant="muted" size="sm">{matter.jurisdiction_state}</Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">&mdash;</span>
                              )}
                            </Link>
                          </TD>
                          <TD className="p-0 align-top">
                            <Link href={detailHref} className="block px-3 py-2.5">
                              <span className="text-sm text-foreground tabular-nums">{createdAt.date}</span>
                            </Link>
                          </TD>
                          <TD className="w-10 p-0 align-middle">
                            <Link href={detailHref} className="flex items-center justify-center px-2 py-2.5">
                              <span className="text-muted-foreground opacity-0 transition-opacity duration-micro group-hover:opacity-100">
                                <ArrowRightIcon />
                              </span>
                            </Link>
                          </TD>
                        </TR>
                      );
                    })}
                  </tbody>
                </Table>
              </TableFrame>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-semibold text-foreground tabular-nums">{visibleRangeStart}-{visibleRangeEnd}</span> of{" "}
                  <span className="font-semibold text-foreground tabular-nums">{totalMatters}</span> matter{totalMatters === 1 ? "" : "s"}
                </p>
              </div>

              {totalPages > 1 ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    Page <span className="font-semibold text-foreground">{page}</span> of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    {page > 1 ? (
                      <Link
                        href={`/matters${buildQueryString(filters, page - 1)}`}
                        className={buttonClassName({ variant: "secondary", size: "sm" })}
                      >
                        Previous
                      </Link>
                    ) : (
                      <span className={buttonClassName({ variant: "secondary", size: "sm", className: "pointer-events-none opacity-50" })}>
                        Previous
                      </span>
                    )}
                    {page < totalPages ? (
                      <Link
                        href={`/matters${buildQueryString(filters, page + 1)}`}
                        className={buttonClassName({ variant: "secondary", size: "sm" })}
                      >
                        Next
                      </Link>
                    ) : (
                      <span className={buttonClassName({ variant: "secondary", size: "sm", className: "pointer-events-none opacity-50" })}>
                        Next
                      </span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

      </div>
      </Page>
  );
}
