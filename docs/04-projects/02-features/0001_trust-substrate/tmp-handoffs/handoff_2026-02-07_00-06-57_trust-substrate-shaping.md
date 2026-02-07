Saved handoff: docs/04-projects/02-features/0001_trust-substrate/tmp-handoffs/handoff_2026-02-07_00-06-57_trust-substrate-shaping.md

- Scope/status:
  - Read the full dossier + prior handoffs.
  - Applied RH2 oracle guidance into shaping artefacts:
    - Updated `brief.md` acceptance signals + fail-closed highlight posture.
    - Updated `breadboard-pack.md` with a minimal Next.js App Router server/client viewer boundary + fail-closed behavior.
    - Updated `risk-register.md` RH2 mitigation with concrete mapping + fallbacks.
    - Updated `spike-investigation.md` RH2 with a fixture-backed mini-eval plan (50/100/150, rotation, fail-closed, evidence capture options).
  - Created `prd.md` + `prd.json` spine for dossier 0001.
  - Validated `prd.json` against `docs/04-projects/_templates/json-prd.schema.json` (PASS via python jsonschema).
  - Added a short learning note to `docs/LEARNINGS.md` re: pdf.js coordinate spaces and overlay alignment pitfalls.

- Oracle:
  - RH2 bundle: `tmp-oracle/oracle-bundle_0001_trust-substrate_RH2_highlight-overlay.md`
  - RH2 response: `tmp-oracle/oracle_response_0001.md` (2026-02-06)

- Browser automation note (RH2 evidence capture):
  - `agent-browser` is not installed locally (`command -v agent-browser` -> not found) and npm registry access may be blocked in this environment.
  - Spike plan includes alternatives (manual screenshots; Playwright if already wired; consider `browser-use` only if install/runtime constraints are workable).

- Next steps:
  - Execute RH1 and RH2 spikes (viewer perf + overlay transform) and record spike reports + evidence.
  - Decide and lock RH2 fallback (full overlay invariance vs "verified at 100% only" vs evidence crop card).
  - Close/patch remaining spikes (RH3-RH5) and re-lock perimeter (GO/NO-GO).
  - Slice thin implementation PRDs from the breadboard parts list per `docs/00-strategy/initiatives/prd-slicing-rules.md`.

