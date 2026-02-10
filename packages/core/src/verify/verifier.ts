import { performance } from "node:perf_hooks";

import { hashSnippet } from "../citations/snippet";
import { VerifyInputSchema, type VerifyInput, type VerifyResult } from "./verifier.schemas";

export type EntailmentVerdict = "PASS" | "FAIL" | "UNSURE";

export type EntailmentVerifier = (input: {
  question: string;
  answer: string;
  citations: Array<{ snippet: string }>;
}) => Promise<{ verdict: EntailmentVerdict; reason?: string }>;

export type VerifierMode = "deterministic-only" | "entailment";

export async function verifyRow(
  input: VerifyInput,
  opts: { mode: VerifierMode; entailment?: EntailmentVerifier },
): Promise<VerifyResult> {
  const t0 = performance.now();

  // Schema validates basic shape; deterministic checks enforce invariants.
  const parsed = VerifyInputSchema.safeParse(input);
  if (!parsed.success) {
    const t = performance.now();
    return {
      verdict: "fail",
      reason_code: "VALIDATION_ERROR",
      reason: "Input did not match VerifyInput schema.",
      timings_ms: { total: t - t0, deterministic: t - t0 },
    };
  }

  const tDetStart = performance.now();

  const failDeterministic = (args: { reason_code: VerifyResult["reason_code"]; reason: string }): VerifyResult => {
    const t = performance.now();
    return {
      verdict: "fail",
      reason_code: args.reason_code,
      reason: args.reason,
      timings_ms: { total: t - t0, deterministic: t - tDetStart },
    };
  };

  if (parsed.data.answer === "Not found in provided documents." && parsed.data.citations.length !== 0) {
    return failDeterministic({
      reason_code: "MISSING_INPUT_INVARIANT",
      reason: "missing_input answers must have zero citations.",
    });
  }

  if (parsed.data.answer !== "Not found in provided documents." && parsed.data.citations.length === 0) {
    return failDeterministic({
      reason_code: "NO_CITATIONS",
      reason: "Non-missing_input answers must include at least one citation.",
    });
  }

  for (const cit of parsed.data.citations) {
    const computed = hashSnippet(cit.snippet);
    if (computed !== cit.snippet_hash) {
      return failDeterministic({
        reason_code: "CITATION_MISMATCH",
        reason: "snippet_hash did not match the canonical hash of snippet.",
      });
    }
  }

  const tDetEnd = performance.now();

  if (opts.mode === "deterministic-only") {
    return {
      verdict: "pass",
      reason_code: "DETERMINISTIC_ONLY",
      timings_ms: { total: tDetEnd - t0, deterministic: tDetEnd - tDetStart },
    };
  }

  if (!opts.entailment) {
    return {
      verdict: "fail",
      reason_code: "ENTAILMENT_NOT_CONFIGURED",
      reason: "Entailment verifier is required in entailment mode.",
      timings_ms: { total: tDetEnd - t0, deterministic: tDetEnd - tDetStart },
    };
  }

  const tEntStart = performance.now();
  const entailment = await opts.entailment({
    question: parsed.data.question,
    answer: parsed.data.answer,
    citations: parsed.data.citations.map((c) => ({ snippet: c.snippet })),
  });
  const tEntEnd = performance.now();

  if (entailment.verdict === "PASS") {
    return {
      verdict: "pass",
      reason_code: "ENTAILMENT_PASS",
      timings_ms: {
        total: tEntEnd - t0,
        deterministic: tDetEnd - tDetStart,
        entailment: tEntEnd - tEntStart,
      },
    };
  }

  return {
    verdict: "fail",
    reason_code: entailment.verdict === "FAIL" ? "ENTAILMENT_FAIL" : "ENTAILMENT_UNSURE",
    reason: entailment.reason,
    timings_ms: {
      total: tEntEnd - t0,
      deterministic: tDetEnd - tDetStart,
      entailment: tEntEnd - tEntStart,
    },
  };
}
