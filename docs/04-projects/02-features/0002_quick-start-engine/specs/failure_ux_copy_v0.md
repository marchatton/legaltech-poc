# Failure UX Copy v0 (Initiative 0002)

This doc defines safe, consistent drawer copy for failure and "needs review" reasons.

Constraints:
- Never suggest disabling verification or "trusting the model".
- Show a reason code (safe taxonomy) and an actionable next step.
- Do not leak provider payloads or internal stack traces.

## Reason code -> guidance (draft)

### No-evidence (`missing_input`)

| Reason code | What it means | What to do next (user-facing) |
| --- | --- | --- |
| `NO_EVIDENCE_NO_READY_DOCUMENTS` | No upload+parse+OCR-ready documents were available for retrieval. | Upload/parse the relevant document(s), then re-run the question. |
| `NO_EVIDENCE_RETRIEVAL_EMPTY` | Retrieval returned no relevant chunks for this question. | Confirm the content exists in the uploaded docs, then retry after indexing is healthy. |
| `NO_EVIDENCE_ANCHOR_UNRESOLVED` | Retrieval found chunks, but no lockable page anchor was available. | Re-run after re-indexing; if repeated, treat as an anchor/ingest bug. |
| `NO_EVIDENCE_DRAFT_UNSUPPORTED` | Evidence was present, but drafting could not support a grounded answer. | Review source docs manually and re-run if additional docs are added. |

### System failures (`citation_failed`)

| Reason code | What it means | What to do next (user-facing) |
| --- | --- | --- |
| `VALIDATION_ERROR` | Row payload/contract validation failed. | Retry; if it persists, include reason code + trace_id in a bug report. |
| `RETRIEVAL_FAILED` | Retrieval failed unexpectedly. | Retry after checking indexing/database health. |
| `DRAFT_FAILED` | Draft generation failed unexpectedly. | Retry; if repeated, check model gateway/runtime health. |
| `ROW_WRITE_FAILED` | Row/citation persistence failed. | Retry and check DB/worker health. |
| `PROGRESS_UPDATE_FAILED` | Run progress update failed after row processing. | Retry and verify run progress advances correctly. |

## Drawer affordances (draft)

- Always show:
  - `status`
  - reason code (when present)
  - a short explanation
  - next action checklist (when applicable)

## Notes

- For `missing_input`, the answer string must be exactly: `Not found in provided documents.` and citations must be empty.
