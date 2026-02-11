import { cn } from "./cn";

export type OrbitalLoaderSize = "sm" | "md" | "lg";

const sizeClasses: Record<OrbitalLoaderSize, { outer: string; ring2: string; ring3: string }> = {
  sm: { outer: "h-8 w-8", ring2: "inset-[5px]", ring3: "inset-[10px]" },
  md: { outer: "h-10 w-10", ring2: "inset-[6px]", ring3: "inset-[12px]" },
  lg: { outer: "h-14 w-14", ring2: "inset-[8px]", ring3: "inset-[16px]" },
};

export function OrbitalLoader({
  size = "md",
  className,
  "aria-label": ariaLabel = "Loading",
}: {
  size?: OrbitalLoaderSize;
  className?: string;
  "aria-label"?: string;
}) {
  const s = sizeClasses[size];
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={cn("relative inline-block", s.outer, className)}
    >
      {/* Ring 1 — primary */}
      <span
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-orbit"
        aria-hidden="true"
      />
      {/* Ring 2 — secondary (reverse) */}
      <span
        className={cn(
          "absolute rounded-full border-2 border-transparent border-t-secondary animate-orbit [animation-duration:2s] [animation-direction:reverse]",
          s.ring2,
        )}
        aria-hidden="true"
      />
      {/* Ring 3 — accent */}
      <span
        className={cn(
          "absolute rounded-full border-2 border-transparent border-t-accent animate-orbit [animation-duration:2.5s]",
          s.ring3,
        )}
        aria-hidden="true"
      />
    </span>
  );
}
