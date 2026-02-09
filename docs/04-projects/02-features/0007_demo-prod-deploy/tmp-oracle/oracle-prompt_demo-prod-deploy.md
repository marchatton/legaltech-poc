You are reviewing a Next.js (App Router) TypeScript repo: Orbital PoC.

Goal: help us ship a private “demo-prod” deployment (Hetzner + Docker/Compose) that behaves like a real app demo but uses fixture/test data only.

Constraints:
- Runs with NODE_ENV=production.
- Must be private: Basic Auth (or equivalent simple gate).
- Fixture-only posture: do NOT enable arbitrary uploads or real customer data.
- Minimal infra: Docker/Compose (web + worker + db + volumes). Object store is local filesystem volume for the demo.

What happened:
- During demos, certain buttons crashed because signed URL generation requires OBJECT_STORE_SIGNING_SECRET.
- Many pages/routes are currently dev-only via assertDevOnly/assertDevOnlyApi.

What I have drafted:
- A PRD + plan in docs/04-projects/02-features/0007_demo-prod-deploy/* describing:
  - Introducing ORBITAL_MODE=demo-prod to allow selected routes outside dev while keeping real prod locked down.
  - Adding Next middleware Basic Auth and forwarding Authorization header in server-side internal fetches.
  - Enabling fixture PDF routes in demo-prod (but still disabled in real prod).
  - Adding fixture-backed DOCX export fallback so demo feels complete.
  - Docker packaging and compose runbook (web + worker + db + volumes for tmp/object-store and tmp/fixture-seed).

What I need from you (be specific and code-grounded):
1) Validate the proposed approach. What assumptions are wrong or risky given the attached code?
2) Identify missing code changes for demo-prod. Produce an ordered, minimal patch plan:
   - exact files likely to change/add
   - what each change should do
   - pitfalls (auth forwarding, SSRF/origin derivation, volumes/workdir, worker behavior)
3) Identify what can remain dev-only and what must be enabled for a credible demo.
4) Check that the acceptance criteria are testable and propose a concrete verification checklist (commands + URLs).
5) Call out any security footguns we should avoid (even for demo-prod).

Output format:
- “Findings” (bullet list, severity ordered)
- “Patch Plan” (phased, minimal diffs)
- “Demo Route Matrix” (must/optional/disabled)
- “Verification Checklist”
- “Open Questions / Decisions”

