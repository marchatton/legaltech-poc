# ADR-0013: LLM + embeddings calls go through AI SDK; gateway is default

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
Assumption: you are comfortable with TypeScript/Next.js, but new to AI SDKs and LLM gateways.

This ADR says: in this repo, code should not talk to OpenAI/Anthropic (or any model provider) directly. Every LLM call and every embeddings call goes through one shared interface: the AI SDK (`ai`). By default, those calls go through a gateway (Vercel AI Gateway) so auth, model routing, and telemetry look the same everywhere.

The goal is boring consistency:
- Web route handlers need streaming responses for UX.
- Worker steps (WDK) need durable side effects and retries.
- We still want to choose "fast draft" vs "strong verify" models without rewriting call sites.

## Metaphor/analogy (with mapping + where it breaks)
Metaphor: a company phone system with a switchboard.

Mapping:
| Metaphor thing | In this ADR |
| --- | --- |
| Employee making a call | Any place in code that needs an LLM or embeddings |
| Company phone handset (one interface) | AI SDK (`ai`) APIs used across the repo |
| Switchboard operator | Vercel AI Gateway (default path) |
| External phone carriers | Model providers (OpenAI, Anthropic, etc) |
| Extension list / routing rules | Config-driven model selection (e.g. `LLM_MODEL_CHAT`, `LLM_MODEL_SUMMARY`, `EMBED_MODEL`) |
| Company calling plan / badge | Gateway auth (`AI_GATEWAY_API_KEY` locally/Hetzner; Vercel OIDC where available) |
| People using personal phones | Direct provider SDK usage (allowed only with an explicit reason) |

Where the metaphor breaks:
- A switchboard just routes; it does not fix bad prompts or weak models.
- LLM calls include special modes like streaming tokens and embedding vectors; different constraints and failure modes.

## Visual explanation (small ASCII diagram)
```text
             (same contract, different runtimes)
[Next.js route handler]        [WDK worker step]
          |                           |
          +-----------+---------------+
                      |
              [Internal router]
             (draft/verify/embed)
                      |
                  [AI SDK]
                    ("ai")
                      |
             [AI Gateway default]
          (auth, routing, telemetry)
                      |
            [Model provider(s)]
      (OpenAI / Anthropic / others)
```

## Step-by-step breakdown
1. Decide what you are doing: `draft`, `verify`, or `embed`.

Conceptual inputs/outputs:
```text
draft(messages, options)  -> streamed text or final text + usage
verify(messages, options) -> final text + usage
embed(texts, options)     -> vectors (number arrays) + usage
```

2. Call the repo's internal small router interface.
This keeps call sites simple and intention-revealing: "I am drafting" is different from "I am verifying", even if both use chat models.

3. The router uses AI SDK (`ai`) as the only public API for making the request.
Constraint: we want one interface that works for streaming in Next.js route handlers and for non-UI worker steps (WDK) without duplicating code.

4. By default, the AI SDK is configured to send requests via Vercel AI Gateway.
Why: the gateway centralizes auth, provider swaps, and consistent telemetry, and supports routing between "fast draft" and "strong verify" models without changing application code.

5. Model selection happens via environment/config, not scattered code edits.
Example consequence: model IDs live in env vars like `LLM_MODEL_CHAT`, `LLM_MODEL_SUMMARY`, `EMBED_MODEL`.

6. Direct provider SDKs are allowed only with an explicit reason (missing feature, debugging, or provider-specific capability).
Trade-off: this is an escape hatch that can reintroduce inconsistency in auth/telemetry if overused.

Failure modes to expect and design for:
- Missing/wrong gateway auth (`AI_GATEWAY_API_KEY` not set locally/Hetzner; OIDC assumptions wrong).
- Wrong model ID in env (routing points at a model that does not exist or does not support required features).
- Gateway outage or throttling (extra hop is a new point of failure).
- Provider quirks still matter (the gateway normalizes interfaces, but limits and behavior still differ).

Why this design vs alternatives:
| Option | Why not the default here |
| --- | --- |
| Call provider SDKs directly everywhere | Duplicates streaming + worker patterns, scatters auth/model selection, observability becomes inconsistent |
| Build a custom in-house wrapper | You still solve provider parity, streaming ergonomics, auth, telemetry; AI SDK + gateway is smaller surface area for a PoC |
| Pick one provider and never route | Conflicts with fast draft vs strong verify flexibility and reversible provider choice |

## Common misunderstandings
- "AI SDK is the model." It is the calling interface; the model lives behind gateway/provider.
- "Gateway default means gateway only." Direct provider SDKs are allowed with explicit reason.
- "One interface means one model." It means one calling contract; model selection is config-driven.
- "Embeddings are just another chat call." They have different outputs (vectors) and downstream compatibility constraints (dimensions, index assumptions).
- "This removes all vendor lock-in." It reduces lock-in at call sites, but adds a dependency on gateway auth as part of the minimum env contract.

## Check understanding (teach-back question)
If you are adding a new worker step that needs embeddings, where should the call go, how does it pick the embedding model, and what breaks (and how would you notice) if `AI_GATEWAY_API_KEY` is missing on Hetzner?

