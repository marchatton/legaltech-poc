# ADR-0021: Data handling posture (storage, provider boundaries, and redaction defaults)

Status: proposed  
Date: 2026-02-07  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
Treat user data like it is easy to spill and hard to un-spill.

So we draw hard boundaries:
- What we store (Postgres vs object storage).
- What we send to outside providers (OCR, LLM, embeddings, storage).
- What we record for visibility (logs and telemetry).

Default posture: store only what we need for product state and auditability, send the minimum text needed for a step, do not persist provider payloads, and redact logs by default.

## Metaphor/analogy (with mapping + where it breaks)
Think of Orbital as a secure office building with a vault, a warehouse, and a public lobby whiteboard.

Mapping:
- Orbital app: the building that controls where things can go.
- Postgres: the secure file room (contains product state and extracted text, so it is sensitive).
- Object storage: a locked warehouse for big boxes (raw PDFs and exported artifacts).
- OCR/layout provider: an outside scanning service you hand a box to; they give you typed pages and layout.
- LLM/embedding providers: a consultant you show only the relevant excerpt needed for the current step.
- Logs/telemetry: the public lobby whiteboard (assume many people can see it over time).
- Signed URL: a temporary visitor pass to pick up one box (expires quickly, never filed away).
- `ORBITAL_ADMIN_TOKEN`: the master key kept in a safe (env-only, never written down in records).

Where the metaphor breaks:
- Digital copies are perfect; if you send too much out, you cannot reliably get it back.
- A signed URL is a valid pass until it expires. Leaks inside the TTL are still leaks.
- Providers may keep notes depending on contracts/behavior; minimizing what you send is safest.

## Visual explanation (small ASCII diagram)
```text
                        (redacted only: ids/hashes/counts/timings/codes)
                                         +------------------+
                                         | Logs / telemetry |
                                         +------------------+
                                                  ^
                                                  |
[Client] ---> [Orbital API] -----------------------+
    |              |      |
    |              |      +--> [Postgres]
    |              |            (folders/runs/questions/report rows/citations/
    |              |             sanitized errors/metadata + extracted text)
    |              |
    |              +--> [Object storage]
    |                    (raw PDFs + exported artifacts; signed URLs NOT stored)
    |
    |   (on demand, TTL target 5-15 min; return to client; never persist)
    +<-------------------------- signed URL ------------------------------+

[Orbital API] -- PDF bytes --> [OCR/layout provider] -- text+geometry --> [Orbital API]
[Orbital API] -- minimal text --> [LLM/embedding providers] -- output --> [Orbital API]

[env: ORBITAL_ADMIN_TOKEN] --> [Orbital API admin-only endpoints]
```

## Step-by-step breakdown
1. Persist what must be durable (storage boundaries).
Input: user uploads a PDF.
Output: PDF bytes go to object storage; product state and auditability primitives go to Postgres.
Constraint: Postgres also stores extracted text (`document_pages.text`, `chunks.text`, `citations.snippet`) and must be treated as sensitive.

2. Extract text via OCR without broad sharing (provider boundary: OCR).
Input to OCR provider: PDF bytes.
Output from OCR provider: text plus geometry.
Constraint: do not transmit customer exports or run traces as part of OCR calls.
Default: provider request/response payloads are not persisted.

3. Ask LLMs/embeddings with minimum required text (provider boundary: LLM/embeddings).
Input to providers: question text plus candidate chunk text plus limited system instructions.
Constraint: do not send full documents by default; send only the minimum text required for the current step.
Default: do not persist provider payloads.

4. Generate signed URLs only when needed (signed URL posture).
Output: signed URLs generated on demand with short TTL (target 5-15 minutes).
Constraint: signed URLs are never persisted. Logs may include `storage_key` and expiry metadata, but must not include the signed URL.

5. Log like you are writing to a public board (redaction defaults).
Outputs: logs include only opaque IDs, hashes, counts, timings, and failure codes.
Constraints:
- Never log raw PDFs, full extracted text, or full provider payloads.
- Admin tokens and signed URLs are secrets and must never be logged.

6. Protect stored data and its copies (encryption + backups).
Constraints:
- Encrypt object storage and DB volumes at rest where possible.
- Backups (DB dumps, object snapshots) are sensitive and must be protected like primary data.

7. Keep admin power out of data stores and responses (admin token handling).
Constraint: `ORBITAL_ADMIN_TOKEN` is env-only, never stored in DB, never returned in responses, and never logged.

Trade-offs:
- Less raw visibility for debugging (provider payloads and full text are not logged/persisted by default).
- Requires discipline: redaction must be enforced consistently.
- More operational care for backups and access controls.

Failure modes to watch for:
- Accidentally logging extracted text, provider payloads, signed URLs, or `ORBITAL_ADMIN_TOKEN`.
- Sending too much text to LLM/embedding providers (entire documents instead of candidate chunks).
- Persisting signed URLs "for convenience".
- Under-protecting backups.

Why this design vs alternatives:
- Persist provider request/response payloads for debugging: increases durable sensitive surface area and leak risk.
- Send entire documents to LLMs: violates minimum-required and increases exposure.
- Store long-lived signed URLs: turns temporary access into durable access and increases leak impact.

## Common misunderstandings
- "If it is in Postgres, it is fine to log it." Logs are a separate distribution channel; extracted text should never be logged in full.
- "Signed URLs are not secrets because they expire." They are secrets while valid.
- "This is just a PoC, so we can persist provider payloads." Default is the opposite, even in PoC v1.
- "Only LLM calls are a provider boundary." OCR/layout is also a boundary and receives PDF bytes.
- "Object storage is lower risk." It holds raw PDFs and exports; it is sensitive and must be protected.
- "Admin token checks can be stored in DB for convenience." The admin token is env-only.

## Check understanding (teach-back question)
You are adding an endpoint that (1) ingests a PDF, (2) runs OCR, (3) calls an LLM to answer a question, and (4) returns a download link for an export. Walk through what data goes to Postgres, what goes to object storage, what gets sent to OCR and LLM providers, and exactly what you are allowed to log. Where are the top 2 places you could accidentally leak sensitive data?

