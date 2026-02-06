# LLM gateway options (PoC)

Date: 2026-02-06

Decision framing
- For this PoC, a gateway is primarily about: simplifying auth, enabling provider swaps, and getting basic logging/cost visibility.
- Keep a thin internal "LLM router" interface either way. A gateway should be a config change, not a rewrite.

## Option categories

1) No gateway (direct provider keys)
- Lowest moving parts.
- You own retries, observability, and any multi-provider routing.

2) Managed gateway (SaaS)
- Centralized logging + governance without self-hosting.
- Trade-off: vendor dependency and another layer when debugging.

3) Self-hosted gateway (proxy)
- One endpoint + unified auth, but you own the proxy.

## Practical gateways worth considering

### Vercel AI Gateway (managed)
What it is
- A unified gateway (200+ models) and an OpenAI-compatible API.

Useful specifics
- OpenAI-compatible base URL: `https://ai-gateway.vercel.sh/v1`.
- Auth methods: API keys (work anywhere) and OIDC tokens (Vercel-native).
- Endpoints include `GET /models`, `POST /chat/completions`, and `POST /embeddings`.
- Pricing: pay-as-you-go credits with no markup; free tier includes $5/month credits until you make your first payment.
- BYOK: you can add provider keys at the team level and gateway can retry with system credentials if your key fails.

Docs
- https://vercel.com/docs/ai-gateway
- https://vercel.com/docs/ai-gateway/openai-compat
- https://vercel.com/docs/ai-gateway/pricing
- https://vercel.com/docs/ai-gateway/authentication-and-byok

### Cloudflare AI Gateway (managed)
What it is
- A gateway focused on observability and controls (caching, rate limiting, and reliability patterns).

Docs
- https://developers.cloudflare.com/ai-gateway/
- https://developers.cloudflare.com/ai-gateway/features/
- https://www.cloudflare.com/developer-platform/products/ai-gateway/

### Portkey AI Gateway (managed or self-hosted)
What it is
- A gateway product with a broad enterprise feature surface (routing, retries, cache, budgets, etc).

Useful specifics
- Open source gateway: `npx @portkey-ai/gateway`.

Docs
- https://portkey.ai/docs/product/ai-gateway

### Helicone AI Gateway (self-hosted)
What it is
- An open-source Rust proxy with caching/routing/observability integration.

Useful specifics
- Quickstart (per Helicone): `npx @helicone/ai-gateway` or Docker.

Docs
- https://www.helicone.ai/blog/introducing-ai-gateway
- https://www.helicone.ai/changelog/20250619-ai-gateway-launch

### LiteLLM Proxy (self-hosted)
What it is
- An OpenAI-compatible proxy that unifies many providers, with spend tracking/budgets and load balancing.

Useful specifics
- Quickstart: `pip install 'litellm[proxy]'` then run `litellm ...`.

Docs
- https://docs.litellm.ai/docs/proxy/quick_start

### OpenRouter (managed aggregator)
What it is
- A unified API for many models with an OpenAI-compatible endpoint.

Useful specifics
- OpenAI SDK base URL: `https://openrouter.ai/api/v1`.

Docs
- https://openrouter.ai/docs/quick-start

## Recommendation (default for this repo)

If you are already using Vercel for deployments:
- Default to Vercel AI Gateway for speed (single key, OpenAI-compatible drop-in, no-markup credits).
- Keep an internal router interface anyway, so you can move to direct keys or a self-hosted proxy later.

If you want minimal vendor coupling:
- Start with direct provider keys behind the internal router.
