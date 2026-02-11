"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { Select } from "../../ui/Input";
import { SectionLabel } from "../../ui/Page";

type Props = {
  packIds: string[];
  selectedPackId: string;
};

export function MattersToolbar(props: Props) {
  const router = useRouter();
  const [pack, setPack] = useState(props.selectedPackId);

  const hasSeeded = props.packIds.length > 0;
  const options = useMemo(
    () => (hasSeeded ? props.packIds : [props.selectedPackId]),
    [hasSeeded, props.packIds, props.selectedPackId],
  );

  // Keep local state aligned when navigating (back/forward, etc).
  useEffect(() => {
    setPack(props.selectedPackId);
  }, [props.selectedPackId]);

  return (
    <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
      <SectionLabel>Seed data</SectionLabel>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Seeded pack</span>
          <Select
            className="min-w-64"
            value={pack}
            onChange={(e) => {
              const next = e.currentTarget.value;
              setPack(next);
              router.push(`/matters?${new URLSearchParams({ pack: next }).toString()}`);
            }}
          >
            {options.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </Select>
        </label>

        {!hasSeeded ? (
          <div className="text-xs text-muted-foreground">
            No seeded packs found. Run <code className="font-mono">pnpm fixture:seed pack_01_clean</code>.
          </div>
        ) : null}
      </div>
    </section>
  );
}
