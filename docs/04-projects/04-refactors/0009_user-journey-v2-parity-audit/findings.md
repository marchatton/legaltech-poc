# User Journey V2 Parity Audit Findings

Date: 2026-02-11

Source spec:
- `docs/00-strategy/user-journeys/orbital-user-journeys-and-magic-patterns-prompts-v2.md`

Primary implementation surface reviewed:
- `apps/web/app`
- `apps/web/lib`
- `apps/web/app/(api)`

Wireframe reference reviewed (affordances/IA/workflows only):
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes`

## Executive summary

- Weighted alignment to the v2 affordance model: **38.5%**
- Count by affordance status:
  - Implemented: 11
  - Partial: 18
  - Missing: 23
- Core theme:
  - Trust viewer + export safety are relatively mature.
  - Shell/navigation, matter setup, report triage drawer/split-view, and operator workflow are the largest gaps.

## Scope classification legend

- `UI-only`: can be implemented in existing UI with current backend contracts.
- `UI + thin backend`: small API additions/params/fields (low complexity).
- `UI + moderate backend`: new endpoints, non-trivial query/state changes, or schema-level behavior changes.
- `Backend-heavy`: large backend/system work or orchestration-heavy changes.

## U1–U52 parity checklist

| Affordance | Status | Scope classification | Notes |
|---|---|---|---|
| U1 | Missing | UI + moderate backend | No global nav (`Matters`, `Runs`, `Alerts`, `Settings`) surface. |
| U2 | Partial | UI + thin backend | `DEMO MODE` bar exists, but no explicit `demo-dev` / `demo-prod` badge contract. |
| U3 | Missing | UI-only | No breadcrumb chain in app shell. |
| U4 | Partial | UI-only | IDs shown in local views, not sticky shell wayfinding. |
| U5 | Missing | UI + thin backend | No searchable matters list UI. |
| U6 | Missing | UI + thin backend | No saved-view chip model (`Active`, `Needs Attention`, `Demo Packs`). |
| U7 | Missing | UI + thin backend | No `New Matter` CTA in matters list (create API exists). |
| U8 | Missing | UI-only | No matter-row `Open` action in list context. |
| U9 | Missing | UI + thin backend | No matter-name creation form. |
| U10 | Missing | UI + moderate backend | No upload dropzone flow in UI (upload-init API exists). |
| U11 | Partial | UI-only | Ingest status rows exist in matter detail, but not in dedicated setup flow. |
| U12 | Partial | UI + moderate backend | Checklist exists post-run in row context, not pre-run setup gating. |
| U13 | Implemented | N/A | Quick Start start button exists. |
| U14 | Implemented | N/A | Run progress meter exists. |
| U15 | Missing | UI-only | No local row-status tabs (`All`, `Needs Review`, etc.). |
| U16 | Implemented | N/A | Row status chips rendered. |
| U17 | Missing | UI-only | No row drawer open action; rows are inline cards. |
| U18 | Partial | UI-only | Structured payload rendering present, but not in dedicated drawer UX. |
| U19 | Implemented | N/A | Citation chips link to evidence viewer. |
| U20 | Missing | UI + moderate backend | No split-view lock to keep row + viewer visible together. |
| U21 | Missing | UI-only | No explicit PDF loading skeleton state. |
| U22 | Missing | UI-only | No page controls in evidence viewer UI. |
| U23 | Partial | UI-only | Zoom controls exist; verification indicator is implicit/partial. |
| U24 | Partial | UI-only | 100% behavior enforced, but no explicit `Reset to 100% to verify` CTA. |
| U25 | Implemented | N/A | Highlight overlay rendering exists. |
| U26 | Partial | UI + thin backend | Metadata rail lacks full trust context fields in UI. |
| U27 | Partial | UI-only | `citation_failed` panel exists with reason code, but recovery checklist is thin. |
| U28 | Missing | UI + moderate backend | No `Flag citation wrong` action + confirmation flow. |
| U29 | Missing | UI + thin backend | No export run selector (defaults to latest run). |
| U30 | Implemented | N/A | 3 CSV + 1 DOCX export actions are present. |
| U31 | Partial | UI-only | Export blocked copy exists, but not standardized as one shared panel pattern. |
| U32 | Partial | UI-only | “Review failed rows” journey is weak (JSON link, no filtered report UI route). |
| U33 | Missing | UI-only | No artefact kind filter (`csv`, `docx`, `unsafe`). |
| U34 | Partial | UI-only | Artefact row lacks full provenance display (e.g. visible `source_run_id`). |
| U35 | Partial | UI-only | Download actions exist; no explicit loading/freshness feedback pattern. |
| U36 | Partial | UI-only | `UNSAFE` tag exists; no explanatory tooltip pattern. |
| U37 | Missing | UI + moderate backend | No chat run picker / run scoping control. |
| U38 | Implemented | N/A | Message composer exists. |
| U39 | Implemented | N/A | Streaming response state exists. |
| U40 | Missing | UI + moderate backend | Chat source chips are non-clickable; no jump-to-evidence path. |
| U41 | Missing | UI-only | No “sources for selected message” side rail. |
| U42 | Missing | UI + moderate backend | No run scope mismatch warning behavior. |
| U43 | Missing | UI + thin backend | Input is not disabled with guidance when no indexed docs/context. |
| U44 | Implemented | N/A | Persistent `DEMO MODE` bar exists. |
| U45 | Implemented | N/A | Allowlisted pack selector exists. |
| U46 | Implemented | N/A | `Load demo pack` CTA exists. |
| U47 | Partial | UI-only | Fixture context text exists, but not explicit operator checklist banner mode. |
| U48 | Missing | UI + moderate backend | No operator checklist card with step completion + elapsed time. |
| U49 | Partial | UI-only | Repeat-load behavior exists indirectly; no explicit `Load pack again` shortcut affordance. |
| U50 | Partial | UI-only | Safe error envelopes exist, but UI usually hides deterministic incident/tracing code. |
| U51 | Partial | UI-only | Retry exists in chat only; not standardized cross-surface. |
| U52 | Missing | UI + thin backend | No support escalation action pattern. |

## Scope mix across non-implemented affordances

Non-implemented = `Partial + Missing` (41 items total)

- UI-only: 23
- UI + thin backend: 9
- UI + moderate backend: 9
- Backend-heavy: 0

## Backend-moderate deep dive (scope-cut candidates)

Focus: treat `UI + moderate backend` items as primary scope-cut candidates by delivering thin slices first and deferring deeper backend workflows.

| ID | Current parity ask | Thin-slice option (ship first) | Defer/cut lever |
|---|---|---|---|
| U1 | Functional global nav surfaces for `Runs`, `Alerts`, `Settings`. | Show all three in shell as disabled placeholders; keep `Matters` as the only functional destination. | Defer routes, query models, and backend contracts for those tabs. |
| U10 | Upload dropzone setup flow. | Use existing upload-init path with minimal upload UI and status list; avoid complex queue UX. | Defer multi-file orchestration, resumable/chunked behavior, and advanced retry handling. |
| U12 | Pre-run checklist gating before execution. | De-scope pre-run checklist gating for parity v1; keep existing runnable preconditions and simple readiness copy only. | Defer full checklist state machine and any new backend gating contract. |
| U20 | Split-view lock for row + evidence viewer. | Client-side split-view toggle (URL/local state) with no backend persistence. | Defer user/workspace-level saved layout state. |
| U28 | `Flag citation wrong` action + confirmation flow. | UI-only acknowledgement pattern (`Thanks, we’ll investigate`) with no persistence. | Defer citation-flag endpoint and reviewer workflow lifecycle. |
| U37 | Chat run picker and run scoping. | Show active run chip and optional minimal run selector for recent completed runs only. | Defer historical run-scoped retrieval tuning and richer compare behaviors. |
| U40 | Clickable source chips with jump-to-evidence. | Enable jump only when citation anchor mapping exists; when unavailable, show disabled state with friendly hover copy. | Defer robust fallback resolution for missing/mutated anchors. |
| U42 | Run scope mismatch warning. | Warn when message source run differs from currently selected run. | Defer auto-reconcile or cross-run merge behaviors. |
| U48 | Operator checklist card with completion + elapsed time. | Keep checklist card with coarse step states and optional minute-level timing. | Defer second-level precision telemetry and backend duration pipeline. |
| W-A8 | `Review failed rows` deep-link contract with `run_id` + failed filter state. | Implement URL-based deep-link/filter state first. | Defer saved server-side view state and synchronization behaviors. |

### Decision updates (2026-02-11, follow-up)

- `U12`: confirmed de-scope for parity v1 (no pre-run checklist build).
- `U28`: confirmed UI-only acknowledgement pattern for v1 (no backend persistence).
- `U37`: scope locked to `L1` for parity v1; `L2` and `L3` are out-of-scope for this iteration.
- `U40`: confirmed disabled-source friendly hover message when jump is unavailable.
- `U42`: confirmed.
- `U48`: confirmed.
- `W-A8`: confirmed.

### U37 deep scope options (chat run scoping)

| Level | What users get | API/contract impact | Scope |
|---|---|---|---|
| L0 (status quo) | No run picker; chat uses folder latest index implicitly. | None. | Existing |
| L1 (selected for parity v1) | Run chip + simple picker for recent completed runs + mismatch warning badge/copy. | Extend `POST /api/folders/:id/chat` with optional `run_id`; include selected/effective run metadata in stream events. | UI + moderate backend |
| L2 | Strong run isolation with explicit retrieval against selected run index and deterministic source tagging per response. | L1 + stricter run/index binding rules and validation errors when run/index is unavailable. | UI + moderate backend |
| L3 | Multi-run compare/merge experience (diffing answers/sources across runs). | New compare endpoints/state model and more complex retrieval/orchestration semantics. | Backend-heavy (defer) |

Selected cut line: ship `L1` only. `L2` and `L3` are explicitly out-of-scope for parity v1.

## API affordances (breadboard `N*`, light + moderate only)

Focus: add concrete API affordances for all `UI + thin backend` and `UI + moderate backend` items so scope cuts can happen at contract level, not just UI level.

| ID | Related parity items | Component/service | API affordance | Control | Wires out | Scope classification | Thin-slice / cut lever |
|---|---|---|---|---|---|---|---|
| N1 | U5, U6, W-A2 | `GET /api/folders` | Search + saved-view query affordance (`q`, `state`, `view`, `limit`, `cursor`) on matter list. | call/read | SQL filtered matters list for list shell and demo history slice. | UI + thin backend | Ship with `q` + `state` first; defer saved views persistence and server-side presets. |
| N2 | U7, U9 | `POST /api/folders` | Matter creation with explicit name contract. | call/write | Folder row creation returned to list/detail entry points. | UI + thin backend | Use current contract as-is; defer extra metadata fields until needed. |
| N3 | U10, U11, W-A1 | `GET /api/folders/:id/documents` | Documents readiness/read model for setup and documents tab (`parse_status`, `ocr_status`, `page_count`, errors). | call/read | Setup/documents UI state and upload progress list rendering. | UI + thin backend | Add aggregate readiness counts only; defer richer pipeline telemetry. |
| N4 | U10, W-C5 | `POST /api/folders/:id/documents` | Upload-init affordance with capability envelope (accepted MIME and size bounds). | call/write | Creates queued document + signed upload target for client PUT. | UI + thin backend | Keep PDF-only contract explicit; defer multi-mime expansion. |
| N5 | U10, U12 | `PUT /api/documents/:id/upload` + `POST /api/documents/:id/complete` | Upload-complete and ingest-trigger affordance with deterministic state transitions. | call/write | Object-store write-once + ingest enqueue + folder state refresh. | UI + thin backend | Keep two-step flow and idempotent conflict handling; defer resumable/chunked uploads. |
| N6 | W-A3 (U12 de-scoped) | `POST /api/folders/:id/runs` | Run-start readiness affordance via existing preconditions and conflict reasons (no checklist workflow). | call/write | Run creation + workflow scheduling + conflict reason feedback. | UI + thin backend | Keep existing contract and improve reason copy in UI; defer any checklist-state API. |
| N7 | U29, U37, W-A8 | `GET /api/folders/:id/runs` (new) | Run-picker/read affordance for exports/chat/report scoping. | call/read | Lists recent runs and statuses for selectors/chips. | UI + moderate backend | Add newest N runs only; defer pagination/history depth. |
| N8 | U29, U32, W-A8 | `GET /api/folders/:id/report` | Report read affordance with `run_id` + status filter/deep-link echo. | call/read | Returns rows for scoped run and failed-row review jumps. | UI + moderate backend | Add `run_id` + `status` only; defer persisted saved filters. |
| N9 | W-A4 | `PATCH /api/report-rows/:id` (new) | Row decision mutation affordance (`mark_reviewed`, `flag_issue`, optional note). | call/write | Updates row decision state for drawer workflow. | UI + thin backend | Start with single-state transition + note; defer assignment/work queues. |
| N10 | U28 | No new API in v1 | Citation feedback stays UI-only (`Thanks, we’ll investigate`) without persistence. | render | No backend side effects in parity v1. | UI-only | Defer `/api/citations/:id/flags` and downstream triage workflow. |
| N11 | U37, U42 | `POST /api/folders/:id/chat` | Run-scoped chat affordance (optional `run_id`) + stream metadata (`selected_run_id`, `effective_run_id`, mismatch flag). | call/read | Retrieval constrained to selected/effective run with explicit mismatch visibility. | UI + moderate backend | Parity v1 scope lock: recent completed run picker + mismatch metadata only; `L2` strict isolation and `L3` compare are out-of-scope. |
| N12 | U40, W-A10 | `POST /api/folders/:id/chat` + `GET /api/citations/:id` + `GET /api/documents/:id/render` | Click-to-evidence source affordance (source carries citation/document/page anchor). | call/read | Enables chip click from chat response into evidence viewer. | UI + moderate backend | Enable only when anchor exists; show friendly hover copy when disabled; defer fuzzy anchor recovery heuristics. |
| N13 | U33, U34, U35 | `GET /api/folders/:id/artefacts` | Artefact list filter/provenance affordance (`type`, `kind`, `source_run_id`) + freshness hinting. | call/read | Powers artefact filtering and provenance visibility in list UI. | UI + thin backend | Add filter params + response echo; defer advanced sort modes. |
| N14 | U50, U51, U52, W-A12 | Shared error envelope + support action (new endpoint if needed) | Cross-surface deterministic error affordance (`code`, `trace_id`, retryability, support escalation target). | read/call | Standardized `ErrorBanner` behavior and optional support escalation action. | UI + thin backend | Standardize error payload first; defer external ticketing integrations. |
| N15 | W-A11 | `GET /api/folders/:id/report` and/or citation/report payload fields | Trust-footer metadata affordance (`doc_version`, `verified_at`, `loaded_state`). | read | Evidence viewer trust footer rendering and audit context. | UI + thin backend | Add nullable fields first; defer stricter schema evolution/version policy. |
| N16 | U48, W-C11 | `GET /api/runs/:id` | Operator checklist telemetry affordance (`started_at`, `updated_at`, coarse elapsed minutes). | read | Checklist progress card and elapsed-time display. | UI + moderate backend | Expose coarse duration only; defer second-level precision timers. |

### Moderate API cut line (recommended defer-first)

- `N10`: de-scoped in v1 (UI-only acknowledgement).
- `N11`: keep optional `run_id` + explicit mismatch metadata only; `L2`/`L3` out-of-scope.
- `N12`: keep strict anchor-only jumps; defer fuzzy recovery.
- `N16`: keep coarse elapsed timing; defer precision telemetry pipeline.

## Wireframe delta review (`orbital-ui-wireframes`)

Notes:
- This section captures additional planning deltas from wireframes and does not change the U1–U52 score above.
- Design-system visual treatment in wireframes is intentionally excluded from scope.
- Decision record (2026-02-11): keep this as a separate wireframe delta section; keep demo-only deltas in scope; keep `Documents` tab delta only if it remains non-heavy backend work; convert cut/ignore items into cut/adjust guidance where placeholders are intentionally retained.

### 1) Add to findings: extra work to track from wireframes

| ID | Add this to findings/backlog | Why it matters (affordance / IA / workflow) | Scope classification |
|---|---|---|---|
| W-A1 | Add a first-class `Documents` tab workflow (indexed docs list, readiness state, and clear handoff from setup to review), only while this remains thin/moderate backend effort. | Current checklist tracks setup affordances but does not explicitly track ongoing document-library IA after matter creation. | UI + thin backend (defer if it becomes backend-heavy) |
| W-A2 | Add `Demo History` as a demo-only side surface in matters list (recent demo matters with pack + timestamp + reopen action). | Improves operator repeatability and shortens demo reset loops; complements U45–U49. | UI + thin backend |
| W-A3 | Add explicit Quick Start gating reasons (`ready`, `blocked`, `already complete`) with visible reason copy. | Wireframes make run-state transitions clearer than a binary enabled/disabled button, reducing operator confusion. | UI-only |
| W-A4 | Add row-drawer action workflow (`Mark reviewed`, `Flag issue`) as the primary row-resolution path. | U17/U18 focus on opening details; wireframes add the missing “complete the review decision” step inside that context. | UI + thin backend |
| W-A5 | Add row-level metadata contract in drawer (`schema field`, `data type`, `model/version`) for auditability. | Raises trust/readability during review; currently only broad metadata parity is tracked. | UI + thin backend |
| W-A6 | Add explicit “copy extracted answer” affordance in row detail. | Supports operator handoff and QA workflows without forcing export/download detours. | UI-only |
| W-A7 | Add report-table scale behaviors as acceptance criteria (sticky header + predictable dense-row scanning pattern). | Wireframes define a clearer large-list triage IA than current findings notes. | UI-only |
| W-A8 | Add deep-link contract for `Review failed rows` that carries both `run_id` and failed-status filter state. | Avoids context loss between Exports and Report; wireframes imply this linkage but current finding is still generic. | UI + moderate backend |
| W-A9 | Add chat empty-state onboarding with suggested prompts and one-click injection. | Improves discoverability of chat workflow and reduces first-message friction. | UI-only |
| W-A10 | Add evidence-viewer interaction contract beyond controls (Esc close, backdrop close, return-focus target). | Wireframes imply modal workflow expectations that affect usability/accessibility and operator speed. | UI-only |
| W-A11 | Add evidence trust-footer fields as explicit contract (`doc version`, `verification timestamp`, `loaded state`). | Turns “trust posture” into concrete, inspectable metadata rather than implicit UI. | UI + thin backend |
| W-A12 | Add a standardized cross-surface `ErrorBanner` contract with deterministic code + retry + support escalation. | Current U50–U52 findings are fragmented; wireframes suggest a reusable error workflow component. | UI + thin backend |

### 2) Cut down / adjust from wireframes

| ID | Direction | Decision |
|---|---|---|
| W-C1 | De-prioritize | Use wireframe visual styling/microinteractions as rough inspiration only; parity acceptance should stay grounded in our design system and existing app components. |
| W-C2 | Keep placeholder | Keep `Runs`, `Alerts`, and `Settings` visible on the panel with no functionality (disabled placeholder state). |
| W-C3 | Keep cut | Do not ship hardcoded labels/IDs/dates (`run_882`, sample matter IDs, static timestamps, fixture names). |
| W-C4 | Keep cut | Do not hardcode ingest stats (`12 pages`, `All ready`, fixed document counts); bind to backend ingest state. |
| W-C5 | Keep cut | Do not promise dropzone capabilities (`DOCX`, fixed size limits) unless backend contracts confirm support. |
| W-C6 | Keep cut | Treat document canvas/highlight geometry in wireframes as placeholder; bind implementation to real PDF coordinates and citation anchors. |
| W-C7 | Keep cut | Trust claims (`Loaded securely`, version, verification date) must be dynamic and source-backed. |
| W-C8 | Keep with guardrails | Keep hover interactions where useful, but never as the only discovery path; provide keyboard/touch-visible affordances. |
| W-C9 | Improve | Keep open affordances only with clear hierarchy (one primary open pattern and optional secondary shortcut). |
| W-C10 | De-prioritize | Micro-animation flourishes are polish and should not block parity delivery. |
| W-C11 | Keep cut | Avoid second-level precision elapsed timers unless meaningful run telemetry exists. |
| W-C12 | Keep placeholder | Keep sidebar profile/logout block as a placeholder; use a famous lawyer name (`Ruth Bader Ginsburg`) and no real account behavior. |

## Evidence anchors

- `apps/web/app/layout.tsx`
- `apps/web/app/DemoToolbar.tsx`
- `apps/web/app/(app)/matters/page.tsx`
- `apps/web/app/(app)/matters/[id]/page.tsx`
- `apps/web/app/(app)/matters/[id]/ChatPanel.tsx`
- `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`
- `apps/web/app/(api)/export/csv/route.ts`
- `apps/web/app/(api)/export/docx/route.ts`
- `apps/web/app/(api)/folders/route.ts`
- `apps/web/app/(api)/folders/[id]/documents/route.ts`
- `apps/web/app/(api)/folders/[id]/runs/route.ts`
- `apps/web/app/(api)/folders/[id]/report/route.ts`
- `apps/web/app/(api)/folders/[id]/chat/route.ts`
- `apps/web/app/(api)/folders/[id]/artefacts/route.ts`
- `apps/web/app/(api)/documents/[id]/upload/route.ts`
- `apps/web/app/(api)/documents/[id]/complete/route.ts`
- `apps/web/app/(api)/runs/[id]/route.ts`
- `apps/web/app/(api)/citations/[id]/route.ts`
- `packages/core/src/safe-error.ts`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/pages/MattersListPage.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/pages/NewMatterPage.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/pages/MatterDetailPage.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/ReportTab.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/RowDrawer.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/EvidenceViewer.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/ChatTab.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/ExportsTab.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/ArtefactsTab.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/demo/OperatorChecklist.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/demo/DemoToolbar.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/demo/DemoHistory.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/ui/ErrorBanner.tsx`
