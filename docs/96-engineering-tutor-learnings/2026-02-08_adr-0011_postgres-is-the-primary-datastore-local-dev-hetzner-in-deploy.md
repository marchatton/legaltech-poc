# ADR-0011: Postgres is the primary datastore (local dev; Hetzner in deploy)

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
Pick one place where the product's facts live, and treat it as the source of truth.

In this project, that place is Postgres. It holds truth data for runs, steps, citations, and other product state. It also supports the two retrieval features we need early: `pgvector` for semantic search and `tsvector` for keyword search.

Because the PoC is single-tenant, we can start with one Postgres instance and keep the data plane simple. Local dev runs Postgres locally. Deployment runs Postgres on the Hetzner VM, with backups and monitoring.

Inputs:
- Writes from the app: runs, steps, citations, and other truth rows.
- Writes for search: vectors (embeddings) and text for full text search.

Outputs:
- Reads for product behavior: "what happened in this run?", "what steps were taken?", "what citations support this answer?"
- Reads for retrieval: nearest-neighbor vector matches and keyword matches.

## Metaphor/analogy (with mapping + where it breaks)
Think of Postgres as the team's master lab notebook.

Everyone writes the real results in the notebook (runs, steps, citations). The notebook also has two indexes:
- A keyword index so you can look up pages by words (tsvector).
- A "looks similar" index so you can find pages that are semantically close (pgvector).

Local dev is you having a copy of the notebook on your desk. Deployment is the notebook stored in the lab safe (the Hetzner VM), with scheduled photocopies (backups) and someone monitoring it.

Mapping:
| Metaphor | System |
|---|---|
| Master lab notebook | Postgres primary datastore (truth store) |
| A page in the notebook | A row in a table |
| Writing experiment steps | Writing run/step records |
| Footnotes/citations | Citation rows that point to supporting material |
| Keyword index | Full text search via `tsvector` |
| "Find similar pages" index | Vector similarity search via `pgvector` |
| Desk copy | Local dev Postgres via Docker Compose or Sprite (ADR-0022) |
| Lab safe | Self-hosted Postgres on the Hetzner VM |
| Photocopies stored elsewhere | Automated backups |
| Someone watching for problems | Monitoring (disk, CPU, slow queries, backup success) |

Where the metaphor breaks:
- Postgres has hard limits (connections, disk, CPU). A notebook does not.
- Indexes can bloat and require maintenance.
- Vector similarity is math-based and can return plausible but wrong matches.

## Visual explanation (small ASCII diagram)
```text
Local dev (on your laptop):
  [web/api/worker code] <--> [Postgres: Docker Compose OR Sprite]

Deploy (on Hetzner VM):
  [browser/users] -> [web/api/worker] <--> [Postgres]
                                      |
                                      +--> [automated backups]
                                      +--> [monitoring/alerts]
```

## Step-by-step breakdown
1. Define the truth store.
Postgres is the canonical place for runs, steps, citations, and core state. If something is not in Postgres, it is not a reliable fact.

2. Put structure and safety close to the data.
Relational tables, constraints, and transactions make behavior explicit and reduce silent drift.

3. Use Postgres for both truth and search, initially.
`pgvector` and `tsvector` let us start without adding separate systems.

4. Local dev runs Postgres next to the code.
Start Postgres via Docker Compose or Sprite (ADR-0022). The app talks to a real Postgres instance during development.

5. Deploy runs Postgres on the Hetzner VM with backups and monitoring.
This keeps the data plane simple and latency predictable. Constraint: self-hosting means you own operations (patching, sizing, restores, alerting).

6. Plan for serverless connection issues if the web/API moves to Vercel.
If we later put the web/API on Vercel, we must add connection pooling and strict limits.

Trade-offs:
- Pro: one datastore to learn, query, secure, and reason about.
- Pro: fewer moving parts for a PoC, faster iteration.
- Con: you must do basic database operations work (backups, monitoring, upgrades).
- Con: Postgres is not a specialized vector DB or search engine, so extreme scale may require changes later.

Failure modes:
- Postgres is down: app cannot read/write truth data.
- Too many connections: connection slot errors and high latency.
- Disk fills: writes fail; recovery gets risky.
- Backups exist but restores are untested.
- Slow queries/missing indexes: latency spikes and timeouts.

Why this design vs alternatives:
- SQLite: weaker concurrency and does not match the deploy posture we want.
- Separate vector DB/search engine now: adds operational overhead before we know we need it.
- Managed Postgres: could be fine, but the Hetzner-first posture keeps the demo stack simple, at the cost of owning ops.

## Common misunderstandings
- "Primary datastore means we store everything in Postgres." Primary means source of truth for core state. Large blobs can live elsewhere, but canonical references still belong in Postgres.
- "pgvector means we never need a real vector database." It is enough early; not a guarantee for every scale/latency target.
- "Self-hosted on Hetzner is effortless." It is simpler in some ways, but you must do backups, monitoring, upgrades, and restores.
- "Vercel can just connect to Postgres directly like any server." Serverless traffic can explode connection counts; pooling is not optional if we go that route.

## Check understanding (teach-back question)
Teach back in 4 to 6 sentences: what does "Postgres is the truth store" mean, where does Postgres run in local dev and in deployment, what are the main trade-offs, and what new risk appears if the web/API moves to Vercel (plus one concrete mitigation)?

