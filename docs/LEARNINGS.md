# Learnings

## 2026-02-06: PoC infra defaults (early)
- Prefer a single deployment posture early (single VM) to reduce integration bugs across networks.
- Keep provider choices reversible with thin adapters: OCR provider, object storage, and LLM access should all be behind small interfaces.
- Introduce gateways/proxies only when they remove real friction; every extra layer makes debugging and determinism harder.
