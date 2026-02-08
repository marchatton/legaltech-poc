# ADR-0008: Explicit error envelope for APIs

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
When an API fails, clients still need a predictable response shape. If every endpoint returns a different error format (or raw exceptions), frontend code becomes fragile and you risk leaking internal/provider details.

So the rule is simple: every non-2xx response returns the same JSON error envelope with a safe `code`, a human-readable `message`, optional safe `details`, and an optional `trace_id`.

Inputs/outputs (at a glance):
- Input: any request that results in a non-2xx outcome (validation, auth, conflict, rate limit, unexpected exception).
- Output: HTTP non-2xx + JSON body shaped like:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable summary",
    "details": { "field": "optional safe detail" },
    "trace_id": "optional-trace-id"
  }
}
```

## Metaphor/analogy (with mapping + where it breaks)
Think of API errors like a standardized incident report form that every department must use.

Mapping:
- HTTP status: the big red severity stamp on the form (400, 401, 403, 404, 409, 429, 500).
- `error.code`: the incident category dropdown (stable and machine-branchable).
- `error.message`: the one-sentence summary a human can understand.
- `error.details`: a small notes box for safe, bounded context (not raw logs).
- `error.trace_id`: the case number you give to support so they can find the full internal report.

Where the metaphor breaks:
- `details` must stay safe because it goes to the client.
- `error.code` should come from a controlled set so clients can rely on it.

## Visual explanation (small ASCII diagram)
```text
Client                API Server                         Logs/Tracing
  |  JSON request         |                                  |
  |---------------------->|                                  |
  |                       | validate/auth/business logic      |
  |                       |                                  |
  |                       | on success:                       |
  |                       |   2xx + normal JSON               |
  |                       |                                  |
  |                       | on failure:                       |
  |                       |   non-2xx + { error: {...} }      |
  |                       |   include trace_id (and header)   |
  |                       |------------------------------->   | (full internal detail)
  |<----------------------|                                  |
```

## Step-by-step breakdown
1. Decide if the request failed at a boundary (invalid input, missing auth, forbidden, not found, conflict, rate limited) or failed unexpectedly (exception, provider failure).
2. Pick a stable `error.code` that the client can branch on. Keep it consistent across endpoints.
3. Map `error.code` to the right HTTP status. Example defaults:
- `VALIDATION_ERROR`: 400
- `UNAUTHENTICATED`: 401
- `UNAUTHORISED`: 403
- `NOT_FOUND`: 404
- `CONFLICT`: 409
- `RATE_LIMITED`: 429
- `INTERNAL`: 500
4. Write `error.message` as a safe summary. It must not contain stack traces, secrets, or raw provider payloads.
5. Add `error.details` only when it is safe and useful. Treat it as public API: bounded size, no PII, no tokens, no signed URLs, no upstream dumps.
6. Generate or propagate a `trace_id` per request. Include it in the envelope and (ideally) as an `X-Trace-Id` response header.
7. Log the real internal error server-side with the same `trace_id`. If you hit an unexpected exception, return `error.code = "INTERNAL"` with a safe message.

Constraints:
- All non-2xx responses use the same envelope shape.
- Never leak internal errors or provider payloads to clients.
- Clients implement consistent error handling using `error.code`.

Trade-offs:
- More server work up front (mapping, sanitizing, standardizing).
- Less immediate debugging info in the client response.
- Big win in stability, security posture, and simpler frontend and support workflows.

Failure modes:
- Ad hoc error shapes on one endpoint "just for now".
- Returning 200 with an `error` payload.
- Letting `details` become a dumping ground for secrets or upstream payloads.
- Changing `error.code` values casually (breaks client logic).
- Omitting `trace_id` (harder incident correlation).

Why this design vs alternatives:
- Per-endpoint error JSON: breaks clients and duplicates handling.
- Plain text errors: not machine-readable or stable.
- Raw exceptions/provider errors: leaks internals and breaks contracts.
- "Always 200 with error inside": breaks HTTP semantics and monitoring/retry behavior.

## Common misunderstandings
- "The envelope replaces HTTP status codes." It does not; you still use correct non-2xx statuses.
- "`error.message` must be stable for clients." Usually `error.code` is the stable contract; messages can evolve.
- "`details` is for debugging everything." No; deep debugging stays in server logs keyed by `trace_id`.
- "We can pass through provider error blobs." Not if it risks leaking internals; map to safe code/message and log raw server-side.

## Check understanding (teach-back question)
A request fails because the user is authenticated but not allowed to access a document. Describe the HTTP status and JSON envelope you would return, what you would put in `error.code` and `error.message`, what (if anything) you would put in `details`, and how `trace_id` helps you debug without leaking internals.

