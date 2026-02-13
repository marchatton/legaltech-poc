"use client";

import { createContext, forwardRef, useContext, useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "./cn";
import { useAnimatedPresence } from "./useAnimatedPresence";

const ModalTitleIdContext = createContext<string | undefined>(undefined);

/* ── ModalOverlay (backdrop) ── */

export function ModalOverlay({
  className,
  onClose,
  closing,
  ...props
}: HTMLAttributes<HTMLDivElement> & { onClose?: () => void; closing?: boolean }) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/25 backdrop-blur-[4px]",
        closing ? "animate-fade-out" : "animate-fade-in",
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
  closing?: boolean;
};

const sizeClasses: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  function ModalContent({ className, size = "md", closing, ...props }, ref) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
        )}
      >
        <div
          ref={ref}
          className={cn(
            "w-full rounded-ui-xl border border-border bg-card p-6 shadow-ui-lg",
            closing ? "animate-fade-out" : "animate-fade-in",
            sizeClasses[size],
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

/* ── ModalTitle ── */

export function ModalTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const titleId = useContext(ModalTitleIdContext);
  return (
    <h2
      id={titleId}
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

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, size, children, className }: ModalProps) {
  const { shouldRender, isAnimating } = useAnimatedPresence(open);
  const closing = !isAnimating && shouldRender;
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!shouldRender) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus first focusable element inside modal
    requestAnimationFrame(() => {
      const el = contentRef.current;
      if (!el) return;
      const first = el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      first?.focus();
    });

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const el = contentRef.current;
      if (!el) return;

      const focusable = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus();
    };
  }, [shouldRender, onClose]);

  if (!shouldRender) return null;

  return createPortal(
    <ModalTitleIdContext.Provider value={titleId}>
      <ModalOverlay onClose={onClose} closing={closing} />
      <ModalContent ref={contentRef} size={size} className={className} closing={closing} aria-labelledby={titleId}>
        {children}
      </ModalContent>
    </ModalTitleIdContext.Provider>,
    document.body,
  );
}
