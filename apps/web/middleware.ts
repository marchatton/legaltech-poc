import { NextResponse, type NextRequest } from "next/server";

import { isDemoProd } from "./lib/runtimeMode";
import {
  basicAuthMisconfiguredResponse,
  basicAuthRequiredResponse,
  verifyBasicAuthHeader,
} from "./lib/basicAuth";

function isStaticOrNextInternal(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/robots.txt") return true;
  if (pathname === "/sitemap.xml") return true;
  return false;
}

function isAllowedInDemoProd(req: NextRequest): boolean {
  const p = req.nextUrl.pathname;
  const m = req.method.toUpperCase();

  if (isStaticOrNextInternal(p)) return true;
  if (p === "/") return true;

  // Core pages (server-rendered).
  if (m === "GET" && (p === "/matters" || p.startsWith("/matters/"))) return true;

  // Operator: seed a synthetic pack into Postgres.
  if (p === "/demo/load-pack") return m === "POST";

  // Viewer overlay (fixture-backed).
  if (p.startsWith("/citations/")) return m === "GET";
  if (p.startsWith("/documents/")) return m === "GET";

  // Quick Start + report surfaces.
  if (/^\/folders\/[^/]+\/runs$/.test(p)) return m === "POST";
  if (/^\/folders\/[^/]+\/report$/.test(p)) return m === "GET";
  if (/^\/runs\/[^/]+$/.test(p)) return m === "GET";

  // Exports + downloads.
  if (p === "/export/csv") return m === "POST";
  if (p === "/export/docx") return m === "POST";
  if (/^\/folders\/[^/]+\/artefacts$/.test(p)) return m === "GET";
  if (/^\/artefacts\/[^/]+\/download$/.test(p)) return m === "GET";

  return false;
}

export function middleware(req: NextRequest) {
  if (!isDemoProd()) return NextResponse.next();

  // Fail closed: demo-prod must always be private.
  const expectedUser = process.env.BASIC_AUTH_USER?.trim() ?? "";
  const expectedPass = process.env.BASIC_AUTH_PASS?.trim() ?? "";
  if (!expectedUser || !expectedPass) {
    return basicAuthMisconfiguredResponse();
  }

  const auth = req.headers.get("authorization");
  if (!verifyBasicAuthHeader(auth)) {
    return basicAuthRequiredResponse();
  }

  if (!isAllowedInDemoProd(req)) {
    return new Response("Not found.", { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes so we can protect pages, APIs, PDF bytes, and artefact downloads.
  matcher: ["/:path*"],
};

