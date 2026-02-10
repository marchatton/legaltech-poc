export type OrbitalMode = "dev" | "demo-prod" | "prod";

function normaliseMode(raw: string | undefined): OrbitalMode | null {
  const s = raw?.trim();
  if (!s) return null;
  if (s === "dev" || s === "demo-prod" || s === "prod") return s;
  return null;
}

// NOTE: This module is imported by both Node/server code and Next middleware (edge),
// so it must not use Node-only APIs or `server-only`.
export function orbitalMode(): OrbitalMode {
  const fromEnv = normaliseMode(process.env.ORBITAL_MODE);
  if (fromEnv) return fromEnv;

  // Local development should not require ORBITAL_MODE.
  if (process.env.NODE_ENV === "development") return "dev";

  // Default posture: locked down unless explicitly opted into demo-prod.
  return "prod";
}

export function isDevOrDemoProd(): boolean {
  const m = orbitalMode();
  return m === "dev" || m === "demo-prod";
}

export function isDemoProd(): boolean {
  return orbitalMode() === "demo-prod";
}

