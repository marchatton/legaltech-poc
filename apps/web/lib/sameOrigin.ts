type HeaderGetter = Pick<Headers, "get">;

export function isSameOriginMutationRequest(args: {
  expectedOrigin: string;
  headers: HeaderGetter;
}): boolean {
  const expectedOrigin = args.expectedOrigin.trim();
  if (!expectedOrigin) return false;

  const origin = args.headers.get("origin");
  const referer = args.headers.get("referer");
  const secFetchSite = args.headers.get("sec-fetch-site");

  // Require at least one browser-provided signal so non-browser clients can't
  // accidentally bypass same-origin checks in demo-prod.
  let hadSignal = false;

  // Fail closed on any contradiction.
  if (secFetchSite !== null) {
    hadSignal = true;
    if (secFetchSite.trim().toLowerCase() !== "same-origin") return false;
  }

  if (origin !== null) {
    hadSignal = true;
    const v = origin.trim();
    if (!v || v === "null") return false;
    if (v !== expectedOrigin) return false;
  }

  if (referer !== null) {
    hadSignal = true;
    const v = referer.trim();
    if (!v) return false;
    let refOrigin: string;
    try {
      refOrigin = new URL(v).origin;
    } catch {
      return false;
    }
    if (refOrigin !== expectedOrigin) return false;
  }

  return hadSignal;
}

