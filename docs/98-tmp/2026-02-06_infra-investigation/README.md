# Infra investigation (PoC)

Date: 2026-02-06

Goal
- Pick pragmatic defaults for a "production-minded PoC" that can run locally and (optionally) on a single Hetzner VM.
- Keep portability: avoid hard-locking to Vercel-only services unless the upside is clear.

Docs
- LLM gateways: `docs/98-tmp/2026-02-06_infra-investigation/llm-gateways.md`
- Object storage: `docs/98-tmp/2026-02-06_infra-investigation/storage.md`
- OCR/layout extraction: `docs/98-tmp/2026-02-06_infra-investigation/ocr.md`
- Deployment posture: `docs/98-tmp/2026-02-06_infra-investigation/deployment.md`

Next action
- Confirm the deployment target (Hetzner-first vs Vercel web + Hetzner workers) and which managed services you want to depend on.
