# Demo Notes

## Diagram rendering (Mermaid -> SVG)

The runbook (`demo-runbook.html`) stores Mermaid source, but renders diagrams as **inline SVG** using `beautiful-mermaid` (no in-browser Mermaid runtime).

When you edit any Mermaid source block, regenerate the SVGs:

```bash
node --experimental-strip-types .agents/skills/06-release/demo-runbook/scripts/render_mermaid_svgs.ts docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-runbook.html
```

Implementation notes:
- Mermaid sources are kept in `<pre class="mermaid mermaid-source">...</pre>` and hidden via CSS.
- Generated SVG is inserted between `<!--bm:svg:start-->` and `<!--bm:svg:end-->`.
- The renderer namespaces SVG IDs per-diagram to avoid collisions when multiple SVGs are in the same page.

