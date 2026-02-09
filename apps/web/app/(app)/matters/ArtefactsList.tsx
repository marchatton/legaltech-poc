import { z } from "zod";

import { headers } from "next/headers";

import { Badge } from "../../ui/Badge";
import { buttonClassName } from "../../ui/Button";
import { Table, TableFrame, TD, TH } from "../../ui/Table";

type Props = {
  folderId: string;
};

const ArtefactSchema = z
  .object({
    id: z.string().min(1),
    kind: z.string().min(1),
    filename: z.string().min(1),
    created_at: z.string().min(1),
    download_url: z.string().min(1),
  })
  .passthrough();

const ArtefactsResponseSchema = z
  .object({
    artefacts: z.array(ArtefactSchema),
  })
  .passthrough();

type SafeErr = { code: string; message: string };

function safeErrFromJson(json: unknown, fallback: SafeErr): SafeErr {
  if (!json || typeof json !== "object" || Array.isArray(json)) return fallback;
  const env = (json as { error?: unknown }).error;
  if (!env || typeof env !== "object" || Array.isArray(env)) return fallback;
  const code = (env as { code?: unknown }).code;
  const message = (env as { message?: unknown }).message;
  return {
    code: typeof code === "string" && code.trim() ? code.trim() : fallback.code,
    message: typeof message === "string" && message.trim() ? message.trim() : fallback.message,
  };
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").replace(".000Z", "Z");
}

function isUnsafeFilename(filename: string): boolean {
  return filename.toUpperCase().includes(".UNSAFE.");
}

function hrefFromDownloadUrl(downloadUrl: string): string {
  try {
    // List endpoints may return absolute URLs; keep the signature but drop origin so
    // links work regardless of the current host.
    const u = new URL(downloadUrl, "http://localhost:3000");
    return `${u.pathname}${u.search}`;
  } catch {
    return downloadUrl;
  }
}

function safeLocalOriginFromHostHeader(host: string): string {
  // Avoid trusting arbitrary hostnames (SSRF). Keep internal fetches pinned to localhost,
  // but allow dynamic ports (Next dev may fall back to 3001, 3002, etc.).
  const m = host.match(/:(\d{1,5})$/);
  const portFromHost = m?.[1] ? Number(m[1]) : null;
  const envPort = process.env.PORT ? Number(process.env.PORT) : null;

  const port =
    (portFromHost && Number.isInteger(portFromHost) && portFromHost >= 1 && portFromHost <= 65535
      ? portFromHost
      : null) ??
    (envPort && Number.isInteger(envPort) && envPort >= 1 && envPort <= 65535 ? envPort : null) ??
    3000;

  return `http://127.0.0.1:${port}`;
}

export async function ArtefactsList(props: Props) {
  const h = await headers();
  const origin = safeLocalOriginFromHostHeader(h.get("host") ?? "");
  let res: Response;
  try {
    res = await fetch(`${origin}/folders/${encodeURIComponent(props.folderId)}/artefacts`, { cache: "no-store" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <section className="rounded-ui-lg border border-destructive/30 bg-destructive/10 p-4">
        <div className="text-sm font-semibold text-destructive">Artefacts</div>
        <div className="mt-2 text-xs text-destructive">{message}</div>
      </section>
    );
  }

  if (res.status === 404) {
    return (
      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="text-sm font-semibold text-foreground">Artefacts</div>
        <div className="mt-2 text-xs text-muted-foreground">No artefacts yet.</div>
      </section>
    );
  }

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const e = safeErrFromJson(json, {
      code: "ARTEFACTS_FETCH_FAILED",
      message: `Request failed (${res.status}).`,
    });
    return (
      <section className="rounded-ui-lg border border-destructive/30 bg-destructive/10 p-4">
        <div className="text-sm font-semibold text-destructive">Artefacts</div>
        <div className="mt-2 text-xs text-destructive">
          {e.code}: {e.message}
        </div>
      </section>
    );
  }

  const parsed = ArtefactsResponseSchema.safeParse(json);
  if (!parsed.success) {
    return (
      <section className="rounded-ui-lg border border-destructive/30 bg-destructive/10 p-4">
        <div className="text-sm font-semibold text-destructive">Artefacts</div>
        <div className="mt-2 text-xs text-destructive">Invalid artefacts payload.</div>
      </section>
    );
  }

  const artefacts = parsed.data.artefacts;
  if (!artefacts.length) {
    return (
      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="text-sm font-semibold text-foreground">Artefacts</div>
        <div className="mt-2 text-xs text-muted-foreground">No artefacts yet.</div>
      </section>
    );
  }

  return (
    <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-sm font-semibold text-foreground">Artefacts</div>
        <div className="text-xs text-muted-foreground">{artefacts.length} item(s)</div>
      </div>

      <TableFrame className="mt-3">
        <Table>
          <thead>
            <tr>
              <TH>Filename</TH>
              <TH>Kind</TH>
              <TH>Created</TH>
              <TH className="text-right">Action</TH>
            </tr>
          </thead>
          <tbody>
            {artefacts.map((a) => {
              const unsafe = isUnsafeFilename(a.filename);
              const downloadHref = hrefFromDownloadUrl(a.download_url);
              return (
                <tr key={a.id}>
                  <TD>
                    <div className="flex flex-wrap items-center gap-2">
                      {unsafe ? <Badge variant="destructive" size="sm">UNSAFE</Badge> : null}
                      <span className="font-mono">{a.filename}</span>
                    </div>
                  </TD>
                  <TD>
                    <Badge variant="muted" size="sm" className="font-mono">{a.kind}</Badge>
                  </TD>
                  <TD>
                    <span className="font-mono">{formatCreatedAt(a.created_at)}</span>
                  </TD>
                  <TD className="text-right">
                    <a
                      className={buttonClassName({ variant: "secondary", size: "sm" })}
                      href={downloadHref}
                    >
                      Download
                    </a>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableFrame>
    </section>
  );
}
