"use client";

import Link from "next/link";
import { useEffect, useState, type ReactElement } from "react";

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

/* ── Sidebar ── */

export function WorkspaceSidebar(props: { active: DestinationId }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("orbital.sidebar.collapsed");
      if (stored !== null) {
        setCollapsed(stored === "true");
      }
    } catch {
      // Ignore localStorage errors and default to expanded.
    }
  }, []);

  const handleCollapsedChange = (next: boolean) => {
    setCollapsed(next);
    try {
      window.localStorage.setItem("orbital.sidebar.collapsed", String(next));
    } catch {
      // Ignore localStorage errors and rely on in-memory state.
    }
  };

  return (
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
          <div className="flex size-8 shrink-0 items-center justify-center rounded-ui-md bg-primary text-primary-foreground shadow-ui-sm ring-2 ring-purple-200 ring-offset-1 ring-offset-sidebar">
            <span className="text-sm font-semibold">O</span>
          </div>
          {!collapsed && (
            <span className="ml-3 truncate font-serif text-xl font-semibold tracking-tight text-sidebar-foreground">
              Orbital
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

      {/* Navigation */}
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
                    collapsed ? "justify-center px-2" : "gap-3 px-3",
                    isActive
                      ? "border-l-cyan-500 bg-cyan-50 text-cyan-800 shadow-ui-sm dark:bg-cyan-500/10 dark:text-cyan-300"
                      : "border-l-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  );
                  const iconClass = cn("size-5 shrink-0", isActive ? "text-cyan-600 dark:text-cyan-400" : "text-muted-foreground");

                  if (item.href) {
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={itemClass}
                      >
                        <item.icon className={iconClass} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    );
                  }

                  const disabledNode = (
                    <button
                      type="button"
                      aria-disabled="true"
                      onClick={(event) => event.preventDefault()}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        itemClass,
                        "cursor-not-allowed border-l-transparent text-muted-foreground/70 hover:bg-sidebar-accent/70 hover:text-muted-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                      )}
                    >
                      <item.icon className={cn(iconClass, "text-muted-foreground/70")} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
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

      {/* Expand toggle (collapsed only) */}
      {collapsed && (
        <div className="px-2 pb-2">
          <button
            type="button"
            onClick={() => handleCollapsedChange(false)}
            className="flex w-full items-center justify-center rounded-ui-md p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            title="Expand sidebar"
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
            RG
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">Ruth Bader Ginsburg</p>
                <p className="truncate text-2xs text-muted-foreground">Operator</p>
              </div>
              <button
                type="button"
                aria-label="Sign out"
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
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
  );
}
