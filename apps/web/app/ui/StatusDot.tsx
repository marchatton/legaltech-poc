import { cn } from "./cn";

export type StatusDotStatus = "success" | "warning" | "error" | "muted" | "info";
export type StatusDotSize = "xs" | "sm";

type StatusDotProps = {
  status: StatusDotStatus;
  size?: StatusDotSize;
  label?: string;
  className?: string;
};

const statusColorClasses: Record<StatusDotStatus, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
  muted: "bg-muted-foreground",
  info: "bg-info",
};

const sizeClasses: Record<StatusDotSize, string> = {
  xs: "h-1.5 w-1.5",
  sm: "h-2 w-2",
};

export function StatusDot({ status, size = "xs", label, className }: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span
        className={cn("shrink-0 rounded-full", sizeClasses[size], statusColorClasses[status])}
        aria-hidden="true"
      />
      {label ? <span>{label}</span> : null}
    </span>
  );
}
