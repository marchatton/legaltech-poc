import { cn } from "./cn";

export function ProgressBar({
  value,
  max = 100,
  label = "Progress",
  className,
}: {
  value?: number;
  max?: number;
  label?: string;
  className?: string;
}) {
  const indeterminate = value === undefined;
  const clampedValue = indeterminate ? undefined : Math.max(0, Math.min(max, value));

  return (
    <div
      className={cn("h-1 w-full overflow-hidden rounded-pill bg-muted", className)}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      {indeterminate ? (
        <div className="h-full w-[40%] animate-progress-slide rounded-pill bg-primary" />
      ) : (
        <div
          className="h-full w-full origin-left rounded-pill bg-primary transition-transform duration-large ease-brand-standard"
          style={{ transform: `scaleX(${clampedValue! / max})` }}
        />
      )}
    </div>
  );
}
