import type { OrbitalMode } from "../../../lib/runtimeMode";

type ShellEnvironmentBadgeVariant = "warning" | "muted";

export type ShellEnvironment = {
  label: string;
  badgeVariant: ShellEnvironmentBadgeVariant;
};

export function resolveShellEnvironment(mode: OrbitalMode, demoModeEnabled: boolean): ShellEnvironment {
  if (mode === "demo-prod") {
    return { label: "demo-prod", badgeVariant: "warning" };
  }

  if (mode === "dev" && demoModeEnabled) {
    return { label: "demo-dev", badgeVariant: "warning" };
  }

  if (mode === "dev") {
    return { label: "dev", badgeVariant: "muted" };
  }

  return { label: "production", badgeVariant: "muted" };
}
