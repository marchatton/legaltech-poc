import Link from "next/link";

import { cn } from "./cn";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

type Props<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange?: (value: T) => void;
  href?: (value: T) => string;
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
  const { options, value, onChange, href, size = "sm", className } = props;
  const s = sizeClasses[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-ui-lg border border-border bg-muted/30",
        s.container,
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        const itemClass = cn(
          "inline-flex items-center gap-1.5 rounded-ui-md font-medium transition-all duration-micro ease-brand-standard",
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

        if (href) {
          return (
            <Link
              key={option.value}
              href={href(option.value)}
              role="tab"
              aria-selected={isActive}
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
