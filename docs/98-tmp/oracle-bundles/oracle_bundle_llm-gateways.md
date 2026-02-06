# Oracle research bundle (LLM gateways)

Date: 2026-02-06

This repo uses the `oracle` workflow for "second model" cross-validation, but in this environment the automated browser run failed because:
- no ChatGPT cookies were available to the Oracle browser automation, and
- `npx` package fetch can fail due to network restrictions.

If you want to re-run this investigation on a machine with network + a signed-in ChatGPT profile, use:

```bash
npx -y @steipete/oracle --engine browser --model gpt-5.2-pro --slug "infra-gateway-research" \
  -p "Investigate LLM gateway options for this repo's planned Orbital Copilot PoC architecture. Context: Next.js app (App Router) + Workflow DevKit (durable workflows + steps) + Postgres (pgvector+tsvector) + object storage for PDFs/exports + OCR/layout extraction (Azure Document Intelligence or AWS Textract). The owner prefers running server-side on an existing Hetzner VM, with local Postgres in dev.

Task:
1) List and compare practical gateway options (direct provider keys, Vercel AI Gateway, Cloudflare AI Gateway, Portkey, Helicone, LiteLLM Proxy, OpenRouter, AWS Bedrock/Vertex/Azure OpenAI as 'platform' alternatives).
2) For each: supported providers/models, auth model, observability/logging, caching/rate-limits/retries, cost/markup, vendor lock-in, and ease of use from a Hetzner-hosted service.
3) Recommend a default for this PoC (and why), plus a migration path if we outgrow it.
4) Call out pitfalls: secrets handling, per-request attribution, audit logs, data residency, connection pooling, retries/idempotency, and streaming.

Output:
- A concise decision recommendation.
- A pros/cons table.
- Any 'gotchas' and suggested defaults for env vars and client code." \
  --file "docs/03-architecture/*.md" \
  --file "docs/03-architecture/01_onboarding_checklist.md" \
  --file "README.md" \
  --file ".agents/skills/04-develop/use-ai-sdk/references/ai-gateway.md"
```
