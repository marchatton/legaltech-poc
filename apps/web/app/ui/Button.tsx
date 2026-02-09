import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "./cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "neutral" | "secondary" | "ghost" | "destructive" | "success" | "outline" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:brightness-90 hover:-translate-y-px hover:shadow-ui-md active:translate-y-0",
  neutral:
    "bg-foreground text-background hover:bg-foreground/90 hover:-translate-y-px hover:shadow-ui-sm active:translate-y-0",
  secondary:
    "border border-border bg-card text-foreground hover:border-foreground/20 hover:bg-muted active:translate-y-px",
  ghost: "bg-transparent text-foreground hover:bg-muted active:translate-y-px",
  destructive:
    "bg-destructive text-destructive-foreground hover:brightness-90 hover:-translate-y-px hover:shadow-ui-sm active:translate-y-0",
  success:
    "bg-success text-success-foreground hover:brightness-90 hover:-translate-y-px hover:shadow-ui-sm active:translate-y-0",
  outline:
    "border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground active:translate-y-px",
  link: "bg-transparent text-foreground underline underline-offset-[3px] hover:text-primary p-0 h-auto shadow-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-2xs",
  md: "h-9 px-3 py-2 text-sm",
  lg: "h-11 px-5 text-base",
};

export function buttonClassName(args?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  className?: string;
}) {
  const variant = args?.variant ?? "primary";
  const size = args?.size ?? "md";

  return cn(
    "inline-flex items-center justify-center gap-2 font-medium",
    args?.pill ? "rounded-pill" : "rounded-ui-md",
    "transition-[transform,box-shadow,background-color,border-color,color,filter] duration-micro ease-brand-standard",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-60",
    variant !== "link" && sizeClasses[size],
    variantClasses[variant],
    args?.className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, pill, type, loading, loadingLabel, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={buttonClassName({ variant, size, pill, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="xs" className="shrink-0" aria-label="Loading" />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
});
