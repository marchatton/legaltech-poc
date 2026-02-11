import fs from "node:fs";
import path from "node:path";

function repoRoot(): string {
  return path.resolve(process.cwd());
}

function baseUrl(): string {
  return (process.env.ORBITAL_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function readJson(res: Response): Promise<any> {
  const json = await res.json().catch(() => null);
  if (!json) throw new Error(`Expected JSON response, got status=${res.status}`);
  return json;
}

async function main() {
  const base = baseUrl();

  async function createFolderId(label: string): Promise<string> {
    const res = await fetch(`${base}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `US-002 smoke ${label} (${new Date().toISOString()})` }),
    });
    if (!res.ok) throw new Error(`Create folder failed: ${JSON.stringify(await readJson(res))}`);
    const json = await readJson(res);
    const id = String(json.folder?.id ?? "");
    if (!id) throw new Error("Missing folder.id from create response.");
    return id;
  }

  async function uploadFiles(folderId: string, files: Array<{ pack: string; filename: string }>) {
    const out: Array<{ id: string; storage_key: string; filename: string }> = [];

    for (const f of files) {
      const filePath = path.resolve(repoRoot(), "docs/08-example-data", f.pack, "docs", f.filename);
      const bytes = new Uint8Array(fs.readFileSync(filePath));

      const initRes = await fetch(`${base}/folders/${folderId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: f.filename, mime: "application/pdf", bytes: bytes.byteLength }),
      });
      if (!initRes.ok) throw new Error(`Init upload failed: ${JSON.stringify(await readJson(initRes))}`);

      const initJson = await readJson(initRes);
      const documentId = String(initJson.document?.id ?? "");
      const storageKey = String(initJson.upload?.storage_key ?? "");
      const uploadUrlRaw = String(initJson.upload?.url ?? "");
      const uploadHeaders = (initJson.upload?.headers ?? {}) as Record<string, string>;

      if (!documentId || !storageKey || !uploadUrlRaw) {
        throw new Error(`Init upload response missing fields: ${JSON.stringify(initJson)}`);
      }

      const uploadUrl = new URL(uploadUrlRaw, base).toString();
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: uploadHeaders,
        body: bytes,
      });
      if (!putRes.ok) {
        const text = await putRes.text().catch(() => "");
        throw new Error(`PUT upload failed: status=${putRes.status} body=${text.slice(0, 200)}`);
      }

      out.push({ id: documentId, storage_key: storageKey, filename: f.filename });
    }

    return out;
  }

  async function completeAndWait(folderId: string, docs: Array<{ id: string; storage_key: string }>) {
    for (const d of docs) {
      const completeRes = await fetch(`${base}/documents/${d.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storage_key: d.storage_key }),
      });
      if (!completeRes.ok) throw new Error(`Complete upload failed: ${JSON.stringify(await readJson(completeRes))}`);
    }

    const seen: Record<string, { parse: Set<string>; ocr: Set<string> }> = {};
    for (const d of docs) seen[d.id] = { parse: new Set(), ocr: new Set() };

    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      const listRes = await fetch(`${base}/folders/${folderId}/documents`);
      if (!listRes.ok) throw new Error(`List documents failed: ${JSON.stringify(await readJson(listRes))}`);

      const json = await readJson(listRes);
      const items: any[] = Array.isArray(json.documents) ? json.documents : [];
      const byId = new Map(items.map((it) => [String(it.id), it]));

      let terminal = 0;
      for (const d of docs) {
        const it = byId.get(d.id);
        if (!it) continue;
        const parse = String(it.parse_status ?? "");
        const ocr = String(it.ocr_status ?? "");
        seen[d.id]!.parse.add(parse);
        seen[d.id]!.ocr.add(ocr);

        const isTerminal = ["parsed", "failed"].includes(parse) && ["done", "failed"].includes(ocr);
        if (isTerminal) terminal++;
      }

      if (terminal === docs.length) break;
      await sleep(200);
    }

    const intermediateSeen = docs.some((d) => seen[d.id]!.parse.has("parsing") || seen[d.id]!.ocr.has("running"));
    if (!intermediateSeen) {
      const snapshot = Object.fromEntries(
        Object.entries(seen).map(([id, s]) => [id, { parse: [...s.parse], ocr: [...s.ocr] }]),
      );
      throw new Error(`Did not observe intermediate ingest states. Seen=${JSON.stringify(snapshot)}`);
    }
  }

  // Scenario A: mixed-quality docs should ingest and settle in a consistent folder state.
  const folderA = await createFolderId("mixed");
  const docsA = await uploadFiles(folderA, [
    { pack: "pack_01_clean", filename: "TitleCommitment.pdf" },
    { pack: "pack_07_scans_rotated_low_quality", filename: "ALTA_Survey_SCANNED_ROTATED.pdf" },
  ]);

  // Negative case: wrong storage_key -> VALIDATION_ERROR.
  const badCompleteRes = await fetch(`${base}/documents/${docsA[0]!.id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storage_key: `${docsA[0]!.storage_key}.wrong` }),
  });
  if (badCompleteRes.status !== 400) throw new Error(`Expected 400 for wrong storage_key, got ${badCompleteRes.status}`);
  const badJson = await readJson(badCompleteRes);
  if (String(badJson?.error?.code ?? "") !== "VALIDATION_ERROR") {
    throw new Error(`Expected VALIDATION_ERROR, got ${JSON.stringify(badJson)}`);
  }

  await completeAndWait(folderA, docsA);
  const folderAState = String((await readJson(await fetch(`${base}/folders/${folderA}`))).folder?.state ?? "");

  // Scenario B: a clean, text-heavy PDF should pass "ready" checks.
  const folderB = await createFolderId("clean");
  const docsB = await uploadFiles(folderB, [{ pack: "pack_01_clean", filename: "TitleCommitment.pdf" }]);
  await completeAndWait(folderB, docsB);
  const folderBState = String((await readJson(await fetch(`${base}/folders/${folderB}`))).folder?.state ?? "");
  if (folderBState !== "ready") {
    throw new Error(`Expected clean folder to become ready, got ${folderBState}`);
  }

  process.stdout.write(`US-002 smoke OK: mixed=${folderA}(${folderAState}) clean=${folderB}(${folderBState})\n`);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
