"use client";

import { useEffect, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "./cn";

/* ── ModalOverlay (backdrop) ── */

export function ModalOverlay({
  className,
  onClose,
  ...props
}: HTMLAttributes<HTMLDivElement> & { onClose?: () => void }) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/25 backdrop-blur-[4px]",
        "animate-fade-in",
        className,
      )}
      aria-hidden="true"
      onClick={onClose}
      {...props}
    />
  );
}

/* ── ModalContent (the dialog box) ── */

export type ModalContentProps = HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function ModalContent({ className, size = "md", ...props }: ModalContentProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
      )}
    >
      <div
        className={cn(
          "w-full rounded-ui-xl border border-border bg-card p-6 shadow-ui-lg",
          "animate-fade-in",
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    </div>
  );
}

/* ── ModalTitle ── */

export function ModalTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("font-serif text-heading-sm font-medium", className)}
      {...props}
    />
  );
}

/* ── ModalBody ── */

export function ModalBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-2 text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  );
}

/* ── ModalActions ── */

export function ModalActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-5 flex items-center justify-end gap-2.5", className)}
      {...props}
    />
  );
}

/* ── Modal (convenience wrapper) ── */

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
};

export function Modal({ open, onClose, size, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <ModalOverlay onClose={onClose} />
      <ModalContent size={size} className={className}>
        {children}
      </ModalContent>
    </>
  );
}
