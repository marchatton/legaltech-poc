export type ExceptionMatchStatusV0 = "matched" | "ambiguous" | "missing_doc" | "missing_attachment";

export type ExceptionMatchCandidateV0 = {
  doc: string;
  instrument_no?: string | null;
};

export type InstrumentDocRef = {
  doc: string;
  instrument_no: string | null;
};

function normInstrumentNo(input: string): string {
  return input.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");
}

export function matchExceptionToInstrumentDocs(args: {
  instrument_no: string | null;
  instrument_docs: InstrumentDocRef[];
}): {
  match_status: ExceptionMatchStatusV0;
  doc: string | null;
  candidates?: ExceptionMatchCandidateV0[];
} {
  const instrumentNo = args.instrument_no ? normInstrumentNo(args.instrument_no) : "";
  if (!instrumentNo) return { match_status: "missing_doc", doc: null };

  const matches = args.instrument_docs.filter((d) => d.instrument_no && normInstrumentNo(d.instrument_no) === instrumentNo);

  if (matches.length === 1) return { match_status: "matched", doc: matches[0]!.doc };

  if (matches.length > 1) {
    // Safe default: no silent auto-pick when more than one candidate fits.
    const candidates = matches
      .map((m) => ({ doc: m.doc, instrument_no: m.instrument_no }))
      .sort((a, b) => a.doc.localeCompare(b.doc));

    return { match_status: "ambiguous", doc: null, candidates };
  }

  return { match_status: "missing_doc", doc: null };
}

