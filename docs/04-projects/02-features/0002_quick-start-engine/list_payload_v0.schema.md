# List Payload v0 (Initiative 0002)

This is the stable, versioned contract for list-shaped artefacts produced by Initiative 0002:
- Schedule B-I requirements tracker
- Schedule B-II exceptions table
- Survey reconciliation issues list

Row status invariants remain unchanged: report rows can only be `needs_review|reviewed|missing_input|citation_failed`.
Item-level states live inside the payload and must not invent new report-row statuses.

## Schema (Zod-ish / TypeScript)

```ts
// payload_schema_version = "list_payload_v0"

export type ListPayloadV0 = {
  kind: "requirements_tracker" | "exceptions_table" | "survey_issues";
  items: Array<RequirementsItemV0 | ExceptionItemV0 | SurveyIssueItemV0>;
};

export type BaseItemV0 = {
  item_id: string;        // deterministic for diffing + idempotency
  citation_ids: string[]; // locked citations only (ADR-0001)
  notes?: string | null;
};

export type ParcelScopeV0 =
  | { scope: "all" }
  | { scope: "parcels"; parcels: number[]; citation_ids: string[] };

export type RequirementsItemV0 = BaseItemV0 & {
  kind: "requirements_tracker_item";
  bi_item: number;
  requirement: string;
  owner: string;
  item_status: "open" | "closed" | "waived"; // item-level only
  parcel_scope?: ParcelScopeV0;
};

export type ExceptionMatchStatusV0 =
  | "matched"
  | "ambiguous"
  | "missing_doc"
  | "missing_attachment";

export type ExceptionItemV0 = BaseItemV0 & {
  kind: "exceptions_table_item";
  bii_item: number;
  type: string;
  instrument_no?: string | null;
  recorded_date?: string | null; // ISO YYYY-MM-DD
  doc?: string | null;           // expected filename
  risk_tags?: string[];          // normalised lower-case tags
  match_status: ExceptionMatchStatusV0;
  candidates?: Array<{ doc: string; instrument_no?: string | null }>;
  parcel_scope?: ParcelScopeV0;

  // Truth CSVs include an item-level "status". Keep this item-level and map from match_status.
  item_status: "needs_review" | "missing_input";
};

export type SurveyIssueItemV0 = BaseItemV0 & {
  kind: "survey_issue_item";
  issue_type: string; // e.g. encroachment, ocr_quality, missing_input
  description: string;
  impact?: string | null;
  suggested_fix?: string | null;

  // optional linkage for reconciliation
  related_exception_item_id?: string | null;
  item_classification?: "depicted" | "not_depicted" | "unknown"; // item-level only
};
```

## Deterministic `item_id` rules

Keep item IDs boring and stable:
- Requirements: `bi:<bi_item>`
- Exceptions: `bii:<bii_item>`
- Issues:
  - Prefer anchor-derived IDs when available: `issue:<issue_type>:<doc>:<anchor>`
  - Otherwise: `issue:<issue_type>:sha256:<desc_hash_12>`

## Notes

- `citation_ids` must refer only to locked `citations.id` values; never expose chunk IDs to the UI.
- "Missing doc" and "missing attachment" are item-level states (e.g. `match_status`) that may require row-level `missing_input` depending on what the question/row can honestly answer.

## Example payload items

These are illustrative only; truth comparators for packs define the concrete expected columns/values.

### B-I requirement item

```json
{
  "kind": "requirements_tracker_item",
  "item_id": "bi:1",
  "bi_item": 1,
  "requirement": "Payment of the full consideration to the Company for the policy(ies) to be issued and all applicable premiums and charges.",
  "owner": "Buyer",
  "item_status": "open",
  "citation_ids": ["cit_..."]
}
```

### B-II exception item

```json
{
  "kind": "exceptions_table_item",
  "item_id": "bii:15",
  "bii_item": 15,
  "type": "Reciprocal Easement Agreement (REA)",
  "instrument_no": "2021-218785",
  "recorded_date": "2021-10-22",
  "doc": "REA.pdf",
  "risk_tags": ["parking", "shared_costs"],
  "match_status": "matched",
  "item_status": "needs_review",
  "citation_ids": ["cit_..."]
}
```

### Survey issue item

```json
{
  "kind": "survey_issue_item",
  "item_id": "issue:encroachment:ALTA_Survey.pdf:SURVEY_ENC_01",
  "issue_type": "encroachment",
  "description": "Chain-link fence encroaches approx. 0.4' over the north boundary line near the NW corner.",
  "impact": "May require cure, endorsement, or risk acceptance.",
  "suggested_fix": "Confirm materiality; consider survey revision, boundary agreement, or endorsement evidence package.",
  "citation_ids": ["cit_..."]
}
```
