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

  const pack = "pack_01_clean";
  const filename = "TitleCommitment.pdf";

  const filePath = path.resolve(repoRoot(), "docs/08-example-data", pack, "docs", filename);
  const bytes = new Uint8Array(fs.readFileSync(filePath));

  const folderRes = await fetch(`${base}/folders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: `US-001 smoke (${new Date().toISOString()})` }),
  });
  if (!folderRes.ok) throw new Error(`Create folder failed: ${JSON.stringify(await readJson(folderRes))}`);
  const folderJson = await readJson(folderRes);
  const folderId = String(folderJson.folder?.id ?? "");
  if (!folderId) throw new Error("Missing folder.id from create response.");

  const initRes = await fetch(`${base}/folders/${folderId}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, mime: "application/pdf", bytes: bytes.byteLength }),
  });
  if (!initRes.ok) throw new Error(`Init upload failed: ${JSON.stringify(await readJson(initRes))}`);

  const initJson = await readJson(initRes);
  const documentId = String(initJson.document?.id ?? "");
  const storageKey = String(initJson.upload?.storage_key ?? "");
  const uploadUrl = String(initJson.upload?.url ?? "");
  const uploadHeaders = (initJson.upload?.headers ?? {}) as Record<string, string>;

  if (!documentId || !storageKey || !uploadUrl) {
    throw new Error(`Init upload response missing fields: ${JSON.stringify(initJson)}`);
  }

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: uploadHeaders,
    body: bytes,
  });
  if (!putRes.ok) {
    const text = await putRes.text().catch(() => "");
    throw new Error(`PUT upload failed: status=${putRes.status} body=${text.slice(0, 200)}`);
  }

  const completeRes = await fetch(`${base}/documents/${documentId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storage_key: storageKey }),
  });
  if (!completeRes.ok) throw new Error(`Complete upload failed: ${JSON.stringify(await readJson(completeRes))}`);

  let pageCount: number | null = null;
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const listRes = await fetch(`${base}/folders/${folderId}/documents`);
    if (!listRes.ok) throw new Error(`List documents failed: ${JSON.stringify(await readJson(listRes))}`);
    const listJson = await readJson(listRes);
    const items: any[] = Array.isArray(listJson.documents) ? listJson.documents : [];
    const doc = items.find((it) => String(it.id ?? "") === documentId);
    const pc = typeof doc?.page_count === "number" && Number.isFinite(doc.page_count) ? doc.page_count : null;
    if (pc && pc > 0) {
      pageCount = pc;
      break;
    }
    await sleep(200);
  }

  if (!pageCount) throw new Error("Timed out waiting for page_count to become known.");

  const renderRes = await fetch(`${base}/documents/${documentId}/render?page=1`);
  if (!renderRes.ok) throw new Error(`Render URL fetch failed: ${JSON.stringify(await readJson(renderRes))}`);
  const renderJson = await readJson(renderRes);

  const renderUrl = String(renderJson.render_url ?? "");
  if (!renderUrl) throw new Error(`Missing render_url in response: ${JSON.stringify(renderJson)}`);

  const expires = renderRes.headers.get("x-orbital-render-expires") ?? "";
  const sig = renderRes.headers.get("x-orbital-render-signature") ?? "";
  if (!expires || !sig) {
    throw new Error("Missing X-Orbital-Render-* headers on render response.");
  }

  const rangeRes = await fetch(renderUrl, {
    headers: {
      Range: "bytes=0-10",
      "X-Orbital-Render-Expires": expires,
      "X-Orbital-Render-Signature": sig,
    },
  });

  if (rangeRes.status !== 206) {
    const text = await rangeRes.text().catch(() => "");
    throw new Error(`Range precheck failed: status=${rangeRes.status} body=${text.slice(0, 200)}`);
  }

  const acceptRanges = (rangeRes.headers.get("accept-ranges") ?? "").toLowerCase();
  if (acceptRanges !== "bytes") {
    throw new Error(`Expected Accept-Ranges: bytes, got ${JSON.stringify(acceptRanges)}`);
  }

  const contentRange = rangeRes.headers.get("content-range") ?? "";
  if (!/^bytes 0-10\/[0-9]+$/.test(contentRange)) {
    throw new Error(`Expected Content-Range like "bytes 0-10/...", got ${JSON.stringify(contentRange)}`);
  }

  const buf = new Uint8Array(await rangeRes.arrayBuffer());
  if (buf.byteLength !== 11) {
    throw new Error(`Expected 11 bytes from Range precheck, got ${buf.byteLength}`);
  }

  const missingRes = await fetch(`${base}/documents/does-not-exist/render?page=1`);
  if (missingRes.status !== 404) throw new Error(`Expected 404 for unknown document, got ${missingRes.status}`);
  const missingJson = await readJson(missingRes);
  if (String(missingJson?.error?.code ?? "") !== "NOT_FOUND") {
    throw new Error(`Expected NOT_FOUND, got ${JSON.stringify(missingJson)}`);
  }
  if (!String(missingJson?.error?.trace_id ?? "")) {
    throw new Error(`Expected trace_id in NOT_FOUND envelope, got ${JSON.stringify(missingJson)}`);
  }

  const oobPage = pageCount + 1;
  const oobRes = await fetch(`${base}/documents/${documentId}/render?page=${oobPage}`);
  if (oobRes.status !== 400) throw new Error(`Expected 400 for out-of-range page, got ${oobRes.status}`);
  const oobJson = await readJson(oobRes);
  if (String(oobJson?.error?.code ?? "") !== "VALIDATION_ERROR") {
    throw new Error(`Expected VALIDATION_ERROR, got ${JSON.stringify(oobJson)}`);
  }
  if (!String(oobJson?.error?.trace_id ?? "")) {
    throw new Error(`Expected trace_id in VALIDATION_ERROR envelope, got ${JSON.stringify(oobJson)}`);
  }

  process.stdout.write(`US-001 render smoke OK: doc=${documentId} page_count=${pageCount}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
