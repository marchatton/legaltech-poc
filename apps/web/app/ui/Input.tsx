import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

import { cn } from "./cn";

export type FieldSize = "sm" | "md";

export function fieldClassName(args?: { uiSize?: FieldSize; className?: string }) {
  const uiSize = args?.uiSize ?? "md";
  return cn(
    "rounded-ui-md border border-input bg-background text-foreground shadow-ui-sm",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
  return <select ref={ref} className={fieldClassName({ uiSize, className })} {...props} />;
});
