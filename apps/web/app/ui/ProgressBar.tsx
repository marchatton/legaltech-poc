import { cn } from "./cn";

export function ProgressBar({
  value,
  className,
}: {
  value?: number;
  className?: string;
}) {
  const indeterminate = value === undefined;

  return (
    <div className={cn("h-1 w-full overflow-hidden rounded-pill bg-muted", className)}>
      {indeterminate ? (
        <div className="h-full w-[40%] animate-progress-slide rounded-pill bg-primary" />
      ) : (
        <div
          className="h-full rounded-pill bg-primary transition-[width] duration-large ease-brand-standard"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      )}
    </div>
  );
}
