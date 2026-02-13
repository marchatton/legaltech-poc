"use client";

import { createContext, useContext, useId, useCallback, type HTMLAttributes, type ReactNode, type KeyboardEvent } from "react";

import { cn } from "./cn";

/* ── TabsProvider (context for keyboard nav + ARIA wiring) ── */

type TabsContextValue = {
  id: string;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  count: number;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export type TabsProviderProps = {
  activeIndex: number;
  onChange: (index: number) => void;
  count: number;
  children: ReactNode;
};

export function TabsProvider({ activeIndex, onChange, count, children }: TabsProviderProps) {
  const id = useId();
  return (
    <TabsContext.Provider value={{ id, activeIndex, setActiveIndex: onChange, count }}>
      {children}
    </TabsContext.Provider>
  );
}

/* ── TabList (the container with bottom border) ── */

export function TabList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ctx = useContext(TabsContext);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!ctx) return;
      let next = -1;
      if (e.key === "ArrowRight") {
        next = ctx.activeIndex < ctx.count - 1 ? ctx.activeIndex + 1 : 0;
      } else if (e.key === "ArrowLeft") {
        next = ctx.activeIndex > 0 ? ctx.activeIndex - 1 : ctx.count - 1;
      } else if (e.key === "Home") {
        next = 0;
      } else if (e.key === "End") {
        next = ctx.count - 1;
      }
      if (next >= 0) {
        e.preventDefault();
        ctx.setActiveIndex(next);
        const tabs = e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]');
        tabs[next]?.focus();
      }
    },
    [ctx],
  );

  return (
    <div
      role="tablist"
      className={cn("flex gap-0 border-b border-border", className)}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

/* ── Tab (individual tab trigger) ── */

export type TabProps = HTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  icon?: ReactNode;
  index?: number;
};

export function Tab({ className, active, icon, index, children, ...props }: TabProps) {
  const ctx = useContext(TabsContext);
  const isActive = active ?? (ctx ? ctx.activeIndex === index : false);
  const tabId = ctx && index !== undefined ? `${ctx.id}-tab-${index}` : undefined;
  const panelId = ctx && index !== undefined ? `${ctx.id}-panel-${index}` : undefined;

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={ctx ? (isActive ? 0 : -1) : undefined}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium -mb-px",
        "border-b-2 border-transparent cursor-pointer",
        "transition-colors duration-micro ease-brand-standard",
        "hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive
          ? "text-primary border-b-primary"
          : "text-muted-foreground",
        className,
      )}
      onClick={() => {
        if (ctx && index !== undefined) ctx.setActiveIndex(index);
      }}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

/* ── TabPanel (content panel) ── */

export type TabPanelProps = HTMLAttributes<HTMLDivElement> & {
  index?: number;
};

export function TabPanel({ className, index, ...props }: TabPanelProps) {
  const ctx = useContext(TabsContext);
  const panelId = ctx && index !== undefined ? `${ctx.id}-panel-${index}` : undefined;
  const tabId = ctx && index !== undefined ? `${ctx.id}-tab-${index}` : undefined;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      className={cn("mt-4", className)}
      {...props}
    />
  );
}
