import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type GlobalObj = typeof globalThis & {
  __orbitalObjectStoreSecret?: string;
};

const STORAGE_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/documents\/[A-Za-z0-9_-]+\.pdf$/;
const ARTEFACT_CSV_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/artefacts\/art_[0-9a-f-]+\.csv$/i;
const ARTEFACT_DOCX_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/artefacts\/art_[0-9a-f-]+\.docx$/i;
const ARTEFACT_META_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/artefacts\/art_[0-9a-f-]+\.meta\.json$/i;

function objectStoreRoot(): string {
  // In Next dev, `process.cwd()` resolves to `apps/web`.
  return path.resolve(process.cwd(), "../../tmp/object-store");
}

export function validateStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!STORAGE_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactCsvStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!ARTEFACT_CSV_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactDocxStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!ARTEFACT_DOCX_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactMetadataStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!ARTEFACT_META_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (ARTEFACT_CSV_KEY_RE.test(storageKey)) return { ok: true };
  if (ARTEFACT_DOCX_KEY_RE.test(storageKey)) return { ok: true };
  return { ok: false, reason: "INVALID_STORAGE_KEY" };
}

function resolveObjectPath(storageKey: string): string {
  const base = objectStoreRoot();
  const candidate = path.resolve(base, storageKey);
  if (!candidate.startsWith(base + path.sep)) throw new Error("PATH_TRAVERSAL");
  return candidate;
}

function secret(): string {
  const fromEnv = process.env.OBJECT_STORE_SIGNING_SECRET;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();

  // Fail closed unless explicitly allowed in dev.
  const devFallbackAllowed = process.env.NODE_ENV === "development" && process.env.ALLOW_DEV_OBJECT_STORE_SECRET === "1";
  if (!devFallbackAllowed) {
    throw new Error("OBJECT_STORE_SIGNING_SECRET_MISSING");
  }

  // Dev-only fallback so local demo flows work out of the box.
  //
  // Next.js may execute route handlers in separate isolates during dev. A global-only
  // secret can differ between those isolates, which breaks signed URL verification
  // across endpoints. Persisting to the object-store directory keeps it stable.
  const g = globalThis as GlobalObj;
  const base = objectStoreRoot();
  fs.mkdirSync(base, { recursive: true });
  const secretPath = path.resolve(base, ".dev-signing-secret");

  // Disk secret is canonical (so all isolates converge).
  try {
    const fromDisk = fs.readFileSync(secretPath, "utf8").trim();
    if (fromDisk) {
      g.__orbitalObjectStoreSecret = fromDisk;
      return fromDisk;
    }
  } catch (err) {
    const code = err instanceof Error ? (err as NodeJS.ErrnoException).code : null;
    if (code !== "ENOENT") throw err;
  }

  const existing = g.__orbitalObjectStoreSecret?.trim();
  const candidate = existing && existing.length ? existing : `dev-${randomBytes(32).toString("hex")}`;

  // Best-effort persist, then read back to handle concurrent writers.
  try {
    fs.writeFileSync(secretPath, candidate, { flag: "wx", mode: 0o600 });
  } catch (err) {
    const code = err instanceof Error ? (err as NodeJS.ErrnoException).code : null;
    if (code !== "EEXIST") throw err;
  }

  try {
    const fromDisk = fs.readFileSync(secretPath, "utf8").trim();
    if (fromDisk) {
      g.__orbitalObjectStoreSecret = fromDisk;
      return fromDisk;
    }
  } catch {
    // Fall back to the in-memory secret.
  }

  g.__orbitalObjectStoreSecret = candidate;
  return candidate;
}

function b64url(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

const SIGNATURE_PAYLOAD_VERSION = "v1";

function sign(args: { purpose: string; storageKey: string; expiresAtMs: number }): string {
  const payload = `${SIGNATURE_PAYLOAD_VERSION}\n${args.purpose}\n${args.storageKey}\n${args.expiresAtMs}`;
  const digest = createHmac("sha256", secret()).update(payload).digest();
  return b64url(digest);
}

export function verifySignature(args: { purpose: string; storageKey: string; expiresAtMs: number; sig: string }): boolean {
  const expiresAtMs = args.expiresAtMs;
  if (!Number.isFinite(expiresAtMs)) return false;

  // Defensive-in-depth: signatures are not valid once expired, even if the HMAC matches.
  const now = Date.now();
  if (expiresAtMs < now) return false;

  // Cap far-future signatures so callers can't accidentally mint "near-permanent" URLs.
  const maxFutureMs = 24 * 60 * 60 * 1000;
  if (expiresAtMs > now + maxFutureMs) return false;

  const expected = sign({ purpose: args.purpose, storageKey: args.storageKey, expiresAtMs: args.expiresAtMs });
  const a = Buffer.from(expected);
  const b = Buffer.from(args.sig);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function createSignedHeaders(args: {
  purpose: string;
  storageKey: string;
  expiresInSeconds?: number;
}): { expires_at_ms: number; signature: string } {
  const expiresInSeconds = args.expiresInSeconds ?? 10 * 60;
  const expiresAtMs = Date.now() + expiresInSeconds * 1000;
  const signature = sign({ purpose: args.purpose, storageKey: args.storageKey, expiresAtMs });
  return { expires_at_ms: expiresAtMs, signature };
}

export function createSignedPutHeaders(args: {
  storageKey: string;
  expiresInSeconds?: number;
}): { expires_at_ms: number; signature: string } {
  return createSignedHeaders({ purpose: "put", ...args });
}

export function createSignedGetHeaders(args: {
  storageKey: string;
  expiresInSeconds?: number;
}): { expires_at_ms: number; signature: string } {
  return createSignedHeaders({ purpose: "get", ...args });
}

export function objectExists(storageKey: string): boolean {
  const p = resolveObjectPath(storageKey);
  return fs.existsSync(p);
}

function sha256Digest(bytes: Uint8Array): string {
  const hash = createHash("sha256").update(bytes).digest("hex");
  return `sha256:${hash}`;
}

async function writeObjectFile(p: string, bytes: Uint8Array, opts?: { writeOnce?: boolean }): Promise<void> {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (opts?.writeOnce) {
    await fs.promises.writeFile(p, bytes, { flag: "wx" });
    return;
  }
  await fs.promises.writeFile(p, bytes);
}

export async function putObject(args: {
  storageKey: string;
  bytes: Uint8Array;
}): Promise<{ bytesWritten: number; sha256: string }> {
  const p = resolveObjectPath(args.storageKey);
  await writeObjectFile(p, args.bytes);
  return { bytesWritten: args.bytes.byteLength, sha256: sha256Digest(args.bytes) };
}

export async function putObjectWriteOnce(args: {
  storageKey: string;
  bytes: Uint8Array;
}): Promise<{ bytesWritten: number; sha256: string }> {
  const p = resolveObjectPath(args.storageKey);
  await writeObjectFile(p, args.bytes, { writeOnce: true });
  return { bytesWritten: args.bytes.byteLength, sha256: sha256Digest(args.bytes) };
}

export async function readObject(storageKey: string): Promise<Uint8Array> {
  const p = resolveObjectPath(storageKey);
  const buf = await fs.promises.readFile(p);
  return new Uint8Array(buf);
}

export async function statObject(storageKey: string): Promise<fs.Stats> {
  const p = resolveObjectPath(storageKey);
  return fs.promises.stat(p);
}

export function createObjectReadStream(
  storageKey: string,
  opts?: { start?: number; end?: number },
): fs.ReadStream {
  const p = resolveObjectPath(storageKey);
  return fs.createReadStream(p, opts);
}
