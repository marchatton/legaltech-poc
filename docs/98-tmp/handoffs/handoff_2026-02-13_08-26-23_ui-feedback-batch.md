Saved handoff: docs/98-tmp/handoffs/handoff_2026-02-13_08-26-23_ui-feedback-batch.md

## Scope

~20 discrete UI fixes spanning sidebar, tables, filters, drawer, chat, reports, and a new data field. Based on user feedback after the v5 design system refactor.

## Status: Complete (not committed)

All changes build cleanly (`pnpm --filter @legaltech-poc/web build` passes). 12 files changed, ~273 insertions, ~300 deletions. No new test failures introduced.

## Changes by area

### 1. SegmentedControl primitive — NEW file (unused)
- `app/ui/SegmentedControl.tsx` — generic `<Link>`/`<button>` segmented control with size variants and optional count badges.
- **Not wired in**: user decided to keep existing filter pill style. Available for future use.

### 2. Sidebar (`app/ui/WorkspaceSidebar.tsx`)
- Replaced complex gear SVG for Settings with clean Lucide-style sun-ray cog icon.
- Added `DestinationGroup` ("main" | "system") — visual `border-t` separator between Matters/Runs and Alerts/Settings.

### 3. Matters list page (`app/(app)/matters/page.tsx`)
- Removed "Demo Packs" from `SAVED_VIEW_OPTIONS`.
- Reduced sticky filter section top padding `pt-6` → `pt-4`.
- **Fixed overlay bug**: filter section now sticks at `top-[calc(var(--app-topbar-height,3rem)+3.5rem)]` (below both topbar and context bar) instead of `top-[var(--app-topbar-height,3rem)]` which caused it to slide behind the context bar (z-30 vs z-20).
- Moved "Showing X-Y of N matters" from above the table to below it.
- Added "State" column showing `jurisdiction_state` as a muted badge.

### 4. Matter detail page (`app/(app)/matters/[id]/page.tsx`)
- Checklist section wrapped in `max-w-lg`.
- "Load Pack Again" button changed from `ghost` to `secondary` variant.
- Stepper line overflow fixed: replaced `border-l-2` on `<ol>` with per-item `<span>` connector lines (skipped below last item).
- Added document icon (file SVG) and chat icon (speech bubble SVG) to `tabIcon()`.
- Moved triage "Showing X/Y" from inline next to pills to `text-right` below the `ReportTriagePanel`.
- Jurisdiction state badge displayed in header alongside status badge.
- FolderRow type + SQL query updated to include `jurisdiction_state`.

### 5. Side drawer (`app/(app)/matters/[id]/ReportTriagePanel.tsx`)
- **Anchoring fix**: changed from `fixed inset-y-0 right-0` to `fixed right-0 bottom-0 top-[calc(var(--app-topbar-height,3rem)+3.5rem)]` — drawer now starts below topbar + context bar instead of being hidden behind them.
- Widened from `max-w-[34rem]` to `max-w-[42rem]` (table padding offset updated to match).
- **Removed sections**: "Structured payload" (copy payload button + schema/kind/JSON pre) and "Metadata" (row metadata + trust metadata sub-sections) both deleted entirely.
- Dead code cleaned up: `TrustMetadata` type, `TRUST_METADATA_FALLBACK`, `trustMetadataFromRecord`, `trustMetadataFromProvenance`, `formatTrustTimestamp`, `trustValue`, `inferDataType`, `payloadKind`, `stringifyJson`, `handleCopyStructuredPayload`, `selectedRowTrustMetadata` memo all removed. `CopyAction` narrowed to `"answer"` only.

### 6. Documents panel (`SetupDocumentsPanel.tsx`)
- Button label renamed: "Refresh readiness" → "Check status".

