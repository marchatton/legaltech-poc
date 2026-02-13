"use client";

import Link from "next/link";
import { useCallback, type KeyboardEvent } from "react";

import { cn } from "./cn";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
  href?: string;
};

type Props<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange?: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
};

const sizeClasses: Record<"sm" | "md", { container: string; item: string; count: string }> = {
  sm: {
    container: "gap-0.5 p-0.5",
    item: "px-2.5 py-1 text-xs",
    count: "text-2xs px-1.5 py-0.5",
  },
  md: {
    container: "gap-1 p-1",
    item: "px-3 py-1.5 text-sm",
    count: "text-xs px-1.5 py-0.5",
  },
};

export function SegmentedControl<T extends string>(props: Props<T>) {
  const { options, value, onChange, size = "sm", className } = props;
  const s = sizeClasses[size];
  const activeIdx = options.findIndex((o) => o.value === value);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const tabs = Array.from(
        e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'),
      );
      if (!tabs.length) return;
      let next = -1;
      if (e.key === "ArrowRight") {
        next = activeIdx < tabs.length - 1 ? activeIdx + 1 : 0;
      } else if (e.key === "ArrowLeft") {
        next = activeIdx > 0 ? activeIdx - 1 : tabs.length - 1;
      } else if (e.key === "Home") {
        next = 0;
      } else if (e.key === "End") {
        next = tabs.length - 1;
      }
      if (next >= 0) {
        e.preventDefault();
        const opt = options[next];
        if (opt?.href) {
          tabs[next]?.click();
        } else {
          onChange?.(opt.value);
        }
        tabs[next]?.focus();
      }
    },
    [activeIdx, options, onChange],
  );

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-ui-lg border border-border bg-muted/30",
        s.container,
        className,
      )}
      role="tablist"
      onKeyDown={handleKeyDown}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        const itemClass = cn(
          "inline-flex items-center gap-1.5 rounded-ui-md font-medium transition-all duration-micro ease-brand-standard",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          s.item,
          isActive
            ? "bg-card text-foreground font-semibold shadow-ui-sm"
            : "text-muted-foreground hover:text-foreground",
        );

        const countBadge =
          option.count !== undefined ? (
            <span
              className={cn(
                "rounded-pill tabular-nums font-semibold",
                s.count,
                isActive
                  ? "bg-muted text-foreground"
                  : "bg-muted/60 text-muted-foreground",
              )}
            >
              {option.count}
            </span>
          ) : null;

        if (option.href) {
          return (
            <Link
              key={option.value}
              href={option.href}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={itemClass}
            >
              {option.label}
              {countBadge}
            </Link>
          );
        }

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange?.(option.value)}
            className={itemClass}
          >
            {option.label}
            {countBadge}
          </button>
        );
      })}
    </div>
  );
}
