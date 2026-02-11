import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "./cn";
import { type FieldSize, fieldClassName } from "./Input";

export type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  uiSize?: FieldSize;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ className, uiSize, ...props }, ref) {
    return (
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={ref}
          type="search"
          className={fieldClassName({
            uiSize,
            className: cn("pl-9", className),
          })}
          {...props}
        />
      </div>
    );
  },
);
