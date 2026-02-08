# ADR-0018: Run trace export is `GET /runs/:id/trace` and is admin-token gated

Status: accepted  
Date: 2026-02-07  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
When a run cannot export (or it fails closed, meaning it blocks output when trust breaks), you still need to see what happened so you can debug it. Re-running the workflow is slow and can change the outcome, so we want a deterministic trace for that exact run.

This ADR adds a simple, developer-facing endpoint to fetch a run's trace as JSON, but locks it behind an admin token because traces can be sensitive and PoC environments may not have full auth.

## Metaphor/analogy (with mapping + where it breaks)
Think of a run trace like an airplane's flight recorder. When something goes wrong, you do not re-fly the plane to guess what happened. You pull the recorder data for that flight, but only authorized investigators can access it, and even then you do not automatically publish everything to the public.

Mapping:
| Real thing | Metaphor |
| --- | --- |
| Run | A flight |
| Trace | Flight recorder data |
| `GET /runs/:id/trace` | Request the recorder for a specific flight ID |
| `X-Orbital-Admin-Token` | Investigator badge |
| `ORBITAL_ADMIN_TOKEN` (env) | Badge value stored securely |
| `403` error envelope | Access denied at the locked archive |

Where it breaks:
- Flight recorders are physical artifacts; traces are data the system already captured.
- Real investigations use roles and audit trails; PoC v1 uses a shared admin token, so it is simpler but less granular.

## Visual explanation (small ASCII diagram)
```text
[Dev/Operator]
    |
    | GET /runs/:id/trace
    | X-Orbital-Admin-Token: <token>
    v
[API Server]
    |
    | compare header token to env ORBITAL_ADMIN_TOKEN
    v
[Admin Gate]
  | ok                       | not ok
  v                          v
[Trace Exporter]          [403 Error Envelope]
  |
  | sanitize: no PDF bytes, avoid full doc text,
  |           no raw provider payloads, prefer IDs + hashes
  v
[200 JSON Trace]
```

## Step-by-step breakdown
1. Input: caller chooses a run ID and sends `GET /runs/:id/trace`.
2. Input: caller includes `X-Orbital-Admin-Token` in request headers.
3. Constraint: PoC v1 might have no user auth, so this endpoint must still be admin-only.
4. The server compares `X-Orbital-Admin-Token` to `ORBITAL_ADMIN_TOKEN` (env).
5. Output on failure: missing/mismatched token returns `403` using the standard error envelope (ADR-0008).
6. Output on success: return a JSON trace for the run.

Safety constraints:
- No raw PDF bytes.
- Avoid full extracted document text.
- No raw provider payload dumps.
- Prefer opaque IDs + hashes.

Inputs:
- Path param: `id` (run ID)
- Header: `X-Orbital-Admin-Token`
- Server config: `ORBITAL_ADMIN_TOKEN` (environment variable)

Outputs:
- `200` JSON trace (sanitized)
- `403` standard error envelope when token is missing/wrong

Trade-offs:
- Pro: `GET` makes this a simple, deterministic fetch for a specific run (good for debugging and repeatability).
- Pro: token gating works even when there is no full auth system in a PoC environment.
- Con: shared admin token is coarse-grained and needs careful handling.
- Con: safe-by-default means you might not get every possible detail (by design).

Failure modes:
- Legit operators forget to include token and get `403`.
- Sanitization is incomplete and leaks sensitive information.
- Admin token leaks via shell history/logs.
- Trace too minimal, requiring additional artifacts or logs to debug.

Why this design vs alternatives:
- Full auth/roles: heavier than PoC v1 needs; trace still must be admin-only even when auth is missing.
- Returning raw artifacts/payloads: higher leakage risk.
- Re-running workflows: slower and can change behavior; a trace fetch is deterministic.

## Common misunderstandings
- "It is a GET endpoint, so it is public." No. It is gated by `X-Orbital-Admin-Token`.
- "The trace is a complete dump of everything." No. It is minimal and safe by default.
- "If I know the run ID, I can fetch the trace." Not without the admin token.
- "Token gating is the same as a full auth system." It is a PoC v1 control with coarse access.

## Check understanding (teach-back question)
If a run export fails closed and you need to debug without re-running, what exact request do you make, what header must you include, what does the server compare it against, and what kinds of data must the trace avoid returning by default?

