# ADR-0014: Create a minimal runnable scaffold to validate the architecture

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
This ADR is a tracer bullet decision: the repo is docs-first, but architecture only becomes real when you can run a thin end-to-end slice.

A minimal scaffold lets us validate two things early:
- The UX shape we care about (PDF viewer + citations) can actually be delivered in the chosen framework.
- The plumbing (shared contracts, local infra, dev commands) works in a repeatable way for anyone cloning the repo.

The goal is not to build the whole product. The goal is to make the architecture falsifiable quickly with the smallest runnable system.

## Metaphor/analogy (with mapping + where it breaks)
Think of this as building a test jig for a machine before you build the machine.

Mapping:
- Architecture docs and ADRs: the machine design.
- Minimal pnpm workspace scaffold: the test jig.
- `apps/web`: the control panel (Next.js App Router UX).
- `packages/core`: the spec sheet and standardized connectors (Zod schemas + core contracts).
- `docker-compose.yml` Postgres (pgvector): the bench power supply and sensors (local backing services).
- `pnpm dev/build/test/lint`: the standard test procedures.

Where the metaphor breaks: a jig usually does not ship; scaffolding sometimes accidentally becomes production. This ADR explicitly calls out that risk and says to keep it intentionally thin.

## Visual explanation (small ASCII diagram)
```text
            pnpm workspace (minimal scaffold)
+--------------------------------------------------+
|                                                  |
|  apps/web (Next.js App Router)                   |
|    - PDF viewer + citations UX tracer bullet     |
|            |                                     |
|            v                                     |
|  packages/core                                  |
|    - Zod schemas                                |
|    - core contracts (shared types/interfaces)    |
|            |                                     |
|            v                                     |
|  docker-compose.yml                              |
|    - Postgres + pgvector                         |
|    - (MinIO optional later)                      |
|                                                  |
|  Repo commands: pnpm dev | build | test | lint    |
+--------------------------------------------------+
```

## Step-by-step breakdown
1. Define the minimum runnable outcome.
Input: a fresh clone plus minimal env vars.
Output: a running web app plus a local database, started via documented `pnpm` and `docker` commands.

2. Add a pnpm workspace skeleton that encodes boundaries.
Constraint: keep it intentionally small and focused on validating the architecture, not feature completeness.

3. Create `packages/core` as the single source of truth for contracts.
Output: Zod-validated schemas and types that `apps/web` consumes.

4. Create `apps/web` as the runnable UX surface.
Output: a Next.js App Router app that exercises PDF viewing and citation-related flows enough to prove viability.

5. Add local infrastructure with `docker-compose.yml` for Postgres + pgvector.
Constraint: MinIO is optional and deferred.

6. Wire repo-level commands: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`.
Output: onboarding becomes repeatable.

Trade-offs:
- Faster architecture validation and onboarding.
- Risk of scaffolding becoming premature product code if it grows without restraint.

Failure modes:
- "Works on my machine" drift if the scaffold does not encode the real dependencies/commands.
- Contract drift if `packages/core` is bypassed or duplicated inside `apps/web`.

Why this design vs alternatives:
- Docs-only cannot validate integration points, DX, or end-to-end feasibility.
- Building the full PoC immediately wastes work if assumptions are wrong.
- A single app without workspace/packages makes shared contracts easy to duplicate and drift.

## Common misunderstandings
- "Scaffold" means production foundation. It is a tracer bullet to validate assumptions.
- `packages/core` is optional. It should be the shared source of truth to avoid contract drift.
- Adding more services now is harmless. Every extra service increases onboarding cost and widens the failure surface.
- If `pnpm dev` works, the architecture is done. A scaffold validates feasibility, not completeness.

## Check understanding (teach-back question)
Explain what the minimal scaffold is meant to prove (and what it is explicitly not meant to prove). Then list one concrete signal that would tell you the architecture assumptions are failing when you run `pnpm dev` against local Postgres.

