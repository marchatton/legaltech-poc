import { z } from "zod";

export const LIST_PAYLOAD_V0_SCHEMA_VERSION = "list_payload_v0" as const;

export const ListPayloadV0KindSchema = z.enum(["requirements_tracker", "exceptions_table", "survey_issues"]);

const LockedCitationIdSchema = z.string().min(1);

const BaseItemV0Schema = z
  .object({
    item_id: z.string().min(1), // deterministic for diffing + idempotency
    citation_ids: z.array(LockedCitationIdSchema), // locked citation ids only
    notes: z.string().min(1).nullable().optional(),
  })
  .strict();

const ParcelScopeV0Schema = z.union([
  z.object({ scope: z.literal("all") }).strict(),
  z
    .object({
    scope: z.literal("parcels"),
    parcels: z.array(z.number().int().nonnegative()).min(1),
    citation_ids: z.array(LockedCitationIdSchema),
  })
    .strict(),
]);

const RequirementsItemV0Schema = BaseItemV0Schema.extend({
  kind: z.literal("requirements_tracker_item"),
  bi_item: z.number().int().nonnegative(),
  requirement: z.string().min(1),
  owner: z.string().min(1),
  item_status: z.enum(["open", "closed", "waived"]), // item-level only
  parcel_scope: ParcelScopeV0Schema.optional(),
}).strict();

const ExceptionMatchStatusV0Schema = z.enum(["matched", "ambiguous", "missing_doc", "missing_attachment"]);

const ExceptionItemV0Schema = BaseItemV0Schema.extend({
  kind: z.literal("exceptions_table_item"),
  bii_item: z.number().int().nonnegative(),
  type: z.string().min(1),
  // Item-level only (do not reuse report-row statuses). Comparator expects this field.
  item_status: z.enum(["needs_review", "missing_input"]),
  instrument_no: z.string().min(1).nullable().optional(),
  recorded_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "recorded_date must be ISO YYYY-MM-DD")
    .nullable()
    .optional(),
  doc: z.string().min(1).nullable().optional(), // expected filename
  risk_tags: z.array(z.string().min(1)).optional(), // normalised lower-case tags (producer responsibility)
  match_status: ExceptionMatchStatusV0Schema,
  candidates: z
    .array(z.object({ doc: z.string().min(1), instrument_no: z.string().min(1).nullable().optional() }).strict())
    .optional(),
  parcel_scope: ParcelScopeV0Schema.optional(),
}).strict();

const SurveyIssueItemV0Schema = BaseItemV0Schema.extend({
  kind: z.literal("survey_issue_item"),
  issue_type: z.string().min(1),
  // Optional structured code for downstream routing/UX. Example: CERT_MISSING_LENDER.
  issue_code: z
    .string()
    .regex(/^[A-Z][A-Z0-9_]+$/, "issue_code must be SCREAMING_SNAKE_CASE")
    .optional(),
  description: z.string().min(1),
  impact: z.string().min(1).nullable().optional(),
  suggested_fix: z.string().min(1).nullable().optional(),
  related_exception_item_id: z.string().min(1).nullable().optional(),
  item_classification: z.enum(["depicted", "not_depicted", "unknown"]).optional(), // item-level only
}).strict();

export const ListPayloadV0ItemSchema = z.discriminatedUnion("kind", [
  RequirementsItemV0Schema,
  ExceptionItemV0Schema,
  SurveyIssueItemV0Schema,
]);

export const ListPayloadV0Schema = z
  .object({
  kind: ListPayloadV0KindSchema,
  items: z.array(ListPayloadV0ItemSchema),
  })
  .strict();

export type ListPayloadV0 = z.infer<typeof ListPayloadV0Schema>;

export function emptyListPayloadV0(kind: z.infer<typeof ListPayloadV0KindSchema>): ListPayloadV0 {
  return { kind, items: [] };
}
