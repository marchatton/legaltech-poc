import { parseDemoMatterMetadata } from "../../../../lib/demoMatterMetadata";

export type FixtureReadiness = {
  state: "ready" | "blocked" | "already-complete";
  reason: string;
};

export type FixtureContextBanner = {
  activePack: string;
  loadedAt: string;
  loadState: string;
  nextStep: string;
  variant: "success" | "warning" | "info";
};

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

export function fixtureStatusLabel(variant: FixtureContextBanner["variant"]): string {
  if (variant === "success") return "ready";
  if (variant === "info") return "already complete";
  return "blocked";
}

export function deriveFixtureContextBanner(args: {
  matterName: string;
  readiness: FixtureReadiness;
}): FixtureContextBanner {
  const metadata = parseDemoMatterMetadata(args.matterName);

  return {
    activePack: metadata?.packId ?? "not detected",
    loadedAt: metadata?.loadedAt ?? "not detected",
    loadState: loadStateFromReadiness(args.readiness.state),
    nextStep: args.readiness.reason,
    variant: bannerVariant(args.readiness.state),
  };
}
