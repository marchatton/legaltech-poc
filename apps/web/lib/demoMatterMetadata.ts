const DEMO_MATTER_NAME_RE = /^DEMO:\s+(pack_[a-z0-9_]+)\s+(.+)$/i;

export type DemoMatterMetadata = {
  packId: string;
  loadedAt: string;
};

export function parseDemoMatterMetadata(matterName: string): DemoMatterMetadata | null {
  const match = DEMO_MATTER_NAME_RE.exec(matterName.trim());
  if (!match) return null;

  const packId = match[1]?.trim() ?? "";
  const loadedAt = match[2]?.trim() ?? "";
  if (!packId || !loadedAt) return null;

  return { packId, loadedAt };
}

export function formatDemoLoadedAtLabel(raw: string): string {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toISOString().slice(0, 16).replace("T", " ");
}
