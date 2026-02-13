# Demo Notes v2: Orbital PoC (Story + Build Learnings)

Use this as a speaker script. Keep the pace tight and demo-first.

## 1) What I built (opening, 45 to 60 sec)

I built a US commercial real estate matter workspace with three core capabilities:

1. `Manage matters`: create/open matters and run repeatable workflows.
2. `Citations to documents`: evidence-first outputs where claims point back to source documents.
3. `Chat with a matter`: question-answering in the context of one matter, not a generic chatbot.

Short version: this is a trust-first workflow product, not just a chat UI.

## 2) Why I chose this (60 to 90 sec)

I chose this domain to learn in a hard, realistic environment:

1. `US CRE nuance`: state-by-state differences and domain-specific edge cases.
2. `Messy docs`: low-quality scans, inconsistent structure, noisy source material.
3. `Emotional job-to-be-done`: users do not just want speed, they need confidence the result is correct.
4. `Shipping discipline`: push beyond prototypes into durable build workflows (AI SDK patterns, repeatability, verification loops).

I also wanted to see how far I could push a shipping workflow with current models. I got further than expected, and model quality gains last week (5.3 release) materially helped execution speed.

## 3) What this means for my role (45 to 60 sec)

This project was primarily a learning vehicle, but with practical output.

My core responsibility is still creating value for users and the company. I know engineers are feeling disruption with soon engineers not hand writing code (already a large way there). That said I am not claiming to being able to fully shipping production grade performant scalable and secure systems. 

## 4) Build stats (30 sec)

Current repo/build stats:

1. `40,048` source LOC (`apps/`, `packages/`, `scripts/`; TS/JS/CSS/SQL).
2. `513` commits in repo history.
3. `970M` tokens used (my usage figure).
4. Subscriptions: `$200` OpenAI + `$20` Claude.

## 5) Synthetic users, synthetic data, and skills system (60 to 90 sec)

I used AI to generate and evolve:

1. Synthetic users/personas for workflow pressure-testing.
2. Synthetic sample packs and scenario data for repeatable demos and regression loops.

Skills footprint in this repo:

1. `98` total skills (`SKILL.md` files in `.agents/skills`).
2. `16` explicitly curated (externally sourced, marked in metadata).
3. `82` project/local skills (everything else by exclusion).

I also used the Compound engineering workflow (`compound-docs`) to consolidate solved problems into reusable team knowledge instead of losing context between runs.

## 6) Tooling learnings (90 sec)

### Build tooling choices that worked

1. Claude + Amp: strongest pair for frontend polish and interaction details.
2. Codex: strongest for broad implementation velocity across backend, docs, and workflow plumbing.
3. Repo prompt as context builder: high leverage for keeping long-running work coherent.
4. Sprites as lightweight VMs: useful isolation for parallel work and task switching.
5. "Magic patterns" for frontend design: helped preserve quality while moving fast.

### Stack decisions that held up

1. Vercel AI Gateway for chat model routing and consistency.
2. Workflow Dev Kit for durable workflows and state management.
3. Azure Document Intelligence for document/layout handling in the doc pipeline.

### 30 sec tech stack overview (speaker-ready)

I used `Next.js 15` + `TypeScript` so UI and API live in one deploy, and chat streams from route handlers without a separate backend service. `Tailwind` is wired to a shared preset + token system, so I can ship fast without UI drift. On ingest, documents are split with `char_window_v0` chunks (`1500` max chars, `200` overlap) and stored with page + char offsets and `text_hash` for idempotent re-indexing. Chat retrieval is hybrid by design: lexical (`websearch_to_tsquery` + `ts_rank_cd`) plus semantic (`pgvector` cosine over `1536`-dim embeddings), merged at `0.55` lexical / `0.45` semantic. In chat, I take top-`6` chunks and return citation sources with `document_id`, `page_number`, and anchor state; citation records keep `snippet_hash` and polygon geometry so evidence can be verified and highlighted.

## 7) Close (30 sec)

This is not a production claim. It is a shipped learning system that proves:

1. You can build credible, trust-aware vertical workflows with AI-native development.
2. The bottleneck is no longer only coding speed; it is judgment, verification, and system design.
3. The next step is converting this learning velocity into direct user and company value.
