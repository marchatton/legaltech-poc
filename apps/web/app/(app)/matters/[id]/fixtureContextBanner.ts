export type FixtureReadiness = {
  state: "ready" | "blocked" | "already-complete";
  reason: string;
};

export type FixtureContextBanner = {
  activePack: string;
  loadState: string;
  nextStep: string;
  variant: "success" | "warning" | "info";
};

const DEMO_PACK_FROM_NAME_RE = /^DEMO:\s+(pack_[a-z0-9_]+)\b/i;

function activePackFromMatterName(name: string): string | null {
  const match = DEMO_PACK_FROM_NAME_RE.exec(name);
  return match?.[1] ?? null;
}

function loadStateFromReadiness(state: FixtureReadiness["state"]): string {
  if (state === "ready") return "ready";
  if (state === "already-complete") return "already complete";
  return "blocked";
}

function bannerVariant(state: FixtureReadiness["state"]): FixtureContextBanner["variant"] {
  if (state === "ready") return "success";
  if (state === "already-complete") return "info";
  return "warning";
}

export function deriveFixtureContextBanner(args: {
  matterName: string;
  readiness: FixtureReadiness;
}): FixtureContextBanner {
  return {
    activePack: activePackFromMatterName(args.matterName) ?? "not detected",
    loadState: loadStateFromReadiness(args.readiness.state),
    nextStep: args.readiness.reason,
    variant: bannerVariant(args.readiness.state),
  };
}
