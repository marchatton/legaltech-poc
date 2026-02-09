import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "./cn";

export type ButtonVariant = "primary" | "neutral" | "secondary" | "ghost" | "destructive" | "success" | "outline" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  neutral: "bg-foreground text-background hover:bg-foreground/90",
  secondary: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  success: "bg-success text-success-foreground hover:bg-success/90",
  outline: "border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
  link: "bg-transparent text-foreground underline underline-offset-4 hover:text-primary p-0 h-auto shadow-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-3 py-2 text-sm",
  lg: "h-11 px-5 text-base",
};

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
    variant !== "link" && sizeClasses[size],
    variantClasses[variant],
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
