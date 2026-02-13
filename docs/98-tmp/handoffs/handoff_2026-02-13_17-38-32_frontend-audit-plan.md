# Handoff: Frontend Audit Plan

## 1. Scope / Status

**What:** Comprehensive frontend audit of the Orbital PoC web app covering accessibility, UI finesse, microinteractions, motion performance, and component architecture.

**Status:** Plan agreed, not yet executed.

**Agreed audit plan (8 skills, 4 passes):**

### Pass 1 — Accessibility (parallel)
| Skill | Focus |
|---|---|
| `wcag-audit-patterns` | WCAG 2.2 automated + manual checks (contrast, ARIA, keyboard nav, focus management) |
| `fixing-accessibility` | Actionable a11y fixes for issues found |

### Pass 2 — Visual Design & UI Finesse (parallel)
| Skill | Focus |
|---|---|
| `rams` | Dieter Rams-inspired design critique (clarity, consistency, restraint) |
| `baseline-ui` | Baseline UI rules — spacing, typography, color token usage, design slop detection |
| `web-design-guidelines` | Web Interface Guidelines compliance (layout, responsiveness, dark mode) |

### Pass 3 — Motion & Interactions
| Skill | Focus |
|---|---|
| `interaction-design` | Microinteractions, transitions, hover/focus/active states, feedback patterns |
| `fixing-motion-performance` | Animation performance (jank, layout thrash, GPU compositing) |

### Pass 4 — Component Architecture
| Skill | Focus |
|---|---|
| `composition-patterns` | React composition quality — prop sprawl, reusability, API consistency |

**Deliverable:** Consolidated prioritized report (Critical / Major / Minor) with file, line, issue, and suggested fix.

## 2. Working Tree

```
## main...origin/main
 M apps/web/app/(app)/matters/ExportCsvButton.tsx
 M apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx
 M apps/web/app/(app)/matters/[id]/ExportsPanel.tsx
 M apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx
 M apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx
 M apps/web/app/(app)/matters/[id]/layout.tsx
 M apps/web/app/(app)/matters/[id]/page.tsx
 M apps/web/app/DemoToolbar.tsx
 M apps/web/app/layout.tsx
?? apps/web/.next-dev.lock
```

Local uncommitted changes in 9 files. No local commits ahead of origin.

## 3. Branch / PR

- **Branch:** `main`
- **PR:** None open for this work
- **CI:** N/A

## 4. Running Processes

tmux session `0` with 4 panes:
- Pane 0: `codex-aarch64-a` — `tmux capture-pane -p -J -t 0:0.0 -S -200`
- Pane 1: `bun` (likely dev server) — `tmux capture-pane -p -J -t 0:0.1 -S -200`
- Pane 2: `codex-aarch64-a` — `tmux capture-pane -p -J -t 0:0.2 -S -200`
- Pane 3: `node` — `tmux capture-pane -p -J -t 0:0.3 -S -200`

Attach: `tmux attach -t 0`

## 5. Tests / Checks

- No tests or checks run yet for this audit task.
- The audit itself will identify what needs fixing.

## 6. Next Steps

1. Run **Pass 1** skills in parallel: `/wcag-audit-patterns` + `/fixing-accessibility`
2. Run **Pass 2** skills in parallel: `/rams` + `/baseline-ui` + `/web-design-guidelines`
3. Run **Pass 3** skills: `/interaction-design` + `/fixing-motion-performance`
4. Run **Pass 4** skill: `/composition-patterns`
5. Consolidate all findings into a single prioritized report
6. Create actionable fix tasks from Critical/Major findings

## 7. Risks / Gotchas

- Uncommitted changes in working tree — audit should read current working state (not just HEAD)
- `apps/web/.next-dev.lock` suggests dev server may be running — good for browser-based checks
- `lib/memoDocx.server.ts` has a pre-existing TS2307 error (missing `docx` module) — ignore in audit
- Design system tokens are in `docs/02-guidelines/v5-final/` — cross-reference during visual audit
