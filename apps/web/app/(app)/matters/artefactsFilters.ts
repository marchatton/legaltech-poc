import { firstSearchParamValue, type MatterSearchParamValue } from "./runScope";

export const ARTEFACT_KIND_PARAM = "artefact_kind";
export const ARTEFACT_TYPE_PARAM = "artefact_type";
export const ARTEFACT_SAFETY_PARAM = "artefact_safety";

const ARTEFACT_FILTER_PARAM_KEYS = new Set<string>([
  ARTEFACT_KIND_PARAM,
  ARTEFACT_TYPE_PARAM,
  ARTEFACT_SAFETY_PARAM,
]);

export type ArtefactSafetyFilter = "all" | "safe" | "unsafe";

export type ArtefactFilters = {
  kind: string | null;
  type: string | null;
  safety: ArtefactSafetyFilter;
};

export type ArtefactFilterSearchParams = Record<string, MatterSearchParamValue>;

type ArtefactSafetyInput = {
  filename: string;
  metadata_json: unknown;
};

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function isUnsafeFilename(filename: string): boolean {
  return filename.toUpperCase().includes(".UNSAFE.");
}

function parseSafetyFilter(raw: MatterSearchParamValue): ArtefactSafetyFilter {
  const value = firstSearchParamValue(raw);
  if (value === "unsafe" || value === "safe") return value;
  return "all";
}

function parseOptionFilter(args: {
  raw: MatterSearchParamValue;
  allowedValues: ReadonlySet<string>;
}): string | null {
  const value = firstSearchParamValue(args.raw);
  if (!value) return null;
  return args.allowedValues.has(value) ? value : null;
}

export function uniqueFilterValues(values: ReadonlyArray<string>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export function parseArtefactFilters(args: {
  searchParams?: ArtefactFilterSearchParams;
  availableKinds: ReadonlyArray<string>;
  availableTypes: ReadonlyArray<string>;
}): ArtefactFilters {
  const searchParams = args.searchParams ?? {};
  const availableKinds = new Set(args.availableKinds);
  const availableTypes = new Set(args.availableTypes);

  return {
    kind: parseOptionFilter({
      raw: searchParams[ARTEFACT_KIND_PARAM],
      allowedValues: availableKinds,
    }),
    type: parseOptionFilter({
      raw: searchParams[ARTEFACT_TYPE_PARAM],
      allowedValues: availableTypes,
    }),
    safety: parseSafetyFilter(searchParams[ARTEFACT_SAFETY_PARAM]),
  };
}

export function buildPassthroughSearchEntries(searchParams?: ArtefactFilterSearchParams): Array<[string, string]> {
  if (!searchParams) return [];

  const out: Array<[string, string]> = [];
  for (const [key, raw] of Object.entries(searchParams)) {
    if (ARTEFACT_FILTER_PARAM_KEYS.has(key)) continue;

    if (typeof raw === "string") {
      if (raw.length > 0) out.push([key, raw]);
      continue;
    }

    if (Array.isArray(raw)) {
      for (const value of raw) {
        if (value.length > 0) out.push([key, value]);
      }
    }
  }

  return out;
}

export function searchFromEntries(entries: ReadonlyArray<readonly [string, string]>): string {
  const params = new URLSearchParams();
  for (const [key, value] of entries) {
    params.append(key, value);
  }
  const query = params.toString();
  return query.length > 0 ? `?${query}` : "";
}

export function isUnsafeArtefact(artefact: ArtefactSafetyInput): boolean {
  if (isUnsafeFilename(artefact.filename)) return true;
  if (!isRecord(artefact.metadata_json)) return false;
  return artefact.metadata_json.unsafe_override === true;
}

export function applyArtefactFilters<T extends ArtefactSafetyInput & { kind: string; type: string }>(
  artefacts: ReadonlyArray<T>,
  filters: ArtefactFilters,
): T[] {
  return artefacts.filter((artefact) => {
    if (filters.kind && artefact.kind !== filters.kind) return false;
    if (filters.type && artefact.type !== filters.type) return false;

    const unsafe = isUnsafeArtefact(artefact);
    if (filters.safety === "unsafe" && !unsafe) return false;
    if (filters.safety === "safe" && unsafe) return false;
    return true;
  });
}
