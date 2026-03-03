# Investigation: V5 UI Alignment (apps/web vs docs/02-guidelines/v5-final)

## Summary
`apps/web` is now wired to the v5-final design system (`docs/02-guidelines/v5-final`) via a vendored token CSS + Tailwind preset. Remaining work is migrating route/component styling from Tailwind defaults (`slate/emerald/amber/red`) to v5 semantic tokens.

## Symptoms
- Unclear whether the web app is “considering” `docs/02-guidelines/v5-final` during UI work.
- UI reads as default Tailwind + ad-hoc styling rather than the v5 reference (`design-system.html`).

## Investigation Log

### 2026-02-08 - Phase 1/2: Wiring + token usage audit
**Hypothesis:** `apps/web` is consuming v5 tokens/preset (Tailwind preset + CSS vars) and using semantic classes.

**Findings:**
- Tailwind config is effectively default; **no `presets`** configured. Evidence: `apps/web/tailwind.config.ts:3`.
- Global CSS has Tailwind layers only + hard-coded body colors; **no token import**. Evidence: `apps/web/app/globals.css:1`, `apps/web/app/globals.css:10`.
- Root layout does not load v5 fonts, does not apply any semantic classes, and does not toggle `.dark`. Evidence: `apps/web/app/layout.tsx:3`, `apps/web/app/layout.tsx:12`.
- Routes use Tailwind default palettes and hard-coded values instead of semantic tokens.\n
  - Status badges use `emerald/amber/red/slate` hard-coded utilities. Evidence: `apps/web/app/(app)/matters/page.tsx:26`.\n
  - Citation chips are black-filled `bg-slate-900`. Evidence: `apps/web/app/(app)/matters/page.tsx:75`.\n
  - Viewer overlay uses hard-coded blue RGBA fill/stroke. Evidence: `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx:371`.\n

**Conclusion:** Confirmed. v5-final is not integrated into the runtime UI stack.

### 2026-02-08 - Phase 3: Implement v5 wiring in `apps/web`
**Hypothesis:** We can wire v5 tokens + preset with minimal churn and keep it build-safe in Next.js.

**Findings:**
- Added vendored design pack files:
  - `apps/web/app/tokens.css` (copied from `docs/02-guidelines/v5-final/tokens.css`, with `@layer` removed for Next build compatibility).
  - `apps/web/tailwind.preset.ts` (copied from `docs/02-guidelines/v5-final/tailwind.preset.ts`, exported as `Partial<Config>` so it can be used as a preset without requiring `content`).
- Tailwind now consumes the v5 preset. Evidence: `apps/web/tailwind.config.ts:3`.
- Global CSS now imports tokens. Evidence: `apps/web/app/globals.css:1`.
- Build + typecheck + tests pass:\n
  - `pnpm --filter @legaltech-poc/web build`\n
  - `pnpm --filter @legaltech-poc/web typecheck` (run after build so `.next/types` are present)\n
  - `pnpm --filter @legaltech-poc/web test`\n

**Conclusion:** Confirmed. v5 semantic utilities are available in the app; migration work can now be incremental and low-risk.

### 2026-02-08 - Phase 2: Design-system source-of-truth audit
**Hypothesis:** v5-final provides a single canonical token source.

**Findings:**
- v5-final has:
  - `tokens.css` defining CSS vars and applying `html { color/background }`. Evidence: `docs/02-guidelines/v5-final/tokens.css:98`, `docs/02-guidelines/v5-final/tokens.css:194`.
  - `tailwind.preset.ts` mapping those vars into Tailwind semantic colors/radii/fonts/motion. Evidence: `docs/02-guidelines/v5-final/tailwind.preset.ts:9`, `docs/02-guidelines/v5-final/tailwind.preset.ts:13`.
- There are multiple archived design packs (`v1-*` … `v4-*`) that could be copied from accidentally, and `design-system.html` also embeds its own token CSS (risk of drift vs `tokens.css`). Evidence: `docs/02-guidelines/`.

**Conclusion:** v5-final is the intended foundation, but without integration it remains “doc-only”; token duplication exists inside docs artifacts.

### 2026-02-08 - Phase 2: Guideline compliance check
**Hypothesis:** repo agent guidance mandates v5 usage for the web app.

**Findings:**
- Docs explicitly call v5-final foundational. Evidence: `docs/02-guidelines/AGENTS.md:7`.
- `apps/web/AGENTS.md` claims shadcn/Radix/RHF stack, but `apps/web/package.json` does not include those deps. Evidence: `apps/web/AGENTS.md:6`, `apps/web/package.json:14`.

**Conclusion:** There is documentation drift in `apps/web/AGENTS.md` relative to the codebase.

## Root Cause
The web app lacks the two integration steps required by the v5-final system:
1) Loading CSS variables (`tokens.css`) into global CSS.\n
2) Enabling the Tailwind preset (`tailwind.preset.ts`) via `presets: [...]` in Tailwind config.\n
As a result, pages are styled ad-hoc with Tailwind defaults and hard-coded values.

## Recommendations
1. **Wire v5-final into `apps/web` (lowest-risk: vendor the pack locally).**\n
   - Copy `docs/02-guidelines/v5-final/tokens.css` → `apps/web/app/tokens.css`\n
   - Copy `docs/02-guidelines/v5-final/tailwind.preset.ts` → `apps/web/tailwind.preset.ts`\n
   - Update `apps/web/tailwind.config.ts` to use `presets: [preset]`.\n
   - Update `apps/web/app/globals.css` to `@import \"./tokens.css\";` before Tailwind layers.\n
   - NOTE: In Next.js, importing a CSS file containing Tailwind `@layer` rules can fail unless you inline imports with `postcss-import`. The current app copy keeps tokens unlayered.
2. **Add base semantic classes + fonts.**\n
   - Apply `bg-background text-foreground font-sans` at the root layout.\n
   - Load Inter/Crimson Pro/JetBrains Mono (match `docs/02-guidelines/v5-final/tailwind.preset.ts:93`).\n
3. **Migrate the 3 highest surface areas to semantic tokens first:**\n
   - `apps/web/app/(app)/matters/page.tsx` (cards, borders, status badges)\n
   - `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx` (viewer chrome + overlay)\n
   - `apps/web/app/(app)/matters/ExportCsvButton.tsx` (button recipe + feedback colors)\n
4. **Resolve `apps/web/AGENTS.md` drift:**\n
   - Prefer updating the doc to match reality now (Tailwind + v5 tokens/preset + hand-rolled UI), then adopt Radix/shadcn later if desired.\n
5. **Long-term: eliminate token duplication.**\n
   - Consider a shared package (e.g. `packages/design-system/`) exporting `tokens.css` + `tailwind.preset.ts` and have both docs + app consume it.

## Preventive Measures
- Add a lightweight check in CI/verify that `apps/web/tailwind.config.ts` includes the v5 preset and `apps/web/app/globals.css` imports `tokens.css`.\n
- Treat any new hard-coded hex/rgb colors in `apps/web` as a code-review smell; prefer semantic tokens.\n
