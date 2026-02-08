"use server";

import { z } from "zod";

import { redirect } from "next/navigation";

import { assertDevOnly } from "../../../lib/devOnly";
import { loadSeedSnapshot, saveSeedSnapshot } from "../../../lib/fixtureSeed.server";

const FormSchema = z.object({
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i),
  question_id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_-]+$/),
});

type ReviewErrorCode =
  | "INVALID_REQUEST"
  | "SNAPSHOT_NOT_FOUND"
  | "ROW_NOT_FOUND"
  | "NOT_NEEDS_REVIEW"
  | "NO_LOCKED_CITATIONS";

function toRedirectUrl(args: { pack?: string; reviewed?: string; error?: { code: ReviewErrorCode; qid?: string } }) {
  const params = new URLSearchParams();
  if (args.pack) params.set("pack", args.pack);
  if (args.reviewed) params.set("reviewed", args.reviewed);
  if (args.error) {
    params.set("review_error", args.error.code);
    if (args.error.qid) params.set("qid", args.error.qid);
  }
  const qs = params.toString();
  return qs ? `/matters?${qs}` : "/matters";
}

function fdString(fd: FormData, key: string): string | undefined {
  const val = fd.get(key);
  return typeof val === "string" ? val : undefined;
}

export async function markRowReviewed(formData: FormData): Promise<void> {
  assertDevOnly();

  const parsed = FormSchema.safeParse({
    pack: fdString(formData, "pack"),
    question_id: fdString(formData, "question_id"),
  });
  if (!parsed.success) {
    redirect(toRedirectUrl({ error: { code: "INVALID_REQUEST" } }));
  }

  const packId = parsed.data.pack;
  const questionId = parsed.data.question_id;

  const snapshot = loadSeedSnapshot(packId);
  if (!snapshot) {
    redirect(toRedirectUrl({ pack: packId, error: { code: "SNAPSHOT_NOT_FOUND" } }));
  }

  const row = snapshot.rows.find((r) => r.question_id === questionId);
  if (!row) {
    redirect(toRedirectUrl({ pack: packId, error: { code: "ROW_NOT_FOUND", qid: questionId } }));
  }

  if (row.status !== "needs_review") {
    redirect(toRedirectUrl({ pack: packId, error: { code: "NOT_NEEDS_REVIEW", qid: questionId } }));
  }

  const lockedCount = row.citation_ids.filter((cid) => Boolean(snapshot.citations?.[cid])).length;
  if (lockedCount < 1) {
    redirect(toRedirectUrl({ pack: packId, error: { code: "NO_LOCKED_CITATIONS", qid: questionId } }));
  }

  row.status = "reviewed";
  saveSeedSnapshot(packId, snapshot);
  redirect(toRedirectUrl({ pack: packId, reviewed: questionId }));
}

