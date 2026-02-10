import { notFound } from "next/navigation";

import { isDevOrDemoProd } from "./runtimeMode";

export function assertDevOnly(): void {
  if (process.env.NODE_ENV !== "development") notFound();
}

export function assertDevOrDemoProd(): void {
  // Keep spikes and unsafe tooling dev-only, but allow the demo-prod runtime to
  // reach the core demo journey surfaces explicitly.
  if (!isDevOrDemoProd()) notFound();
}
