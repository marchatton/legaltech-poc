"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

type Props = {
  enabled: boolean;
  intervalMs?: number;
};

export function MatterAutoRefresh({ enabled, intervalMs = 5000 }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [enabled, intervalMs, router]);

  return null;
}
