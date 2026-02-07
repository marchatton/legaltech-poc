import { z } from "zod";

export const MissingDocSignalSchema = z.object({
  type: z.enum(["file_ref", "acronym", "phrase"]),
  value: z.string().min(1),
  source: z.string().min(1),
  page: z.number().int().positive().optional(),
});

export type MissingDocSignal = z.infer<typeof MissingDocSignalSchema>;

export const MissingDocCandidateSchema = z.object({
  label: z.string().min(1),
  confidence: z.number().min(0).max(1),
  signals: z.array(MissingDocSignalSchema),
});

export type MissingDocCandidate = z.infer<typeof MissingDocCandidateSchema>;

export const DetectMissingDocsResultSchema = z.object({
  pack_id: z.string().min(1),
  missing_docs: z.array(MissingDocCandidateSchema),
  candidates_low_confidence: z.array(MissingDocCandidateSchema).optional(),
});

export type DetectMissingDocsResult = z.infer<typeof DetectMissingDocsResultSchema>;

