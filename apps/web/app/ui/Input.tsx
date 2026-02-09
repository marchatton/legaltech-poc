import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

import { cn } from "./cn";

export type FieldSize = "sm" | "md";

export function fieldClassName(args?: { uiSize?: FieldSize; className?: string }) {
  const uiSize = args?.uiSize ?? "md";
  return cn(
    "rounded-ui-md border border-input bg-background text-foreground",
    "transition-colors duration-micro ease-brand-standard",
    "placeholder:text-muted-foreground",
    "hover:border-foreground/20",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:shadow-[0_0_0_3px_rgba(216,172,255,0.2)]",
    "disabled:cursor-not-allowed disabled:opacity-60",
    uiSize === "sm" ? "h-8 px-2 text-xs" : "h-9 px-3 text-sm",
    args?.className,
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  uiSize?: FieldSize;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, uiSize, ...props },
  ref,
) {
  return <input ref={ref} className={fieldClassName({ uiSize, className })} {...props} />;
});

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  uiSize?: FieldSize;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, uiSize, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={fieldClassName({
          uiSize,
          className: cn("appearance-none pr-9 cursor-pointer", className),
        })}
        {...props}
      />
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
});
