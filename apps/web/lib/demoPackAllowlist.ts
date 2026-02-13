export const DEMO_PACK_ALLOWLIST = ["pack_01_clean", "pack_02_missing_rea", "pack_09_bad_citation"] as const;

export type DemoPackId = (typeof DEMO_PACK_ALLOWLIST)[number];
