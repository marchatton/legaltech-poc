function safeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  // Avoid timingSafeEqual here so this file can be used in middleware (edge).
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function decodeBasicCredentials(authHeader: string): { user: string; pass: string } | null {
  const m = authHeader.match(/^Basic\s+(.+)$/i);
  if (!m) return null;

  let decoded: string;
  try {
    // Edge runtime: prefer atob. Node runtime: fall back to Buffer.
    if (typeof (globalThis as unknown as { atob?: unknown }).atob === "function") {
      decoded = (globalThis as unknown as { atob: (s: string) => string }).atob(m[1]!);
    } else {
      const B = (globalThis as unknown as { Buffer?: { from: (s: string, enc: string) => { toString: (enc: string) => string } } })
        .Buffer;
      if (!B) return null;
      decoded = B.from(m[1]!, "base64").toString("utf8");
    }
  } catch {
    return null;
  }

  const idx = decoded.indexOf(":");
  if (idx < 0) return null;
  return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
}

export function basicAuthRequiredResponse(): Response {
  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Orbital demo-prod"' },
  });
}

export function basicAuthMisconfiguredResponse(): Response {
  return new Response("Demo-prod auth is misconfigured.", { status: 500 });
}

export function verifyBasicAuthHeader(authHeader: string | null): boolean {
  const expectedUser = process.env.BASIC_AUTH_USER?.trim() ?? "";
  const expectedPass = process.env.BASIC_AUTH_PASS?.trim() ?? "";
  if (!expectedUser || !expectedPass) return false;

  if (!authHeader) return false;
  const creds = decodeBasicCredentials(authHeader);
  if (!creds) return false;
  return safeEq(creds.user, expectedUser) && safeEq(creds.pass, expectedPass);
}
