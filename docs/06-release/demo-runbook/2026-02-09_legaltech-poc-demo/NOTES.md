# Demo Notes

## Canonical Inputs (2026-02-14 refresh)

When updating this demo bundle, align content to these source docs first:

- Current runtime (implemented reality): `docs/03-architecture/07_current_poc_runtime.md`
- Target architecture (north star): `docs/03-architecture/00_overview.md`, `docs/03-architecture/10_system_architecture.md`, `docs/03-architecture/60_observability_and_evals.md`
- Current user journeys (v3 parity): `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3.md`
- Design system showcase: `docs/02-guidelines/v5-final/design-system.html`

## Diagram Rendering (Mermaid -> SVG)

The runbook (`demo-runbook.html`) stores Mermaid source and rendered inline SVG.

When you edit any Mermaid source block, regenerate SVGs:

```bash
node --experimental-strip-types .agents/skills/06-release/demo-runbook/scripts/render_mermaid_svgs.ts docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-runbook.html
```

Implementation notes:
- Mermaid sources are kept in `<pre class="mermaid mermaid-source">...</pre>` and hidden via CSS.
- Generated SVG is inserted between `<!--bm:svg:start-->` and `<!--bm:svg:end-->`.
- The renderer namespaces SVG IDs per diagram to avoid collisions.
