"use client";

import Link from "next/link";
import { useCallback, useState, useSyncExternalStore, type ReactElement } from "react";

import { Tooltip } from "./Tooltip";
import { cn } from "./cn";

/* ── Destination config ── */

type DestinationId = "matters" | "runs" | "alerts" | "settings";

type Destination = {
  id: DestinationId;
  label: string;
  href?: string;
  disabledHint?: string;
  icon: (props: { className?: string }) => ReactElement;
};

type DestinationGroup = "main" | "system";

const DESTINATIONS: (Destination & { group: DestinationGroup })[] = [
  {
    id: "matters",
    label: "Matters",
    href: "/matters",
    group: "main",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className} aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "runs",
    label: "Runs",
    disabledHint: "Runs are coming soon",
    group: "main",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className} aria-hidden="true">
        <circle cx="9.5" cy="12" r="6.5" />
        <polygon points="8 9.7 12.5 12 8 14.3 8 9.7" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "alerts",
    label: "Alerts",
    disabledHint: "Alerts are coming soon",
    group: "system",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className} aria-hidden="true">
        <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
        <path d="M9.5 20a2.5 2.5 0 0 0 5 0" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    disabledHint: "Settings are coming soon",
    group: "system",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className} aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
];

/* ── Sidebar collapsed state (localStorage-backed, SSR-safe) ── */

const COLLAPSED_STORAGE_KEY = "orbital.sidebar.collapsed";
const collapsedListeners = new Set<() => void>();

function getCollapsedSnapshot(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getCollapsedServerSnapshot(): boolean {
  return false;
}

function subscribeCollapsed(callback: () => void): () => void {
  collapsedListeners.add(callback);
  return () => collapsedListeners.delete(callback);
}

function setCollapsedStorage(next: boolean) {
  try {
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
  } catch {
    // Ignore localStorage errors.
  }
  for (const listener of collapsedListeners) listener();
}

/* ── Sidebar ── */

function SidebarNav(props: { active: DestinationId; collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary" className="flex-1 overflow-y-auto px-2 py-4">
      {(["main", "system"] as const).map((group, groupIdx) => {
        const items = DESTINATIONS.filter((d) => d.group === group);
        return (
          <div key={group}>
            {groupIdx > 0 && (
              <div className="my-2 border-t border-sidebar-border" />
            )}
            <div className="space-y-1">
              {items.map((item) => {
                const isActive = item.id === props.active;
                const itemClass = cn(
                  "flex w-full items-center rounded-ui-md border-l-[3px] py-2.5 text-sm font-medium transition-colors duration-micro ease-brand-standard",
                  props.collapsed ? "justify-center px-2" : "gap-3 px-3",
                  isActive
                    ? "border-l-secondary bg-secondary/10 text-sidebar-foreground shadow-ui-sm"
                    : "border-l-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                );
                const iconClass = cn("size-5 shrink-0", isActive ? "text-sidebar-foreground" : "text-sidebar-foreground/60");

                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      title={props.collapsed ? item.label : undefined}
                      className={itemClass}
                      onClick={props.onNavigate}
                    >
                      <item.icon className={iconClass} />
                      {!props.collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                }

                const disabledNode = (
                  <button
                    type="button"
                    aria-disabled="true"
                    onClick={(event) => event.preventDefault()}
                    title={props.collapsed ? item.label : undefined}
                    className={cn(
                      itemClass,
                      "cursor-not-allowed border-l-transparent text-muted-foreground/70 hover:bg-sidebar-accent/70 hover:text-muted-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                    )}
                  >
                    <item.icon className={cn(iconClass, "text-muted-foreground/70")} />
                    {!props.collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );

                return (
                  <Tooltip key={item.id} content={item.disabledHint ?? "Coming soon"} position="right" className="block">
                    {disabledNode}
                  </Tooltip>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function BrandMark() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-ui-md bg-primary text-primary-foreground shadow-ui-sm ring-2 ring-accent/30 ring-offset-1 ring-offset-sidebar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="M10 9v6l5-3-5-3z" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

export function WorkspaceSidebar(props: { active: DestinationId }) {
  const collapsed = useSyncExternalStore(subscribeCollapsed, getCollapsedSnapshot, getCollapsedServerSnapshot);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCollapsedChange = useCallback((next: boolean) => {
    setCollapsedStorage(next);
  }, []);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="fixed left-3 top-[calc(var(--app-topbar-height,3rem)/2-12px)] z-40 inline-flex size-6 items-center justify-center rounded-ui-sm text-muted-foreground transition-colors duration-micro hover:text-foreground lg:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/15 backdrop-blur-[4px] animate-fade-in"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar shadow-ui-lg animate-fade-in">
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
              <div className="flex min-w-0 items-center">
                <BrandMark />
                <span className="ml-3 truncate font-serif text-xl font-semibold tracking-tight text-sidebar-foreground">
                  LegalTech
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-ui-sm text-muted-foreground transition-colors duration-micro hover:bg-sidebar-accent hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <SidebarNav active={props.active} collapsed={false} onNavigate={() => setMobileOpen(false)} />

            <div className="border-t border-sidebar-border p-3">
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-secondary text-xs font-semibold text-secondary-foreground">
                  DD
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">Donna Deed</p>
                  <p className="truncate text-2xs text-muted-foreground">Director</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-[var(--app-topbar-height,3rem)] hidden h-[calc(100dvh-var(--app-topbar-height,3rem))] shrink-0 border-r border-sidebar-border bg-sidebar transition-all duration-standard ease-brand-standard lg:flex lg:flex-col",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo area */}
        <div
          className={cn(
            "flex h-14 items-center border-b border-sidebar-border",
            collapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          <div className={cn("flex min-w-0 items-center", collapsed && "justify-center")}>
            <BrandMark />
            {!collapsed && (
              <span className="ml-3 truncate font-serif text-xl font-semibold tracking-tight text-sidebar-foreground">
                LegalTech
              </span>
            )}
          </div>
          {!collapsed && (
            <button
              type="button"
              onClick={() => handleCollapsedChange(true)}
              aria-label="Collapse sidebar"
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-ui-sm text-muted-foreground transition-colors duration-micro hover:bg-sidebar-accent hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
          )}
        </div>

        <SidebarNav active={props.active} collapsed={collapsed} />

        {/* Expand toggle (collapsed only) */}
        {collapsed && (
          <div className="px-2 pb-2">
            <button
              type="button"
              onClick={() => handleCollapsedChange(false)}
              className="flex w-full items-center justify-center rounded-ui-md p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            </button>
          </div>
        )}

        {/* User profile */}
        <div className="border-t border-sidebar-border p-3">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3 px-1 py-1")}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-secondary text-xs font-semibold text-secondary-foreground">
              DD
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">Donna Deed</p>
                  <p className="truncate text-2xs text-muted-foreground">Director</p>
                </div>
                <button
                  type="button"
                  aria-label="Sign out"
                  className="shrink-0 rounded-ui-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
