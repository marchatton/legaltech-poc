# ADR-0022: Docker Compose usage (local services) and Sprite as a dev sandbox (both supported)

Status: accepted  
Date: 2026-02-08  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
When you build the app locally, you need supporting services to exist, especially a database. This ADR says: we support two boring ways to get those services.

Docker Compose mode is for running only the dependencies (currently: Postgres 16 with pgvector) in containers. You still run the web app and worker on your machine for the fast edit-run-debug loop.

Sprite mode is for people who want a tighter sandbox. It can run the same dev setup in a more isolated, reproducible environment. It might run the app and worker in a container as part of the sandbox, but the repo does not require that as the default dev path.

Inputs: `docker-compose.yml` or Sprite sandbox config, plus env vars like `DATABASE_URL`.  
Outputs: a running Postgres + pgvector that the app can connect to.

Constraint: keep local onboarding simple, do not force a container-first workflow for the whole app, and keep local dev ergonomics separate from production deployment choices.

## Metaphor/analogy (with mapping + where it breaks)
Think "test kitchen".

Mapping:
| Real world | Compose mode | Sprite mode |
| --- | --- | --- |
| Your kitchen | Your host OS | A sandboxed environment |
| One rented appliance | The `db` container (Postgres + pgvector) | The whole kitchen kit (dependencies, and maybe app/worker) |
| Recipe card | `docker-compose.yml` | Sprite config / sandbox definition |
| Pantry that keeps leftovers | Docker volume `orbital-pgdata` | Sandbox storage (depends on Sprite) |
| The cook | You running `pnpm dev` on the host | You running the same dev commands inside the sandbox |

Where the metaphor breaks:
- Containers/sandboxes have network boundaries (ports, hostnames).
- Data leftovers differ: Compose uses a named volume by default; Sprite may isolate/reset state differently.

## Visual explanation (small ASCII diagram)
```text
Mode A: Docker Compose for local services (app stays on host)

+-------------------+        DATABASE_URL         +----------------------+
| Your machine      |  ----------------------->  | Postgres + pgvector   |
| web/worker (host) |                            | (Compose service: db) |
+-------------------+                            +----------------------+
                                                        |
                                                        | persisted in
                                                        v
                                                 +---------------+
                                                 | orbital-pgdata |
                                                 +---------------+

Mode B: Sprite sandbox (more isolation)

+--------------------------------------------------------------+
| Sprite sandbox                                                |
|   web/worker (maybe)  <-->  Postgres + pgvector (same contract) |
+--------------------------------------------------------------+
```

## Step-by-step breakdown
Step 1: Decide what you need today.
- Compose mode is best when you just want Postgres running fast.
- Sprite mode is best when you want stronger isolation and reproducibility.

Step 2: Compose mode (start only dependency services).
Typical flow:
```sh
docker compose up -d
pnpm dev
```

In this repo, the Compose service is `db` with image `pgvector/pgvector:pg16`. It exposes `5432` on the host and initializes extensions from `scripts/db/init.sql` (including `vector`). A safe mental contract is: something listens on `127.0.0.1:5432` and supports `CREATE EXTENSION vector;`.

Step 3: Sprite mode (run the same dev setup inside a sandbox).
The stable contract is still: Postgres + pgvector are reachable to the app. Sprite provides a more isolated environment that can run the same setup.

Step 4: Know the trade-offs and failure modes.
Trade-offs:
| Choice | What you gain | What you pay |
| --- | --- | --- |
| Compose mode | Fast inner loop, minimal abstraction | Less isolation, port conflicts, more drift |
| Sprite mode | Isolation, reproducibility, onboarding parity | More tooling, sandbox quirks |

Failure modes:
- Port conflict: `docker compose up` fails or the app cannot connect to `127.0.0.1:5432` because another Postgres is already using it.
- DB is up but pgvector is missing: init script did not run (common when a volume already exists).
- Hostname mismatch: some sandboxes treat `localhost` differently. Try `127.0.0.1` to force IPv4.

Why this design vs alternatives:
- Containerize the whole app/worker: pushes everyone into a container-first workflow and often slows day-to-day debugging.
- Require Sprite only: adds tooling even for contributors who just want a database.
- Install Postgres locally: increases setup variability and makes pgvector easy to forget.

## Common misunderstandings
- "Docker Compose mode means the app runs in Docker." Compose is for local dependency services; you run the app/worker on the host.
- "Sprite is required." It is supported as an option.
- "This decides production deployment." No. It explicitly keeps production containerization/deployment separate from local dev ergonomics.
- "If I ran `docker compose up`, my app will connect." Only if `DATABASE_URL` points at the right host/port and pgvector is enabled.
- "Re-running Compose always re-runs init.sql." Init scripts typically run only on first init of a fresh data directory.

## Check understanding (teach-back question)
If you were onboarding a new contributor, how would you explain the difference between Compose mode and Sprite mode in one sentence each, and what single contract (inputs and outputs) must hold true for the app to work in either mode?

