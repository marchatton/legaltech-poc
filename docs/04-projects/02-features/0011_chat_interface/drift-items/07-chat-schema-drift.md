# Drift Item 7: Chat Schema Drift (`ensureChatSchema()` exists but is empty)

Assumptions: you want PRD B matter chat, and you are trying to see why persistence is currently blocked even though there is a schema module.

## Sources (doc vs code)
- Docs (should): `docs/04-projects/02-features/0011_chat_interface/prds/0011b_matter-chat-v0/prd.md`
- Code (is): `apps/web/lib/db/schema/chat.server.ts`

## 1) Intuition first (plain English)
PRD B needs a place to store chat threads and messages.

The codebase has a module named `ensureChatSchema()`, which sounds like "we already have chat tables".

But it is currently a no-op, meaning there is no DB schema backing chat yet. So chat cannot persist, and anything that needs message history or stable source references will be blocked.

## 2) Metaphor / analogy (mapping)
Think of a notebook:
- PRD B assumes you have a notebook where you write conversations down.
- The code has a label on the shelf that says "Notebook", but the shelf is empty.

Where the metaphor breaks: sometimes the empty shelf is intentional scaffolding, but then the docs and PRDs need to be explicit about "not built yet".

## 3) Visual explanation (diagram via beautiful-mermaid)
Mermaid source:
```mermaid
flowchart LR
  D[PRD B: threads + messages persisted] --> P["Chat persistence"]
  C[Code: ensureChatSchema() no-op] --> N["No tables"]
  N --> I[Impact: can't store chat or sources]
  N --> F[Fix: add chat_threads + chat_messages]
```

Rendered:
```text
┌─────────────────────────────────────┐     ┌────────────────────┐     ┌───────────────────────────────────────┐
│                                     │     │                    │     │                                       │
│ PRD B: threads + messages persisted ├────►│ "Chat persistence" │  ┌─►│  Impact: can't store chat or sources  │
│                                     │     │                    │  │  │                                       │
└─────────────────────────────────────┘     └────────────────────┘  │  └───────────────────────────────────────┘
                                                                    │
                                                                    │
                                                       ┌────────────┘
                                                       │
                                                       │
┌─────────────────────────────────────┐     ┌──────────┴─────────┐     ┌───────────────────────────────────────┐
│                                     │     │                    │     │                                       │
│    Code: ensureChatSchema() no-op   ├────►│    "No tables"     ├────►│ Fix: add chat_threads + chat_messages │
│                                     │     │                    │     │                                       │
└─────────────────────────────────────┘     └────────────────────┘     └───────────────────────────────────────┘
```

## 4) Step-by-step breakdown
What chat persistence needs (inputs/outputs):
- Create a thread (associated to a matter/user context).
- Append messages (role, content, timestamps).
- Later: associate sources/citations to messages (either via shared citations or a chat-specific linkage table).

What a no-op schema function implies:
- There is no contract for:
  - stable thread IDs,
  - message ordering,
  - retention/deletion policies,
  - how citations attach to messages.

Fix options (from drift doc), explained:
- Code: implement `chat_threads` + `chat_messages`.
  - Keep it minimal: just enough fields to satisfy PRD B.
  - Decide citations strategy explicitly:
    - unify with existing citations (preferred for reuse), or
    - separate chat citations (only if you factor shared invariants to avoid DRY violations).

Trade-offs:
- If you delay schema decisions, you will accidentally encode them in UI state or ad-hoc JSON blobs.
- If you decide now, you can keep interfaces small and explicit, even if the internals evolve later.

## 5) Common misunderstandings
- "We can store chat in the client for now."
  - You can for a UI prototype, but PRD B implies persistence for product behavior (history, auditability, sources).
- "Adding tables is premature."
  - Without tables, it is hard to test grounding, citations, and exports end-to-end.
- "Citations for chat are separate from viewer citations."
  - They can be separate, but the trust posture is shared; duplication increases the chance of drift.

## 6) Check understanding (teach-back question)
If we add `chat_threads` and `chat_messages` tomorrow, what is the smallest set of fields you would include to support: (1) showing history, (2) linking messages to a matter, and (3) attaching sources later without a migration?

