import { cn } from "./cn";

export function PulseLoader({
  className,
  "aria-label": ariaLabel = "Loading",
}: {
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-[5px]", className)}
    >
      <span className="h-[7px] w-[7px] rounded-full bg-primary animate-pulse" aria-hidden="true" />
      <span className="h-[7px] w-[7px] rounded-full bg-primary animate-pulse [animation-delay:150ms]" aria-hidden="true" />
      <span className="h-[7px] w-[7px] rounded-full bg-primary animate-pulse [animation-delay:300ms]" aria-hidden="true" />
    </span>
  );
}
