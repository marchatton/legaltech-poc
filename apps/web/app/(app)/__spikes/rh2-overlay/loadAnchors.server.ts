import "server-only";

import fs from "node:fs";
import path from "node:path";

import { AnchorFileSchema } from "@orbital-poc/core";

export type LoadedAnchors = {
  anchorIds: string[];
  anchors: Record<string, { page: number; bbox: [number, number, number, number] }>;
};

export function loadAnchorsFromFixture(args: {
  pack: string;
  docKey: "TitleCommitment" | "ALTA_Survey";
}): LoadedAnchors {
  const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data", args.pack);
  const anchorsPath = path.join(packRoot, "layout", `${args.docKey}.anchors.json`);

  const raw = fs.readFileSync(anchorsPath, "utf8");
  const parsed = AnchorFileSchema.parse(JSON.parse(raw));

  const anchors: LoadedAnchors["anchors"] = {};
  for (const [id, v] of Object.entries(parsed)) {
    anchors[id] = { page: v.page, bbox: v.bbox };
  }

  const anchorIds = Object.keys(anchors).sort();
  return { anchorIds, anchors };
}
