# Drift Item 2: Evidence/Citations Drift (DB-backed locked citations vs fixture-only `/citations/:id`)

Assumptions: you want to build chat "with sources" soon, and you want the evidence UX contract to be stable and real-ingest-capable (not just demo fixtures).

## Sources (doc vs code)
- Docs (should): `docs/03-architecture/50_api_surface.md`, `docs/03-architecture/DECISIONS.md`
- Code (is): `apps/web/app/(api)/citations/[id]/route.ts`, `apps/web/lib/fixtureSeed.server.ts`, `apps/web/app/(app)/matters/viewer/page.tsx`

## 1) Intuition first (plain English)
Docs describe citations as durable, "locked" evidence: you can fetch a citation by ID and trust it is backed by real ingested documents stored in Postgres.

Code today serves citations from seeded fixture snapshots. That makes the demo work, but it means real ingested documents cannot use the evidence UX contract yet.

So: the contract exists, but the data source is not the real system of record.

## 2) Metaphor / analogy (mapping)
Think of a museum exhibit:
- "Locked citations in DB" is the real artifact in a display case: anyone can reference it and see the same thing.
- "Fixture-only citations" is a photo of the artifact in the gift shop: it looks right, but it is not the thing itself.

Where the metaphor breaks: fixture-only can be fine for a prototype, but it becomes dangerous if the docs imply the gift-shop photo is the artifact.

## 3) Visual explanation (diagram via beautiful-mermaid)
Mermaid source:
```mermaid
flowchart LR
  D[Docs: locked citations in DB] --> A[/citations/:id]
  C[Code: fixtures + seed snapshots] --> A
  A --> I[Impact: real ingests can't show evidence]
  A --> F[Fix: DB-first lookup; fixture fallback]
```

Rendered:
```text
┌─────────────────────────────────┐     ┌────────────────┐     ┌──────────────────────────────────────────┐
│                                 │     │                │     │                                          │
│   Docs: locked citations in DB  ├────►│ /citations/:id ├────►│ Impact: real ingests can't show evidence │
│                                 │     │                │     │                                          │
└─────────────────────────────────┘     └────────┬───────┘     └──────────────────────────────────────────┘
                                                 ▲
                                                 │
                                                 │
                                                 │
                                                 │
┌─────────────────────────────────┐              │             ┌──────────────────────────────────────────┐
│                                 │              │             │                                          │
│ Code: fixtures + seed snapshots ├──────────────┴────────────►│  Fix: DB-first lookup; fixture fallback  │
│                                 │                            │                                          │
└─────────────────────────────────┘                            └──────────────────────────────────────────┘
```

## 4) Step-by-step breakdown
What "locked citations" usually means (inputs/outputs):
- Input: a `citation_id`.
- Output: a payload that includes:
  - the exact snippet (or excerpt bounds) shown to users,
  - a hash so you can prove it did not change,
  - geometry/polygons so the UI can highlight where it came from (even if coarse at first).

What the current code is doing:
- It can return citation-like objects, but they are coming from a seeded fixture snapshot path.
- The viewer works because it is reading from that fixture world.

Why this matters (constraints + failure modes):
- Chat "with sources" needs to reference citations that come from actual ingested docs; otherwise:
  - sources are not reproducible,
  - exports may not be trustworthy,
  - you cannot unify evidence across viewer + chat.

Fix options (with trade-offs):
- Doc-only: mark `/citations/:id` as fixture-only.
  - Pro: fastest; reduces confusion.
  - Con: still blocks chat grounding on real ingests.
- Code (recommended): make `/citations/:id` DB-first.
  - Behavior: look up in Postgres by ID; if not found and in dev/demo-prod, fall back to fixtures.
  - Pro: stabilizes the contract for real ingested data; chat can depend on it.
  - Con: you must define and maintain DB schema/invariants for citations.

## 5) Common misunderstandings
- "We can keep fixtures forever for citations."
  - You can for demos, but if chat depends on citations, fixtures become an unreliable substrate.
- "DB-first means no demo."
  - You can still keep a fixture fallback in dev/demo-prod, but the default path should match production reality.
- "Citations can be generated on the fly at request time."
  - That breaks "locked" semantics; you want stable payloads that can be audited and exported.

## 6) Check understanding (teach-back question)
If someone shares a citation link today, what guarantees do we want about what the recipient sees (stability, provenance, highlight location), and which of those guarantees are currently violated by fixture-only backing?

