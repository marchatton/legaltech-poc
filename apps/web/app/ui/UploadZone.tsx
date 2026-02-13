"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "./cn";

export type UploadZoneProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode;
  title?: string;
  description?: string;
  active?: boolean;
};

export const UploadZone = forwardRef<HTMLDivElement, UploadZoneProps>(
  function UploadZone({ className, icon, title, description, active, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-ui-lg border-2 border-dashed border-foreground/20 p-10 text-center cursor-pointer",
          "transition-[border-color,background-color] duration-standard ease-brand-standard",
          "hover:border-primary hover:bg-primary/[0.02]",
          active && "border-primary bg-primary/[0.04]",
          className,
        )}
        {...props}
      >
        {icon && (
          <div className="mx-auto mb-3 text-muted-foreground">{icon}</div>
        )}
        {title && (
          <div className="text-base font-semibold">{title}</div>
        )}
        {description && (
          <div className="mt-1 text-sm text-muted-foreground">{description}</div>
        )}
        {children}
      </div>
    );
  },
);
