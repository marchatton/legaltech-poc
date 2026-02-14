export const DEMO_PACK_ALLOWLIST = [
  "pack_01_clean",
  "pack_02_missing_rea",
  "pack_03_mismatch_and_cert_gap",
  "pack_04_multi_parcel",
  "pack_05_partial_release",
  "pack_06_overlapping_easements",
  "pack_07_scans_rotated_low_quality",
  "pack_08_defined_terms_and_cross_refs",
  "pack_09_bad_citation",
] as const;

export type DemoPackId = (typeof DEMO_PACK_ALLOWLIST)[number];
