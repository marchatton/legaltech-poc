import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createSignedGetHeaders, createSignedPutHeaders, verifySignature } from "./objectStore.server";

function setEnv(key: string, val: string | undefined) {
  const env = process.env as unknown as Record<string, string | undefined>;
  if (val === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete env[key];
    return;
  }
  env[key] = val;
}

function resetDevFallbackSecret() {
  const g = globalThis as unknown as { __orbitalObjectStoreSecret?: string };
  delete g.__orbitalObjectStoreSecret;
}

describe("object store signing", () => {
  const originalEnv = {
    NODE_ENV: process.env.NODE_ENV,
    OBJECT_STORE_SIGNING_SECRET: process.env.OBJECT_STORE_SIGNING_SECRET,
    ALLOW_DEV_OBJECT_STORE_SECRET: process.env.ALLOW_DEV_OBJECT_STORE_SECRET,
  };

  beforeEach(() => {
    resetDevFallbackSecret();
    delete process.env.ALLOW_DEV_OBJECT_STORE_SECRET;
    delete process.env.OBJECT_STORE_SIGNING_SECRET;
  });

  afterEach(() => {
    resetDevFallbackSecret();
    setEnv("NODE_ENV", originalEnv.NODE_ENV);
    if (originalEnv.OBJECT_STORE_SIGNING_SECRET !== undefined) {
      process.env.OBJECT_STORE_SIGNING_SECRET = originalEnv.OBJECT_STORE_SIGNING_SECRET;
    } else {
      delete process.env.OBJECT_STORE_SIGNING_SECRET;
    }
    if (originalEnv.ALLOW_DEV_OBJECT_STORE_SECRET !== undefined) {
      process.env.ALLOW_DEV_OBJECT_STORE_SECRET = originalEnv.ALLOW_DEV_OBJECT_STORE_SECRET;
    } else {
      delete process.env.ALLOW_DEV_OBJECT_STORE_SECRET;
    }
  });

  it("accepts a valid, unexpired signature", () => {
    process.env.OBJECT_STORE_SIGNING_SECRET = "test-secret";
    const storageKey = "folders/fld_123/documents/doc_123.pdf";

    const signed = createSignedPutHeaders({ storageKey, expiresInSeconds: 60 });
    expect(
      verifySignature({ purpose: "put", storageKey, expiresAtMs: signed.expires_at_ms, sig: signed.signature }),
    ).toBe(true);
  });

  it("rejects an expired signature even when the HMAC matches", () => {
    process.env.OBJECT_STORE_SIGNING_SECRET = "test-secret";
    const storageKey = "folders/fld_123/documents/doc_123.pdf";

    // Negative expiry mints a signature that is already expired.
    const signed = createSignedGetHeaders({ storageKey, expiresInSeconds: -1 });
    expect(
      verifySignature({ purpose: "get", storageKey, expiresAtMs: signed.expires_at_ms, sig: signed.signature }),
    ).toBe(false);
  });

  it("rejects far-future signatures (defensive cap)", () => {
    process.env.OBJECT_STORE_SIGNING_SECRET = "test-secret";
    const storageKey = "folders/fld_123/documents/doc_123.pdf";

    const signed = createSignedGetHeaders({ storageKey, expiresInSeconds: 3 * 24 * 60 * 60 });
    expect(
      verifySignature({ purpose: "get", storageKey, expiresAtMs: signed.expires_at_ms, sig: signed.signature }),
    ).toBe(false);
  });

  it("requires explicit dev opt-in for the per-process fallback secret", () => {
    setEnv("NODE_ENV", "development");
    const storageKey = "folders/fld_123/documents/doc_123.pdf";

    expect(() => createSignedGetHeaders({ storageKey })).toThrowError("OBJECT_STORE_SIGNING_SECRET_MISSING");

    process.env.ALLOW_DEV_OBJECT_STORE_SECRET = "1";
    const signed = createSignedGetHeaders({ storageKey, expiresInSeconds: 60 });
    expect(
      verifySignature({ purpose: "get", storageKey, expiresAtMs: signed.expires_at_ms, sig: signed.signature }),
    ).toBe(true);
  });
});
