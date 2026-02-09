import { cn } from "./cn";

export type SpinnerSize = "xs" | "sm" | "md";
export type SpinnerVariant = "current" | "primary";

const sizeClasses: Record<SpinnerSize, string> = {
  xs: "h-3 w-3 border-[1.5px]",
  sm: "h-3.5 w-3.5 border-2",
  md: "h-4 w-4 border-2",
};

const variantClasses: Record<SpinnerVariant, string> = {
  current: "border-current border-t-transparent",
  primary: "border-border border-t-primary",
};

export function Spinner({
  size = "sm",
  variant = "current",
  className,
  "aria-label": ariaLabel = "Loading",
}: {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "inline-block animate-spin rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    />
  );
}
