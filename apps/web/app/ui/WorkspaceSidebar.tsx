import Link from "next/link";
import type { ReactElement } from "react";

import { Tooltip } from "./Tooltip";
import { cn } from "./cn";

type Destination = {
  id: "matters" | "runs_alerts" | "settings";
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

export function WorkspaceSidebar(props: { active: Destination["id"] }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-ui-md bg-primary text-primary-foreground shadow-ui-sm">
            <span className="text-sm font-semibold">O</span>
          </div>
          <span className="truncate font-serif text-xl font-medium text-sidebar-foreground">Orbital</span>
        </div>
        <button
          type="button"
          aria-label="Collapse sidebar"
          className="inline-flex size-6 items-center justify-center rounded-ui-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        >
          <span aria-hidden="true" className="font-mono text-sm">&lt;&lt;</span>
        </button>
      </div>

      <nav aria-label="Primary" className="flex-1 space-y-1 p-2">
        {DESTINATIONS.map((item) => {
          const isActive = item.id === props.active;
          const itemClass = cn(
            "flex w-full items-center gap-3 rounded-ui-md border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors duration-micro ease-brand-standard",
            isActive
              ? "border-l-info bg-info/10 text-info shadow-ui-sm"
              : "border-l-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
          );
          const iconClass = cn("size-4 shrink-0", isActive ? "text-info" : "text-muted-foreground");

          if (item.href) {
            return (
              <Link key={item.id} href={item.href} aria-current={isActive ? "page" : undefined} className={itemClass}>
                <item.icon className={iconClass} />
                <span>{item.label}</span>
              </Link>
            );
          }

          return (
            <Tooltip key={item.id} content={item.disabledHint ?? "Coming soon"} position="right">
              <span
                aria-disabled="true"
                tabIndex={0}
                className={cn(
                  itemClass,
                  "cursor-not-allowed border-l-transparent text-muted-foreground/70 hover:bg-sidebar-accent/70 hover:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                )}
              >
                <item.icon className={iconClass} />
                <span>{item.label}</span>
              </span>
            </Tooltip>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-ui-md px-1 py-1">
          <div className="flex size-8 items-center justify-center rounded-pill bg-secondary text-2xs font-semibold text-secondary-foreground">
            RG
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">Ruth Bader Ginsburg</p>
            <p className="truncate text-2xs text-muted-foreground">Operator</p>
          </div>
          <span aria-hidden="true" className="text-muted-foreground">
            -
          </span>
        </div>
      </div>
    </aside>
  );
}
