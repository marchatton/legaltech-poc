import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "success";
export type ButtonSize = "sm" | "md";

export function buttonClassName(args?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const variant = args?.variant ?? "primary";
  const size = args?.size ?? "md";

  return cn(
    "inline-flex items-center justify-center gap-2 rounded-ui-md font-medium transition-colors duration-micro ease-brand-standard",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-60",
    size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-3 py-2 text-sm",
    variant === "primary"
      ? "bg-foreground text-background hover:bg-foreground/90"
      : variant === "secondary"
        ? "border border-border bg-card text-foreground hover:bg-muted"
        : variant === "ghost"
          ? "bg-transparent text-foreground hover:bg-muted"
          : variant === "success"
            ? "bg-success text-success-foreground hover:bg-success/90"
            : "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    args?.className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, type, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
});

