"use client";

import Link from "next/link";
import { useState, type ReactElement } from "react";

import { Tooltip } from "./Tooltip";
import { cn } from "./cn";

/* ── Destination config ── */

type DestinationId = "matters" | "runs_alerts" | "settings";

type Destination = {
  id: DestinationId;
  label: string;
  href?: string;
  disabledHint?: string;
  icon: (props: { className?: string }) => ReactElement;
};

const DESTINATIONS: Destination[] = [
  {
    id: "matters",
    label: "Matters",
    href: "/matters",
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
    id: "runs_alerts",
    label: "Runs + Alerts",
    disabledHint: "Runs and alerts are coming soon",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className} aria-hidden="true">
        <circle cx="9.5" cy="12" r="6.5" />
        <polygon points="8 9.7 12.5 12 8 14.3 8 9.7" fill="currentColor" stroke="none" />
        <path d="M16.4 8.8a2.4 2.4 0 0 1 2.4 2.4v1.1c0 .5.2 1 .5 1.4l.8.8h-4.9" />
        <path d="M16.9 17.1a1.2 1.2 0 0 0 2.4 0" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    disabledHint: "Settings are coming soon",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className} aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.4 1.4 0 1 1-2 2l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9v.3a1.4 1.4 0 1 1-2.8 0v-.3a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.4 1.4 0 1 1-2-2l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6h-.3a1.4 1.4 0 1 1 0-2.8h.3a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.4 1.4 0 1 1 2-2l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9v-.3a1.4 1.4 0 1 1 2.8 0v.3a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.4 1.4 0 1 1 2 2l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6h.3a1.4 1.4 0 1 1 0 2.8h-.3a1 1 0 0 0-.9.6z" />
      </svg>
    ),
  },
];

/* ── Sidebar ── */

export function WorkspaceSidebar(props: { active: DestinationId }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 border-r border-sidebar-border bg-sidebar transition-all duration-standard ease-brand-standard lg:flex lg:flex-col",
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
            onClick={() => setCollapsed(true)}
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
      <nav aria-label="Primary" className="flex-1 space-y-1 px-2 py-4">
        {DESTINATIONS.map((item) => {
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
            <span
              aria-disabled="true"
              tabIndex={0}
              title={collapsed ? item.label : undefined}
              className={cn(
                itemClass,
                "cursor-not-allowed border-l-transparent text-muted-foreground/70 hover:bg-sidebar-accent/70 hover:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              )}
            >
              <item.icon className={cn(iconClass, "text-muted-foreground/70")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </span>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id} content={item.disabledHint ?? "Coming soon"} position="right">
                {disabledNode}
              </Tooltip>
            );
          }

          return (
            <Tooltip key={item.id} content={item.disabledHint ?? "Coming soon"} position="right">
              {disabledNode}
            </Tooltip>
          );
        })}
      </nav>

      {/* Expand toggle (collapsed only) */}
      {collapsed && (
        <div className="px-2 pb-2">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
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
