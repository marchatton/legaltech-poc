"use client";

import { useEffect } from "react";

export type KeyboardShortcutMap = Record<string, (event: KeyboardEvent) => void>;

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcutMap,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      const handler = shortcuts[event.key];
      if (handler) handler(event);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcuts, enabled]);
}
