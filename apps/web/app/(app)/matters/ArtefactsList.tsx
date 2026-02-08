import { z } from "zod";

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

export async function ArtefactsList(props: Props) {
  // Dev-only UI: fetch via localhost to avoid trusting Host headers (SSRF).
  const origin = "http://localhost:3000";
  let res: Response;
  try {
    res = await fetch(`${origin}/folders/${encodeURIComponent(props.folderId)}/artefacts`, { cache: "no-store" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <section className="rounded border border-red-200 bg-red-50 p-4">
        <div className="text-sm font-semibold text-red-900">Artefacts</div>
        <div className="mt-2 text-xs text-red-700">{message}</div>
      </section>
    );
  }

  if (res.status === 404) {
    return (
      <section className="rounded border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">Artefacts</div>
        <div className="mt-2 text-xs text-slate-600">No artefacts yet.</div>
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
      <section className="rounded border border-red-200 bg-red-50 p-4">
        <div className="text-sm font-semibold text-red-900">Artefacts</div>
        <div className="mt-2 text-xs text-red-700">
          {e.code}: {e.message}
        </div>
      </section>
    );
  }

  const parsed = ArtefactsResponseSchema.safeParse(json);
  if (!parsed.success) {
    return (
      <section className="rounded border border-red-200 bg-red-50 p-4">
        <div className="text-sm font-semibold text-red-900">Artefacts</div>
        <div className="mt-2 text-xs text-red-700">Invalid artefacts payload.</div>
      </section>
    );
  }

  const artefacts = parsed.data.artefacts;
  if (!artefacts.length) {
    return (
      <section className="rounded border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">Artefacts</div>
        <div className="mt-2 text-xs text-slate-600">No artefacts yet.</div>
      </section>
    );
  }

  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">Artefacts</div>
        <div className="text-xs text-slate-600">{artefacts.length} item(s)</div>
      </div>

      <div className="mt-3 overflow-auto rounded border border-slate-200">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700">
            <tr className="border-b border-slate-200">
              <th className="px-3 py-2 font-medium">Filename</th>
              <th className="px-3 py-2 font-medium">Kind</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white text-slate-800">
            {artefacts.map((a) => {
              const unsafe = isUnsafeFilename(a.filename);
              const downloadHref = hrefFromDownloadUrl(a.download_url);
              return (
                <tr key={a.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {unsafe ? (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-inset ring-red-200">
                          UNSAFE
                        </span>
                      ) : null}
                      <span className="font-mono">{a.filename}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-800">
                      {a.kind}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono">{formatCreatedAt(a.created_at)}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <a
                      className="rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
                      href={downloadHref}
                    >
                      Download
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