### 7. Chat panel (`ChatPanel.tsx`)
- Send button redesigned: replaced text `<Button>` with circular `size-[38px] bg-primary text-primary-foreground rounded-ui-md` button with arrow SVG icon.
- Suggested prompts moved from `EmptyState` action slot to a dedicated section between messages and input area (persists until first message is sent, visible when `contextReady`).

### 8. Exports panel (`ExportsPanel.tsx`)
- Redesigned from 2-column (report card + CSV card with 3 buttons) to 4 equal cards in `grid gap-4 sm:grid-cols-2`.
- Each card: 40px icon circle (`bg-primary/10`), title, description, single download button.
- Cards: Full Report (doc icon), Summary CSV (table/grid icon), Details CSV (list icon), Citations CSV (link icon).

### 9. US State field — NEW data
- **Schema** (`lib/db/schema/core.server.ts`): `ALTER TABLE folders ADD COLUMN IF NOT EXISTS jurisdiction_state TEXT NULL` backfill.
- **API** (`app/(api)/folders/route.ts`): `CreateFolderSchema` accepts optional `jurisdiction_state` (max 2 chars). Inserted into DB and returned in response.
- **Form** (`CreateMatterForm.tsx`): `<Select>` picklist with all 50 US states + DC. Optional field, label "Jurisdiction State".
- **Display**: Badge in matter detail header + "State" column in matters table.
- **Fixtures** (`app/(api)/demo/load-pack/route.ts`): `PACK_JURISDICTION` map seeds pack_01=NY, pack_02=TX, pack_09=NY.
- **List query** (`lib/mattersList.server.ts`): `MatterListItem` type and SQL updated to include `jurisdiction_state`.

## Files modified

| File | Summary |
|------|---------|
| `app/ui/SegmentedControl.tsx` | **NEW** — unused but available |
| `app/ui/WorkspaceSidebar.tsx` | Settings icon, nav group separator |
| `app/(app)/matters/page.tsx` | Remove Demo Packs, fix overlay, move count, add State column |
| `app/(app)/matters/[id]/page.tsx` | Checklist width/stepper, tab icons, triage count, jurisdiction badge |
| `app/(app)/matters/[id]/ReportTriagePanel.tsx` | Drawer anchoring/width, remove payload+metadata sections, dead code cleanup |
| `app/(app)/matters/[id]/SetupDocumentsPanel.tsx` | Rename button label |
| `app/(app)/matters/[id]/ChatPanel.tsx` | V5 send button, suggestion placement |
| `app/(app)/matters/[id]/ExportsPanel.tsx` | 4-card redesign |
| `app/(app)/matters/CreateMatterForm.tsx` | State picklist |
| `app/(api)/folders/route.ts` | Accept jurisdiction_state |
| `app/(api)/demo/load-pack/route.ts` | Seed jurisdiction_state per pack |
| `lib/db/schema/core.server.ts` | jurisdiction_state column backfill |
| `lib/mattersList.server.ts` | jurisdiction_state in type + query |

## Visual verification checklist

1. `/matters` — filter pills (no Demo Packs), count below table, State column, sticky filters below context bar
2. Open a matter → checklist capped width, stepper lines stop at last item, doc/chat tab icons, jurisdiction badge in header
3. Open triage drawer → anchored below header bars, wider, only answer + citations (no payload/metadata)
4. Documents tab → "Check status" label
5. Chat tab → circular orange send button, suggestions above input (before first message)
6. Reports tab → 4 clean cards
7. Create new matter → state picklist appears, saves and displays correctly
8. Sidebar → cleaner settings icon, visual separator between nav groups

## Decisions / trade-offs

- **SegmentedControl not used**: User explicitly requested keeping existing pill style. Component exists for future use.
- **Drawer removes payload + metadata entirely**: Per plan. Operators only need extracted answer + citation summary for triage workflow.
- **jurisdiction_state has no CHECK constraint**: Any 2-char string accepted. Validation is in the Zod schema (`.max(2)`). No enum constraint in DB for flexibility.
