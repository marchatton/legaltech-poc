import { notFound } from "next/navigation";

export function assertDevOnly(): void {
  if (process.env.NODE_ENV !== "development") notFound();
}

export function assertDevOrDemoProd(): void {
  // Keep spikes and unsafe tooling dev-only, but allow the demo-prod runtime to
  // reach the core demo journey surfaces explicitly.
  const mode = process.env.ORBITAL_MODE?.trim();
  const ok = process.env.NODE_ENV === "development" || mode === "demo-prod" || mode === "dev";
  if (!ok) notFound();
}
