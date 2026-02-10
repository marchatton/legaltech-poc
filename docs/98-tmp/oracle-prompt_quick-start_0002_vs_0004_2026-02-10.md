<file_map>
/Users/marc/Code/personal-projects/orbital-poc
├── apps
│   └── web
│       ├── app
│       │   ├── (api)
│       │   │   ├── folders
│       │   │   │   └── [id]
│       │   │   │       ├── runs
│       │   │   │       │   └── route.ts * +
│       │   │   │       ├── artefacts
│       │   │   │       ├── documents
│       │   │   │       └── report
│       │   │   ├── artefacts
│       │   │   │   └── [id]
│       │   │   │       └── download
│       │   │   ├── citations
│       │   │   │   └── [id]
│       │   │   ├── demo
│       │   │   │   └── load-pack
│       │   │   ├── documents
│       │   │   │   └── [id]
│       │   │   │       ├── complete
│       │   │   │       ├── pdf
│       │   │   │       ├── render
│       │   │   │       └── upload
│       │   │   ├── export
│       │   │   │   ├── csv
│       │   │   │   │   └── download
│       │   │   │   └── docx
│       │   │   ├── runs
│       │   │   │   └── [id]
│       │   │   │       └── trace
│       │   │   └── spikes
│       │   │       ├── export
│       │   │       │   └── csv
│       │   │       ├── local-pdf
│       │   │       ├── retrieval
│       │   │       │   └── hybrid-search
│       │   │       ├── rh4-verify
│       │   │       └── wdk
│       │   │           └── smoke
│       │   │               ├── start
│       │   │               └── state
│       │   ├── (app)
│       │   │   ├── matters
│       │   │   │   ├── [id]
│       │   │   │   │   └── QuickStartPanel.tsx * +
│       │   │   │   └── viewer
│       │   │   └── spikes
│       │   │       ├── rh1-pdf-perf
│       │   │       └── rh2-overlay
│       │   └── ui
│       ├── lib
│       │   ├── db
│       │   │   └── schema
│       │   │       └── core.server.ts * +
│       │   ├── wdk
│       │   │   ├── stepQueue.server.ts * +
│       │   │   ├── wdkDirectiveGuardrail.server.ts * +
│       │   │   ├── wdkInlineKick.server.ts * +
│       │   │   └── wdkWorker.server.ts * +
│       │   ├── ai
│       │   ├── ingest
│       │   ├── jobs
│       │   ├── retrieval
│       │   ├── questionSet.server.ts * +
│       │   ├── quickStartRunProcessor.server.ts * +
│       │   └── quickStartRunQueue.server.ts * +
│       ├── scripts
│       │   └── worker.ts * +
│       ├── steps
│       │   ├── quickStartExecuteV0.step.server.ts * +
│       │   ├── quickStartStepHandlers.server.ts * +
│       │   └── quickStartWriteRowV0.step.server.ts * +
│       ├── workflows
│       │   └── quickStartTitleSurveyWorkflow.server.ts * +
│       ├── test
│       │   ├── fixtures
│       │   └── stubs
│       └── types
├── docs
│   ├── 03-architecture
│   │   ├── 07_current_poc_runtime.md *
│   │   ├── 20_state_model.md *
│   │   ├── 30_data_model.md *
│   │   ├── 40_rag_and_agents.md *
│   │   └── DECISIONS.md *
│   ├── 04-projects
│   │   ├── 02-features
│   │   │   ├── 0002_quick-start-engine
│   │   │   │   ├── specs
│   │   │   │   │   ├── README.md *
│   │   │   │   │   ├── comparator_spec_v0.md *
│   │   │   │   │   ├── failure_ux_copy_v0.md *
│   │   │   │   │   ├── list_payload_v0.schema.md *
│   │   │   │   │   ├── list_verification_policy_v1.md *
│   │   │   │   │   └── question_set_v1.json *
│   │   │   │   ├── spike-proofs
│   │   │   │   │   ├── README.md *
│   │   │   │   │   ├── RH-2.10_pack_name_audit.txt *
│   │   │   │   │   ├── RH-2.12_pin_audit.md *
│   │   │   │   │   ├── RH-2.16_cut_note.md *
│   │   │   │   │   ├── SP-2.1_practitioner_review.md *
│   │   │   │   │   └── SP-2.7_decision.md *
│   │   │   │   ├── prds
│   │   │   │   │   ├── 0002a_run-skeleton
│   │   │   │   │   ├── 0002b_row-payload-contract
│   │   │   │   │   ├── 0002c_commitment-parsing-pack-01-clean
│   │   │   │   │   ├── 0002d_exception-matching-pack-01-02
│   │   │   │   │   ├── 0002e_survey-extraction-pack-01-03
│   │   │   │   │   └── 0002f_reconciliation-honesty-pack-03-07
│   │   │   │   ├── tmp-handoffs
│   │   │   │   ├── tmp-oracle
│   │   │   │   ├── breadboard-pack.md *
│   │   │   │   ├── brief.md *
│   │   │   │   ├── investigation-report.md *
│   │   │   │   ├── plan.md *
│   │   │   │   ├── prd-overall.md *
│   │   │   │   ├── prd.json *
│   │   │   │   ├── prd.md *
│   │   │   │   ├── risk-register.md *
│   │   │   │   ├── spike-investigation.md *
│   │   │   │   └── stuck-extract.md *
│   │   │   ├── 0001_trust-substrate
│   │   │   │   ├── fixtures
│   │   │   │   ├── prds
│   │   │   │   │   ├── 0001a_matter-documents
│   │   │   │   │   ├── 0001b-f_trust-substrate-slices
│   │   │   │   │   ├── 0001b_pdf-viewer
│   │   │   │   │   ├── 0001c_citations-api-locking
│   │   │   │   │   ├── 0001d_citation-chip-highlight
│   │   │   │   │   ├── 0001e_row-status-export-failures
│   │   │   │   │   ├── 0001f_provenance-trace-export
│   │   │   │   │   └── 0001g_render-url-contract-alignment
│   │   │   │   ├── spike-proofs
│   │   │   │   ├── tmp-handoffs
│   │   │   │   └── tmp-oracle
│   │   │   ├── 0003_demo-grade-outputs
│   │   │   │   ├── tmp-handoffs
│   │   │   │   └── tmp-oracle
│   │   │   ├── 0004_csv-export
│   │   │   ├── 0005_word-export
│   │   │   ├── 0006_eval-harness
│   │   │   ├── 0007_demo-prod-deploy
│   │   │   │   ├── tmp-handoffs
│   │   │   │   └── tmp-oracle
│   │   │   ├── 0007_demo-reliability
│   │   │   ├── 0008_artefacts-foundation
│   │   │   ├── 0009_contradiction-radar
│   │   │   ├── 0010_cite-capsules
│   │   │   └── 0011_chat_interface
│   │   │       ├── drift-items
│   │   │       ├── prds
│   │   │       │   ├── 0011a_hybrid-retrieval-v0
│   │   │       │   └── 0011b_matter-chat-v0
│   │   │       └── tmp-oracle
│   │   ├── 04-refactors
│   │   │   ├── 0004_quick-start-to-wdk
│   │   │   │   ├── plan.md *
│   │   │   │   ├── prd.json *
│   │   │   │   └── prd.md *
│   │   │   ├── 0001_v5-ui-alignment
│   │   │   ├── 0002_durable-jobs
│   │   │   ├── 0003_wdk-runtime
│   │   │   │   └── prds
│   │   │   │       ├── 0003a_wdk-runtime-skeleton
│   │   │   │       └── 0003b_ingest-to-wdk-cutover
│   │   │   ├── 0005_citations-db-first
│   │   │   ├── 0006_security-audit-remediation
│   │   │   └── 0007_empty-text-sentinel-chunks
│   │   ├── 01-experiments-prototypes
│   │   ├── 03-fixes
│   │   │   ├── 0001_drift
│   │   │   └── 0002_arch-drift-guardrails
│   │   ├── 05-migrations
│   │   └── _templates
│   ├── 00-strategy
│   │   └── initiatives
│   │       └── 100_chat_interface
│   ├── 01-insights
│   │   ├── capabilities
│   │   ├── competitors
│   │   ├── customers
│   │   │   ├── product-metrics
│   │   │   └── user-calls
│   │   └── tech-and-market
│   ├── 02-guidelines
│   │   ├── archive
│   │   ├── inspiration
│   │   │   ├── brand-dna-2026-02-06
│   │   │   │   ├── .firecrawl
│   │   │   │   │   └── brand-dna-2026-02-06
│   │   │   │   │       ├── maps
│   │   │   │   │       └── scrape
│   │   │   │   │           ├── amp
│   │   │   │   │           ├── coinshift
│   │   │   │   │           ├── every
│   │   │   │   │           ├── firecrawl
│   │   │   │   │           ├── parallel
│   │   │   │   │           └── raycast
│   │   │   │   ├── .parallel
│   │   │   │   │   └── brand-dna-2026-02-06
│   │   │   │   └── .probe
│   │   │   │       └── brand-dna-2026-02-06
│   │   │   │           └── out
│   │   │   └── tailwind
│   │   ├── v1-warm-editorial
│   │   ├── v2-refined-neutral
│   │   ├── v3-deep-ink
│   │   ├── v4-frost-and-fire
│   │   └── v5-final
│   ├── 05-reviews-audits
│   │   ├── code-simplicity
│   │   ├── e2e-testing
│   │   │   ├── 0001_citation-viewer-highlight
│   │   │   ├── 0002_missing-input-checklist
│   │   │   └── 0003_fail-closed-export-gating
│   │   └── security
│   ├── 06-release
│   │   ├── demo-runbook
│   │   │   └── 2026-02-09_orbital-poc-demo
│   │   └── postmortems
│   ├── 08-example-data
│   │   ├── pack_01_clean
│   │   │   ├── docs
│   │   │   ├── layout
│   │   │   └── truth
│   │   ├── pack_02_missing_rea
│   │   │   ├── docs
│   │   │   ├── layout
│   │   │   └── truth
│   │   ├── pack_03_mismatch_and_cert_gap
│   │   │   ├── docs
│   │   │   ├── layout
│   │   │   └── truth
│   │   ├── pack_04_multi_parcel
│   │   │   ├── docs
│   │   │   ├── layout
│   │   │   └── truth
│   │   ├── pack_05_partial_release
│   │   │   ├── docs
│   │   │   ├── layout
│   │   │   └── truth
│   │   ├── pack_06_overlapping_easements
│   │   │   ├── docs
│   │   │   ├── layout
│   │   │   └── truth
│   │   ├── pack_07_scans_rotated_low_quality
│   │   │   ├── docs
│   │   │   ├── layout
│   │   │   └── truth
│   │   ├── pack_08_defined_terms_and_cross_refs
│   │   │   ├── docs
│   │   │   ├── layout
│   │   │   └── truth
│   │   └── pack_09_bad_citation
│   │       ├── docs
│   │       ├── layout
│   │       ├── produced
│   │       └── truth
│   ├── 96-engineering-tutor-learnings
│   ├── 98-tmp
│   │   ├── 2026-02-06_infra-investigation
│   │   ├── handoffs
│   │   └── oracle
│   │       └── oracle-bundles
│   └── 99-archive
├── packages
│   └── core
│       └── src
│           ├── schemas
│           │   └── list_payload_v0.ts * +
│           ├── spikes
│           │   ├── rh1.schemas.ts * +
│           │   ├── rh3_snippet_hash_harness.ts * +
│           │   ├── rh4_verification_harness.ts * +
│           │   ├── rh5_missing_docs_harness.ts * +
│           │   ├── us001_pack01_cert_parties.e2e.test.ts * +
│           │   └── us002_pack03_cert_gap_issue.e2e.test.ts * +
│           ├── verify
│           │   ├── verifier.schemas.ts * +
│           │   └── verifier.ts * +
│           ├── chunking
│           ├── citations
│           ├── exception-matching
│           ├── fixtures
│           ├── geometry
│           ├── missing-docs
│           └── index.ts * +
├── scripts
│   ├── fixtures
│   │   ├── lib
│   │   │   ├── args.ts * +
│   │   │   ├── csv.ts * +
│   │   │   ├── fs.ts * +
│   │   │   ├── geometry.ts * +
│   │   │   └── snapshot.ts * +
│   │   ├── README.md *
│   │   ├── assert_citation_integrity.ts * +
│   │   ├── assert_row_invariants.ts * +
│   │   └── compare_truth.ts * +
│   ├── db
│   └── oracle
├── .agents
│   ├── backup
│   │   └── 2026-02-08T12-17-42-189Z
│   ├── hooks
│   │   └── git
│   └── skills
│       ├── 00-utilities
│       │   ├── agent-browser
│       │   ├── agentation
│       │   ├── ask-questions-if-underspecified
│       │   ├── beautiful-mermaid
│       │   ├── brand-dna-extractor
│       │   │   ├── assets
│       │   │   │   └── examples
│       │   │   ├── references
│       │   │   └── scripts
│       │   ├── browser-use
│       │   ├── commit
│       │   │   └── references
│       │   ├── create-cli
│       │   │   └── references
│       │   ├── dev-browser
│       │   │   ├── references
│       │   │   ├── scripts
│       │   │   └── src
│       │   │       └── snapshot
│       │   │           └── __tests__
│       │   ├── docs-list
│       │   ├── engineering-tutor
│       │   ├── every-style-editor
│       │   │   └── references
│       │   ├── file-todos
│       │   │   └── assets
│       │   ├── firecrawl
│       │   │   └── rules
│       │   ├── framework-docs-researcher
│       │   ├── handoff
│       │   ├── landpr
│       │   ├── markdown-converter
│       │   ├── nano-banana-pro
│       │   │   └── scripts
│       │   ├── openai-image-gen
│       │   │   └── scripts
│       │   ├── oracle
│       │   ├── parallel-web-tools
│       │   │   ├── assets
│       │   │   ├── references
│       │   │   └── scripts
│       │   ├── pickup
│       │   └── video-transcript-downloader
│       │       └── scripts
│       ├── 02-shape
│       │   ├── breadboarding
│       │   │   ├── references
│       │   │   │   ├── examples
│       │   │   │   └── templates
│       │   │   └── scripts
│       │   ├── brief
│       │   ├── create-json-prd
│       │   │   └── references
│       │   │       └── examples
│       │   ├── create-prd
│       │   │   └── assets
│       │   ├── spike-investigation
│       │   │   └── references
│       │   │       ├── examples
│       │   │       └── templates
│       │   └── wf-shape
│       │       └── references
│       ├── 03-plan
│       │   ├── best-practices-researcher
│       │   ├── bug-reproduction-validator
│       │   ├── deepen-plan
│       │   ├── plan-review
│       │   ├── repo-research-analyst
│       │   ├── reproduce-bug
│       │   ├── spec-flow-analyzer
│       │   ├── triage
│       │   └── wf-plan
│       │       └── references
│       ├── 04-develop
│       │   ├── 00-frontend-general
│       │   │   ├── composition-patterns
│       │   │   │   └── rules
│       │   │   ├── frontend-design
│       │   │   ├── generating-tailwind-brand-config
│       │   │   │   ├── references
│       │   │   │   └── scripts
│       │   │   ├── rams
│       │   │   ├── react-best-practices
│       │   │   │   └── rules
│       │   │   └── web-design-guidelines
│       │   ├── 01-ui-skills-dot-com
│       │   │   ├── 12-principles-of-animation
│       │   │   ├── baseline-ui
│       │   │   ├── canvas-design
│       │   │   ├── design-lab
│       │   │   ├── fixing-accessibility
│       │   │   ├── fixing-metadata
│       │   │   ├── fixing-motion-performance
│       │   │   ├── interaction-design
│       │   │   ├── interface-design
│       │   │   ├── swiftui-ui-patterns
│       │   │   ├── tailwind-css-patterns
│       │   │   ├── ui-ux-pro-max
│       │   │   └── wcag-audit-patterns
│       │   ├── pr-comment-resolver
│       │   ├── use-ai-sdk
│       │   │   └── references
│       │   ├── verify
│       │   ├── wf-develop
│       │   └── wf-ralph
│       │       ├── examples
│       │       └── references
│       ├── 05-review
│       │   ├── agent-native-architecture
│       │   │   └── references
│       │   ├── agent-native-reviewer
│       │   ├── architecture-strategist
│       │   ├── code-simplicity-reviewer
│       │   ├── data-integrity-guardian
│       │   ├── data-migration-expert
│       │   ├── git-history-analyzer
│       │   ├── kieran-python-reviewer
│       │   ├── kieran-typescript-reviewer
│       │   ├── pattern-recognition-specialist
│       │   ├── performance-oracle
│       │   ├── security
│       │   │   ├── security-best-practices
│       │   │   │   ├── agents
│       │   │   │   └── references
│       │   │   ├── security-sentinel
│       │   │   └── security-threat-model
│       │   │       ├── agents
│       │   │       └── references
│       │   ├── security-sentinel
│       │   ├── test-browser
│       │   └── wf-review
│       ├── 06-release
│       │   ├── changelog
│       │   ├── demo-runbook
│       │   │   ├── assets
│       │   │   ├── references
│       │   │   └── scripts
│       │   ├── deployment-verification-agent
│       │   └── wf-release
│       ├── 07-compound
│       │   └── compound-docs
│       │       ├── assets
│       │       └── references
│       ├── 10-audit
│       │   └── agent-native-audit
│       └── 98-skill-maintenance
│           ├── create-agent-skills
│           │   ├── references
│           │   ├── templates
│           │   └── workflows
│           ├── heal-skill
│           ├── modular-skills-architect
│           └── skill-creator
│               └── scripts
├── .claude
│   └── skills
├── .gemini
├── .github
│   └── workflows
└── tmp
    └── oracle-home
        └── sessions


(* denotes selected files)
(+ denotes code-map available)
Config: directory-only view; selected files shown.
</file_map>
<file_contents>
File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/specs/README.md
```md
# 0002 Quick Start Engine: Specs (Pinned Contracts)

Overall PRD (initiative-level overview): `../prd-overall.md`
Slice PRDs (implementation units): `../prds/README.md`

This folder contains pinned, shared spec artefacts referenced across the 0002 spine/slices/spikes.

## Files
- Comparator rules (deterministic PASS/FAIL + normalisation): `comparator_spec_v0.md`
- Failure UX copy (reason-code -> guidance): `failure_ux_copy_v0.md`
- List payload contract (versioned schema): `list_payload_v0.schema.md`
- List verification semantics (v1 policy): `list_verification_policy_v1.md`
- Frozen question set + pinning/version semantics: `question_set_v1.json`

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/wdk/wdkDirectiveGuardrail.server.ts
```ts
import "server-only";

export type WdkDirective = "use workflow" | "use step";

export type WdkDirectiveSubject = {
  kind: "workflow" | "step";
  id: string;
};

type DirectiveCheckResult = { ok: true } | { ok: false; error: string };

function isWs(ch: string): boolean {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\v" || ch === "\f";
}

function skipLineComment(src: string, start: number): number {
  let i = start;
  while (i < src.length && src[i] !== "\n") i += 1;
  return i;
}

function skipBlockComment(src: string, start: number): number {
  let i = start;
  while (i < src.length) {
    if (src[i] === "*" && src[i + 1] === "/") return i + 2;
    i += 1;
  }
  return i;
}

function skipWsAndComments(src: string, start: number): number {
  let i = start;
  while (i < src.length) {
    const ch = src[i];
    if (isWs(ch)) {
      i += 1;
      continue;
    }

    if (ch === "/" && src[i + 1] === "/") {
      i = skipLineComment(src, i + 2);
      continue;
    }

    if (ch === "/" && src[i + 1] === "*") {
      i = skipBlockComment(src, i + 2);
      continue;
    }

    break;
  }

  return i;
}

function skipStringLiteral(src: string, start: number, quote: "'" | '"'): number {
  let i = start;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }

    if (ch === quote) return i + 1;
    i += 1;
  }

  return i;
}

function findArrowTokenIndex(src: string): number | null {
  let i = 0;
  while (i < src.length - 1) {
    const ch = src[i];

    if (ch === "'" || ch === '"') {
      i = skipStringLiteral(src, i + 1, ch);
      continue;
    }

    if (ch === "/" && src[i + 1] === "/") {
      i = skipLineComment(src, i + 2);
      continue;
    }

    if (ch === "/" && src[i + 1] === "*") {
      i = skipBlockComment(src, i + 2);
      continue;
    }

    if (ch === "=" && src[i + 1] === ">") return i;
    i += 1;
  }

  return null;
}

function findFunctionKeywordIndex(src: string): number | null {
  let i = 0;
  while (i < src.length) {
    const ch = src[i];

    if (ch === "'" || ch === '"') {
      i = skipStringLiteral(src, i + 1, ch);
      continue;
    }

    if (ch === "/" && src[i + 1] === "/") {
      i = skipLineComment(src, i + 2);
      continue;
    }

    if (ch === "/" && src[i + 1] === "*") {
      i = skipBlockComment(src, i + 2);
      continue;
    }

    if (src.startsWith("function", i)) {
      const prev = src[i - 1];
      const next = src[i + "function".length];
      const prevOk = !prev || !/[A-Za-z0-9_$]/.test(prev);
      const nextOk = !next || !/[A-Za-z0-9_$]/.test(next);
      if (prevOk && nextOk) return i;
    }

    i += 1;
  }

  return null;
}

function findFunctionBodyOpenBrace(source: string): number | null {
  const arrow = findArrowTokenIndex(source);
  if (arrow !== null) {
    // Arrow function: `(...) => { ... }`
    const i = skipWsAndComments(source, arrow + 2);
    if (source[i] === "{") return i;
    return null;
  }

  const fnKw = findFunctionKeywordIndex(source);
  if (fnKw === null) return null;

  // Find parameter list `(...)` after `function` keyword.
  let i = fnKw + "function".length;
  i = skipWsAndComments(source, i);
  while (i < source.length && source[i] !== "(") i += 1;
  if (source[i] !== "(") return null;

  i += 1;
  let depth = 1;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === "'" || ch === '"') {
      i = skipStringLiteral(source, i + 1, ch);
      continue;
    }

    if (ch === "/" && source[i + 1] === "/") {
      i = skipLineComment(source, i + 2);
      continue;
    }

    if (ch === "/" && source[i + 1] === "*") {
      i = skipBlockComment(source, i + 2);
      continue;
    }

    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    i += 1;
  }

  if (depth !== 0) return null;

  i = skipWsAndComments(source, i);
  if (source[i] === "{") return i;
  return null;
}

function parseStringLiteralValue(source: string, start: number): { value: string; nextIndex: number } | null {
  const quote = source[start];
  if (quote !== "'" && quote !== '"') return null;

  let i = start + 1;
  let value = "";
  while (i < source.length) {
    const ch = source[i];
    if (ch === "\\") {
      const next = source[i + 1];
      if (next) value += next;
      i += 2;
      continue;
    }

    if (ch === quote) return { value, nextIndex: i + 1 };
    value += ch;
    i += 1;
  }

  return null;
}

function isDirectiveStatementBoundary(source: string, start: number): boolean {
  // Ensure the string literal is a standalone expression statement, not part of
  // something like `"use step" + x`.
  let i = start;
  while (i < source.length) {
    const ch = source[i];

    // Spaces/tabs/etc can be safely skipped. Newlines/r are statement boundaries via ASI.
    if (ch === " " || ch === "\t" || ch === "\v" || ch === "\f") {
      i += 1;
      continue;
    }
    if (ch === "\n" || ch === "\r") return true;

    if (ch === "/" && source[i + 1] === "/") return true; // line comment ends at newline

    if (ch === "/" && source[i + 1] === "*") {
      const next = skipBlockComment(source, i + 2);
      for (let j = i; j < next; j += 1) {
        if (source[j] === "\n" || source[j] === "\r") return true;
      }
      i = next;
      continue;
    }

    if (ch === ";") return true;
    if (ch === "}") return true;

    return false;
  }

  return true;
}

function checkWdkDirective(fn: unknown, expected: WdkDirective): DirectiveCheckResult {
  if (typeof fn !== "function") {
    return { ok: false, error: `Expected a function to check for "${expected}".` };
  }
  let source: string;
  try {
    source = Function.prototype.toString.call(fn);
  } catch {
    return { ok: false, error: `Unable to stringify function to check for "${expected}".` };
  }

  const bodyOpen = findFunctionBodyOpenBrace(source);
  if (bodyOpen === null) {
    return { ok: false, error: `Unable to locate a block body ("{ ... }") to assert "${expected}".` };
  }

  const first = skipWsAndComments(source, bodyOpen + 1);
  const lit = parseStringLiteralValue(source, first);
  if (!lit) {
    return { ok: false, error: `Missing "${expected}" as the first statement in the function body.` };
  }

  if (lit.value !== expected) {
    return { ok: false, error: `Expected "${expected}" as the first statement; found "${lit.value}".` };
  }

  if (!isDirectiveStatementBoundary(source, lit.nextIndex)) {
    return { ok: false, error: `Directive must be a standalone statement (e.g. "${expected}";).` };
  }

  return { ok: true };
}

export function assertWdkDirective(
  fn: unknown,
  expected: WdkDirective,
  subject: WdkDirectiveSubject,
): void {
  const result = checkWdkDirective(fn, expected);
  if (result.ok) return;

  const label = `${subject.kind} ${subject.id}`;
  throw new Error(`WDK directive guardrail failed for ${label}: ${result.error}`);
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/index.ts
```ts
export * from "./geometry/anchors";
export * from "./geometry/mapToViewport";
export * from "./chunking/char_window_v0";
export * from "./exception-matching/matchExceptionsToInstrumentDocs";
export * from "./missing-docs/detectMissingDocs";
export * from "./missing-docs/schemas";
export * from "./schemas/list_payload_v0";
export * from "./safe-error";
export * from "./spikes/rh1.schemas";
export * from "./verify/verifier.schemas";

```

File: /Users/marc/Code/personal-projects/orbital-poc/scripts/fixtures/assert_row_invariants.ts
```ts
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { LIST_PAYLOAD_V0_SCHEMA_VERSION, ListPayloadV0Schema } from "../../packages/core/src/schemas/list_payload_v0.ts";
import { MissingDocCandidateSchema } from "../../packages/core/src/missing-docs/schemas.ts";

import { parseArgs, getStringArg, requireStringArg } from "./lib/args.ts";
import { assertIsSnapshot, isRecord } from "./lib/snapshot.ts";

type InvariantError = {
  kind: string;
  question_id?: string;
  message: string;
  details?: unknown;
};

function extractReasonCode(provenance: unknown): string | null {
  if (!provenance) return null;
  if (!isRecord(provenance)) return null;

  const direct = provenance.reason_code;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const verify = provenance.verify;
  if (isRecord(verify) && typeof verify.reason_code === "string" && verify.reason_code.trim()) return verify.reason_code.trim();

  const v = provenance.verification;
  if (isRecord(v) && typeof v.reason_code === "string" && v.reason_code.trim()) return v.reason_code.trim();

  return null;
}

function hasChecklist(row: { notes?: string | null; provenance_json?: unknown }): boolean {
  if (typeof row.notes === "string" && row.notes.trim().length > 0) return true;
  const prov = row.provenance_json;
  if (!prov || !isRecord(prov)) return false;

  const isHighConfidenceChecklist = (val: unknown): boolean => {
    if (!Array.isArray(val) || val.length < 1) return false;
    for (const item of val) {
      const parsed = MissingDocCandidateSchema.safeParse(item);
      if (!parsed.success) return false;
      if (parsed.data.confidence < 0.8) return false;
    }
    return true;
  };

  const checklist = prov.checklist;
  if (isHighConfidenceChecklist(checklist)) return true;

  const missing = prov.missing_docs_checklist;
  if (isHighConfidenceChecklist(missing)) return true;

  return false;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const snapshotPath = resolve(requireStringArg(args, "snapshot"));
  const outPath = getStringArg(args, "out") ? resolve(getStringArg(args, "out")!) : undefined;

  const snapshotRaw = JSON.parse(await readFile(snapshotPath, "utf8")) as unknown;
  const snapshot = assertIsSnapshot(snapshotRaw);

  const errors: InvariantError[] = [];

  // Unique question_id
  const seen = new Set<string>();
  for (const row of snapshot.rows) {
    if (!row || typeof row !== "object") {
      errors.push({ kind: "row_invalid", message: "Row must be an object", details: row });
      continue;
    }
    const qid = (row as any).question_id;
    if (typeof qid !== "string" || !qid.trim()) {
      errors.push({ kind: "row_invalid", message: "Row.question_id must be a non-empty string", details: row });
      continue;
    }
    if (seen.has(qid)) errors.push({ kind: "duplicate_question_id", question_id: qid, message: "Duplicate question_id in snapshot" });
    seen.add(qid);
  }

  const allowedStatuses = new Set(["needs_review", "reviewed", "missing_input", "citation_failed"]);
  const strictReasonCodes = new Set([
    // Row-level taxonomy (docs/03-architecture/60_observability_and_evals.md)
    "VALIDATION_ERROR",
    "NO_CITATIONS",
    "MISSING_INPUT_INVARIANT",
    "CITATION_MISMATCH",
    "NO_ANCHORS_FILE",
    "ANCHOR_NOT_FOUND",
  ]);
  const enforceStrictReasonCodes = Boolean(args["strict-reason-codes"]);

  for (const row of snapshot.rows) {
    const qid = row.question_id;
    if (!allowedStatuses.has(row.status)) {
      errors.push({
        kind: "status_invalid",
        question_id: qid,
        message: `Invalid row status: ${String(row.status)}`,
        details: { status: row.status },
      });
    }

    if (!Array.isArray(row.citation_ids) || row.citation_ids.some((x) => typeof x !== "string")) {
      errors.push({
        kind: "citation_ids_invalid",
        question_id: qid,
        message: "Row.citation_ids must be a string[]",
        details: { citation_ids: row.citation_ids },
      });
    }

    if ((row.status === "needs_review" || row.status === "reviewed") && row.citation_ids.length < 1) {
      errors.push({
        kind: "missing_citations",
        question_id: qid,
        message: "needs_review|reviewed rows must have >= 1 locked citation_id",
      });
    }

    if (row.status === "missing_input") {
      if (row.answer !== "Not found in provided documents.") {
        errors.push({
          kind: "missing_input_answer_mismatch",
          question_id: qid,
          message: "missing_input rows must use exact answer string",
          details: { answer: row.answer },
        });
      }
      if (row.citation_ids.length !== 0) {
        errors.push({
          kind: "missing_input_has_citations",
          question_id: qid,
          message: "missing_input rows must have zero citations",
          details: { citation_ids: row.citation_ids },
        });
      }
      if (!hasChecklist(row)) {
        errors.push({
          kind: "missing_input_missing_checklist",
          question_id: qid,
          message:
            "missing_input rows must include an actionable missing-doc checklist (notes or provenance_json.missing_docs_checklist[])",
        });
      }
    }

    if (row.status === "citation_failed") {
      const reasonCode = extractReasonCode(row.provenance_json);
      if (!reasonCode) {
        errors.push({
          kind: "citation_failed_missing_reason_code",
          question_id: qid,
          message: "citation_failed rows must include a safe reason_code in provenance",
        });
      } else if (!/^[A-Z][A-Z0-9_]+$/.test(reasonCode)) {
        errors.push({
          kind: "citation_failed_invalid_reason_code",
          question_id: qid,
          message: `Invalid reason_code format: ${reasonCode}`,
          details: { reason_code: reasonCode },
        });
      } else if (enforceStrictReasonCodes && !strictReasonCodes.has(reasonCode)) {
        errors.push({
          kind: "citation_failed_unknown_reason_code",
          question_id: qid,
          message: `Unknown reason_code (strict mode): ${reasonCode}`,
          details: { reason_code: reasonCode, allowed: Array.from(strictReasonCodes) },
        });
      }
    }

    const hasSchema = row.payload_schema_version !== undefined && row.payload_schema_version !== null && row.payload_schema_version !== "";
    const hasPayload = row.payload_json !== undefined && row.payload_json !== null;
    if (hasSchema !== hasPayload) {
      errors.push({
        kind: "payload_fields_inconsistent",
        question_id: qid,
        message: "payload_schema_version and payload_json must be both present or both absent",
        details: { payload_schema_version: row.payload_schema_version, payload_json_present: hasPayload },
      });
    }

    if (hasSchema && hasPayload) {
      if (row.payload_schema_version === LIST_PAYLOAD_V0_SCHEMA_VERSION) {
        const parsed = ListPayloadV0Schema.safeParse(row.payload_json);
        if (!parsed.success) {
          errors.push({
            kind: "payload_schema_invalid",
            question_id: qid,
            message: "payload_json failed list_payload_v0 validation",
            details: parsed.error.issues.map((i) => ({ code: i.code, message: i.message, path: i.path })),
          });
        }
      } else {
        errors.push({
          kind: "payload_schema_unknown",
          question_id: qid,
          message: `Unknown payload_schema_version: ${String(row.payload_schema_version)}`,
        });
      }
    }
  }

  const result = {
    pass: errors.length === 0,
    snapshot_path: snapshotPath,
    pack_id: snapshot.meta.pack_id,
    error_count: errors.length,
    errors,
  };

  if (outPath) {
    await writeFile(outPath, JSON.stringify(result, null, 2) + "\n", "utf8");
  }

  // Human summary
  if (result.pass) {
    process.stdout.write(`PASS row invariants (${snapshot.meta.pack_id})\n`);
    process.exit(0);
  }

  process.stdout.write(`FAIL row invariants (${snapshot.meta.pack_id}) - ${errors.length} error(s)\n`);
  for (const e of errors.slice(0, 20)) {
    process.stdout.write(`- ${e.question_id ?? "(no question_id)"}: ${e.kind}: ${e.message}\n`);
  }
  if (errors.length > 20) process.stdout.write(`(showing first 20)\n`);
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(String(err?.stack ?? err) + "\n");
  process.exit(2);
});

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.7_decision.md
```md
# SP-2.7 Payload Representation Decision

Decision:
- Option 4: store structured payload in `report_rows.payload_json` (JSONB) + `report_rows.payload_schema_version` (string).
- Keep `report_rows.answer` human-readable and keep `report_rows.provenance_json` debug-only.

Schema:
- `payload_schema_version = "list_payload_v0"`
- Canonical schema doc: `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md`

Docs updated:
- `docs/03-architecture/30_data_model.md` (report_rows includes payload columns)
- `docs/03-architecture/50_api_surface.md` (report rows include payload fields)

Why:
- UI renders tables from a versioned contract (no prose parsing).
- Evals compare stable JSON payloads.
- Provenance stays non-contractual (debug-only).


```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/04-refactors/0004_quick-start-to-wdk/plan.md
```md
# Plan: Refactor Quick Start To WDK (Workstream C)

Date: 2026-02-10
Status: Draft (planning doc; no implementation implied)
Owner: marc

## Intent
Refactor Quick Start run execution from the durable `jobs` worker to the WDK runtime (Workstream B), so Quick Start is durably orchestrated via workflows + steps.

This closes the biggest runtime drift: two orchestration systems (jobs vs WDK) competing for the same domain problem.

## Dependencies
Hard dependency:
- Workstream B: `docs/04-projects/04-refactors/0003_wdk-runtime/plan.md`
  - WDK worker exists and can execute steps durably
  - WDK world schema decisions are settled (whether `run_steps` is extended or a sibling table exists)

Soft dependencies (can be follow-ups):
- Retrieval substrate (0011a) and DB-first citations (Workstream D/E) are not required to move Quick Start onto WDK.
  - This refactor should preserve current Quick Start behavior (which is placeholder rows and/or missing-input rows today).

Entry criteria (do not start Workstream C PRs until true):
- `pnpm --filter @orbital-poc/web worker` runs a WDK worker loop (not the legacy jobs worker).
- WDK has a supported way to:
  - start a workflow and persist its run state durably
  - schedule/claim/execute steps durably
  - observe progress via DB rows (at minimum)

## Goal (definition of done)
1. `POST /folders/:id/runs` starts a WDK workflow for Quick Start and returns the created `run` as it does today.
2. Quick Start execution is performed by the WDK worker, not `apps/web/lib/jobs/*`.
3. New Quick Start runs do not create `jobs` rows of type `execute_run`.
4. The existing run state model remains coherent and inspectable:
   - `runs.state` transitions remain correct (`running -> completed|partial|failed`)
   - `runs.questions_total/questions_done` and `failure_counts_json` semantics are preserved
   - idempotency header behavior (`Idempotency-Key`) is preserved
5. Legacy jobs runtime remains present for a short deprecation window, clearly marked as legacy-only, and not used by Quick Start.

## Non-goals (explicit cuts)
- Do not change product semantics (question set, row schemas, status taxonomy, fixture packs).
- Do not implement retrieval/draft/lock/verify logic for Quick Start yet.
- Do not invent a second evidence/citations system.

## Current State (reality check)
Run start:
- API: `apps/web/app/(api)/folders/[id]/runs/route.ts`
  - inserts a `runs` row
  - inserts a `run_steps` row `workflow_start` (succeeded)
  - calls `enqueueQuickStartRun(runId)` (fire-and-forget)
- Queue: `apps/web/lib/quickStartRunQueue.server.ts` enqueues `jobs(type=execute_run, job_key=run:<id>)` and kicks inline drainer in dev
- Worker: `apps/web/lib/jobs/jobWorker.server.ts` handles `execute_run` by calling `processQuickStartRun(runId)`
- Processor: `apps/web/lib/quickStartRunProcessor.server.ts` writes `run_steps(write_row)` and `report_rows`, and finalizes `runs.state`

Polling:
- `GET /runs/:id`: `apps/web/app/(api)/runs/[id]/route.ts`

## Target State
- Quick Start is a WDK workflow type (e.g. `quick_start_title_survey`).
- The WDK worker claims and runs Quick Start steps durably.
- `jobs(type=execute_run)` is no longer written.
- For the deprecation window, the jobs worker can continue to exist for other legacy uses (e.g. ingest) but must be clearly labeled as legacy.

## Design Constraints (to avoid future pain)
- Preserve idempotency:
  - Run-level idempotency remains `(folder_id, idempotency_key)`.
  - Step-level idempotency uses deterministic `step_key` (unique per `run_id`).
- Keep side effects inside steps.
- Keep domain logic testable:
  - Prefer extracting pure functions into `packages/core` when it reduces coupling.
  - Keep WDK wiring inside `apps/web`.

## Plan Overview (PR-by-PR)
This workstream should be landed as small PRs with tight verification loops.

### PR C1: Quick Start WDK workflow skeleton (no cutover)
Goal: Add a WDK workflow + step set for Quick Start without changing behavior.

Changes:
- Add `apps/web/workflows/quickStartTitleSurvey.workflow.ts` (or equivalent) that declares:
  - workflow type: `quick_start_title_survey`
  - input: `{ run_id: string }` (or `{ folder_id, idempotency_key? }` if Workstream B world prefers it)
  - controller: schedules the first step only (tracer bullet)
- Add step(s) in `apps/web/steps/quickStart/*`:
  - `qs_execute_v0` step: calls existing `processQuickStartRun(runId)` as a thin integration slice
- Minimal WDK registry wiring (if Workstream B didn’t already create it):
  - ensure worker can discover workflow + step implementations

Acceptance:
- WDK worker can execute `qs_execute_v0` end-to-end when started manually.
- No route cutover yet.

### PR C2: Feature-flagged cutover for `POST /folders/:id/runs`
Goal: Route starts WDK workflow for Quick Start behind a clearly named flag.

Changes:
- Add an env flag, e.g. `FEATURE_WDK_QUICK_START=1`.
- In `apps/web/app/(api)/folders/[id]/runs/route.ts`:
  - if flag enabled: start the WDK workflow instead of `enqueueQuickStartRun(runId)`
  - else: preserve current job enqueue behavior
- Ensure logs make runtime choice explicit:
  - `run.created` log includes `{ orchestration: 'wdk' | 'jobs' }`
- Add a small test that asserts the branching is correct:
  - WDK flag on: does not call `enqueueQuickStartRun`
  - WDK flag off: still calls `enqueueQuickStartRun`

Acceptance:
- With flag enabled: a run progresses to terminal state with WDK worker running.
- With flag disabled: behavior is unchanged.

### PR C3: Default-on in dev + explicit legacy marking
Goal: Make WDK the default Quick Start runtime in development, and make jobs clearly legacy-only.

Changes:
- Default `FEATURE_WDK_QUICK_START=1` in local dev tooling (document it; do not silently change prod defaults).
- Update code comments and docs to label jobs runtime as legacy:
  - `apps/web/lib/jobs/*` header comment: legacy-only, pending removal
  - `docs/03-architecture/07_current_poc_runtime.md`: Quick Start runs on WDK; jobs may remain only for legacy tasks

Acceptance:
- A contributor following docs runs Quick Start via WDK without confusion.

### PR C4: Remove Quick Start `execute_run` jobs usage (keep ingest as-is)
Goal: Quick Start no longer enqueues durable jobs at all.

Changes:
- Remove `enqueueQuickStartRun()` usage from Quick Start routes.
- Optionally keep `apps/web/lib/quickStartRunQueue.server.ts` for the deprecation window but unused, then delete it.
- Update jobs worker handler map:
  - remove `execute_run` handler (or gate it behind a legacy flag)
- Add a one-time cleanup note:
  - existing `jobs(type=execute_run)` rows in dev DB can be ignored or manually cleared; they should no longer be created

Acceptance:
- `jobs` table can still exist, but Quick Start never writes to it.

### PR C5 (recommended): Move off the monolith processor into per-question WDK steps
Goal: Make the WDK model real: explicit steps, resumability, and controllable progress, instead of a single long `qs_execute_v0` step.

Why:
- A single long step is still a "job" in disguise.
- Per-question steps allow durable progress and safe restarts without re-running the entire processor.

Approach:
- Replace `qs_execute_v0` with a deterministic step graph:
  - Workflow schedules `write_row` steps per question_id.
  - Each step:
    - writes `run_steps(step_type='write_row', step_key=...)` idempotently
    - writes `report_rows` idempotently
    - updates `runs.questions_done` and `failure_counts_json` deterministically
- Convert `processQuickStartRun()` into either:
  - a pure planner that computes per-question intents, or
  - delete it and move logic into a `writeRow` step handler.

Acceptance:
- Killing the worker mid-run and restarting continues the run without duplicating rows.
- `GET /runs/:id` progress updates incrementally as steps complete.

### PR C6: Legacy job runtime deprecation window and removal plan
Goal: Make 4b explicit and enforceable.

Policy (mark clearly):
- Jobs runtime is legacy-only for one deprecation window.
- After the window:
  - delete `apps/web/lib/jobs/*` and `apps/web/lib/*Queue.server.ts` legacy enqueue paths
  - remove `jobs` DDL from `apps/web/lib/db/schema/core.server.ts` (or keep temporarily if ingest hasn’t moved)

Deliverable:
- A short `docs/04-projects/04-refactors/0004_quick-start-to-wdk/deprecation.md` describing:
  - what is legacy
  - how to remove it
  - what must be migrated first (e.g. ingest)

## Verification
Automated (each PR):
- `pnpm --filter @orbital-poc/web typecheck`
- `pnpm --filter @orbital-poc/web test`

Manual smoke (PR C2+):
1. Start web: `pnpm dev`
2. Start worker: `pnpm --filter @orbital-poc/web worker`
3. Trigger a run from the UI or via POST `/folders/:id/runs`.
4. Confirm:
   - run reaches `completed` or `partial`
   - `GET /runs/:id` progress increases over time
   - when WDK mode is enabled, no `jobs(type=execute_run)` row is created

Regression checks:
- Idempotency-Key: repeat `POST /folders/:id/runs` with the same header returns the existing run.
- Folder gating behavior (`indexed|ready` runnable) remains unchanged.

## Risks / Watchouts
- Workstream B schema decisions may require additional changes here (e.g. if `run_steps` is extended for claiming).
- Mixing two runtimes (jobs + WDK) can create confusion; this is why we keep the deprecation window short and clearly documented.
- Refactoring `processQuickStartRun` into per-question steps can accidentally change ordering/timings. This is acceptable as long as:
  - outputs remain terminal-only
  - idempotency and invariants hold

## Open Questions (to settle in PR C1)
- What is the canonical WDK workflow input for Quick Start?
  - Option A: `{ run_id }` (minimal change)
  - Option B: `{ folder_id, run_type, idempotency_key? }` and the workflow creates the `runs` row itself
- Who owns updating `runs.state` to terminal?
  - Option A: step handlers (as today) after each row write
  - Option B: workflow controller finalizes when all step keys exist

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/specs/question_set_v1.json
```json
{
  "question_set_id": "qs_0002_v1",
  "question_set_version_format": "qs:0002:v{major}.{minor}:sha256:{canonical_json_sha256}",
  "questions": [
    {
      "question_id": "TS-01",
      "group": "title_schedule_a",
      "question": "Who is the Proposed Insured?",
      "response_kind": "scalar_text"
    },
    {
      "question_id": "TS-02",
      "group": "title_schedule_a",
      "question": "What is the Insured Estate?",
      "response_kind": "scalar_text"
    },
    {
      "question_id": "TS-03",
      "group": "artefacts",
      "question": "List Schedule B-I requirements.",
      "response_kind": "list_payload",
      "artefact_kind": "requirements_tracker",
      "payload_schema_version": "list_payload_v0"
    },
    {
      "question_id": "TS-04",
      "group": "artefacts",
      "question": "List the recorded exceptions in Schedule B-II.",
      "response_kind": "list_payload",
      "artefact_kind": "exceptions_table",
      "payload_schema_version": "list_payload_v0"
    },
    {
      "question_id": "TS-05",
      "group": "survey",
      "question": "Who is the survey certified to?",
      "response_kind": "scalar_text"
    },
    {
      "question_id": "TS-06",
      "group": "survey",
      "question": "Are there any encroachments or protrusions noted on the survey?",
      "response_kind": "scalar_text"
    },
    {
      "question_id": "TS-07",
      "group": "survey",
      "question": "Does the survey flag any mismatch with the record description?",
      "response_kind": "scalar_text"
    },
    {
      "question_id": "TS-08",
      "group": "reconciliation",
      "question": "Is any referenced exception document missing from the pack?",
      "response_kind": "scalar_text"
    },
    {
      "question_id": "TS-09",
      "group": "artefacts",
      "question": "List survey reconciliation issues and QC flags (title <-> survey), including missing-doc, cert-gap, mismatch, encroachments, and scan-quality warnings.",
      "response_kind": "list_payload",
      "artefact_kind": "survey_issues",
      "payload_schema_version": "list_payload_v0"
    }
  ],
  "list_shaped_question_ids": ["TS-03", "TS-04", "TS-09"],
  "notes": {
    "pinning": {
      "runs.question_set_version": "Set to qs:0002:v1.0:sha256:{canonical_json_sha256} at run start; stored on run; must be returned by GET /runs/:id and in report responses.",
      "canonicalisation": "Before hashing, serialise JSON with stable key ordering and no insignificant whitespace; then sha256 the bytes."
    }
  }
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/verify/verifier.schemas.ts
```ts
import { z } from "zod";

export const VerifyCitationSchema = z.object({
  document_id: z.string().min(1),
  page_number: z.number().int().positive(),
  snippet: z.string(),
  snippet_hash: z.string().min(1),
  polygons: z
    .array(
      z
        .array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).readonly())
        .min(3),
    )
    .min(1),
});

export type VerifyCitation = z.infer<typeof VerifyCitationSchema>;

export const VerifyInputSchema = z.object({
  case_id: z.string().min(1),
  question_id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string(),
  citations: z.array(VerifyCitationSchema),
});

export type VerifyInput = z.infer<typeof VerifyInputSchema>;

export const VerifyVerdictSchema = z.enum(["pass", "fail"]);

export const VerifyResultSchema = z.object({
  verdict: VerifyVerdictSchema,
  reason_code: z.string().min(1),
  reason: z.string().optional(),
  timings_ms: z
    .object({
      total: z.number().nonnegative(),
      deterministic: z.number().nonnegative(),
      entailment: z.number().nonnegative().optional(),
    })
    .passthrough(),
});

export type VerifyResult = z.infer<typeof VerifyResultSchema>;

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx
```tsx
"use client";

import { useState } from "react";

import { Button } from "../../../ui/Button";
import { InlineStatus } from "../../../ui/InlineStatus";

type Props = {
  folderId: string;
  disabledReason: string | null;
};

type QuickStartState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "started"; runId: string; runState: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function readSafeError(json: unknown): { code: string; message: string } | null {
  const env = isRecord(json) && isRecord(json.error) ? json.error : null;
  if (!env) return null;
  const code = typeof env.code === "string" && env.code.trim() ? env.code.trim() : null;
  const message = typeof env.message === "string" && env.message.trim() ? env.message.trim() : null;
  if (!code || !message) return null;
  return { code, message };
}

export function QuickStartPanel(props: Props) {
  const [state, setState] = useState<QuickStartState>({ kind: "idle" });

  async function start() {
    if (props.disabledReason) return;
    setState({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch(`/folders/${encodeURIComponent(props.folderId)}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": "demo-quick-start",
        },
        body: JSON.stringify({ type: "quick_start_title_survey" }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    const json: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const env = readSafeError(json);
      if (env) {
        setState({ kind: "error", message: `${env.code}: ${env.message}` });
        return;
      }
      setState({ kind: "error", message: `Request failed (${res.status}).` });
      return;
    }

    const run = isRecord(json) && isRecord(json.run) ? json.run : null;
    const runId = run && typeof run.id === "string" ? run.id : null;
    const runState = run && typeof run.state === "string" ? run.state : "running";
    if (!runId) {
      setState({ kind: "error", message: "Missing run.id in response." });
      return;
    }

    setState({ kind: "started", runId, runState });
  }

  return (
    <div className="grid justify-items-end gap-2">
      <Button
        size="sm"
        onClick={start}
        disabled={Boolean(props.disabledReason)}
        loading={state.kind === "loading"}
      >
        Run Quick Start
      </Button>

      {props.disabledReason ? <div className="text-xs text-muted-foreground">{props.disabledReason}</div> : null}

      <InlineStatus kind={state.kind === "error" ? "error" : "idle"}>
        {state.kind === "error" ? state.message : null}
      </InlineStatus>

      {state.kind === "started" ? (
        <div className="grid gap-1 text-right text-xs text-muted-foreground">
          <div>
            run: <span className="font-mono">{state.runId}</span> ({state.runState})
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <a
              className="underline hover:text-foreground"
              href={`/runs/${encodeURIComponent(state.runId)}`}
              target="_blank"
              rel="noreferrer"
            >
              Run JSON
            </a>
            <a
              className="underline hover:text-foreground"
              href={`/folders/${encodeURIComponent(props.folderId)}/report?${new URLSearchParams({
                run_id: state.runId,
              }).toString()}`}
              target="_blank"
              rel="noreferrer"
            >
              Report JSON
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/prd.json
```json
{
  "version": 1,
  "project": "0002 Quick Start Engine (Consolidated)",
  "branchName": "feat/0002-quick-start-engine",
  "description": "Implement the deterministic-ish Quick Start: Title + Survey run that turns a fixture pack into three evidence-backed artefacts: Schedule B-I requirements tracker, Schedule B-II exceptions table (linked to instruments), and a survey reconciliation issues list. This consolidated PRD is intended to be the single Ralph-loop input; slice PRDs remain the thin executable units.",
  "overview": "Implement the deterministic-ish Quick Start: Title + Survey run that turns a fixture pack into three evidence-backed artefacts: Schedule B-I requirements tracker, Schedule B-II exceptions table (linked to instruments), and a survey reconciliation issues list. This consolidated PRD is intended to be a single canonical reference that reassembles the spine plus slice PRDs under prds/.",
  "goals": [
    "Implement a Quick Start run that produces three evidence-backed artefacts from a fixture pack: B-I requirements tracker, B-II exceptions table (linked to instruments), and survey reconciliation issues list.",
    "Maintain the trust posture: evidence-first, fail-closed verification, deterministic orchestration, and fixtures/evals as first-class.",
    "Prove outputs against fixture packs and /truth rather than ad-hoc eyeballing."
  ],
  "nonGoals": [
    "Any external web research inside runs (ADR-0007).",
    "Any approach that weakens fail-closed verification or evidence-first contracts.",
    "Freeform chat or open-ended research agent browsing.",
    "Legal advice, negotiation posture, or materiality decisions.",
    "Universal coverage of all title company formats or survey styles.",
    "Geometry overlays for easements (we link to evidence; we do not render corridors).",
    "Human-in-the-loop ambiguity resolution / selection persistence (v1 shows candidates only; no choose correct doc flow).",
    "Any prose-parsing fallback when structured payload is missing/invalid for list-shaped artefacts."
  ],
  "successMetrics": [
    "Quick Start produces the three artefacts for pack_01_clean with locked citations and deterministic outputs.",
    "Known failure journeys (missing docs, bad citations) are surfaced as missing_input / citation_failed per taxonomy, and exports are blocked by default when citation_failed exists.",
    "Fixture/eval infrastructure supports regression detection vs /truth."
  ],
  "openQuestions": [
    "Payload representation decision (SP-2.7): where structured artefact payload lives and how API exposes it.",
    "Retrieval Recall@K baseline (SP-2.8): are we retrieving the right evidence before drafting?",
    "Scan torture honesty policy: when to downgrade to missing_input vs emit unknown items safely.",
    "Human-in-the-loop ambiguity resolution: if later allowed, it must re-verify and must not mutate immutable citations."
  ],
  "stack": {
    "framework": "Next.js (apps/web) + packages/core + WDK workflows/steps",
    "hosting": "TBD (PoC)",
    "database": "Postgres + pgvector (canonical state) (docs/03-architecture/30_data_model.md)",
    "auth": "TBD / not specified"
  },
  "routes": [],
  "uiNotes": [
    "Quick Start is artefacts-first and should surface deterministic progress and artefacts views.",
    "Exports and trust gates must remain fail-closed by default.",
    "List-shaped artefacts must render from payload_json (no prose parsing fallback).",
    "Ambiguity is surfaced explicitly (candidates shown; no v1 persistence)."
  ],
  "dataModel": [
    {
      "entity": "runs",
      "fields": [
        "index_version",
        "agent_bundle_version",
        "question_set_version",
        "state"
      ]
    },
    {
      "entity": "report_rows",
      "fields": [
        "status",
        "citation_ids",
        "payload_schema_version",
        "payload_json"
      ]
    },
    {
      "entity": "citations",
      "fields": [
        "immutable locked citation_id",
        "document_id",
        "page_number",
        "polygons",
        "snippet_hash"
      ]
    }
  ],
  "importFormat": {
    "description": "Quick Start operates on fixture packs under docs/08-example-data/ and compares key outputs against each pack's /truth.",
    "example": {
      "packId": "pack_01_clean",
      "packsSummary": "docs/08-example-data/packs_summary.md"
    }
  },
  "rules": [
    "Evidence-first (ADR-0001): drafting uses candidate chunk_id values; rows refer to locked citation_id values only.",
    "Verification is fail-closed (ADR-0002): integrity/invariant failures yield citation_failed; blocked from export by default. (ADR-0017: v1 is integrity-only.)",
    "OCR/layout extraction is default for all PDFs (ADR-0003) for geometry highlights.",
    "Retrieval returns IDs (ADR-0004): chunk IDs + scores; provenance stores IDs, not prose.",
    "Orchestration via WDK (ADR-0005): use workflow controller; use step side effects; step idempotency via deterministic step_key.",
    "Fixtures + evals are first-class (ADR-0006): success is measurable vs /truth.",
    "No external web research inside runs (ADR-0007).",
    "APIs use a safe error envelope with trace_id (ADR-0008); never leak internal errors/provider payloads."
  ],
  "qualityGates": [
    "pnpm verify",
    "pnpm fixture:eval:all"
  ],
  "dependencies": [
    "Initiative 0001 trust substrate must exist for citation locking + immutable citations, click-to-jump PDF viewer highlights, report-row status invariants, and export gating UX."
  ],
  "fixtureAnchors": {
    "canonicalPackList": "docs/08-example-data/packs_summary.md",
    "primaryAnchors": [
      "pack_01_clean",
      "pack_02_missing_rea",
      "pack_03_mismatch_and_cert_gap",
      "pack_07_scans_rotated_low_quality"
    ]
  },
  "slicePrds": [
    {
      "path": "docs/04-projects/02-features/0002_quick-start-engine/prds/0002a_run-skeleton/prd.md",
      "summary": "Runs API + version pinning + WDK workflow skeleton + incremental UI progress, with strict invariants."
    },
    {
      "path": "docs/04-projects/02-features/0002_quick-start-engine/prds/0002b_row-payload-contract/prd.md",
      "summary": "Decide and implement list payload storage + schema versioning + UI rendering contract for artefact tables."
    },
    {
      "path": "docs/04-projects/02-features/0002_quick-start-engine/prds/0002c_commitment-parsing-pack-01-clean/prd.md",
      "summary": "Commitment parsing baseline for pack_01_clean producing B-I + B-II payloads matching truth key fields."
    },
    {
      "path": "docs/04-projects/02-features/0002_quick-start-engine/prds/0002d_exception-matching-pack-01-02/prd.md",
      "summary": "Exception to instrument matching baseline + missing-doc journey on pack_02_missing_rea; ambiguity surfaced without silent pick."
    },
    {
      "path": "docs/04-projects/02-features/0002_quick-start-engine/prds/0002e_survey-extraction-pack-01-03/prd.md",
      "summary": "Survey extraction baseline + certification gap issue on pack_03_mismatch_and_cert_gap with locked citations."
    },
    {
      "path": "docs/04-projects/02-features/0002_quick-start-engine/prds/0002f_reconciliation-honesty-pack-03-07/prd.md",
      "summary": "Reconciliation issues list with honesty policy: bias to unknown; not_depicted requires positive evidence of absence."
    }
  ],
  "stories": [
    {
      "id": "US-001",
      "title": "Run Surface Skeleton (Slice 0002a)",
      "status": "open",
      "dependsOn": [],
      "description": "As a user, I can start Quick Start and observe deterministic progress and incremental rows via the canonical run API and WDK workflow skeleton.",
      "acceptanceCriteria": [
        "Example: On fixture packs pack_01_clean and pack_02_missing_rea, Quick Start can start and progress deterministically with incremental UI progress.",
        "Slice is implemented per docs/04-projects/02-features/0002_quick-start-engine/prds/0002a_run-skeleton/prd.md.",
        "Negative: No duplicate rows are produced on retries; step idempotency via step_key and unique (run_id, question_id) is enforced.",
        "Negative: APIs return safe error envelope with trace_id and do not leak internal/provider payloads (ADR-0008)."
      ]
    },
    {
      "id": "US-002",
      "title": "Row Payload Contract + Table Rendering (Slice 0002b)",
      "status": "open",
      "dependsOn": [
        "US-001"
      ],
      "description": "As a user, artefact rows are structured and renderable as deterministic tables from versioned payload_json with item-level locked citations.",
      "acceptanceCriteria": [
        "Example: Artefact rows render as tables in the UI from payload_json with item-level citation chips that jump-to-evidence.",
        "Slice is implemented per docs/04-projects/02-features/0002_quick-start-engine/prds/0002b_row-payload-contract/prd.md.",
        "Negative: No prose parsing fallback exists when payload_json is missing/invalid; the system fails safely and remains honest."
      ]
    },
    {
      "id": "US-003",
      "title": "Commitment Parsing Baseline (Slice 0002c)",
      "status": "open",
      "dependsOn": [
        "US-002"
      ],
      "description": "As a user, pack_01_clean yields B-I requirements and B-II exceptions structured payloads that match truth key fields with locked citations and fail-closed verification.",
      "acceptanceCriteria": [
        "Example: For pack_01_clean, B-I and B-II payloads match /truth key fields per comparator rules.",
        "Slice is implemented per docs/04-projects/02-features/0002_quick-start-engine/prds/0002c_commitment-parsing-pack-01-clean/prd.md.",
        "Negative: 0 false positives by item number; no extra items not present in truth are emitted.",
        "Negative: Verification is fail-closed; mismatches yield citation_failed and exports remain blocked by default."
      ]
    },
    {
      "id": "US-004",
      "title": "Exception to Instrument Matching (Slice 0002d)",
      "status": "open",
      "dependsOn": [
        "US-003"
      ],
      "description": "As a user, exceptions are deterministically linked to instrument PDFs (or surfaced as ambiguous/missing_doc) without silent false matches, proven on pack_01_clean and pack_02_missing_rea.",
      "acceptanceCriteria": [
        "Example: For pack_01_clean, truth-linked exceptions resolve to matched with evidence.",
        "Example: For pack_02_missing_rea, missing REA is surfaced as missing_doc with checklist.",
        "Slice is implemented per docs/04-projects/02-features/0002_quick-start-engine/prds/0002d_exception-matching-pack-01-02/prd.md.",
        "Negative: No silent auto-pick; ambiguous cases remain ambiguous with candidates listed."
      ]
    },
    {
      "id": "US-005",
      "title": "Survey Extraction Baseline + Cert Gap (Slice 0002e)",
      "status": "open",
      "dependsOn": [
        "US-002"
      ],
      "description": "As a user, survey certification parties and supported callouts are extracted with locked citations, and a structured cert gap issue code is emitted for the cert gap pack.",
      "acceptanceCriteria": [
        "Example: For pack_01_clean and pack_03_mismatch_and_cert_gap, survey extraction produces structured outputs with evidence.",
        "Slice is implemented per docs/04-projects/02-features/0002_quick-start-engine/prds/0002e_survey-extraction-pack-01-03/prd.md.",
        "Negative: No fabricated callouts or lender names; when evidence cannot be locked, downgrade safely (unknown/missing_input)."
      ]
    },
    {
      "id": "US-006",
      "title": "Reconciliation Issues Honesty Policy (Slice 0002f)",
      "status": "open",
      "dependsOn": [
        "US-004",
        "US-005"
      ],
      "description": "As a user, reconciliation issues are classified honestly (depicted|not_depicted|unknown) with strict evidence thresholds and actionable guidance under uncertainty.",
      "acceptanceCriteria": [
        "Example: For pack_03_mismatch_and_cert_gap and pack_07_scans_rotated_low_quality, reconciliation issues are generated with classifications and guidance copy.",
        "Slice is implemented per docs/04-projects/02-features/0002_quick-start-engine/prds/0002f_reconciliation-honesty-pack-03-07/prd.md.",
        "Negative: not_depicted requires positive evidence of absence; under uncertainty the system biases to unknown or missing_input."
      ]
    }
  ],
  "userStories": [
    {
      "id": "US-001",
      "title": "Run Surface Skeleton (Slice 0002a)",
      "description": "As a user, I can start Quick Start and observe deterministic progress and incremental rows via the canonical run API and WDK workflow skeleton.",
      "acceptanceCriteria": [
        "Example: On fixture packs pack_01_clean and pack_02_missing_rea, Quick Start can start and progress deterministically with incremental UI progress.",
        "No duplicate rows are produced on retries; step idempotency via step_key and unique (run_id, question_id) is enforced.",
        "APIs return safe error envelope with trace_id and do not leak internal/provider payloads."
      ],
      "priority": 1
    },
    {
      "id": "US-002",
      "title": "Row Payload Contract + Table Rendering (Slice 0002b)",
      "description": "As a user, artefact rows are structured and renderable as deterministic tables from versioned payload_json with item-level locked citations.",
      "acceptanceCriteria": [
        "Artefact rows render as tables in the UI from payload_json with item-level citation chips that jump-to-evidence.",
        "No prose parsing fallback exists when payload_json is missing/invalid; the system fails safely and remains honest."
      ],
      "priority": 2
    },
    {
      "id": "US-003",
      "title": "Commitment Parsing Baseline (Slice 0002c)",
      "description": "As a user, pack_01_clean yields B-I requirements and B-II exceptions structured payloads that match truth key fields with locked citations and fail-closed verification.",
      "acceptanceCriteria": [
        "For pack_01_clean, B-I and B-II payloads match /truth key fields per comparator rules.",
        "0 false positives by item number; no extra items not present in truth are emitted.",
        "Verification is fail-closed; mismatches yield citation_failed and exports remain blocked by default."
      ],
      "priority": 3
    },
    {
      "id": "US-004",
      "title": "Exception to Instrument Matching (Slice 0002d)",
      "description": "As a user, exceptions are deterministically linked to instrument PDFs (or surfaced as ambiguous/missing_doc) without silent false matches, proven on pack_01_clean and pack_02_missing_rea.",
      "acceptanceCriteria": [
        "For pack_01_clean, truth-linked exceptions resolve to matched with evidence.",
        "For pack_02_missing_rea, missing REA is surfaced as missing_doc with checklist.",
        "No silent auto-pick; ambiguous cases remain ambiguous with candidates listed."
      ],
      "priority": 4
    },
    {
      "id": "US-005",
      "title": "Survey Extraction Baseline + Cert Gap (Slice 0002e)",
      "description": "As a user, survey certification parties and supported callouts are extracted with locked citations, and a structured cert gap issue code is emitted for the cert gap pack.",
      "acceptanceCriteria": [
        "For pack_01_clean and pack_03_mismatch_and_cert_gap, survey extraction produces structured outputs with evidence.",
        "No fabricated callouts or lender names; when evidence cannot be locked, downgrade safely (unknown/missing_input)."
      ],
      "priority": 5
    },
    {
      "id": "US-006",
      "title": "Reconciliation Issues Honesty Policy (Slice 0002f)",
      "description": "As a user, reconciliation issues are classified honestly (depicted|not_depicted|unknown) with strict evidence thresholds and actionable guidance under uncertainty.",
      "acceptanceCriteria": [
        "For pack_03_mismatch_and_cert_gap and pack_07_scans_rotated_low_quality, reconciliation issues are generated with classifications and guidance copy.",
        "not_depicted requires positive evidence of absence; under uncertainty the system biases to unknown or missing_input."
      ],
      "priority": 6
    }
  ],
  "metadata": {
    "owner": "",
    "status": "Draft (NO-GO until key spikes close)",
    "date": "2026-02-08",
    "slug": "0002-quick-start-engine",
    "sourceMarkdown": "docs/04-projects/02-features/0002_quick-start-engine/prd.md"
  },
  "sources": [
    "docs/04-projects/02-features/0002_quick-start-engine/prd-overall.md",
    "docs/04-projects/02-features/0002_quick-start-engine/prd-overall.json",
    "docs/04-projects/02-features/0002_quick-start-engine/brief.md",
    "docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md",
    "docs/04-projects/02-features/0002_quick-start-engine/risk-register.md",
    "docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md",
    "docs/04-projects/02-features/0002_quick-start-engine/prds/0002a_run-skeleton/prd.md",
    "docs/04-projects/02-features/0002_quick-start-engine/prds/0002b_row-payload-contract/prd.md",
    "docs/04-projects/02-features/0002_quick-start-engine/prds/0002c_commitment-parsing-pack-01-clean/prd.md",
    "docs/04-projects/02-features/0002_quick-start-engine/prds/0002d_exception-matching-pack-01-02/prd.md",
    "docs/04-projects/02-features/0002_quick-start-engine/prds/0002e_survey-extraction-pack-01-03/prd.md",
    "docs/04-projects/02-features/0002_quick-start-engine/prds/0002f_reconciliation-honesty-pack-03-07/prd.md"
  ]
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/scripts/fixtures/lib/geometry.ts
```ts
export type BBox = readonly [xMin: number, yMin: number, xMax: number, yMax: number];
export type NormPoint = readonly [x: number, y: number];
export type NormPolygon = readonly NormPoint[];
export type NormPolygons = readonly NormPolygon[];

export function bboxContainsPoint(bbox: BBox, point: NormPoint): boolean {
  const [xMin, yMin, xMax, yMax] = bbox;
  const [x, y] = point;
  return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
}

export function bboxCenter(bbox: BBox): NormPoint {
  const [xMin, yMin, xMax, yMax] = bbox;
  return [(xMin + xMax) / 2, (yMin + yMax) / 2] as const;
}

export function polygonsToBBox(polygons: NormPolygons): BBox | null {
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;

  let sawPoint = false;
  for (const poly of polygons) {
    for (const [x, y] of poly) {
      sawPoint = true;
      xMin = Math.min(xMin, x);
      yMin = Math.min(yMin, y);
      xMax = Math.max(xMax, x);
      yMax = Math.max(yMax, y);
    }
  }

  if (!sawPoint) return null;
  return [xMin, yMin, xMax, yMax] as const;
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/20_state_model.md
```md
# State model

> Note: This document describes the **target** state model. For what is implemented today, see
> `docs/03-architecture/07_current_poc_runtime.md`.

This doc defines the state machines and invariants for the PoC. Keep this as the canonical reference and link to it from other docs.

## Principles (why these states exist)
- Prefer monotonic state machines: a state should only move "forward" unless a user explicitly retries/restarts.
- States can be stored for UI convenience, but they must be derivable from persisted facts and remain consistent.
- Fail safe: if we cannot prove an answer is supported by locked evidence, we do not export it (ADR-0002).
- Keep states small and explicit. Avoid "magic" implied meaning in free-form JSON.

## Terminology
- **Folder** is the DB/API name for a workspace container. In the UI we call it a **Matter**.
- A **Run** is one execution of a Quick Start workflow for a folder.
- A **Report row** is the persisted output for a `(run_id, question_id)` pair.
- A **Citation** is an immutable, locked evidence object (snippet + hash + geometry) referenced by `citation_id` (ADR-0001).
- States are stored on rows for convenience, but must remain consistent with the invariants below.
- If stored state and derived state disagree, derived state wins (treat stored state as stale and recompute).

## Version pinning (cross-cutting invariants)
Runs must pin the versions they executed with (see `docs/03-architecture/30_data_model.md`):
- `index_version`: which retrieval substrate (chunks + indices) was used.
- `agent_bundle_version`: prompts + schemas + step logic version (git SHA is fine for PoC).
- `question_set_version`: which question set was used.

Why:
- Replays and evals need to answer: "what code + schema + questions produced this row?"

## Folder state (`folders.state`)
States:
- `empty`
- `ingesting`
- `indexed`
- `ready`
- `failed` (terminal until a new ingest attempt is started)

Invariants (must hold):
- `empty`
  - folder has zero documents
- `ingesting`
  - at least one document is not in terminal ingest state (`parse_status != parsed` OR `ocr_status != done`)
  - OR derived retrieval substrate (chunks/indexes) is not built for `folders.latest_index_version`
- `indexed`
  - all documents are in terminal ingest state (`parse_status = parsed` AND `ocr_status = done`)
  - chunks exist for each document for `folders.latest_index_version`
  - folder is runnable (Quick Start can start), even if some docs are low quality
- `ready`
  - all `indexed` invariants hold
  - AND folder health checks pass (see below)
- `failed`
  - one or more documents have terminal `failed` ingest status OR a folder-level indexing job failed

Folder “ready” health checks (PoC defaults):
- no documents are `parse_status = failed` or `ocr_status = failed`
- for every document: `extraction_quality >= 0.60` (configurable; keep the threshold in eval fixtures)
- for every document: `page_count` is set AND `document_pages` count matches `page_count`

Allowed transitions (monotonic, except for retry):
- `empty` → `ingesting` (first upload starts)
- `ingesting` → `indexed` (all docs ingested + chunked + indexed for latest_index_version)
- `indexed` → `ready` (health checks pass)
- `ingesting|indexed|ready` → `failed` (non-recoverable ingest/index error)
- `failed` → `ingesting` (explicit retry/re-ingest; bumps `latest_index_version`)

Notes:
- Quick Start can start in `indexed` as well as `ready` (the "ready checks" are demo quality gates, not a hard requirement to run).
- `folders.state` should be explainable in the UI. If we introduce a new state, also define:
  - the user-facing label
  - the primary remediation action (retry, re-upload, contact support)

## Document state (`documents.parse_status`, `documents.ocr_status`)
Parse status:
- `queued` → `parsing` → `parsed` | `failed`

OCR status:
- `queued` → `running` → `done` | `failed`

Invariants (must hold):
- If `parse_status` is `parsing|parsed` then `storage_key` must be set and the raw PDF must exist in object storage.
- If `parse_status` is `parsed` then `page_count` must be set (>= 1).
- If `ocr_status` is `done` then `document_pages` must exist for every page with `text` and `layout_json`.
- `extraction_quality` is only meaningful when `ocr_status = done` (else set NULL or 0 and do not use it for decisions).

### extraction_quality (PoC definition)
`documents.extraction_quality` is a normalised 0..1 score derived from extraction output.

Current PoC (pdf.js text extraction):
- chars-per-page heuristic (see `documents.metadata_json.extraction_quality_method`, e.g. `pdfjs_text_chars_per_page_v2`)

Target PoC (OCR/layout provider):
- provider mean line confidence (or equivalent), clamped to [0..1]

Rules:
- Only set when `ocr_status = done`.
- Record `extraction_quality_method` (string) in `documents.metadata_json.extraction_quality_method` so we can re-run and compare scores across changes.
- If the method changes, bump `index_version` (ADR-0015) and treat as a fixture-breaking change.

## Run state
Runs are the execution record for a single Quick Start attempt. Runs must pin the versions they executed with (see `docs/03-architecture/30_data_model.md`).

States:
- `created` (row exists, workflow not started)
- `running` (workflow is active)
- `completed` (workflow finished and wrote a terminal row for every question)
- `partial` (workflow stopped early but wrote at least one row)
- `failed` (workflow stopped early and wrote zero trustworthy rows)
- `cancelled` (optional; user-cancel)

Invariants (must hold):
- `completed`
  - for the question set version used by the run: exactly one `report_rows` record exists per `question_id`
  - every report row is in a terminal status (`needs_review|reviewed|missing_input|citation_failed`)
- `partial`
  - at least one report row exists
  - at least one `question_id` is missing a row (run stopped before finishing)
- `failed`
  - zero report rows exist OR all produced rows are explicitly marked non-exportable (e.g. `citation_failed`)

Allowed transitions:
- `created` → `running`
- `running` → `completed|partial|failed|cancelled`

## Run step state (`run_steps.state`)
Run steps are the durable execution log of side effects (OCR, embed, retrieve, draft, lock, verify, write, export). Steps make retries and resumability observable.

States:
- `queued` (scheduled but not started)
- `running`
- `succeeded` (terminal)
- `failed` (terminal)

Invariants (must hold):
- A step must be idempotent: retries must not duplicate `report_rows` or `citations`.
- A step attempt counter increments on each retry; attempt `1` is the first execution.
- `metrics_json` should be safe and structured (timings, token/cost usage, chunk counts). No raw PDF text.
- `error_json` must be safe to show to a user when needed (no provider payloads; no stack traces).

## Report row state (`report_rows.status`)
Statuses (terminal for the workflow):
- `needs_review` (verification passed; user may review)
- `reviewed` (user confirmed)
- `missing_input` (no supporting evidence in provided docs)
- `citation_failed` (verification failed or citation lock mismatch)

Invariants (must hold):
- Rows are scoped to a run: exactly one row per `(run_id, question_id)`.
- `needs_review|reviewed`
  - row has >= 1 citation
  - every citation is **locked** (stores snippet + hash + geometry) and is associated to this row
- `missing_input`
  - `answer` must be exactly: `Not found in provided documents.`
  - citations list must be empty
  - `notes` (or provenance) must include an actionable missing-doc checklist
- `citation_failed`
  - citations may exist, but the row is non-exportable by default
  - store a safe failure reason code in provenance (e.g. `CITATION_MISMATCH`, `VALIDATION_ERROR`, `NO_CITATIONS`)
  - Note (PoC v1): reason codes are integrity-only (ADR-0017). Entailment codes are reserved for a later, gated version.

User-driven transitions:
- `needs_review` → `reviewed` (only via explicit user action)

Export gating (PoC defaults):
- Exports are only allowed when `runs.state = completed` (PoC default).
- If any row in the selected run is `citation_failed`, export returns `EXPORT_BLOCKED` unless `unsafe_override = true` is provided.
  - Unsafe override is intended to be demo-only. See `docs/03-architecture/50_api_surface.md` for the HTTP contract and guardrails.

Notes:
- Do not invent new `report_rows.status` values. If you need additional per-item classification (eg survey issue `unknown`), store it inside the row payload/provenance, not by adding row statuses.
- The UI must reflect gating truthfully: "blocked" is a first-class state, not an exception.

## Suggested invariant checks (SQL; run in debug/evals)
These are optional, but they make "broken windows" obvious.

1) Report rows are 1:1 per run/question
```sql
select run_id, question_id, count(*) as n
from report_rows
group by run_id, question_id
having count(*) > 1;
```

2) `missing_input` rows have no citations and exact string answer
```sql
select rr.id
from report_rows rr
left join citations c on c.report_row_id = rr.id
where rr.status = 'missing_input'
group by rr.id, rr.answer
having rr.answer <> 'Not found in provided documents.' or count(c.id) > 0;
```

3) Export gating sanity: runs marked `completed` must have only terminal row statuses
```sql
select r.id
from runs r
join report_rows rr on rr.run_id = r.id
where r.state = 'completed'
  and rr.status not in ('needs_review', 'reviewed', 'missing_input', 'citation_failed')
group by r.id;
```

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/specs/list_verification_policy_v1.md
```md
# List Verification Policy v1 (Initiative 0002)

This doc pins the *intended* verification semantics for list-shaped artefact rows (B-I/B-II/issues).
It should be validated and refined by SP-2.11.

ADR-0017 scope note: v1 verification is **integrity-only**. Semantic correctness is a reviewer responsibility.
Runtime entailment checks are out of scope for v1 (future/eval-only).

Constraints:
- Fail-closed posture (ADR-0002): unsupported claims must not survive.
- Immutable locked citations (ADR-0001): once a `citation_id` exists, it is not mutated.
- Row status invariants remain unchanged (`docs/03-architecture/20_state_model.md`).

## Unit of verification

Verify at the **item** level (integrity-only):
- Any item that contains one or more material claims must have at least one locked citation attached to the same item (`item.citation_ids.length > 0`).
- "Display-only" fields (e.g. `notes`) may be excluded from the definition of a "material claim".
- This check does **not** assert semantic correctness or entailment of the claim by the cited text.

Notes:
- `list_payload_v0` only supports item-level `citation_ids` and does not provide per-field citation attachment. Field-level verification is therefore out of scope for v1 and should be introduced with a schema revision (e.g. `list_payload_v1`) if/when required.

## Partial failures (decision pending SP-2.11)

Two viable policies:

1. **Strict policy (simplest):** any failed integrity check => entire row becomes `citation_failed`.
2. **Repair policy (preferred if safe):** verifier is allowed to downgrade or remove unsupported items (e.g. set `item_classification="unknown"`, drop an item that cannot be backed by citations) and re-verify, so the row can remain verifiable without fabricating claims.

SP-2.11 should choose one policy explicitly and record:
- what counts as a "material claim"
- how downgrades/removals are represented in `payload_json`
- how provenance records downgrade/repair actions (safe reason codes)

## Required provenance (minimum)

When verification runs, provenance must include (safe):
- verifier implementation version (e.g. git SHA) + mode (e.g. `deterministic-only`)
- verdict (`pass|fail`)
- reason code on failure (`CITATION_MISMATCH`, `MISSING_CITATION`, etc)
- optional downgrade/repair actions taken (if policy 2 is chosen)

```

File: /Users/marc/Code/personal-projects/orbital-poc/scripts/fixtures/assert_citation_integrity.ts
```ts
import { readFile, writeFile } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";

import { hashSnippet } from "../../packages/core/src/citations/snippet.ts";

import { parseArgs, getStringArg, requireStringArg } from "./lib/args.ts";
import { assertIsSnapshot, isRecord } from "./lib/snapshot.ts";

type ManifestDoc = {
  filename: string;
  layout_file?: string;
  anchors_file?: string;
};

type Manifest = {
  pack_id: string;
  documents: ManifestDoc[];
};

type LayoutFile = {
  pages: Array<{ page: number }>;
};

type IntegrityError = {
  code: string; // canonical taxonomy code
  kind: string;
  question_id?: string;
  citation_id?: string;
  message: string;
  details?: unknown;
};

function repoRoot(): string {
  return process.cwd();
}

function packRoot(packId: string): string {
  return path.resolve(repoRoot(), "docs/08-example-data", packId);
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

function asNonEmptyString(val: unknown): string | null {
  return typeof val === "string" && val.trim() ? val.trim() : null;
}

function asPositiveInt(val: unknown): number | null {
  if (typeof val !== "number" || !Number.isFinite(val)) return null;
  if (!Number.isInteger(val) || val <= 0) return null;
  return val;
}

function validatePolygons(polygons: unknown): { ok: true } | { ok: false; message: string } {
  if (!Array.isArray(polygons) || polygons.length < 1) return { ok: false, message: "polygons must be a non-empty array" };
  for (const poly of polygons) {
    if (!Array.isArray(poly) || poly.length < 3) return { ok: false, message: "each polygon must have >= 3 points" };
    for (const pt of poly) {
      if (!Array.isArray(pt) || pt.length !== 2) return { ok: false, message: "each point must be a [x,y] tuple" };
      const [x, y] = pt;
      if (typeof x !== "number" || typeof y !== "number") return { ok: false, message: "polygon points must be numbers" };
      if (!Number.isFinite(x) || !Number.isFinite(y)) return { ok: false, message: "polygon points must be finite numbers" };
      if (x < 0 || x > 1 || y < 0 || y > 1) return { ok: false, message: "polygon points must be in [0..1]" };
    }
  }
  return { ok: true };
}

function loadManifest(packId: string): Manifest {
  const manifestPath = path.resolve(packRoot(packId), "manifest.json");
  if (!fs.existsSync(manifestPath)) throw new Error(`manifest.json not found for pack: ${packId}`);
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as unknown;
  if (!isRecord(raw)) throw new Error(`manifest.json must be an object: ${manifestPath}`);

  const pid = asNonEmptyString(raw.pack_id) ?? packId;
  const docsRaw = raw.documents;
  if (!Array.isArray(docsRaw)) throw new Error(`manifest.json documents must be an array: ${manifestPath}`);

  const documents: ManifestDoc[] = [];
  for (const d of docsRaw) {
    if (!isRecord(d)) continue;
    const filename = asNonEmptyString(d.filename);
    if (!filename) continue;
    const layout_file = asNonEmptyString(d.layout_file) ?? undefined;
    const anchors_file = asNonEmptyString(d.anchors_file) ?? undefined;
    documents.push({ filename, layout_file, anchors_file });
  }

  return { pack_id: pid, documents };
}

function findDoc(manifest: Manifest, filename: string): ManifestDoc | null {
  return manifest.documents.find((d) => d.filename === filename) ?? null;
}

function layoutPathFor(manifest: Manifest, packRootDir: string, filename: string): string | null {
  const doc = findDoc(manifest, filename);
  if (!doc?.layout_file) return null;
  return path.join(packRootDir, doc.layout_file);
}

async function pageExists(args: { packId: string; manifest: Manifest; docFilename: string; pageNumber: number }): Promise<boolean> {
  const root = packRoot(args.packId);
  const layoutPath = layoutPathFor(args.manifest, root, args.docFilename);
  if (layoutPath && fs.existsSync(layoutPath)) {
    const layout = await readJsonFile<LayoutFile>(layoutPath);
    const pages = Array.isArray((layout as any)?.pages) ? (layout as any).pages : [];
    return pages.some((p: any) => typeof p?.page === "number" && p.page === args.pageNumber);
  }

  const producedDocsPath = path.resolve(root, "produced", "documents.json");
  if (fs.existsSync(producedDocsPath)) {
    const docs = await readJsonFile<Array<{ filename: string; page_count: number }>>(producedDocsPath);
    const found = docs.find((d) => d.filename === args.docFilename);
    if (found && typeof found.page_count === "number" && Number.isFinite(found.page_count) && found.page_count > 0) {
      return args.pageNumber >= 1 && args.pageNumber <= found.page_count;
    }
  }

  // No layout/documents index to validate against.
  throw new Error(`No layout_file or produced/documents.json to validate page for doc=${args.docFilename}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const snapshotPath = path.resolve(requireStringArg(args, "snapshot"));
  const outPath = getStringArg(args, "out") ? path.resolve(getStringArg(args, "out")!) : undefined;

  const snapshotRaw = JSON.parse(await readFile(snapshotPath, "utf8")) as unknown;
  const snapshot = assertIsSnapshot(snapshotRaw);
  const packId = snapshot.meta.pack_id;
  const manifest = loadManifest(packId);

  const errors: IntegrityError[] = [];

  const checked: Array<{ question_id: string; citation_id: string }> = [];

  for (const row of snapshot.rows) {
    if (!row || typeof row !== "object") continue;
    if (row.status !== "needs_review" && row.status !== "reviewed") continue;

    const qid = row.question_id;
    const cids = Array.isArray(row.citation_ids) ? row.citation_ids.filter((x) => typeof x === "string" && x.trim()) : [];

    for (const cid of cids) {
      checked.push({ question_id: qid, citation_id: cid });

      const cit = (snapshot.citations as any)[cid];
      if (!cit || typeof cit !== "object") {
        errors.push({
          code: "VALIDATION_ERROR",
          kind: "citation_missing",
          question_id: qid,
          citation_id: cid,
          message: "citation_id did not resolve in snapshot.citations",
        });
        continue;
      }

      const docFilename = asNonEmptyString(cit.document_filename);
      const pageNumber = asPositiveInt(cit.page_number);
      const snippet = typeof cit.snippet === "string" ? cit.snippet : null;
      const snippetHash = asNonEmptyString(cit.snippet_hash);

      if (!docFilename || !pageNumber || snippet === null || !snippetHash) {
        errors.push({
          code: "VALIDATION_ERROR",
          kind: "citation_invalid",
          question_id: qid,
          citation_id: cid,
          message: "citation must include document_filename, page_number, snippet, and snippet_hash",
          details: { document_filename: cit.document_filename, page_number: cit.page_number },
        });
        continue;
      }

      try {
        const ok = await pageExists({ packId, manifest, docFilename, pageNumber });
        if (!ok) {
          errors.push({
            code: "VALIDATION_ERROR",
            kind: "page_out_of_bounds",
            question_id: qid,
            citation_id: cid,
            message: `cited page does not exist in document (doc=${docFilename} page=${pageNumber})`,
          });
        }
      } catch (err) {
        errors.push({
          code: "VALIDATION_ERROR",
          kind: "page_validation_unavailable",
          question_id: qid,
          citation_id: cid,
          message: `could not validate cited page exists (doc=${docFilename} page=${pageNumber})`,
          details: { error: String((err as any)?.message ?? err) },
        });
      }

      const polyCheck = validatePolygons(cit.polygons);
      if (!polyCheck.ok) {
        errors.push({
          code: "VALIDATION_ERROR",
          kind: "missing_polygons",
          question_id: qid,
          citation_id: cid,
          message: `polygons invalid: ${polyCheck.message}`,
        });
      }

      const computed = hashSnippet(snippet);
      if (computed !== snippetHash) {
        errors.push({
          code: "CITATION_MISMATCH",
          kind: "snippet_hash_mismatch",
          question_id: qid,
          citation_id: cid,
          message: "snippet_hash did not match the canonical hash of snippet",
          details: { expected: computed, actual: snippetHash },
        });
      }
    }
  }

  const result = {
    pass: errors.length === 0,
    snapshot_path: snapshotPath,
    pack_id: packId,
    checked_citations: checked.length,
    error_count: errors.length,
    errors,
  };

  if (outPath) await writeFile(outPath, JSON.stringify(result, null, 2) + "\n", "utf8");

  if (result.pass) {
    process.stdout.write(`PASS citation integrity (${packId}) citations=${checked.length}\n`);
    process.exit(0);
  }

  process.stdout.write(`FAIL citation integrity (${packId}) - ${errors.length} error(s)\n`);
  for (const e of errors.slice(0, 20)) {
    process.stdout.write(`- ${e.question_id ?? "(no question_id)"}: ${e.code} ${e.kind}: ${e.message}\n`);
  }
  if (errors.length > 20) process.stdout.write(`(showing first 20)\n`);
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(String((err as any)?.stack ?? err) + "\n");
  process.exit(2);
});

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/30_data_model.md
```md
# Data model (Postgres + pgvector)

> Note: This document describes the **target** data model. The current PoC schema is created at runtime in
> `apps/web/lib/db.server.ts` and may be a minimal subset (and therefore drift from the recommendations below).

This is the canonical DB shape for the PoC “trust spine”: ingest → retrieve → draft → verify → report rows with locked citations.

Design rules (PoC)
- Postgres is the source of truth for state and auditability (ADR-0011 accepted).
- Prefer append-only records for "what happened" (runs, steps, report_rows, citations, artefacts).
- Citations are immutable once created (ADR-0001).
- Retrieval substrate is versioned. A new ingest/re-index bumps `folders.latest_index_version` and produces new `chunks` rows for that version.
- Everything that materially affects outputs should be pinnable on a run: `index_version`, `agent_bundle_version`, `question_set_version` (`docs/03-architecture/20_state_model.md`).

## ERD
```mermaid
erDiagram
  FOLDERS ||--o{ DOCUMENTS : contains
  DOCUMENTS ||--o{ DOCUMENT_PAGES : has
  DOCUMENTS ||--o{ CHUNKS : yields
  FOLDERS ||--o{ RUNS : has
  RUNS ||--o{ RUN_STEPS : has
  RUNS ||--o{ REPORT_ROWS : produces
  REPORT_ROWS ||--o{ CITATIONS : cites
  DOCUMENTS ||--o{ CITATIONS : referenced_by
  FOLDERS ||--o{ ARTEFACTS : exports
```

## Encoding conventions (recommended)
- IDs are opaque strings (optionally prefixed, eg `fld_`, `doc_`, `run_`, `row_`, `cit_`).
- Timestamps are `timestamptz` in UTC.
- JSON columns are `jsonb` and must be "safe": no provider payload dumps, no stack traces, no raw PDF bytes.
- Arrays should be explicit JSON arrays; avoid comma-separated strings.

## Data sensitivity (explicit)
This system stores extracted document text in Postgres (e.g. `document_pages.text`, `chunks.text`, `citations.snippet`) and raw PDFs in object storage.
Treat both as confidential customer data.

Minimum PoC posture:
- Encrypt storage and database volumes at rest where possible.
- Backups are sensitive (DB dumps contain extracted text).
- Do not log raw extracted text or raw PDF bytes.
- Provider calls (OCR/LLM/embeddings) may transmit document content externally; disclose and gate by config.

## Trust spine tables (minimum viable)

### `folders`
- `id`, `name`, `state`, `created_at`, `updated_at`
- `latest_index_version` (string; bumps on re-ingest/re-index)

Recommended constraints:
- `state` should be constrained to the folder state machine values (`docs/03-architecture/20_state_model.md`).

### `documents`
- `id`, `folder_id`, `filename`, `mime`, `bytes`
- `sha256` (dedupe), `storage_key`, `page_count`
- `parse_status`, `ocr_status`, `extraction_quality`
- `metadata_json` (jsonb; safe document metadata for provenance and evals)
- `error_json` (safe ingest failure details)

Recommended constraints:
- FK `documents.folder_id -> folders.id` (ON DELETE CASCADE or RESTRICT; choose intentionally).
- Unique `(documents.folder_id, documents.sha256)` to avoid duplicates within a matter.
  - Recommended `documents.metadata_json` fields (PoC):
    - `extraction_quality_method` (string; versioned name of the quality scoring method used)

### `document_pages`
- `id`, `document_id`, `page_number`
- `text` (canonical)
- `layout_json` (tokens/lines/blocks + polygons)

Recommended constraints:
- FK `document_pages.document_id -> documents.id`.
- Unique `(document_pages.document_id, document_pages.page_number)`.

### `chunks`
- `id`, `document_id`
- `index_version` (string; matches `folders.latest_index_version` at time of build)
- `page_start`, `page_end`, `chunk_index`
- `text`, `metadata_json`, `tsv`, `embedding`
- `text_hash` (hash of `chunks.text` using the canonical hashing rule below)

Notes:
- `tsv` is the lexical index (tsvector). Consider a generated column if you want to avoid drift.
- `embedding` is a pgvector column. It must match the chosen embedding model dimension (open decision; pin in fixtures/evals).
- In PoC v1, citation locking uses `chunks.text` as the citation snippet by default, so `citations.snippet_hash` will usually equal `chunks.text_hash`.
- Chunking rules and required metadata fields are pinned in ADR-0015.

Recommended constraints:
- FK `chunks.document_id -> documents.id`.
- Unique `(chunks.document_id, chunks.index_version, chunks.chunk_index)`.

### `runs`
- `id`, `folder_id`, `type`, `state`
- `index_version` (pins retrieval substrate used by the run)
- `agent_bundle_version` (pins prompts + schemas)
- `question_set_version` (pins the exact question set used by the run; required for “completed” invariants)
- timestamps + `error_json` (safe failure details)

Recommended constraints:
- FK `runs.folder_id -> folders.id`.
- `state` constrained to the run state machine (`docs/03-architecture/20_state_model.md`).
- Consider a partial index for "latest run per folder" queries.

### `run_steps`
- `id`, `run_id`, `step_type`, `state`, `attempt`
- `step_key` (deterministic idempotency key; eg `ingest:doc_123:ocr` or `quick_start:BII-01:verify`)
- `metrics_json`, `error_json`
- timestamps

Recommended constraints:
- FK `run_steps.run_id -> runs.id`.
- Unique `(run_steps.run_id, run_steps.step_key)` so retries short-circuit safely.
- `state` constrained to the step state machine (`docs/03-architecture/20_state_model.md`).

### `report_rows`
- `id`, `folder_id`, `run_id`, `question_id`, `question`
- `answer`, `status`, `notes`
- `payload_schema_version` (string, nullable; e.g. `list_payload_v0`)
- `payload_json` (jsonb, nullable; structured row payload for list-shaped artefacts)
- `provenance_json` (minimum: retrieved chunk IDs + scores, models + prompt hashes, verification verdict + reason codes)
- timestamps

Recommended constraints:
- FK `report_rows.run_id -> runs.id`.
- FK `report_rows.folder_id -> folders.id`.
- Unique `(report_rows.run_id, report_rows.question_id)`.
- `status` constrained to the report row statuses (`docs/03-architecture/20_state_model.md`).

### `citations`
Citations are **locked** and **immutable** once created. They store enough to highlight evidence without re-running retrieval or re-reading chunks.
- `id`, `report_row_id`
- `chunk_id` (nullable; stored for debugging/replay)
- `document_id`, `page_number`
- `polygons`, `snippet`, `snippet_hash`
- `index_version` (string; pins the chunking/indexing version the citation came from)
- timestamps

Recommended constraints:
- FK `citations.report_row_id -> report_rows.id`.
- FK `citations.document_id -> documents.id`.
- `snippet_hash` is required and must be computed with the canonical rule below.
- **Invariant:** exportable citations MUST include valid `polygons`. Missing/invalid polygons fail closed and must set `citation_failed`.

#### Citation polygon coordinate system (polygons)
`citations.polygons` is a list of polygons. Each polygon is a list of points `[x, y]`.

Canonical coordinate space (PoC v1):
- Points are **normalised floats** in the range `[0..1]`.
- Origin is **top-left** of the PDF page’s **viewBox**.
- `x` increases to the right, `y` increases down.
- Points are ordered clockwise (recommended; not required for rendering).
- This coordinate space is independent of zoom. Rendering applies the current pdf.js viewport transform.

Viewer mapping (pdf.js):
- Let `viewBox = [xMin, yMin, xMax, yMax]` from the pdf.js page.
- Convert a point `[xNorm, yNorm]` to PDF points:
  - `xPdf = xMin + xNorm * (xMax - xMin)`
  - `yPdf = yMax - yNorm * (yMax - yMin)` (invert Y because `yNorm` is top-left origin)
- Convert to viewport pixels:
  - `[xPx, yPx] = viewport.convertToViewportPoint(xPdf, yPdf)`

Validation (fail-closed):
- Every point must be within `[0..1]`.
- Polygons must be non-empty.
- If any validation fails (including missing polygons), treat the citation as invalid and fail closed (`citation_failed`).

### `artefacts`
- `id`, `folder_id`, `type`, `storage_key`
- `source_run_id`, `metadata_json`
- timestamps

Notes:
- Do not persist signed `download_url` values in the DB; persist `storage_key` + metadata and generate fresh signed URLs on demand.
- Recommended `metadata_json` fields (PoC):
  - `kind` (e.g. `requirements_tracker`, `exceptions_table`, `survey_issues`, `memo`)
  - `filename`
  - `schema_version` (for CSVs)
  - `unsafe` / `unsafe_override` (if demo-only unsafe exports are ever allowed)

## Provenance JSON (recommended shape)
`report_rows.provenance_json` should be structured enough to support:
- replay ("what evidence did we use?")
- debugging ("which step failed, why?")
- evals ("what was Recall@K, what was verified?")

Minimal example (shape only; evolve as needed):
```json
{
  "retrieval": {
    "index_version": "v1",
    "query": "List Schedule B-II exceptions...",
    "chunks": [
      { "chunk_id": "chk_123", "score": 12.34 },
      { "chunk_id": "chk_456", "score": 10.98 }
    ]
  },
  "draft": {
    "model": "anthropic/claude-sonnet-4.5",
    "prompt_hash": "sha256:..."
  },
  "lock": {
    "locked_citation_ids": ["cit_123", "cit_124"]
  },
  "verify": {
    "model": "openai/gpt-5",
    "verdict": "pass",
    "reason_code": null
  }
}
```

## Hashing rule (snippet_hash)
We use `snippet_hash` to detect citation drift.

PoC rule:
- `snippet_hash = "sha256:" + sha256_hex(normalise(snippet))`
- `sha256_hex(...)` is lower-case hex.
- Input must be UTF-8 text; hashing is performed on UTF-8 bytes after normalisation.
- `normalise()` must:
  - trim leading/trailing whitespace
  - convert CRLF → LF
  - collapse all whitespace (including newlines/tabs) to a single space

This rule must be implemented once (e.g. in `packages/core/citations`) and reused everywhere.

## Indices and constraints (recommended)
- Unique and FK constraints:
  - unique `(documents.folder_id, documents.sha256)`
  - unique `(report_rows.run_id, report_rows.question_id)`
  - unique `(chunks.document_id, chunks.index_version, chunks.chunk_index)`
  - unique `(run_steps.run_id, run_steps.step_key)`

- Indexing:
  - GIN on `chunks.tsv`
  - pgvector index on `chunks.embedding`
  - index `citations.report_row_id`
  - index `runs.folder_id`
  - index `documents.folder_id`

## Immutability and replay (important)
- `citations` must be treated as immutable after insert. If you need to "fix" a citation, create a new citation and update the report row to reference the new ID (and record why in provenance).
- Chunk drift is handled by versioning: new chunking/indexing should create a new `index_version`, not mutate existing chunks.

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/specs/failure_ux_copy_v0.md
```md
# Failure UX Copy v0 (Initiative 0002)

This doc defines safe, consistent drawer copy for failure and "needs review" reasons.

Constraints:
- Never suggest disabling verification or "trusting the model".
- Show a reason code (safe taxonomy) and an actionable next step.
- Do not leak provider payloads or internal stack traces.

## Reason code -> guidance (draft)

| Reason code | What it means | What to do next (user-facing) |
| --- | --- | --- |
| `RETRIEVAL_MISS` | We could not retrieve relevant evidence chunks for this question. | Confirm the relevant document is present in the pack, then retry. If it is present, re-run indexing or adjust retrieval settings. |
| `LOW_EXTRACTION_QUALITY` | The document scan/OCR quality is too low to extract evidence safely. | Provide a higher-quality scan (higher DPI, less skew), rotate if needed, or supply a text-native PDF. Then retry. |
| `NO_CITATIONS` | A non-missing answer was produced without any locked citations. | Re-run the question and confirm evidence is being retrieved and locked. If it persists, treat as a bug (the system must fail closed). |
| `CITATION_MISMATCH` | Evidence integrity failed (e.g. snippet hash mismatch, missing/invalid geometry). | Open the citation and confirm what it actually says. Re-run; if it persists, treat as a bug in citation locking. |
| `MISSING_INPUT_INVARIANT` | The row violated missing-input invariants (e.g. missing_input answer with citations). | Retry. If it persists, treat as a bug and include the reason code + trace_id. |
| `VALIDATION_ERROR` | The row failed schema validation (malformed output). | Retry. If it persists, treat as a bug and include the reason code + trace_id. |
| `REFERENCE_CYCLE` | A cross-reference chain contained a cycle (non-terminating). | Review the referenced docs manually; consider bounding the chase depth or adding a specific doc to break the cycle. |
| `MISSING_DOC` | A referenced instrument document is not present in the pack. | Request/upload the missing document (the drawer should name the expected filename). Then retry. |
| `MISSING_ATTACHMENT` | An exhibit/attachment is referenced but not included in the provided instrument PDF(s). | Request/upload the missing exhibit/attachment. Do not infer its contents from context. |

## Drawer affordances (draft)

- Always show:
  - `status`
  - reason code (when present)
  - a short explanation
  - next action checklist (when applicable)

## Notes

- For `missing_input`, the answer string must be exactly: `Not found in provided documents.` and citations must be empty.

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/brief.md
```md
# Project Brief (1-2 pager)

**Initiative 002: Quick Start Engine (Title + Survey -> 3 artefacts)**

- Dossier: `docs/04-projects/02-features/0002_quick-start-engine/`
- Status: Draft
- Last updated: 2026-02-07
- Owner:

Source docs (canonical):
- `docs/00-strategy/initiatives/initiative-overview-001-002-003.md`
- `docs/00-strategy/initiatives/002-quick-start-engine.md`
- `docs/03-architecture/00_overview.md`
- `docs/03-architecture/20_state_model.md`
- `docs/03-architecture/30_data_model.md`
- `docs/03-architecture/DECISIONS.md`

Dependencies:
- Initiative 001 ("trust substrate") must exist for citation locking, fail-closed verification, and viewer jump-to-evidence.

---

## Problem

We do not have a deterministic, testable path from a diligence pack (title commitment + exception instruments + survey) to a first-pass report that practitioners can trust. Manual analysis is slow, inconsistent, and difficult to validate against fixture "truth" data.

## Why it matters

This is the product wedge: a fast first pass that is evidence-backed and repeatable. Without a deterministic pipeline and eval anchors, we will drift into demo-only outputs that cannot be hardened.

## What we are building (PoC scope)

A "Quick Start: Title + Survey" run that produces a fixed question set v1 (<=25 rows). Three rows are list-shaped artefacts (rendered as tables in the report UI; export later):
1) Schedule B-I requirements tracker
2) Schedule B-II exceptions table linked to underlying instrument PDFs
3) Survey reconciliation issues list (title <-> survey)

Key trust posture (from `docs/03-architecture/*`):
- Evidence-first: every material claim needs locked citations
- Evidence references are IDs only (ADR-0001): drafting uses candidate `chunk_id`s; rows refer to locked `citation_id`s (no free-text citations)
- Verification is fail-closed: any mismatch -> `citation_failed`
- `missing_input` is a valid output and must follow invariants:
  - `answer` is exactly: `Not found in provided documents.`
  - citations are empty
  - `notes` (or provenance) includes an actionable missing-doc checklist
- Deterministic-ish orchestration via Workflow DevKit (workflow + steps)
- APIs must return the safe error envelope with `trace_id` on non-2xx (ADR-0008); do not leak internal errors/provider payloads

## Acceptance packs (fixtures)

Use fixture packs under `docs/08-example-data/` as the acceptance anchor (see `docs/08-example-data/packs_summary.md`):
- `pack_01_clean` (baseline happy path)
- `pack_02_missing_rea` (missing exception doc -> missing-input journey)
- `pack_03_mismatch_and_cert_gap` (survey cert gap + mismatch flags)
- `pack_04_multi_parcel` (multi-parcel scoping)
- `pack_05_partial_release` (lien/release complexity; needs-review flags)
- `pack_06_overlapping_easements` (disambiguation + missing attachment)
- `pack_07_scans_rotated_low_quality` (OCR torture; extraction-quality metering)
- `pack_08_defined_terms_and_cross_refs` (defined terms + exhibit chase)

## Goals

1. Deterministic, testable outputs for the fixture packs (start with `pack_01_clean` + `pack_02_missing_rea`).
2. Evidence-backed rows: citations are locked and verifiable; no "plausible but unprovable" answers.
3. A run UX that shows progress and produces incremental row updates with correct terminal statuses.

## Non-goals (explicit cuts)

- Freeform chat or open-ended research (no external web research inside runs).
- Legal advice, negotiation posture, or "materiality" decisions.
- Universal coverage of all title company formats or survey styles.
- Geometry overlays for easements (we link to evidence; we do not render corridors).
- Human-in-the-loop ambiguity resolution / selection persistence (v1 shows candidates only; no "choose correct doc" flow).

## Perimeter (in/out)

In scope:
- Question set v1 (<=25) with stable IDs and a stable row schema.
- Commitment parsing for Schedule A / B-I / B-II for fixture packs.
- Exception -> instrument matching with ambiguity surfaced at item-level as `match_status: ambiguous` with candidates listed (never silent).
- Survey extraction focused on certification + text callouts first.
- Reconciliation that prefers item-level `unknown` (row stays `needs_review`) over incorrect item-level `not_depicted`.
- WDK workflow orchestration: `retrieve -> draft -> lock citations -> verify -> write row`.

Out of scope:
- "Research agent" browsing.
- Auto strategy decisions (cure vs endorse vs accept).
- Deep semantic interpretation of easement scope.

## Key flows

See `breadboard-pack.md` for places/affordances/connections.
- Start run -> view run progress -> table populates -> open row drawer -> click citation -> jump to highlighted evidence

## Risks and unknowns (top)

See `risk-register.md` and `spike-investigation.md`.
Biggest items to resolve before PRDs:
- How we represent table-shaped artefacts (B-I/B-II/issues) within the report-row model without breaking status + citation invariants
- Parsing robustness on `pack_07_scans_rotated_low_quality`
- Exception matching + missing-attachment handling on `pack_06_overlapping_easements`
- Reconciliation honesty: bias to item-level `unknown` (row stays `needs_review`) rather than wrong item-level `not_depicted`
- Run idempotency: stable `snippet_hash` + no duplicate rows on restart

## Open questions

- Appetite/timebox for Initiative 002 shaping vs implementation.
- Who is the "practitioner" for the question-set spike (and how quickly can we get feedback)?
- Do we treat B-I/B-II/issues as three "big rows", or do we introduce a first-class "artefact table row" model?
- What is the initial question set v1 derived from (start with `golden_questions.json` per pack, then merge)?

## Shaping decision

- Decision: NO-GO for implementation (pending spikes; `prd.md`/`prd.json` exist as draft scaffolding only)
- GO when (all must be true):

Contracts frozen:
- [ ] Question set v1 frozen: `docs/04-projects/02-features/0002_quick-start-engine/specs/question_set_v1.json` committed, `<=25`, exactly 3 list-shaped rows (`TS-03`, `TS-04`, `TS-09`), practitioner review captured.
- [ ] Payload storage decision frozen: SP-2.7 selects Option 4; `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md` committed; canonical architecture docs updated (`docs/03-architecture/30_data_model.md`, `docs/03-architecture/50_api_surface.md`).
- [ ] Comparator spec v0 exists and all spikes reference it: `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`.

Fixture-verifiable spikes passed (proof artefacts committed):
- [ ] SP-2.8 Retrieval Recall@K baseline on `pack_01_clean` is measured, misses logged, and there is an explicit decision (patch vs accept).
- [ ] SP-2.2A Commitment parsing on `pack_01_clean` passes CSV comparators for requirements + exceptions with 0 false positives.
- [ ] SP-2.3A Exception matching passes on `pack_01_clean` and missing-doc journey passes on `pack_02_missing_rea` (checklist includes `REA.pdf`).
- [ ] SP-2.4A Survey extraction passes on `pack_01_clean` + `pack_03_mismatch_and_cert_gap` (cert gap issue code + citation).
- [ ] SP-2.5 Reconciliation honesty policy is written + tested; `not_depicted` rule is safe (or cut to `depicted|unknown` and documented).
- [ ] SP-2.6 Idempotency + snippet_hash stability passes, including the negative test proving workflow continues and run can reach `completed` with one `citation_failed` row.
- [ ] SP-2.11 List verification semantics are pinned (policy doc committed) and consistent with fail-closed + immutable citations.

Explicit cuts / deferrals recorded:
- [ ] RH-2.16 (human-in-loop ambiguity resolution) is marked cut for v1 in this brief and in `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md`.

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/schemas/list_payload_v0.ts
```ts
import { z } from "zod";

export const LIST_PAYLOAD_V0_SCHEMA_VERSION = "list_payload_v0" as const;

export const ListPayloadV0KindSchema = z.enum([
  "requirements_tracker",
  "exceptions_table",
  "survey_issues",
  "survey_certification_parties",
]);

const LockedCitationIdSchema = z.string().min(1);

const BaseItemV0Schema = z
  .object({
    item_id: z.string().min(1), // deterministic for diffing + idempotency
    citation_ids: z.array(LockedCitationIdSchema), // locked citation ids only
    notes: z.string().min(1).nullable().optional(),
  })
  .strict();

const ParcelScopeV0Schema = z.union([
  z.object({ scope: z.literal("all") }).strict(),
  z
    .object({
    scope: z.literal("parcels"),
    parcels: z.array(z.number().int().nonnegative()).min(1),
    citation_ids: z.array(LockedCitationIdSchema),
  })
    .strict(),
]);

const RequirementsItemV0Schema = BaseItemV0Schema.extend({
  kind: z.literal("requirements_tracker_item"),
  bi_item: z.number().int().nonnegative(),
  requirement: z.string().min(1),
  owner: z.string().min(1),
  item_status: z.enum(["open", "closed", "waived"]), // item-level only
  parcel_scope: ParcelScopeV0Schema.optional(),
}).strict();

const ExceptionMatchStatusV0Schema = z.enum(["matched", "ambiguous", "missing_doc", "missing_attachment"]);

const ExceptionItemV0Schema = BaseItemV0Schema.extend({
  kind: z.literal("exceptions_table_item"),
  bii_item: z.number().int().nonnegative(),
  type: z.string().min(1),
  // Item-level only (do not reuse report-row statuses). Comparator expects this field.
  item_status: z.enum(["needs_review", "missing_input"]),
  instrument_no: z.string().min(1).nullable().optional(),
  recorded_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "recorded_date must be ISO YYYY-MM-DD")
    .nullable()
    .optional(),
  doc: z.string().min(1).nullable().optional(), // expected filename
  risk_tags: z.array(z.string().min(1)).optional(), // normalised lower-case tags (producer responsibility)
  match_status: ExceptionMatchStatusV0Schema,
  candidates: z
    .array(z.object({ doc: z.string().min(1), instrument_no: z.string().min(1).nullable().optional() }).strict())
    .optional(),
  parcel_scope: ParcelScopeV0Schema.optional(),
}).strict();

const SurveyIssueItemV0Schema = BaseItemV0Schema.extend({
  kind: z.literal("survey_issue_item"),
  issue_type: z.string().min(1),
  // Optional structured code for downstream routing/UX. Example: CERT_MISSING_LENDER.
  issue_code: z
    .string()
    .regex(/^[A-Z][A-Z0-9_]+$/, "issue_code must be SCREAMING_SNAKE_CASE")
    .optional(),
  description: z.string().min(1),
  impact: z.string().min(1).nullable().optional(),
  suggested_fix: z.string().min(1).nullable().optional(),
  related_exception_item_id: z.string().min(1).nullable().optional(),
  item_classification: z.enum(["depicted", "not_depicted", "unknown"]).optional(), // item-level only
}).strict();

const SurveyCertificationPartyItemV0Schema = BaseItemV0Schema.extend({
  kind: z.literal("survey_certification_party_item"),
  party_name: z.string().min(1),
}).strict();

export const ListPayloadV0ItemSchema = z.discriminatedUnion("kind", [
  RequirementsItemV0Schema,
  ExceptionItemV0Schema,
  SurveyIssueItemV0Schema,
  SurveyCertificationPartyItemV0Schema,
]);

export const ListPayloadV0Schema = z
  .object({
  kind: ListPayloadV0KindSchema,
  items: z.array(ListPayloadV0ItemSchema),
  })
  .strict();

export type ListPayloadV0 = z.infer<typeof ListPayloadV0Schema>;

export function emptyListPayloadV0(kind: z.infer<typeof ListPayloadV0KindSchema>): ListPayloadV0 {
  return { kind, items: [] };
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/RH-2.12_pin_audit.md
```md
# RH-2.12 Pinning Audit (question_set_version)

Goal: ensure run records and API contracts explicitly pin `question_set_version` so comparisons are stable and "completed" invariants are enforceable.

Docs that define/require pinning:
- `docs/03-architecture/20_state_model.md` (run invariants reference question set version)
- `docs/03-architecture/30_data_model.md` (`runs.question_set_version`)
- `docs/03-architecture/50_api_surface.md` (run responses include `question_set_version`)
- `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md` (Runs API pins `question_set_version`; UI shows pinned label per run)
- `docs/04-projects/02-features/0002_quick-start-engine/specs/question_set_v1.json` (version format + pinning notes)
- `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.6 expects pinned versions)

Open implementation items (not covered by this doc patch):
- Persist `question_set_version` on `runs` in the DB migration.
- Ensure `POST /folders/:id/runs` sets it deterministically at run start.
- Ensure `GET /runs/:id` and `GET /folders/:id/report` always return it.


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/scripts/worker.ts
```ts
import os from "node:os";

import { runContinuousJobWorker } from "../lib/jobs/jobWorker.server";
import { runContinuousWdkWorker } from "../lib/wdk/wdkWorker.server";
import { quickStartStepHandlers } from "../steps/quickStartStepHandlers.server";
import { wdkSmokeStepHandlers } from "../steps/wdkSmokeStepHandlers.server";

function workerId(): string {
  const fromEnv = process.env.ORBITAL_WORKER_ID?.trim();
  if (fromEnv) return fromEnv;
  return `worker:${os.hostname()}:${process.pid}`;
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

const baseId = workerId();
await Promise.all([
  runContinuousJobWorker({ workerId: `${baseId}:jobs` }),
  runContinuousWdkWorker({
    workerId: `${baseId}:wdk`,
    handlers: { ...wdkSmokeStepHandlers, ...quickStartStepHandlers },
  }),
]);

```

File: /Users/marc/Code/personal-projects/orbital-poc/scripts/fixtures/README.md
```md
# Fixtures Tooling (Spikes)

This folder contains small, deterministic CLIs used by spikes to turn fixture `/truth` files into PASS/FAIL outcomes.

These scripts are intentionally dependency-light and should run locally.

## Commands

Run with Node's TypeScript stripping:

```bash
node --experimental-strip-types scripts/fixtures/seed.ts pack_01_clean
node --experimental-strip-types scripts/fixtures/eval.ts pack_01_clean
node --experimental-strip-types scripts/fixtures/eval.ts --all
node --experimental-strip-types scripts/fixtures/verify_pack_names.ts
node --experimental-strip-types scripts/fixtures/assert_row_invariants.ts --snapshot <snapshot.json>
node --experimental-strip-types scripts/fixtures/compare_truth.ts --snapshot <snapshot.json>
```

Notes:
- `verify_pack_names.ts` treats `docs/08-example-data/packs_summary.md` as canonical and ignores `docs/**/tmp-oracle/**` + `docs/**/tmp-handoffs/**` when scanning docs for pack references.
- `compare_truth.ts` defaults to "auto mode" (only compares datasets present in the snapshot). Force datasets with `--datasets requirements,exceptions,survey_issues,golden_scalar`.
- `assert_row_invariants.ts` can enforce the baseline reason-code taxonomy with `--strict-reason-codes`.

## Snapshot format (expected by these scripts)

These tools assume a snapshot JSON file shaped like:

```json
{
  "meta": {
    "pack_id": "pack_01_clean",
    "run_id": "run_123",
    "index_version": "v1",
    "agent_bundle_version": "git:abc123",
    "question_set_version": "qs:0002:v1.0:sha256:..."
  },
  "rows": [
    {
      "question_id": "TS-03",
      "question": "List Schedule B-I requirements.",
      "answer": "Extracted requirements tracker (see payload).",
      "status": "needs_review",
      "citation_ids": ["cit_123"],
      "notes": null,
      "payload_schema_version": "list_payload_v0",
      "payload_json": { "kind": "requirements_tracker", "items": [] },
      "provenance_json": {}
    }
  ],
  "citations": {
    "cit_123": {
      "document_filename": "TitleCommitment.pdf",
      "page_number": 2,
      "polygons": [[[0.1, 0.2], [0.2, 0.2], [0.2, 0.3], [0.1, 0.3]]],
      "snippet": "…",
      "snippet_hash": "sha256:..."
    }
  }
}
```

## Canonical comparator rules

Comparator behavior is specified in:
- `docs/04-projects/02-features/0002_quick-start-engine/comparator_spec_v0.md`

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/verify/verifier.ts
```ts
import { performance } from "node:perf_hooks";

import { hashSnippet } from "../citations/snippet";
import { VerifyInputSchema, type VerifyInput, type VerifyResult } from "./verifier.schemas";

export type EntailmentVerdict = "PASS" | "FAIL" | "UNSURE";

export type EntailmentVerifier = (input: {
  question: string;
  answer: string;
  citations: Array<{ snippet: string }>;
}) => Promise<{ verdict: EntailmentVerdict; reason?: string }>;

export type VerifierMode = "deterministic-only" | "entailment";

export async function verifyRow(
  input: VerifyInput,
  opts: { mode: VerifierMode; entailment?: EntailmentVerifier },
): Promise<VerifyResult> {
  const t0 = performance.now();

  // Schema validates basic shape; deterministic checks enforce invariants.
  const parsed = VerifyInputSchema.safeParse(input);
  if (!parsed.success) {
    const t = performance.now();
    return {
      verdict: "fail",
      reason_code: "VALIDATION_ERROR",
      reason: "Input did not match VerifyInput schema.",
      timings_ms: { total: t - t0, deterministic: t - t0 },
    };
  }

  const tDetStart = performance.now();

  const failDeterministic = (args: { reason_code: VerifyResult["reason_code"]; reason: string }): VerifyResult => {
    const t = performance.now();
    return {
      verdict: "fail",
      reason_code: args.reason_code,
      reason: args.reason,
      timings_ms: { total: t - t0, deterministic: t - tDetStart },
    };
  };

  if (parsed.data.answer === "Not found in provided documents." && parsed.data.citations.length !== 0) {
    return failDeterministic({
      reason_code: "MISSING_INPUT_INVARIANT",
      reason: "missing_input answers must have zero citations.",
    });
  }

  if (parsed.data.answer !== "Not found in provided documents." && parsed.data.citations.length === 0) {
    return failDeterministic({
      reason_code: "NO_CITATIONS",
      reason: "Non-missing_input answers must include at least one citation.",
    });
  }

  for (const cit of parsed.data.citations) {
    const computed = hashSnippet(cit.snippet);
    if (computed !== cit.snippet_hash) {
      return failDeterministic({
        reason_code: "CITATION_MISMATCH",
        reason: "snippet_hash did not match the canonical hash of snippet.",
      });
    }
  }

  const tDetEnd = performance.now();

  if (opts.mode === "deterministic-only") {
    return {
      verdict: "pass",
      reason_code: "DETERMINISTIC_ONLY",
      timings_ms: { total: tDetEnd - t0, deterministic: tDetEnd - tDetStart },
    };
  }

  if (!opts.entailment) {
    return {
      verdict: "fail",
      reason_code: "ENTAILMENT_NOT_CONFIGURED",
      reason: "Entailment verifier is required in entailment mode.",
      timings_ms: { total: tDetEnd - t0, deterministic: tDetEnd - tDetStart },
    };
  }

  const tEntStart = performance.now();
  const entailment = await opts.entailment({
    question: parsed.data.question,
    answer: parsed.data.answer,
    citations: parsed.data.citations.map((c) => ({ snippet: c.snippet })),
  });
  const tEntEnd = performance.now();

  if (entailment.verdict === "PASS") {
    return {
      verdict: "pass",
      reason_code: "ENTAILMENT_PASS",
      timings_ms: {
        total: tEntEnd - t0,
        deterministic: tDetEnd - tDetStart,
        entailment: tEntEnd - tEntStart,
      },
    };
  }

  return {
    verdict: "fail",
    reason_code: entailment.verdict === "FAIL" ? "ENTAILMENT_FAIL" : "ENTAILMENT_UNSURE",
    reason: entailment.reason,
    timings_ms: {
      total: tEntEnd - t0,
      deterministic: tDetEnd - tDetStart,
      entailment: tEntEnd - tEntStart,
    },
  };
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/steps/quickStartExecuteV0.step.server.ts
```ts
import "server-only";

import { z } from "zod";

import type { Sql } from "../lib/db.server";
import { processQuickStartRun } from "../lib/quickStartRunProcessor.server";
import type { StepRow } from "../lib/wdk/stepQueue.server";

const InputSchema = z.object({
  trace_id: z.string().min(1).nullable().optional(),
});

export async function quickStartExecuteV0Step(args: { step: StepRow; workerId: string; db?: Sql }): Promise<{
  output: unknown;
  metrics?: unknown;
}> {
  "use step";

  const input = InputSchema.parse(args.step.input_json);

  // eslint-disable-next-line no-console
  console.info("wdk.quick_start.execute_v0.started", {
    orchestration: "wdk",
    worker_id: args.workerId,
    step_id: args.step.id,
    run_id: args.step.run_id,
    step_key: args.step.step_key,
    step_type: args.step.step_type,
    attempt: args.step.attempt,
    trace_id: input.trace_id ?? null,
  });

  const startedAt = Date.now();
  await processQuickStartRun(args.step.run_id);
  const durationMs = Date.now() - startedAt;

  // eslint-disable-next-line no-console
  console.info("wdk.quick_start.execute_v0.completed", {
    orchestration: "wdk",
    worker_id: args.workerId,
    step_id: args.step.id,
    run_id: args.step.run_id,
    step_key: args.step.step_key,
    step_type: args.step.step_type,
    attempt: args.step.attempt,
    duration_ms: durationMs,
    trace_id: input.trace_id ?? null,
  });

  return {
    output: {
      ok: true,
      run_id: args.step.run_id,
      duration_ms: durationMs,
      trace_id: input.trace_id ?? null,
    },
    metrics: { duration_ms: durationMs },
  };
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md
```md
# Comparator Spec v0 (Initiative 0002)

This spec defines the deterministic PASS/FAIL comparison used by Initiative 0002 spikes.

Goals:
- No eyeballing diffs
- One normalisation contract (single source of truth)
- Explicit citation-to-anchor checks (fail-closed)

Truth sources:
- `docs/08-example-data/<pack>/truth/*.csv`
- `docs/08-example-data/<pack>/layout/*.anchors.json`

Tooling:
- Comparator CLI: `scripts/fixtures/compare_truth.ts`
- Row invariant audit CLI: `scripts/fixtures/assert_row_invariants.ts`

## Input artefact: Spike snapshot JSON (shape)

Every spike that claims a truth match must emit a snapshot JSON containing, at minimum:
- Pinned versions: `{ index_version, agent_bundle_version, question_set_version }`
- Report rows for the spike question IDs:
  - `{ question_id, status, answer, citation_ids, payload_schema_version?, payload_json?, provenance_json? }`
- A citation materialisation map:
  - `{ citation_id -> { document_filename, page_number, polygons, snippet_hash } }`

## Normalisation (apply everywhere)

These are logic-level rules; implementers should keep one implementation and reuse it.

- `norm_ws(s)`: trim; CRLF->LF; collapse whitespace runs to a single space
- `norm_int(s)`: parse int; reject non-numeric (hard fail)
- `norm_instrument_no(s)`: uppercase; remove spaces; keep `[A-Z0-9-]` only
- `norm_date(s)`: parse common forms; output ISO `YYYY-MM-DD`; empty => `null`
- `norm_tags(s)`: split on `;`; trim; lowercase; sort; join with `;`

## `normalise_row_for_idempotency_v0()` (SP-2.6)

This is the canonical normalisation used when comparing two runs for idempotency:
- Sort report rows by `question_id`.
- For list payload rows, sort `payload_json.items` by `item_id`.
- Apply `norm_ws` to all human-readable strings that are compared (at minimum: `answer`, and key payload strings like `requirement`, `type`, `description`).
- Sort deterministic lists before comparing (at minimum: `citation_ids`, and derived `snippet_hash` lists).
- Drop non-semantic fields (timestamps, DB IDs other than `question_id` and `item_id`).

## Citation-to-anchor check (measurable, fail-closed)

Truth rows typically reference a `(doc, anchor)` pair via the golden questions and/or expected CSVs.
For each produced item that asserts a concrete field, the comparator must assert that at least one
locked `citation_id` maps to evidence that overlaps the referenced anchor:

Requirements:
- `citation.document_filename == truth.doc`
- `citation.page_number == anchors[truth.anchor].page`
- Citation polygon overlaps the anchor bbox.

Overlap rule (recommended simplest):
- Compute the citation polygon bounding box.
- Compute the bbox center `(cx, cy)`.
- PASS if `(cx, cy)` is inside `anchors[anchor].bbox`.
- Otherwise FAIL.

If a comparator fails due to a citation mismatch, the spike proof output must record that as a
`CITATION_MISMATCH`-class failure (even if the run itself did not set `citation_failed`).

## Item-level status mapping (do not confuse row statuses)

Expected CSVs may include an item-level `status` column. Treat it as item-level only and map:
- `match_status in {missing_doc, missing_attachment}` => `item_status == "missing_input"`
- `match_status in {matched, ambiguous}` => `item_status == "needs_review"`

Report-row statuses remain the fixed set from `docs/03-architecture/20_state_model.md`.

## Deterministic output contract

The comparator must emit:
- `pass: boolean`
- `failing_rows: [...]` (stable ordering)
- A deterministic diff artefact (JSON; optional CSV)

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/quickStartRunQueue.server.ts
```ts
import "server-only";

import { enqueueJob } from "./jobs/jobQueue.server";
import { kickInlineJobWorker } from "./jobs/jobWorker.server";
import { safeErrMessage } from "./safeErrMessage";

export function enqueueQuickStartRun(runId: string): void {
  void enqueueJob({ type: "execute_run", jobKey: `run:${runId}`, payload: { run_id: runId } })
    .then(() => {
      kickInlineJobWorker();
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("jobs.enqueue failed", { job_type: "execute_run", run_id: runId, message: safeErrMessage(err) });
    });
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/prd-overall.md
```md
# PRD (Overall): 0002 Quick Start Engine (Slices in `prds/`)

Owner:
Status: Draft (NO-GO until key spikes close)
Date: 2026-02-07
Slug: 0002-quick-start-engine

## Summary

Implement the deterministic-ish “Quick Start: Title + Survey” run that turns a fixture pack into three evidence-backed artefacts:
1. Schedule B-I requirements tracker
2. Schedule B-II exceptions table (linked to instruments)
3. Survey reconciliation issues list (title ↔ survey)

This `prd-overall.md` is the initiative-level overall (spine) PRD. Implementation should happen via the thin slice PRDs listed below.

If you want a single PRD to run a single Ralph loop against, use the consolidated dossier PRD: `docs/04-projects/02-features/0002_quick-start-engine/prd.md` (and `prd.json`).

## Non-negotiable constraints (from architecture)

From `docs/03-architecture/*` and `docs/03-architecture/DECISIONS.md`:
- Evidence-first (ADR-0001): drafting uses candidate `chunk_id`s; rows refer to locked `citation_id`s only.
- Verification is fail-closed (ADR-0002): integrity/invariant failures → `citation_failed`; blocked from export by default. (ADR-0017: v1 is integrity-only.)
- OCR/layout extraction is default for all PDFs (ADR-0003) for geometry highlights.
- Retrieval returns IDs (ADR-0004): chunk IDs + scores; provenance stores IDs, not prose.
- Orchestration via WDK (ADR-0005): `"use workflow"` controller; `"use step"` side effects; step idempotency via deterministic `step_key`.
- Fixtures + evals are first-class (ADR-0006): success is measurable vs `/truth`.
- No external web research inside runs (ADR-0007).
- APIs use a safe error envelope with `trace_id` (ADR-0008); never leak internal errors/provider payloads.

## Dependencies

- Initiative 0001 “trust substrate” must exist for:
  - citation locking + immutable citations
  - click-to-jump PDF viewer highlights
  - report-row status invariants and export gating UX

## Acceptance anchors (fixtures)

Canonical pack list: `docs/08-example-data/packs_summary.md`.

Primary near-term anchors for implementation slices:
- `pack_01_clean`
- `pack_02_missing_rea`
- `pack_03_mismatch_and_cert_gap`
- `pack_07_scans_rotated_low_quality`

## Slice PRDs (thin, executable)

1. `prds/0002a_run-skeleton/prd.md`
  - Runs API + version pinning + WDK workflow skeleton + incremental UI progress, with strict invariants.
2. `prds/0002b_row-payload-contract/prd.md`
  - Decide and implement list payload storage + schema versioning + UI rendering contract for artefact tables.
3. `prds/0002c_commitment-parsing-pack-01-clean/prd.md`
  - Commitment parsing baseline for `pack_01_clean` producing B-I + B-II payloads matching truth key fields.
4. `prds/0002d_exception-matching-pack-01-02/prd.md`
  - Exception → instrument matching baseline + missing-doc journey on `pack_02_missing_rea`; ambiguity surfaced without “silent pick”.
5. `prds/0002e_survey-extraction-pack-01-03/prd.md`
  - Survey extraction baseline + certification gap issue on `pack_03_mismatch_and_cert_gap` with locked citations.
6. `prds/0002f_reconciliation-honesty-pack-03-07/prd.md`
  - Reconciliation issues list with an honesty policy (bias to item-level `unknown`; `not_depicted` requires positive evidence of absence).

## Open questions (spike-owned)

- Payload representation decision (SP-2.7): where structured artefact payload lives (and how API exposes it).
- Retrieval Recall@K baseline (SP-2.8): are we retrieving the right evidence before drafting?
- Scan torture honesty policy: when to downgrade to `missing_input` vs emit `unknown` items safely.
- Human-in-the-loop ambiguity resolution: if we later allow selection, it must re-verify and must not mutate immutable citations.

## Sources

- `brief.md`: `docs/04-projects/02-features/0002_quick-start-engine/brief.md`
- `breadboard-pack.md`: `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md`
- `risk-register.md`: `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md`
- `spike-investigation.md`: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/RH-2.10_pack_name_audit.txt
```txt
RH-2.10 pack name audit (canonical packs_summary)
Date: 2026-02-07

Command:
  rg -n "pack_04_multi_parcel|pack_07_scans_rotated_low_quality|pack_05_partial_release" docs --glob '!**/tmp-oracle/**'

Result:
  No matches.

Notes:
  - `docs/04-projects/02-features/0002_quick-start-engine/tmp-oracle/` contains historical oracle bundles and may include non-canonical pack names. Exclude it from audits.


```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/spikes/rh3_snippet_hash_harness.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { hashSnippet, normaliseSnippet } from "@orbital-poc/core/citations/snippet";

type ExtractedSnippet = {
  doc: string;
  page: number | null;
  phrase: string;
  raw: string;
  normalised: string;
  snippet_hash: string;
};

function parseArgs(argv: string[]) {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "true";
    args.set(key, val);
    if (val !== "true") i += 1;
  }
  return args;
}

function readPdfBytes(pdfPath: string): Uint8Array {
  // pdf.js v4 rejects `Buffer` instances; provide a plain Uint8Array view.
  const buf = fs.readFileSync(pdfPath);
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

async function findPhraseSnippet(opts: {
  pdfPath: string;
  phrase: string;
  maxPagesToScan: number;
  windowChars: number;
}): Promise<{ page: number | null; snippet: string }> {
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({ data: readPdfBytes(opts.pdfPath), disableWorker: true });
  const pdf = await loadingTask.promise;

  const pageCount = Number(pdf.numPages ?? 0);
  const maxPages = Math.min(pageCount, opts.maxPagesToScan);

  const phraseLower = opts.phrase.toLowerCase();

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const items = (textContent.items ?? []) as any[];
    const text = items.map((it) => String(it.str ?? "")).join(" ");
    const idx = text.toLowerCase().indexOf(phraseLower);
    if (idx === -1) continue;

    const start = Math.max(0, idx - Math.floor(opts.windowChars / 2));
    const end = Math.min(text.length, start + opts.windowChars);
    return { page: pageNumber, snippet: text.slice(start, end) };
  }

  return { page: null, snippet: "" };
}

function readHarnessOutput(filePath: string): {
  run: string;
  phrase: string;
  snippets: ExtractedSnippet[];
} {
  const raw = fs.readFileSync(filePath, "utf8");
  const json = JSON.parse(raw) as unknown;
  if (!json || typeof json !== "object") throw new Error(`Invalid JSON: ${filePath}`);

  const run = (json as any).run;
  const phrase = (json as any).phrase;
  const snippets = (json as any).snippets;
  if (typeof run !== "string") throw new Error(`Invalid run field: ${filePath}`);
  if (typeof phrase !== "string") throw new Error(`Invalid phrase field: ${filePath}`);
  if (!Array.isArray(snippets)) throw new Error(`Invalid snippets field: ${filePath}`);
  return { run, phrase, snippets: snippets as ExtractedSnippet[] };
}

function compareHarnessRuns(args: {
  root: string;
  outDir: string;
  runA: string;
  runB: string;
}): void {
  const aPath = path.join(args.root, args.outDir, `${args.runA}.json`);
  const bPath = path.join(args.root, args.outDir, `${args.runB}.json`);

  if (!fs.existsSync(aPath)) throw new Error(`Missing run output: ${aPath}`);
  if (!fs.existsSync(bPath)) throw new Error(`Missing run output: ${bPath}`);

  const a = readHarnessOutput(aPath);
  const b = readHarnessOutput(bPath);

  const aByDoc = new Map(a.snippets.map((s) => [s.doc, s.snippet_hash] as const));
  const bByDoc = new Map(b.snippets.map((s) => [s.doc, s.snippet_hash] as const));

  const docs = new Set<string>([...aByDoc.keys(), ...bByDoc.keys()]);
  const mismatches: Array<{ doc: string; a: string | null; b: string | null }> = [];
  for (const doc of docs) {
    const hashA = aByDoc.get(doc) ?? null;
    const hashB = bByDoc.get(doc) ?? null;
    if (hashA !== hashB) mismatches.push({ doc, a: hashA, b: hashB });
  }

  if (mismatches.length) {
    process.stderr.write(`RH3 hash stability: FAIL (${args.runA} vs ${args.runB})\n`);
    for (const m of mismatches) {
      process.stderr.write(`- ${m.doc}: ${String(m.a)} != ${String(m.b)}\n`);
    }
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`RH3 hash stability: PASS (${args.runA} vs ${args.runB})\n`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const run = args.get("run") ?? "run1";
  const outDir = args.get("outDir") ?? "docs/97-throwaway/spike-evidence/rh3";
  const phrase = args.get("phrase") ?? "18W18 Acquisition LLC";
  const compareWith = args.get("compareWith") ?? null;

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
  const docs = [
    {
      name: "TitleCommitment.pdf",
      path: path.join(root, "docs/08-example-data/pack_01_clean/docs/TitleCommitment.pdf"),
    },
    {
      name: "ALTA_Survey.pdf",
      path: path.join(root, "docs/08-example-data/pack_01_clean/docs/ALTA_Survey.pdf"),
    },
  ];

  const extracted: ExtractedSnippet[] = [];
  for (const doc of docs) {
    const { page, snippet } = await findPhraseSnippet({
      pdfPath: doc.path,
      phrase,
      maxPagesToScan: 10,
      windowChars: 200,
    });

    const normalised = normaliseSnippet(snippet);
    extracted.push({
      doc: doc.name,
      page,
      phrase,
      raw: snippet,
      normalised,
      snippet_hash: hashSnippet(snippet),
    });
  }

  const output = {
    run,
    createdAt: new Date().toISOString(),
    phrase,
    snippets: extracted,
  };

  const outPath = path.join(root, outDir, `${run}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf8");
  process.stdout.write(`Wrote ${outPath}\n`);

  if (compareWith) {
    compareHarnessRuns({ root, outDir, runA: compareWith, runB: run });
  }
}

await main();

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/spikes/us002_pack03_cert_gap_issue.e2e.test.ts
```ts
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromCoreCwd(): string {
  // When invoked via `pnpm -r test`, vitest runs with cwd at the package root.
  return path.resolve(process.cwd(), "../..");
}

function runNode(repoRoot: string, args: string[]): string {
  return execFileSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function loadJson(filePath: string): any {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

describe("US-002 pack_03_mismatch_and_cert_gap structured cert gap issue", () => {
  it("seeds survey_issues payload with CERT_MISSING_LENDER and evidence", () => {
    const repoRoot = repoRootFromCoreCwd();
    const outRoot = path.join(os.tmpdir(), `orbital-poc-us002-${process.pid}-${Date.now()}`);

    runNode(repoRoot, [
      "--experimental-strip-types",
      "scripts/fixtures/seed.ts",
      "pack_03_mismatch_and_cert_gap",
      "--out-root",
      outRoot,
      "--overwrite",
      "--no-bad-citation",
    ]);

    const snapshotPath = path.join(outRoot, "pack_03_mismatch_and_cert_gap", "snapshot.json");

    expect(() =>
      runNode(repoRoot, ["--experimental-strip-types", "scripts/fixtures/assert_row_invariants.ts", "--snapshot", snapshotPath]),
    ).not.toThrow();

    // Comparator should confirm description fields and citation->anchor overlap for survey issues.
    expect(() =>
      runNode(repoRoot, [
        "--experimental-strip-types",
        "scripts/fixtures/compare_truth.ts",
        "--snapshot",
        snapshotPath,
        "--datasets",
        "survey_issues",
      ]),
    ).not.toThrow();
    const snapshot = loadJson(snapshotPath);
    const surveyIssuesRow = (snapshot.rows as any[]).find((r) => r?.payload_json?.kind === "survey_issues");
    expect(surveyIssuesRow).toBeTruthy();

    const items = (surveyIssuesRow.payload_json.items as any[]).filter((it) => it?.kind === "survey_issue_item");
    const certGap = items.find((it) => it.issue_type === "survey_certification_gap");
    expect(certGap?.issue_code).toBe("CERT_MISSING_LENDER");
    expect(Array.isArray(certGap?.citation_ids) && certGap.citation_ids.length > 0).toBe(true);
  });
});

```

File: /Users/marc/Code/personal-projects/orbital-poc/scripts/fixtures/compare_truth.ts
```ts
import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { parseArgs, getStringArg, requireStringArg } from "./lib/args.ts";
import { parseCsv } from "./lib/csv.ts";
import { bboxCenter, bboxContainsPoint, polygonsToBBox } from "./lib/geometry.ts";
import { assertIsSnapshot, isRecord } from "./lib/snapshot.ts";

type AnchorBox = {
  page: number;
  bbox: readonly [number, number, number, number];
};

type AnchorFile = Record<string, AnchorBox>;

type DiffItem = {
  key: string;
  field: string;
  expected: string | null;
  actual: string | null;
};

type CitationMismatch = {
  key: string;
  expected_doc: string;
  expected_anchor: string;
  message: string;
  checked_citation_ids: string[];
};

type DatasetDiff = {
  dataset: string;
  pass: boolean;
  expected_count: number;
  actual_count: number;
  missing_keys: string[];
  extra_keys: string[];
  field_mismatches: DiffItem[];
  citation_mismatches: CitationMismatch[];
};

function norm_ws(input: string): string {
  return input.replace(/\r\n/g, "\n").trim().replace(/\s+/g, " ");
}

function norm_instrument_no(input: string): string {
  return input.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");
}

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function norm_date(input: string): string | null {
  const s = norm_ws(input);
  if (!s) return null;

  // ISO
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // MM/DD/YYYY
  const mdY = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdY) {
    const mm = Number(mdY[1]);
    const dd = Number(mdY[2]);
    const yyyy = Number(mdY[3]);
    if (!mm || !dd || !yyyy) return null;
    return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
  }

  // "Month DD, YYYY"
  const m = s.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (m) {
    const month = MONTHS[m[1].toLowerCase()];
    const day = Number(m[2]);
    const year = Number(m[3]);
    if (!month || !day || !year) return null;
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  return null;
}

function norm_tags(input: string): string {
  const parts = input
    .split(";")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)
    .sort();
  return parts.join(";");
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

function docToAnchorsFilename(docFilename: string): string {
  const base = docFilename.replace(/\.pdf$/i, "");
  return `${base}.anchors.json`;
}

async function loadAnchors(packId: string, docFilename: string): Promise<AnchorFile> {
  const anchorsPath = resolve(`docs/08-example-data/${packId}/layout/${docToAnchorsFilename(docFilename)}`);
  return await readJson<AnchorFile>(anchorsPath);
}

async function citationOverlapsAnchor(args: {
  pack_id: string;
  expected_doc: string;
  expected_anchor: string;
  citation_ids: string[];
  citations: Record<string, any>;
}): Promise<{ ok: true } | { ok: false; mismatch: CitationMismatch }> {
  const anchors = await loadAnchors(args.pack_id, args.expected_doc);
  const anchor = anchors[args.expected_anchor];
  if (!anchor) {
    return {
      ok: false,
      mismatch: {
        key: "",
        expected_doc: args.expected_doc,
        expected_anchor: args.expected_anchor,
        message: `Anchor not found in anchors file for doc`,
        checked_citation_ids: args.citation_ids,
      },
    };
  }

  for (const cid of args.citation_ids) {
    const cit = args.citations[cid];
    if (!cit) continue;
    if (cit.document_filename !== args.expected_doc) continue;
    if (cit.page_number !== anchor.page) continue;

    const bbox = polygonsToBBox(cit.polygons ?? []);
    if (!bbox) continue;
    const center = bboxCenter(bbox);
    if (bboxContainsPoint(anchor.bbox, center)) return { ok: true };
  }

  return {
    ok: false,
    mismatch: {
      key: "",
      expected_doc: args.expected_doc,
      expected_anchor: args.expected_anchor,
      message: `No citation overlapped expected anchor (doc=${args.expected_doc} anchor=${args.expected_anchor} page=${anchor.page})`,
      checked_citation_ids: args.citation_ids,
    },
  };
}

function findPayloadRow(snapshot: any, kind: string) {
  for (const row of snapshot.rows) {
    if (!row) continue;
    if (row.payload_schema_version !== "list_payload_v0") continue;
    if (!row.payload_json || !isRecord(row.payload_json)) continue;
    if (row.payload_json.kind === kind) return row;
  }
  return null;
}

function asString(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  return String(val);
}

async function diffRequirements(packId: string, snapshot: any): Promise<DatasetDiff> {
  const truthPath = resolve(`docs/08-example-data/${packId}/truth/expected_requirements_tracker.csv`);
  const truth = parseCsv(await readFile(truthPath, "utf8")).rows;

  const row = findPayloadRow(snapshot, "requirements_tracker");
  if (!row) {
    return {
      dataset: "requirements_tracker",
      pass: false,
      expected_count: truth.length,
      actual_count: 0,
      missing_keys: truth.map((t) => `bi:${t.bi_item}`),
      extra_keys: [],
      field_mismatches: [],
      citation_mismatches: [],
    };
  }

  const payload = row.payload_json as any;
  const items = Array.isArray(payload.items) ? payload.items.filter((i: any) => i?.kind === "requirements_tracker_item") : [];

  const byBi = new Map<number, any>();
  for (const it of items) {
    if (typeof it?.bi_item === "number") byBi.set(it.bi_item, it);
  }

  const missingKeys: string[] = [];
  const fieldMismatches: DiffItem[] = [];
  const citationMismatches: CitationMismatch[] = [];

  for (const t of truth) {
    const bi = Number(t.bi_item);
    const key = `bi:${t.bi_item}`;
    const it = byBi.get(bi);
    if (!it) {
      missingKeys.push(key);
      continue;
    }

    if (norm_ws(asString(it.requirement) ?? "") !== norm_ws(t.requirement)) {
      fieldMismatches.push({ key, field: "requirement", expected: t.requirement, actual: asString(it.requirement) });
    }
    if (norm_ws(asString(it.owner) ?? "") !== norm_ws(t.owner)) {
      fieldMismatches.push({ key, field: "owner", expected: t.owner, actual: asString(it.owner) });
    }
    if (norm_ws(asString(it.item_status) ?? "") !== norm_ws(t.status)) {
      fieldMismatches.push({ key, field: "item_status", expected: t.status, actual: asString(it.item_status) });
    }

    const overlap = await citationOverlapsAnchor({
      pack_id: packId,
      expected_doc: t.citation_doc,
      expected_anchor: t.citation_anchor,
      citation_ids: Array.isArray(it.citation_ids) ? it.citation_ids : [],
      citations: snapshot.citations,
    });
    if (!overlap.ok) {
      citationMismatches.push({ ...overlap.mismatch, key });
    }
  }

  const expectedKeySet = new Set(truth.map((t) => Number(t.bi_item)));
  const extraKeys = Array.from(byBi.keys())
    .filter((bi) => !expectedKeySet.has(bi))
    .map((bi) => `bi:${bi}`);

  const pass =
    missingKeys.length === 0 &&
    extraKeys.length === 0 &&
    fieldMismatches.length === 0 &&
    citationMismatches.length === 0 &&
    items.length === truth.length;

  return {
    dataset: "requirements_tracker",
    pass,
    expected_count: truth.length,
    actual_count: items.length,
    missing_keys: missingKeys,
    extra_keys: extraKeys,
    field_mismatches: fieldMismatches,
    citation_mismatches: citationMismatches,
  };
}

async function diffExceptions(packId: string, snapshot: any): Promise<DatasetDiff> {
  const truthPath = resolve(`docs/08-example-data/${packId}/truth/expected_exceptions_table.csv`);
  const truth = parseCsv(await readFile(truthPath, "utf8")).rows;

  const row = findPayloadRow(snapshot, "exceptions_table");
  if (!row) {
    return {
      dataset: "exceptions_table",
      pass: false,
      expected_count: truth.length,
      actual_count: 0,
      missing_keys: truth.map((t) => `bii:${t.bii_item}`),
      extra_keys: [],
      field_mismatches: [],
      citation_mismatches: [],
    };
  }

  const payload = row.payload_json as any;
  const items = Array.isArray(payload.items) ? payload.items.filter((i: any) => i?.kind === "exceptions_table_item") : [];

  const byBii = new Map<number, any>();
  for (const it of items) {
    if (typeof it?.bii_item === "number") byBii.set(it.bii_item, it);
  }

  const missingKeys: string[] = [];
  const fieldMismatches: DiffItem[] = [];
  const citationMismatches: CitationMismatch[] = [];

  for (const t of truth) {
    const bii = Number(t.bii_item);
    const key = `bii:${t.bii_item}`;
    const it = byBii.get(bii);
    if (!it) {
      missingKeys.push(key);
      continue;
    }

    if (norm_ws(asString(it.type) ?? "") !== norm_ws(t.type)) {
      fieldMismatches.push({ key, field: "type", expected: t.type, actual: asString(it.type) });
    }
    if (norm_instrument_no(asString(it.instrument_no) ?? "") !== norm_instrument_no(t.instrument_no)) {
      fieldMismatches.push({ key, field: "instrument_no", expected: t.instrument_no, actual: asString(it.instrument_no) });
    }
    const truthDate = norm_date(t.recorded);
    const actualDate = norm_date(asString(it.recorded_date) ?? "");
    if (truthDate !== actualDate) {
      fieldMismatches.push({ key, field: "recorded_date", expected: truthDate, actual: actualDate });
    }
    if (norm_ws(asString(it.doc) ?? "") !== norm_ws(t.doc)) {
      fieldMismatches.push({ key, field: "doc", expected: t.doc, actual: asString(it.doc) });
    }

    const truthTags = norm_tags(t.risk_tags);
    const actualTags = Array.isArray(it.risk_tags) ? norm_tags(it.risk_tags.join(";")) : norm_tags(asString(it.risk_tags) ?? "");
    if (truthTags !== actualTags) {
      fieldMismatches.push({ key, field: "risk_tags", expected: truthTags, actual: actualTags });
    }

    if (norm_ws(asString(it.item_status) ?? "") !== norm_ws(t.status)) {
      fieldMismatches.push({ key, field: "item_status", expected: t.status, actual: asString(it.item_status) });
    }

    const overlap = await citationOverlapsAnchor({
      pack_id: packId,
      expected_doc: t.citation_doc,
      expected_anchor: t.citation_anchor,
      citation_ids: Array.isArray(it.citation_ids) ? it.citation_ids : [],
      citations: snapshot.citations,
    });
    if (!overlap.ok) {
      citationMismatches.push({ ...overlap.mismatch, key });
    }
  }

  const expectedKeySet = new Set(truth.map((t) => Number(t.bii_item)));
  const extraKeys = Array.from(byBii.keys())
    .filter((bii) => !expectedKeySet.has(bii))
    .map((bii) => `bii:${bii}`);

  const pass =
    missingKeys.length === 0 &&
    extraKeys.length === 0 &&
    fieldMismatches.length === 0 &&
    citationMismatches.length === 0 &&
    items.length === truth.length;

  return {
    dataset: "exceptions_table",
    pass,
    expected_count: truth.length,
    actual_count: items.length,
    missing_keys: missingKeys,
    extra_keys: extraKeys,
    field_mismatches: fieldMismatches,
    citation_mismatches: citationMismatches,
  };
}

async function diffSurveyIssues(packId: string, snapshot: any): Promise<DatasetDiff> {
  const truthPath = resolve(`docs/08-example-data/${packId}/truth/expected_survey_issues.csv`);
  const truth = parseCsv(await readFile(truthPath, "utf8")).rows;

  const row = findPayloadRow(snapshot, "survey_issues");
  if (!row) {
    return {
      dataset: "survey_issues",
      pass: false,
      expected_count: truth.length,
      actual_count: 0,
      missing_keys: truth.map((t) => `${t.issue_type}:${norm_ws(t.description)}`),
      extra_keys: [],
      field_mismatches: [],
      citation_mismatches: [],
    };
  }

  const payload = row.payload_json as any;
  const items = Array.isArray(payload.items) ? payload.items.filter((i: any) => i?.kind === "survey_issue_item") : [];

  const keyForTruth = (t: any) => `${t.issue_type}:${norm_ws(t.description)}`;
  const keyForItem = (it: any) => `${String(it.issue_type ?? "")}:${norm_ws(String(it.description ?? ""))}`;

  const byKey = new Map<string, any>();
  for (const it of items) {
    const k = keyForItem(it);
    if (k !== ":") byKey.set(k, it);
  }

  const missingKeys: string[] = [];
  const fieldMismatches: DiffItem[] = [];
  const citationMismatches: CitationMismatch[] = [];

  for (const t of truth) {
    const key = keyForTruth(t);
    const it = byKey.get(key);
    if (!it) {
      missingKeys.push(key);
      continue;
    }

    if (norm_ws(asString(it.description) ?? "") !== norm_ws(t.description)) {
      fieldMismatches.push({ key, field: "description", expected: t.description, actual: asString(it.description) });
    }
    if (norm_ws(asString(it.impact) ?? "") !== norm_ws(t.impact)) {
      fieldMismatches.push({ key, field: "impact", expected: t.impact, actual: asString(it.impact) });
    }
    if (norm_ws(asString(it.suggested_fix) ?? "") !== norm_ws(t.suggested_fix)) {
      fieldMismatches.push({ key, field: "suggested_fix", expected: t.suggested_fix, actual: asString(it.suggested_fix) });
    }

    const overlap = await citationOverlapsAnchor({
      pack_id: packId,
      expected_doc: t.citation_doc,
      expected_anchor: t.citation_anchor,
      citation_ids: Array.isArray(it.citation_ids) ? it.citation_ids : [],
      citations: snapshot.citations,
    });
    if (!overlap.ok) {
      citationMismatches.push({ ...overlap.mismatch, key });
    }
  }

  const expectedKeySet = new Set(truth.map((t) => keyForTruth(t)));
  const extraKeys = Array.from(byKey.keys()).filter((k) => !expectedKeySet.has(k));

  const pass =
    missingKeys.length === 0 &&
    extraKeys.length === 0 &&
    fieldMismatches.length === 0 &&
    citationMismatches.length === 0 &&
    items.length === truth.length;

  return {
    dataset: "survey_issues",
    pass,
    expected_count: truth.length,
    actual_count: items.length,
    missing_keys: missingKeys,
    extra_keys: extraKeys,
    field_mismatches: fieldMismatches,
    citation_mismatches: citationMismatches,
  };
}

async function diffSurveyCertificationParties(packId: string, snapshot: any): Promise<DatasetDiff> {
  const truthPath = resolve(`docs/08-example-data/${packId}/truth/expected_survey_certification_parties.csv`);
  const truth = parseCsv(await readFile(truthPath, "utf8")).rows;

  const row = findPayloadRow(snapshot, "survey_certification_parties");
  if (!row) {
    return {
      dataset: "survey_certification_parties",
      pass: false,
      expected_count: truth.length,
      actual_count: 0,
      missing_keys: truth.map((t) => norm_ws(String(t.party_name ?? ""))),
      extra_keys: [],
      field_mismatches: [],
      citation_mismatches: [],
    };
  }

  const payload = row.payload_json as any;
  const items = Array.isArray(payload.items)
    ? payload.items.filter((i: any) => i?.kind === "survey_certification_party_item")
    : [];

  const keyForTruth = (t: any) => norm_ws(String(t.party_name ?? ""));
  const keyForItem = (it: any) => norm_ws(String(it.party_name ?? ""));

  const byKey = new Map<string, any>();
  for (const it of items) {
    const k = keyForItem(it);
    if (k) byKey.set(k, it);
  }

  const missingKeys: string[] = [];
  const fieldMismatches: DiffItem[] = [];
  const citationMismatches: CitationMismatch[] = [];

  for (const t of truth) {
    const key = keyForTruth(t);
    const it = byKey.get(key);
    if (!it) {
      missingKeys.push(key);
      continue;
    }

    if (norm_ws(asString(it.party_name) ?? "") !== norm_ws(String(t.party_name ?? ""))) {
      fieldMismatches.push({ key, field: "party_name", expected: asString(t.party_name), actual: asString(it.party_name) });
    }

    const overlap = await citationOverlapsAnchor({
      pack_id: packId,
      expected_doc: String(t.citation_doc ?? ""),
      expected_anchor: String(t.citation_anchor ?? ""),
      citation_ids: Array.isArray(it.citation_ids) ? it.citation_ids : [],
      citations: snapshot.citations,
    });
    if (!overlap.ok) {
      citationMismatches.push({ ...overlap.mismatch, key });
    }
  }

  const expectedKeySet = new Set(truth.map((t) => keyForTruth(t)));
  const extraKeys = Array.from(byKey.keys()).filter((k) => !expectedKeySet.has(k));

  const pass =
    missingKeys.length === 0 &&
    extraKeys.length === 0 &&
    fieldMismatches.length === 0 &&
    citationMismatches.length === 0 &&
    items.length === truth.length;

  return {
    dataset: "survey_certification_parties",
    pass,
    expected_count: truth.length,
    actual_count: items.length,
    missing_keys: missingKeys,
    extra_keys: extraKeys,
    field_mismatches: fieldMismatches,
    citation_mismatches: citationMismatches,
  };
}

async function diffScalarGoldenQuestions(packId: string, snapshot: any): Promise<DatasetDiff> {
  const truthPath = resolve(`docs/08-example-data/${packId}/truth/golden_questions.json`);
  const golden = await readJson<any[]>(truthPath);

  const scalarQs = golden.filter((q) => typeof q?.question_id === "string" && !["TS-03", "TS-04", "TS-09"].includes(q.question_id));
  const byQid = new Map<string, any>();
  for (const row of snapshot.rows) byQid.set(row.question_id, row);

  const missingKeys: string[] = [];
  const fieldMismatches: DiffItem[] = [];
  const citationMismatches: CitationMismatch[] = [];

  for (const q of scalarQs) {
    const qid = q.question_id;
    const row = byQid.get(qid);
    if (!row) {
      missingKeys.push(qid);
      continue;
    }

    const answer = norm_ws(String(row.answer ?? ""));
    const expectedContains = Array.isArray(q.expected_answer_contains) ? q.expected_answer_contains : [];
    for (const frag of expectedContains) {
      const f = String(frag);
      if (!answer.toLowerCase().includes(f.toLowerCase())) {
        fieldMismatches.push({ key: qid, field: "answer_contains", expected: f, actual: answer });
      }
    }

    const expectedCits = Array.isArray(q.expected_citations) ? q.expected_citations : [];
    for (const ec of expectedCits) {
      const overlap = await citationOverlapsAnchor({
        pack_id: packId,
        expected_doc: ec.doc,
        expected_anchor: ec.anchor,
        citation_ids: Array.isArray(row.citation_ids) ? row.citation_ids : [],
        citations: snapshot.citations,
      });
      if (!overlap.ok) {
        citationMismatches.push({ ...overlap.mismatch, key: qid });
      }
    }
  }

  const pass = missingKeys.length === 0 && fieldMismatches.length === 0 && citationMismatches.length === 0;
  return {
    dataset: "golden_questions_scalar",
    pass,
    expected_count: scalarQs.length,
    actual_count: scalarQs.length - missingKeys.length,
    missing_keys: missingKeys,
    extra_keys: [],
    field_mismatches: fieldMismatches,
    citation_mismatches: citationMismatches,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const snapshotPath = resolve(requireStringArg(args, "snapshot"));
  const packArg = getStringArg(args, "pack");
  const datasetsArg = getStringArg(args, "datasets");

  const outResult = getStringArg(args, "out-result") ? resolve(getStringArg(args, "out-result")!) : undefined;
  const outDiff = getStringArg(args, "out-diff") ? resolve(getStringArg(args, "out-diff")!) : undefined;

  const snapshotRaw = JSON.parse(await readFile(snapshotPath, "utf8")) as unknown;
  const snapshot = assertIsSnapshot(snapshotRaw);
  const packId = packArg ?? snapshot.meta.pack_id;

  const diffs: DatasetDiff[] = [];

  const requested = datasetsArg
    ? new Set(
        datasetsArg
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      )
    : null;
  const autoMode = requested === null;

  const want = (name: string) => (requested ? requested.has(name) : true);

  // Auto mode (default): only compare datasets that are present in the snapshot, so spike snapshots can be partial.
  if (want("requirements") && (!autoMode || findPayloadRow(snapshot, "requirements_tracker"))) {
    diffs.push(await diffRequirements(packId, snapshot));
  }
  if (want("exceptions") && (!autoMode || findPayloadRow(snapshot, "exceptions_table"))) {
    diffs.push(await diffExceptions(packId, snapshot));
  }
  if (want("survey_issues") && (!autoMode || findPayloadRow(snapshot, "survey_issues"))) {
    diffs.push(await diffSurveyIssues(packId, snapshot));
  }
  if (want("survey_certification_parties") && (!autoMode || findPayloadRow(snapshot, "survey_certification_parties"))) {
    diffs.push(await diffSurveyCertificationParties(packId, snapshot));
  }
  if (want("golden_scalar")) {
    const truthPath = resolve(`docs/08-example-data/${packId}/truth/golden_questions.json`);
    const golden = await readJson<any[]>(truthPath);
    const scalarIds = new Set(
      golden
        .filter((q) => typeof q?.question_id === "string" && !["TS-03", "TS-04", "TS-09"].includes(q.question_id))
        .map((q) => q.question_id),
    );
    const hasAnyScalar = snapshot.rows.some((r: any) => scalarIds.has(String(r?.question_id ?? "")));
    if (!autoMode || hasAnyScalar) diffs.push(await diffScalarGoldenQuestions(packId, snapshot));
  }

  if (diffs.length === 0) {
    throw new Error(
      `No comparable datasets found in snapshot. Provide list payload rows (payload_schema_version=list_payload_v0) or pass --datasets requirements,exceptions,survey_issues,survey_certification_parties,golden_scalar`,
    );
  }

  const pass = diffs.every((d) => d.pass);

  const result = {
    pass,
    pack_id: packId,
    snapshot_path: snapshotPath,
    datasets: diffs.map((d) => d.dataset),
    diffs: diffs.map((d) => ({
      dataset: d.dataset,
      pass: d.pass,
      expected_count: d.expected_count,
      actual_count: d.actual_count,
      missing: d.missing_keys.length,
      extra: d.extra_keys.length,
      field_mismatches: d.field_mismatches.length,
      citation_mismatches: d.citation_mismatches.length,
    })),
  };

  const diffOut = { diffs };

  if (outResult) await writeFile(outResult, JSON.stringify(result, null, 2) + "\n", "utf8");
  if (outDiff) await writeFile(outDiff, JSON.stringify(diffOut, null, 2) + "\n", "utf8");

  const label = basename(snapshotPath);
  if (pass) {
    process.stdout.write(`PASS compare_truth (${packId}) snapshot=${label}\n`);
    process.exit(0);
  }

  process.stdout.write(`FAIL compare_truth (${packId}) snapshot=${label}\n`);
  for (const d of diffs.filter((x) => !x.pass)) {
    process.stdout.write(
      `- ${d.dataset}: expected=${d.expected_count} actual=${d.actual_count} missing=${d.missing_keys.length} extra=${d.extra_keys.length} field_mismatches=${d.field_mismatches.length} citation_mismatches=${d.citation_mismatches.length}\n`,
    );
  }
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(String(err?.stack ?? err) + "\n");
  process.exit(2);
});

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/spikes/rh1.schemas.ts
```ts
import { z } from "zod";

export const LocalPdfQuerySchema = z.object({
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i, "Invalid pack id"),
  filename: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_.-]+\.pdf$/i, "Invalid filename"),
});

export type LocalPdfQuery = z.infer<typeof LocalPdfQuerySchema>;

export const PdfPerfJumpRowSchema = z.object({
  requestedPage: z.number().int().positive(),
  cancelledPrevious: z.boolean(),
  t_request: z.number(),
  t_gotPage: z.number().nullable(),
  t_renderStart: z.number().nullable(),
  t_renderEnd: z.number().nullable(),
  getPageMs: z.number().nullable(),
  renderMs: z.number().nullable(),
  totalMs: z.number().nullable(),
  error: z.string().optional(),
});

export type PdfPerfJumpRow = z.infer<typeof PdfPerfJumpRowSchema>;

export const PdfPerfLongTaskStatsSchema = z.object({
  longTaskCount: z.number().int().nonnegative(),
  maxLongTaskMs: z.number().nonnegative(),
  totalLongTaskMs: z.number().nonnegative(),
});

export type PdfPerfLongTaskStats = z.infer<typeof PdfPerfLongTaskStatsSchema>;

export const PdfPerfRunSchema = z.object({
  createdAt: z.string(),
  pdfjsVersion: z.string().optional(),
  userAgent: z.string().optional(),
  devicePixelRatio: z.number().optional(),

  doc: z.object({
    pack: z.string(),
    filename: z.string(),
    document_id: z.string(),
  }),

  zoomPercent: z.number(),
  pageRotate: z.number().optional(),
  viewport: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  canvas: z
    .object({
      width: z.number(),
      height: z.number(),
      cssWidth: z.number(),
      cssHeight: z.number(),
    })
    .optional(),

  test: z.object({
    type: z.enum(["serial", "spam"]),
    n: z.number().int().positive(),
    intervalMs: z.number().int().nonnegative().optional(),
    pageSequence: z.array(z.number().int().positive()),
  }),

  rows: z.array(PdfPerfJumpRowSchema),
  longTasks: PdfPerfLongTaskStatsSchema,
});

export type PdfPerfRun = z.infer<typeof PdfPerfRunSchema>;

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/quickStartRunProcessor.server.ts
```ts
import "server-only";

import {
  LIST_PAYLOAD_V0_SCHEMA_VERSION,
  ListPayloadV0KindSchema,
  ListPayloadV0Schema,
  emptyListPayloadV0,
} from "@orbital-poc/core";

import { ensureSchema, sql } from "./db.server";
import { newId } from "./ids";
import { loadQuestionSetV1 } from "./questionSet.server";
import { safeErrMessage } from "./safeErrMessage";

type RunRow = {
  id: string;
  folder_id: string;
  state: string;
  question_set_version: string;
  trace_id: string | null;
  questions_total: number;
  questions_done: number;
};

type FailureCounts = Record<string, number>;

type JsonArg = Parameters<typeof sql.json>[0];

function missingInputRow(args: { folderId: string; questionSetVersion: string; questionId: string; question: string }) {
  return {
    folder_id: args.folderId,
    question_set_version: args.questionSetVersion,
    question_id: args.questionId,
    question: args.question,
    answer: "Not found in provided documents.",
    status: "missing_input" as const,
    notes: null as string | null,
    provenance_json: {
      missing_docs_checklist: [
        {
          label: "Upload the referenced document(s)",
          confidence: 1,
          signals: [
            {
              type: "phrase",
              value: args.question,
              source: "system",
            },
          ],
        },
      ],
    },
    payload_schema_version: null as string | null,
    payload_json: null as unknown | null,
  };
}

function citationFailedRow(args: { folderId: string; questionSetVersion: string; questionId: string; question: string }) {
  return {
    folder_id: args.folderId,
    question_set_version: args.questionSetVersion,
    question_id: args.questionId,
    question: args.question,
    answer: "Unable to produce locked citations in this slice.",
    status: "citation_failed" as const,
    notes: null as string | null,
    provenance_json: {
      reason_code: "NO_CITATIONS",
      checklist: [
        "Confirm the correct PDFs are uploaded for this folder.",
        "Re-run the workflow after retrieval+locking is implemented.",
      ],
    },
    payload_schema_version: null as string | null,
    payload_json: null as unknown | null,
  };
}

function attachListPayloadIfNeeded<T extends { payload_schema_version: string | null; payload_json: unknown | null }>(
  row: T,
  question: { response_kind: string; artefact_kind?: string; payload_schema_version?: string },
): T {
  if (question.response_kind !== "list_payload") return row;

  if (question.payload_schema_version !== LIST_PAYLOAD_V0_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported payload_schema_version for list_payload: ${String(question.payload_schema_version ?? "null")}`,
    );
  }

  const kind = ListPayloadV0KindSchema.parse(question.artefact_kind);
  const payload = emptyListPayloadV0(kind);
  ListPayloadV0Schema.parse(payload);

  return {
    ...row,
    payload_schema_version: LIST_PAYLOAD_V0_SCHEMA_VERSION,
    payload_json: payload,
  } as T;
}

function asReasonCode(val: unknown): string | null {
  if (!val || typeof val !== "object" || Array.isArray(val)) return null;
  const rec = val as Record<string, unknown>;
  const direct = rec.reason_code;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const verify = rec.verify;
  if (verify && typeof verify === "object" && !Array.isArray(verify)) {
    const s = (verify as Record<string, unknown>).reason_code;
    if (typeof s === "string" && s.trim()) return s.trim();
  }
  const verification = rec.verification;
  if (verification && typeof verification === "object" && !Array.isArray(verification)) {
    const s = (verification as Record<string, unknown>).reason_code;
    if (typeof s === "string" && s.trim()) return s.trim();
  }
  return null;
}

async function recomputeRunProgress(args: { runId: string }): Promise<{ questionsDone: number; failureCounts: FailureCounts }> {
  const done = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int as n
    FROM report_rows
    WHERE run_id = ${args.runId}
  `;
  const questionsDone = done[0]?.n ?? 0;

  // Keep failure taxonomy deterministic across retries by deriving from stored rows.
  const failed = await sql<Array<{ provenance_json: unknown }>>`
    SELECT provenance_json
    FROM report_rows
    WHERE run_id = ${args.runId}
      AND status = 'citation_failed'
  `;
  const counts: FailureCounts = {};
  for (const r of failed) {
    const reasonCode = asReasonCode(r.provenance_json) ?? "VALIDATION_ERROR";
    counts[reasonCode] = (counts[reasonCode] ?? 0) + 1;
  }

  return { questionsDone, failureCounts: counts };
}

export async function processQuickStartRun(runId: string): Promise<void> {
  await ensureSchema();

  const runs = await sql<RunRow[]>`
    SELECT id, folder_id, state, question_set_version, trace_id, questions_total, questions_done
    FROM runs
    WHERE id = ${runId}
    LIMIT 1
  `;
  const run = runs[0];
  if (!run) return;
  if (run.state !== "running") return;

  const { version: currentQuestionSetVersion, questionSet } = await loadQuestionSetV1();
  if (currentQuestionSetVersion !== run.question_set_version) {
    await sql`
      UPDATE runs
      SET state = 'failed',
          error_json = ${sql.json({
            code: "QUESTION_SET_MISMATCH",
            message: "Pinned question_set_version does not match current question set.",
          })},
          updated_at = now()
      WHERE id = ${runId}
    `;
    return;
  }

  const docCounts = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int as n
    FROM documents
    WHERE folder_id = ${run.folder_id}
      AND upload_completed_at IS NOT NULL
      AND parse_status = 'parsed'
      AND ocr_status = 'done'
  `;
  const hasDocs = (docCounts[0]?.n ?? 0) > 0;

  const existing = await sql<Array<{ question_id: string }>>`
    SELECT question_id
    FROM report_rows
    WHERE run_id = ${runId}
  `;
  const existingQids = new Set(existing.map((r) => r.question_id));

  // If we resumed a running run (server restart, retries), make progress reflect
  // already-written rows immediately so polling UIs stay consistent.
  if (existingQids.size > 0) {
    const { questionsDone, failureCounts } = await recomputeRunProgress({ runId });
    await sql`
      UPDATE runs
      SET questions_done = ${questionsDone},
          failure_counts_json = ${sql.json(failureCounts)},
          updated_at = now()
      WHERE id = ${runId}
    `;
  }

  for (const q of questionSet.questions) {
    const stepKey = `quick_start:${run.question_set_version}:question:${q.question_id}:write_row`;
    const stepId = newId("stp");
    const rowId = newId("row");
    const traceId = run.trace_id ?? newId("trc");

    // If the row already exists (retries, restarts), skip all side effects.
    if (existingQids.has(q.question_id)) continue;

    const row = hasDocs
      ? citationFailedRow({
          folderId: run.folder_id,
          questionSetVersion: run.question_set_version,
          questionId: q.question_id,
          question: q.question,
        })
      : missingInputRow({
          folderId: run.folder_id,
          questionSetVersion: run.question_set_version,
          questionId: q.question_id,
          question: q.question,
        });
    let rowWithPayload: typeof row = row;
    try {
      rowWithPayload = attachListPayloadIfNeeded(row, q);
    } catch {
      // If the question set metadata is malformed, fail safely without crashing the run.
      rowWithPayload = citationFailedRow({
        folderId: run.folder_id,
        questionSetVersion: run.question_set_version,
        questionId: q.question_id,
        question: q.question,
      });
      rowWithPayload.provenance_json = {
        reason_code: "VALIDATION_ERROR",
        checklist: ["Question set payload metadata is invalid for this row."],
      };
    }

    const reasonCode =
      rowWithPayload.status === "citation_failed"
        ? String((rowWithPayload.provenance_json as { reason_code?: unknown }).reason_code ?? "VALIDATION_ERROR")
        : null;

    let wrote = false;
    try {
      wrote = await sql.begin(async (tx) => {
        const t = tx as unknown as typeof sql;

        // Step idempotency: deterministic step_key prevents duplicate row writes on retries.
        const steps = await t<{ id: string }[]>`
          INSERT INTO run_steps (
            id,
            run_id,
            step_type,
            state,
            attempt,
            step_key,
            trace_id,
            question_id,
            metrics_json,
            error_json,
            created_at,
            updated_at
          )
          VALUES (
            ${stepId},
            ${runId},
            'write_row',
            'succeeded',
            1,
            ${stepKey},
            ${traceId},
            ${q.question_id},
            ${t.json({ row_status: rowWithPayload.status })},
            NULL,
            now(),
            now()
          )
          ON CONFLICT (run_id, step_key) DO NOTHING
          RETURNING id
        `;
        if (!steps[0]) return false;

        const payload = rowWithPayload.payload_json ?? null;
        const payloadJson = payload === null ? null : t.json(payload as JsonArg);

        const inserted = await t<{ id: string }[]>`
          INSERT INTO report_rows (
            id,
            run_id,
            folder_id,
            question_set_version,
            question_id,
            question,
            answer,
            status,
            notes,
            provenance_json,
            payload_schema_version,
            payload_json,
            created_at,
            updated_at
          )
          VALUES (
            ${rowId},
            ${runId},
            ${rowWithPayload.folder_id},
            ${rowWithPayload.question_set_version},
            ${rowWithPayload.question_id},
            ${rowWithPayload.question},
            ${rowWithPayload.answer},
            ${rowWithPayload.status},
            ${rowWithPayload.notes},
            ${t.json(rowWithPayload.provenance_json)},
            ${rowWithPayload.payload_schema_version},
            ${payloadJson},
            now(),
            now()
          )
          ON CONFLICT (run_id, question_id) DO NOTHING
          RETURNING id
        `;

        if (!inserted[0]) return false;

        const reasonKey = reasonCode ?? "VALIDATION_ERROR";
        await t`
          UPDATE runs
          SET questions_done = LEAST(questions_total, questions_done + 1),
              failure_counts_json = CASE
                WHEN ${rowWithPayload.status} = 'citation_failed' THEN jsonb_set(
                  failure_counts_json,
                  ARRAY[${reasonKey}]::text[],
                  to_jsonb(COALESCE((failure_counts_json->>${reasonKey})::int, 0) + 1),
                  true
                )
                ELSE failure_counts_json
              END,
              updated_at = now()
          WHERE id = ${runId}
        `;

        return true;
      });
    } catch (err) {
      // Row-level failure should not crash the run. Best-effort: emit a terminal
      // citation_failed row with a safe reason_code, then continue.
      // eslint-disable-next-line no-console
      console.error("run.step failed", {
        run_id: runId,
        trace_id: traceId,
        step_key: stepKey,
        question_id: q.question_id,
        message: safeErrMessage(err),
      });

      const fallback = citationFailedRow({
        folderId: run.folder_id,
        questionSetVersion: run.question_set_version,
        questionId: q.question_id,
        question: q.question,
      });
      fallback.provenance_json = {
        reason_code: "VALIDATION_ERROR",
        checklist: [
          "Retry the run (step idempotency should avoid duplicates).",
          "Inspect server logs using the run_id and trace_id for correlation.",
        ],
      };
      let fallbackWithPayload: typeof fallback = fallback;
      try {
        fallbackWithPayload = attachListPayloadIfNeeded(fallback, q);
      } catch {
        // Keep the fallback row writable even if question metadata is malformed.
      }

      try {
        wrote = await sql.begin(async (tx) => {
          const t = tx as unknown as typeof sql;

          await t`
            INSERT INTO run_steps (
              id,
              run_id,
              step_type,
              state,
              attempt,
              step_key,
              trace_id,
              question_id,
              metrics_json,
              error_json,
              created_at,
              updated_at
            )
            VALUES (
              ${newId("stp")},
              ${runId},
              'write_row',
              'succeeded',
              1,
              ${stepKey},
              ${traceId},
              ${q.question_id},
              ${t.json({ row_status: "citation_failed", reason_code: "VALIDATION_ERROR" })},
              NULL,
              now(),
              now()
            )
            ON CONFLICT (run_id, step_key) DO NOTHING
          `;

          const payload = fallbackWithPayload.payload_json ?? null;
          const payloadJson = payload === null ? null : t.json(payload as JsonArg);

          const inserted = await t<{ id: string }[]>`
            INSERT INTO report_rows (
              id,
              run_id,
              folder_id,
              question_set_version,
              question_id,
              question,
              answer,
              status,
              notes,
              provenance_json,
              payload_schema_version,
              payload_json,
              created_at,
              updated_at
            )
            VALUES (
              ${newId("row")},
              ${runId},
              ${fallbackWithPayload.folder_id},
              ${fallbackWithPayload.question_set_version},
              ${fallbackWithPayload.question_id},
              ${fallbackWithPayload.question},
              ${fallbackWithPayload.answer},
              ${fallbackWithPayload.status},
              ${fallbackWithPayload.notes},
              ${t.json(fallbackWithPayload.provenance_json)},
              ${fallbackWithPayload.payload_schema_version},
              ${payloadJson},
              now(),
              now()
            )
            ON CONFLICT (run_id, question_id) DO NOTHING
            RETURNING id
          `;

          if (!inserted[0]) return false;

          await t`
            UPDATE runs
            SET questions_done = LEAST(questions_total, questions_done + 1),
                failure_counts_json = jsonb_set(
                  failure_counts_json,
                  ARRAY['VALIDATION_ERROR']::text[],
                  to_jsonb(COALESCE((failure_counts_json->>'VALIDATION_ERROR')::int, 0) + 1),
                  true
                ),
                updated_at = now()
            WHERE id = ${runId}
          `;
          return true;
        });
      } catch {
        // If we can't write the fallback row, just continue; finalization will
        // mark the run partial if not all rows were persisted.
      }
    }

    if (wrote) {
      existingQids.add(q.question_id);
      // eslint-disable-next-line no-console
      console.info("run.step", {
        run_id: runId,
        trace_id: run.trace_id ?? null,
        step_key: stepKey,
        question_id: q.question_id,
        row_status: rowWithPayload.status,
        reason_code: reasonCode,
      });

      // Yield a small window so polling clients can observe incremental row writes.
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  const { questionsDone, failureCounts } = await recomputeRunProgress({ runId });
  await sql`
    UPDATE runs
    SET questions_done = ${questionsDone},
        failure_counts_json = ${sql.json(failureCounts)},
        updated_at = now()
    WHERE id = ${runId}
  `;

  await sql`
    UPDATE runs
    SET state = 'completed',
        updated_at = now()
    WHERE id = ${runId}
      AND state = 'running'
      AND questions_done >= questions_total
  `;

  // If we couldn't persist terminal rows for every question, avoid leaving the
  // run stuck in running. Keep it inspectable with a safe error envelope.
  if (questionsDone < run.questions_total) {
    await sql`
      UPDATE runs
      SET state = 'partial',
          error_json = ${sql.json({
            code: "ROW_WRITE_INCOMPLETE",
            message: "Run completed with missing terminal rows.",
            details: { questions_total: run.questions_total, questions_done: questionsDone },
          })},
          updated_at = now()
      WHERE id = ${runId}
        AND state = 'running'
    `;
  }

  // eslint-disable-next-line no-console
  console.info("run.completed", { run_id: runId, trace_id: run.trace_id ?? null });
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/stuck-extract.md
```md
# 0002 Quick Start Engine: Where It’s Stuck + What You Need To Answer (Copy/Paste)

Source-of-truth pointers:
- Consolidated PRD + story list: `docs/04-projects/02-features/0002_quick-start-engine/prd.json`
- GO/NO-GO checklist: `docs/04-projects/02-features/0002_quick-start-engine/brief.md`
- Risk register (what’s still open): `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md`
- Spike instructions + report stubs: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- Proof artefacts folder: `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/`

Current state (as of PRD date 2026-02-08):
- `prd.json` metadata is `Draft (NO-GO until key spikes close)` and all stories `US-001..US-006` are `status: open`.
- Most gating spikes are still marked `open` in `risk-register.md`.
- Only “docs-level” proof artefacts exist so far (not fixture-verifiable spike outputs).

---

## 1) Which Stories Are Stuck (And Why)

Story list (from `docs/04-projects/02-features/0002_quick-start-engine/prd.json`):
- `US-001` (Slice 0002a Run skeleton): blocked on closing SP-2.1 + SP-2.6 (and likely SP-2.12 if scan packs are in play).
- `US-002` (Slice 0002b Row payload + rendering): blocked on SP-2.7 + SP-2.11 (and SP-2.1).
- `US-003` (Slice 0002c Commitment parsing): blocked on SP-2.8 + SP-2.2A (and depends on `US-002`).
- `US-004` (Slice 0002d Exception matching): blocked on SP-2.3A (and depends on `US-003`).
- `US-005` (Slice 0002e Survey extraction): blocked on SP-2.4A (and depends on `US-002`).
- `US-006` (Slice 0002f Reconciliation honesty): blocked on SP-2.5 (and depends on `US-004` + `US-005`).

Why they’re stuck:
- The dossier defines explicit spike gates as NO-GO blockers in `brief.md` and `plan.md`.
- The risk register entries that correspond to those spike gates are still `open` in `risk-register.md`.
- The required fixture-verifiable proof artefacts (snapshots/diffs/results) have not been committed under `spike-proofs/`.

---

## 2) The Open Questions You Need To Answer (From PRD)

These are literally listed under `openQuestions` in `docs/04-projects/02-features/0002_quick-start-engine/prd.json` and map to spikes:

1. Payload representation decision (SP-2.7)
   - Question: where does the structured list payload live, and how does the API expose it (so UI renders tables without prose parsing)?
   - Where to answer:
     - Spike plan/stub: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.7)
     - Decision note (already exists): `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.7_decision.md`
     - Schema contract: `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md`
     - Architecture docs (must align): `docs/03-architecture/30_data_model.md`, `docs/03-architecture/50_api_surface.md`
   - What you still need to “close”:
     - Confirm Option 4 is final, and update `risk-register.md` RH-2.2 from `open` -> `closed` (or explicitly justify why it stays open).
     - Ensure `list_verification_policy_v1.md` isn’t contradicting the chosen payload (it currently says partial-failure policy is pending SP-2.11).

2. Retrieval Recall@K baseline (SP-2.8)
   - Question: are we retrieving the right evidence *before* blaming parsing/matching?
   - Where to answer:
     - Spike plan/stub: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.8)
     - Inputs: `docs/08-example-data/pack_01_clean/truth/golden_questions.json`, `docs/08-example-data/pack_01_clean/layout/*.anchors.json`
   - What you must produce:
     - A written Recall@10 + Recall@25 result + a misses log (add to `spike-proofs/` or fill the report stub with links).
     - A decision: “patch retrieval” vs “accept baseline and move on”.

3. Scan torture honesty policy
   - Question: when do we downgrade to `missing_input` vs emit item-level `unknown` safely?
   - Where to answer:
     - Title parsing scan gate: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.2C)
     - Survey scan gate: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.4B)
     - Reconciliation honesty: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.5)
   - What you must decide/record:
     - The single threshold rule that flips (extract with 0 false positives + citations) vs (emit `missing_input` + remediation checklist).
     - Whether `not_depicted` is safe at all; if not, cut v1 to `depicted|unknown` (SP-2.5 allows this cut, but it must be written down).

4. Human-in-the-loop ambiguity resolution (v1 cut; future semantics)
   - Question: if later allowed, how do we re-verify without mutating immutable citations?
   - Where to answer:
     - The v1 cut note: `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/RH-2.16_cut_note.md`
     - Optional spike if you un-cut: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.13)
   - What you need to confirm:
     - For v1: keep it cut (no “choose correct doc” flow). If you change this, you must pick a concrete mechanism (SP-2.13) and update PRDs accordingly.

---

## 3) The Concrete “Answers” Required To Flip From NO-GO -> GO

This is the practical checklist in `docs/04-projects/02-features/0002_quick-start-engine/brief.md` (“GO when all must be true”).
Below is the same list with direct file pointers and the exact outputs expected.

### A) Contracts Frozen (must be true)

- [ ] SP-2.1 Question set v1 is frozen and practitioner-reviewed
  - Files:
    - Question set: `docs/04-projects/02-features/0002_quick-start-engine/specs/question_set_v1.json`
    - Practitioner review writeup: `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.1_practitioner_review.md`
    - Spike plan + report stub to fill: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.1)
  - You must answer:
    - Who reviewed it, in what context?
    - What `question_set_version` string will runs pin?
    - Biggest gaps + biggest cuts to keep `<=25` questions?

- [ ] SP-2.7 Payload storage decision is locked (Option 4) and architecture docs match
  - Files:
    - Decision: `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.7_decision.md`
    - Schema: `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md`
    - Architecture: `docs/03-architecture/30_data_model.md`, `docs/03-architecture/50_api_surface.md`
  - You must answer:
    - Are we *still* choosing Option 4, and if yes, are the API + DB contracts written down and consistent everywhere?

- [ ] Comparator spec is the single source and spikes reference it
  - File: `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`
  - You must answer:
    - What normalisation rules are in v0 (instrument refs, dates, item numbering)?
    - If you change rules, did you update this spec first (so spikes don’t drift)?

### B) Fixture-Verifiable Spikes Passed (proof artefacts committed)

Note: spike expectations and exact proof artefact filenames are in `spike-investigation.md`.

- [ ] SP-2.8 Retrieval Recall@K measured + decision recorded
  - Where: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.8)
  - Inputs:
    - `docs/08-example-data/pack_01_clean/truth/golden_questions.json`
    - `docs/08-example-data/pack_01_clean/layout/*.anchors.json`
  - You must answer:
    - Recall@10? Recall@25?
    - What are the misses and why (doc/page)?
    - Patch retrieval now, or accept baseline?

- [ ] SP-2.2A Commitment parsing baseline passes on `pack_01_clean`
  - Where: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.2A)
  - You must produce (commit to `spike-proofs/`):
    - `SP-2.2A_pack_01_clean.snapshot.json`
    - `SP-2.2A_pack_01_clean.result.json`
    - `SP-2.2A_pack_01_clean.diff.json`
  - You must answer:
    - Did B-I + B-II match truth key fields with 0 false positives?
    - What normalisation decisions were required (and where are they specified)?

- [ ] SP-2.3A Exception matching baseline passes on `pack_01_clean` + missing-doc journey passes on `pack_02_missing_rea`
  - Where: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.3A)
  - You must produce (commit to `spike-proofs/`):
    - `SP-2.3A_pack_01_02_matching.snapshot.json`
    - `SP-2.3A_pack_01_02_matching.result.json`
  - You must answer:
    - Is there any silent auto-pick? (must be “no”)
    - Is missing REA expressed as item-level `match_status: missing_doc` with checklist that includes `REA.pdf`?

- [ ] SP-2.4A Survey extraction baseline passes on `pack_01_clean` + `pack_03_mismatch_and_cert_gap`
  - Where: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.4A)
  - You must answer:
    - What issue codes are emitted (e.g. `CERT_MISSING_LENDER`)?
    - Are all extracted parties/callouts backed by lockable citations (no fabrication)?

- [ ] SP-2.5 Reconciliation honesty policy is written + tested (and safe)
  - Where: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.5)
  - You must answer:
    - What is the hard rule for `not_depicted` (positive evidence of absence), exactly?
    - If that rule is not safe, did you cut v1 to `depicted|unknown` and document it?

- [ ] SP-2.6 Idempotency + snippet_hash stability passes (including negative test)
  - Where: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.6)
  - You must produce (commit to `spike-proofs/`):
    - `SP-2.6_idempotency_pack_01.json`
    - `SP-2.6_negative_test.json`
  - You must answer:
    - Are two runs with pinned versions byte-identical after normalisation (except IDs/timestamps)?
    - Does the workflow continue after a forced `citation_failed` row and still reach `completed`?

- [ ] SP-2.11 List verification semantics are pinned and consistent with fail-closed + immutable citations
  - Where:
    - Spike plan/stub: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.11)
    - Policy doc to update: `docs/04-projects/02-features/0002_quick-start-engine/specs/list_verification_policy_v1.md`
  - You must answer:
    - What is the unit of verification (item-level integrity, not just row shell)?
    - What happens on partial failures: strict fail row vs repair/downgrade?
    - If repair is allowed: where does repair happen (draft vs verify) and how do citations remain immutable?

---

## 4) Where To Record “Done” (So The Dossier Stops Being Perma-NO-GO)

When you close a gate/spike, update these in lockstep:
- Fill the spike report stub section in `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`.
- Add/commit the proof artefacts under `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/`.
- Flip the corresponding risk row(s) in `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md` from `open` -> `closed` (or explicitly justify why it stays open).
- Check the box in `docs/04-projects/02-features/0002_quick-start-engine/brief.md` under “GO when”.

Optional (but helpful):
- Add short links to proof artefacts in `docs/04-projects/02-features/0002_quick-start-engine/plan.md` under the relevant gate rows.

---

## 5) Copy/Paste Status Update (Short Version)

0002 Quick Start Engine is currently NO-GO by design: `prd.json` is `Draft (NO-GO until key spikes close)` and all stories `US-001..US-006` are still `open`.

What’s blocking “GO” is not implementation work; it’s closing the gating spikes with committed proofs:
- SP-2.1 (practitioner question set freeze + `question_set_version`)
- SP-2.8 (retrieval Recall@K baseline + decision)
- SP-2.2A (commitment parsing baseline vs truth on pack_01_clean)
- SP-2.3A (exception matching baseline + missing REA journey on pack_02_missing_rea)
- SP-2.4A (survey extraction baseline + cert gap issue code on pack_03)
- SP-2.5 (reconciliation honesty rules; `not_depicted` safety or cut)
- SP-2.6 (run idempotency + snippet_hash stability + negative test)
- SP-2.11 (list verification semantics: strict vs repair; pinned policy doc)

Pointers:
- GO checklist: `docs/04-projects/02-features/0002_quick-start-engine/brief.md`
- Spike plans + required proof filenames: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- Proof folder: `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/`


```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/RH-2.16_cut_note.md
```md
# RH-2.16 Cut Note (Human-in-the-Loop Disambiguation)

Decision (v1 cut):
- Initiative 0002 does not include a user flow that persists "choose correct doc" / ambiguity resolution.
- The UI may show candidates when an exception match is ambiguous, but the row remains `needs_review` with guidance.

Rationale:
- Persisted user selection implies either mutating immutable citations or defining a re-run mechanism (new run or targeted re-run) with re-verification.
- That run semantics and UX are out of scope for v1 and are easy to get wrong.

Deferred follow-up (optional later spike):
- Define an explicit mechanism for user resolution that does not mutate existing citations, e.g.:
  - create a new run (repair run) that re-drafts + locks + verifies for a single `question_id`, or
  - re-run a single question as a workflow step with a new row revision.

Refs:
- `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md` RH-2.16
- `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md` (ambiguity UI shows candidates; no selection in v1)


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/folders/[id]/runs/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import { refreshFolderState } from "../../../../../lib/folderState.server";
import { newId } from "../../../../../lib/ids";
import { loadQuestionSetV1 } from "../../../../../lib/questionSet.server";
import { createTraceContext } from "../../../../../lib/trace.server";
import { startQuickStartTitleSurveyWorkflow } from "../../../../../workflows/quickStartTitleSurveyWorkflow.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const BodySchema = z.object({
  type: z.enum(["quick_start_title_survey"]),
});

const IdempotencyKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[A-Za-z0-9._:-]+$/, "Invalid Idempotency-Key");

function agentBundleVersion(): string {
  const configured =
    process.env.ORBITAL_AGENT_BUNDLE_VERSION?.trim() ??
    process.env.AGENT_BUNDLE_VERSION?.trim() ??
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ??
    "";
  if (!configured) return "git:dev";
  if (/^[a-f0-9]{7,40}$/i.test(configured)) return `git:${configured.slice(0, 7)}`;
  return configured;
}

type RunRow = {
  id: string;
  folder_id: string;
  state: string;
  index_version: string;
  agent_bundle_version: string;
  question_set_version: string;
};

function runResponse(row: RunRow) {
  return {
    run: {
      id: row.id,
      folder_id: row.folder_id,
      state: row.state,
      index_version: row.index_version,
      agent_bundle_version: row.agent_bundle_version,
      question_set_version: row.question_set_version,
    },
  };
}

async function findRunByIdempotencyKey(args: { folderId: string; idempotencyKey: string }): Promise<RunRow | null> {
  const runs = await sql<RunRow[]>`
    SELECT id, folder_id, state, index_version, agent_bundle_version, question_set_version
    FROM runs
    WHERE folder_id = ${args.folderId}
      AND idempotency_key = ${args.idempotencyKey}
    LIMIT 1
  `;
  return runs[0] ?? null;
}

export async function POST(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsedBody = BodySchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsedBody.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const rawKey = req.headers.get("Idempotency-Key");
  let idempotencyKey: string | null = null;
  if (rawKey !== null) {
    const parsedKey = IdempotencyKeySchema.safeParse(rawKey);
    if (!parsedKey.success) {
      return Response.json(
        safeErrorEnvelope({
          code: "VALIDATION_ERROR",
          message: "Invalid Idempotency-Key header.",
          details: parsedKey.error.flatten(),
          traceId,
        }),
        { status: 400, headers },
      );
    }
    idempotencyKey = parsedKey.data;

    const existing = await findRunByIdempotencyKey({ folderId: parsedParams.data.id, idempotencyKey });
    if (existing) return Response.json(runResponse(existing), { status: 200, headers });
  }

  const folderId = parsedParams.data.id;
  const folders = await sql<{ id: string; state: string; latest_index_version: string }[]>`
    SELECT id, state, latest_index_version
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!folders[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  // Keep folder state consistent with latest persisted facts before enforcing runnable preconditions.
  await refreshFolderState(folderId);

  const refreshed = await sql<{ state: string; latest_index_version: string }[]>`
    SELECT state, latest_index_version
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = refreshed[0];
  if (!folder) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (folder.state !== "indexed" && folder.state !== "ready") {
    const message =
      folder.state === "failed"
        ? "Folder ingest failed. Retry ingest or re-index."
        : "Folder is not runnable yet.";
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message, traceId }), { status: 409, headers });
  }

  const { version: questionSetVersion, questionSet } = await loadQuestionSetV1();

  const runId = newId("run");
  const indexVersion = folder.latest_index_version;
  const agentVersion = agentBundleVersion();
  const questionsTotal = questionSet.questions.length;

  try {
    await sql`
      INSERT INTO runs (
        id,
        folder_id,
        type,
        state,
        index_version,
        agent_bundle_version,
        question_set_version,
        idempotency_key,
        trace_id,
        questions_total,
        questions_done,
        created_at,
        updated_at
      )
      VALUES (
        ${runId},
        ${folderId},
        ${parsedBody.data.type},
        'running',
        ${indexVersion},
        ${agentVersion},
        ${questionSetVersion},
        ${idempotencyKey},
        ${traceId},
        ${questionsTotal},
        0,
        now(),
        now()
      )
    `;
  } catch (err: unknown) {
    // Idempotency-key races should return the previously created run.
    const code = typeof err === "object" && err ? (err as { code?: unknown }).code : null;
    if (idempotencyKey && code === "23505") {
      const existing = await findRunByIdempotencyKey({ folderId, idempotencyKey });
      if (existing) return Response.json(runResponse(existing), { status: 200, headers });
    }

    // eslint-disable-next-line no-console
    console.error("runs.insert failed", {
      trace_id: traceId,
      folder_id: folderId,
      message: err instanceof Error ? err.message : String(err),
    });

    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Failed to start run.", traceId }), {
      status: 500,
      headers,
    });
  }

  const stepId = newId("stp");
  const stepKey = `quick_start:${questionSetVersion}:start`;
  await sql`
    INSERT INTO run_steps (
      id,
      run_id,
      step_type,
      state,
      attempt,
      step_key,
      trace_id,
      question_id,
      created_at,
      updated_at
    )
    VALUES (
      ${stepId},
      ${runId},
      'workflow_start',
      'succeeded',
      1,
      ${stepKey},
      ${traceId},
      NULL,
      now(),
      now()
    )
    ON CONFLICT (run_id, step_key) DO NOTHING
  `;

  // eslint-disable-next-line no-console
  console.info("run.created", {
    orchestration: "wdk",
    trace_id: traceId,
    folder_id: folderId,
    run_id: runId,
    step_key: stepKey,
    run_type: parsedBody.data.type,
    index_version: indexVersion,
    agent_bundle_version: agentVersion,
    question_set_version: questionSetVersion,
    questions_total: questionsTotal,
  });

  const created: RunRow = {
    id: runId,
    folder_id: folderId,
    state: "running",
    index_version: indexVersion,
    agent_bundle_version: agentVersion,
    question_set_version: questionSetVersion,
  };

  const scheduled = await startQuickStartTitleSurveyWorkflow({
    runId,
    questionSetVersion,
    traceId,
    db: sql,
  });
  const insertedSteps = scheduled.steps.reduce((acc, s) => acc + (s.inserted ? 1 : 0), 0);

  // eslint-disable-next-line no-console
  console.info("wdk.workflow_scheduled", {
    orchestration: "wdk",
    trace_id: traceId,
    run_id: runId,
    workflow_type: parsedBody.data.type,
    step_type: scheduled.stepType,
    steps_total: scheduled.steps.length,
    steps_inserted: insertedSteps,
  });

  return Response.json(runResponse(created), { status: 200, headers });
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/wdk/wdkInlineKick.server.ts
```ts
import "server-only";

import { drainWdkStepsOnce, type StepHandlerMap } from "./wdkWorker.server";

type GlobalWdkInlineWorker = typeof globalThis & {
  __orbitalInlineWdkWorker?: { draining: boolean };
};

const g = globalThis as GlobalWdkInlineWorker;
if (!g.__orbitalInlineWdkWorker) g.__orbitalInlineWdkWorker = { draining: false };

function safeErrMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export function kickInlineWdkWorker(args: { handlers: StepHandlerMap; maxSteps?: number }): void {
  if (process.env.NODE_ENV !== "development") return;

  const state = g.__orbitalInlineWdkWorker!;
  if (state.draining) return;
  state.draining = true;

  const workerId = `inline-wdk:${process.pid}`;
  void drainWdkStepsOnce({ workerId, handlers: args.handlers, maxSteps: args.maxSteps ?? 25 })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("wdk.worker.drain_failed", { worker_id: workerId, message: safeErrMessage(err) });
    })
    .finally(() => {
      state.draining = false;
    });
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/scripts/fixtures/lib/snapshot.ts
```ts
import type { NormPolygons } from "./geometry.ts";

export type SnapshotMeta = {
  pack_id: string;
  run_id?: string;
  index_version?: string;
  agent_bundle_version?: string;
  question_set_version?: string;
  generated_at?: string;
};

export type SnapshotRow = {
  id?: string;
  question_id: string;
  question?: string;
  answer: string;
  status: "needs_review" | "reviewed" | "missing_input" | "citation_failed";
  citation_ids: string[];
  notes?: string | null;
  payload_schema_version?: string | null;
  payload_json?: unknown;
  provenance_json?: unknown;
};

export type SnapshotCitation = {
  document_id?: string;
  document_filename: string;
  page_number: number;
  polygons: NormPolygons;
  snippet: string;
  snippet_hash: string;
};

export type SpikeSnapshot = {
  meta: SnapshotMeta;
  rows: SnapshotRow[];
  citations: Record<string, SnapshotCitation>;
};

export function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export function assertIsSnapshot(val: unknown): SpikeSnapshot {
  if (!isRecord(val)) throw new Error("Snapshot must be an object");
  const meta = val.meta;
  if (!isRecord(meta)) throw new Error("Snapshot.meta must be an object");
  if (typeof meta.pack_id !== "string" || !meta.pack_id) throw new Error("Snapshot.meta.pack_id must be a string");

  const rows = val.rows;
  if (!Array.isArray(rows)) throw new Error("Snapshot.rows must be an array");

  const citations = val.citations;
  if (!isRecord(citations)) throw new Error("Snapshot.citations must be an object map");

  // We do light validation here; deeper validation happens in invariant/comparator scripts.
  return val as SpikeSnapshot;
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/plan.md
```md
# Plan: 0002 Quick Start Engine (Consolidated PRD Execution Plan)

Last updated: 2026-02-08

This plan is derived from the consolidated PRD at `docs/04-projects/02-features/0002_quick-start-engine/prd.json` and is optimized for running a single Ralph loop (single PRD), while still keeping slice boundaries explicit to reduce merge and contract conflicts.

## Enhancement Summary (deepen-plan)

Deepened on: 2026-02-08
Sections deepened:
- Spike gates + pass criteria translated into slice blockers
- Slice dependency graph + execution notes aligned to `docs/03-architecture/*`
- Minimal verification ladder per slice (fixtures-first)

Primary sources used (repo-grounded):
- Canonical architecture contracts: `docs/03-architecture/*`
- Shaping packet: `docs/04-projects/02-features/0002_quick-start-engine/brief.md`, `breadboard-pack.md`, `risk-register.md`, `spike-investigation.md`
- Pinned dossier specs: `docs/04-projects/02-features/0002_quick-start-engine/specs/*`

## Inputs

- Consolidated PRD: `docs/04-projects/02-features/0002_quick-start-engine/prd.md`
- Consolidated JSON PRD: `docs/04-projects/02-features/0002_quick-start-engine/prd.json`
- Spine overview (for cross-check): `docs/04-projects/02-features/0002_quick-start-engine/prd-overall.md`
- Slice PRDs (thin executable units): `docs/04-projects/02-features/0002_quick-start-engine/prds/`

Pinned contracts (do not drift):
- Architecture overview: `docs/03-architecture/00_overview.md`
- Trust ADRs: `docs/03-architecture/DECISIONS.md`
- WDK conventions: `docs/03-architecture/06_frameworks_agents_rag_evals.md`
- State model + invariants: `docs/03-architecture/20_state_model.md`
- Data model: `docs/03-architecture/30_data_model.md`
- RAG + agents posture: `docs/03-architecture/40_rag_and_agents.md`
- API surface + safe error envelope: `docs/03-architecture/50_api_surface.md`
- Observability + taxonomy: `docs/03-architecture/60_observability_and_evals.md`

Pinned dossier specs (do not drift):
- List payload schema (v0): `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md`
- Comparator rules (single source): `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`
- Failure UX copy (reason codes -> next actions): `docs/04-projects/02-features/0002_quick-start-engine/specs/failure_ux_copy_v0.md`
- List verification policy (pinned semantics): `docs/04-projects/02-features/0002_quick-start-engine/specs/list_verification_policy_v1.md`

## Goal

1. Make dependencies between slices and spike gates explicit.
2. Define ownership boundaries (paths + contracts) so implementation can proceed with minimal accidental drift from `docs/03-architecture/*`.
3. Preserve the trust posture: evidence-first, fail-closed verification, deterministic orchestration, fixtures-first evaluation.

## Section Manifest (What This Plan Covers)

Section 1: Inputs + pinned contracts - what must not drift
Section 2: Non-negotiables - trust posture rules that override convenience
Section 3: Spike gates - concrete NO-GO blockers per slice
Section 4: Dependency graph - slice ordering and parallelizable work
Section 5: Slice-by-slice execution notes - architecture-aligned implementation constraints
Section 6: Minimal verification ladder - smallest proofs to keep feedback loops tight

## Non-Negotiables (Trust Posture)

- Evidence-first: drafting uses candidate `chunk_id`s; product rows refer only to locked `citation_id`s (ADR-0001).
- Fail-closed: integrity/invariant failures yield `citation_failed`; export is blocked by default when any `citation_failed` exists (ADR-0002).
- No external web research inside runs (ADR-0007).
- Missing docs: `missing_input` must use exact answer string and an actionable checklist; citations must be empty.
- Item-level uncertainty belongs in payload, not row statuses:
  - item-level: `match_status` (`matched|ambiguous|missing_doc|missing_attachment`)
  - item-level: `item_classification` (`depicted|not_depicted|unknown`)

## Spike Gates (Blocked-By Dependencies)

Implementation should not be treated as “GO” until these are closed with committed proofs.

| Gate | Blocks | Evidence location | Notes |
|---|---|---|---|
| SP-2.1 practitioner question set review | all slices | `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/` + `spike-investigation.md` | Freeze `question_set_v1.json` (<=25, exactly 3 list-shaped rows). |
| SP-2.7 payload decision | slices 0002b+ | `spike-proofs/` + `specs/list_payload_v0.schema.md` | Option 4 is the assumed decision; re-lock before implementing storage/API/UI. |
| SP-2.8 retrieval Recall@K | slices 0002c+ | `spike-proofs/` | Avoid misdiagnosing retrieval misses as parsing failures. |
| SP-2.2A commitment parsing baseline | slice 0002c | `spike-proofs/` | Proof is comparator diffs vs truth CSVs. |
| SP-2.3A exception matching baseline | slice 0002d | `spike-proofs/` | Must prove “no silent auto-pick” and missing-doc checklist on pack_02. |
| SP-2.4A survey extraction baseline | slice 0002e | `spike-proofs/` | Cert gap issue code + citation on pack_03. |
| SP-2.5 reconciliation honesty policy | slice 0002f | `spike-proofs/` | not_depicted requires positive evidence of absence; otherwise unknown. |
| SP-2.6 idempotency + failure continuation | slice 0002a | `spike-proofs/` | Prove completed can occur with one citation_failed row and no duplicates. |
| SP-2.11 list verification semantics | slices 0002b+ | `specs/list_verification_policy_v1.md` | Must align with fail-closed + immutable citations. |

## Dependency Graph (Slices)

```mermaid
graph TD
  S1[0002a Run skeleton]
  S2[0002b Row payload contract + rendering]
  S3[0002c Commitment parsing (pack_01_clean)]
  S4[0002d Exception -> instrument matching (pack_01_clean + pack_02_missing_rea)]
  S5[0002e Survey extraction (pack_01_clean + pack_03)]
  S6[0002f Reconciliation honesty (pack_03 + pack_07)]

  S1 --> S2
  S2 --> S3
  S3 --> S4
  S2 --> S5
  S4 --> S6
  S5 --> S6
```

## Slice-by-Slice Execution Notes (Architecture-Aligned)

### 0002a Run Skeleton (US-001..US-002)

Research insights (repo-grounded):
- Prefer the canonical endpoints + error envelope in `docs/03-architecture/50_api_surface.md`; avoid inventing new run/report shapes.
- WDK conventions are non-negotiable: `"use workflow"` has no side effects; `"use step"` owns side effects; step idempotency is via deterministic `step_key` (`docs/03-architecture/06_frameworks_agents_rag_evals.md`).
- Invariants must be enforced at write time (not only in UI): `docs/03-architecture/20_state_model.md`.
- Correlation keys are required in logs/events: `{trace_id, run_id, step_key, question_id}` (`docs/03-architecture/60_observability_and_evals.md`).

Implementation checklist (thin, no drift):
- Confirm folder-state gating policy (indexed vs ready) matches `risk-register.md` item RH-2.18.
- Ensure uniqueness constraints exist/are enforced:
  - unique `(run_id, question_id)` for report rows
  - unique `(run_id, step_key)` for run steps
- Ensure placeholder behavior is honest: missing extraction yields `missing_input` with exact answer string and actionable checklist.

### 0002b Row Payload Contract (US-002)

Research insights (repo-grounded):
- Schema contract must be single-sourced as Zod + doc:
  - Zod boundary validations at step boundaries (`docs/03-architecture/06_frameworks_agents_rag_evals.md`)
  - Schema doc pinned in `specs/list_payload_v0.schema.md`
- Rendering must not parse prose in `report_rows.answer`. Payload is the product contract.

Implementation checklist:
- Implement Option 4 storage contract (SP-2.7) and ensure API returns payload fields without breaking existing clients.
- UI behavior on missing/invalid payload must be safe and explicit; never attempt a “best effort” parse of answer text.

### 0002c Commitment Parsing (US-003)

Research insights (repo-grounded):
- Comparator rules must remain single-sourced in `specs/comparator_spec_v0.md`. If you change rules, you update the spec first, then update tooling and PRDs.
- Precision rule is the quality bar: 0 false positives by item number. Prefer omitting/downgrading to unknown over guessing.

Implementation checklist:
- Pin normalization rules once (item numbering, instrument refs). Do not re-implement per slice.
- Ensure candidate citations are locked before verification and become immutable references in payload items.

### 0002d Exception Matching (US-004)

Research insights (repo-grounded):
- “No silent auto-pick” is a hard product trust constraint: ambiguity is a first-class output state and must remain explicit.
- Missing-doc journey is product-critical: checklist must be actionable (e.g. expected filename for pack_02).

Implementation checklist:
- Encode `match_status` in item-level payload (not row status).
- Ensure matching evidence is inspectable (citations to the fields used for matching).

### 0002e Survey Extraction (US-005)

Research insights (repo-grounded):
- Survey extraction is a hallucination risk: treat low-quality scans as a reason to downgrade or output missing_input; never invent callouts.
- Cert gap must be machine-readable (issue code) and evidence-backed.

Implementation checklist:
- Keep outputs fixture-verifiable (truth key fields, not prose).
- Ensure failure reason codes line up with `docs/03-architecture/60_observability_and_evals.md`.

### 0002f Reconciliation Honesty (US-006)

Research insights (repo-grounded):
- not_depicted is strictly stronger than unknown and requires explicit positive evidence of absence.
- When evidence spans both title + survey, require cross-evidence citations; if either cannot lock, downgrade.

Implementation checklist:
- Keep item-level `item_classification` in payload only; row status remains terminal (`needs_review|reviewed|missing_input|citation_failed`).
- Guidance copy must be specific and map to observed failure mode; reference `specs/failure_ux_copy_v0.md`.

## Minimal Verification Ladder (Per Slice)

- Before any implementation: confirm spike gates are closed or explicitly accept NO-GO risk.
- For each slice story:
  - Use fixture packs listed in `prd.json` as the acceptance anchors.
  - Produce deterministic diffs against `/truth` where applicable.
  - Re-run row invariant audits whenever status logic or payload schemas change.

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/README.md
```md
# Spike Proofs (Initiative 0002)

This folder is a workspace for spike outputs that make pass/fail measurable and reviewable.

Rules:
- Deterministic artefacts when possible (stable key ordering, stable sorting).
- No secrets, provider payload dumps, or stack traces in committed files.
- Prefer JSON for machine diffs; use Markdown for decisions and short write-ups.

Suggested naming:
- `SP-2.2A_pack_01_clean.snapshot.json`
- `SP-2.2A_pack_01_clean.diff.json`
- `SP-2.6_idempotency_pack_01.json`


```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/investigation-report.md
```md
# Investigation: 0002 Quick Start Engine "Stuck Extract"

Date: 2026-02-10

## Summary
The 0002 dossier is intentionally in a NO-GO state: all implementation stories are blocked on closing a set of gating spikes with fixture-verifiable proof artefacts. The immediate gap appears to be that the spike execution harnesses and/or proof outputs have not been produced/committed, leaving risks and GO checklist items open.

## Symptoms
- `prd.json` is `Draft (NO-GO until key spikes close)` and all stories `US-001..US-006` are `open`.
- Multiple gating spikes (SP-2.1, SP-2.2A, SP-2.3A, SP-2.4A, SP-2.5, SP-2.6, SP-2.8, SP-2.11) are required before moving to implementation work.
- The dossier asserts required fixture-verifiable proof artefacts (snapshots/diffs/results) are not yet committed under `spike-proofs/`.

Evidence: `docs/04-projects/02-features/0002_quick-start-engine/stuck-extract.md`.

## Investigation Log

### 2026-02-10 - Phase 1 - Initial Assessment (Docs)
**Hypothesis:** This is primarily a process/verification gap (spikes not executed / proofs not produced), not an implementation bug.
**Findings:** `stuck-extract.md` enumerates explicit spike gates as NO-GO blockers and lists exact expected proof filenames under `spike-proofs/`.
**Evidence:** `docs/04-projects/02-features/0002_quick-start-engine/stuck-extract.md`.
**Conclusion:** Needs system-level context: verify whether spike harness code exists, whether example packs exist, and what concrete missing pieces prevent producing the proofs.

### 2026-02-10 - Phase 2 - Systematic Exploration (Context Builder)
**Hypothesis:** The repo has comparator/validator tooling but lacks an “engine producer” that can emit the required spike snapshot/result/diff artefacts from real extraction logic.
**Findings:** The repo has strong fixture tooling (`scripts/fixtures/*`) and a Quick Start runtime path, but the runtime “write row v0” logic is placeholder and the fixture snapshot generator is truth-driven (seed), not a real extractor.
**Evidence:**
- Required proof artefact names are explicitly specified for spikes like SP-2.2A and SP-2.6. (`docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md:144`, `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md:170`)
- The WDK step writes only `missing_input` or `citation_failed`, and list rows get an empty `list_payload_v0`. (`apps/web/steps/quickStartWriteRowV0.step.server.ts:41`, `apps/web/steps/quickStartWriteRowV0.step.server.ts:71`, `apps/web/steps/quickStartWriteRowV0.step.server.ts:93`)
- Fixture eval prefers `produced/snapshot.json` but otherwise calls the seed script. (`scripts/fixtures/eval.ts:171`)
**Conclusion:** Likely root cause is missing “producer layer” for spikes: a deterministic extractor that emits spike snapshots under `spike-proofs/` to then run comparators and commit `.result.json`/`.diff.json`.

### 2026-02-10 - Phase 4 - Evidence Gathering (Code + Filesystem)
**Hypothesis:** The current Quick Start run path cannot produce the spike proof artefacts because it does not generate locked citations or populated payload items, and there is no script that writes the required proof filenames into `spike-proofs/`.
**Findings:**
- The WDK step `quickStartWriteRowV0Step` chooses between `missing_input` and `citation_failed` based on whether the folder has parsed+OCR’d documents, and it does not emit `needs_review` rows. (`apps/web/steps/quickStartWriteRowV0.step.server.ts:207`, `apps/web/steps/quickStartWriteRowV0.step.server.ts:217`)
- For list payload questions, it attaches `payload_schema_version = list_payload_v0` and uses `emptyListPayloadV0(kind)` which emits `{ kind, items: [] }`. (`apps/web/steps/quickStartWriteRowV0.step.server.ts:93`, `packages/core/src/schemas/list_payload_v0.ts:101`)
- `scripts/fixtures/eval.ts` uses `docs/08-example-data/<pack>/produced/snapshot.json` when present, otherwise it runs `scripts/fixtures/seed.ts` (overwriting) and evaluates the seeded snapshot. (`scripts/fixtures/eval.ts:171`)
- `scripts/fixtures/seed.ts` generates list payload rows by reading truth CSVs (not by parsing commitment/survey content), e.g. TS-03 reads `truth/expected_requirements_tracker.csv` and materializes payload items with citations. (`scripts/fixtures/seed.ts:493`)
- As of 2026-02-10, `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/` contains only doc notes (README + RH/SP md/txt files) and no `SP-2.*.snapshot.json`/`.result.json`/`.diff.json` artefacts. (Directory listing)
- Only `docs/08-example-data/pack_09_bad_citation/produced/snapshot.json` exists; packs 01/02/03 do not have produced snapshots. (Filesystem search)
- Spec drift exists between the list payload doc and the Zod schema:
  - Doc contract excludes `survey_certification_parties` kind. (`docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md:16`)
  - Code includes `survey_certification_parties` kind and defines exception item `item_status` as `needs_review|missing_input`, which the doc does not include. (`packages/core/src/schemas/list_payload_v0.ts:5`, `packages/core/src/schemas/list_payload_v0.ts:44`)
- Question set version drift exists between fixture packs and runtime:
  - Manifest expects `qs:quick_start_title_survey:v1`. (`docs/08-example-data/pack_01_clean/manifest.json:5`)
  - Runtime pins `qs:0002:v1.0:sha256:<hash>`. (`apps/web/lib/questionSet.server.ts:70`)
- “Implemented today” orchestration doc indicates Quick Start is still jobs-based, but the run route handler logs `orchestration: \"wdk\"` and schedules a WDK workflow. (`docs/03-architecture/07_current_poc_runtime.md:16`, `apps/web/app/(api)/folders/[id]/runs/route.ts:270`)
**Conclusion:** Confirmed. The repo has the comparator/validator layer and a truth-driven seeding layer, but it lacks the extraction producer + spike runner that creates the proof artefacts required to flip the dossier to GO.

## Root Cause
The 0002 dossier is stuck in NO-GO because the required gating spikes cannot be closed with fixture-verifiable proof artefacts given the current code:

1) The current Quick Start “write row v0” runtime is intentionally placeholder: it emits `missing_input` or `citation_failed` rows and attaches empty list payloads (no populated items, no locked citations), so it cannot produce truth-comparable outputs for SP-2.2A/SP-2.3A/SP-2.4A/SP-2.6/SP-2.11. (`apps/web/steps/quickStartWriteRowV0.step.server.ts:41`, `apps/web/steps/quickStartWriteRowV0.step.server.ts:217`)

2) The repo has strong tooling to validate/compare snapshots (`scripts/fixtures/assert_row_invariants.ts`, `scripts/fixtures/compare_truth.ts`, etc.), but it does not have a deterministic “producer layer” that generates spike snapshots from real extraction logic and writes the canonical proof filenames under `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/`. (`docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md:170`, directory contents)

3) The fixture snapshot generator that does exist (`scripts/fixtures/seed.ts`) is truth-driven: it reads truth CSVs and materializes payload items, which is useful for harnessing/demos but does not close the “parsing/matching baseline” spikes credibly. (`scripts/fixtures/seed.ts:493`)

Contributing factor: contract drift (list payload schema + question set version formats + orchestration doc) increases ambiguity and slows closure, even where tooling exists. (`docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md:16`, `packages/core/src/schemas/list_payload_v0.ts:5`, `docs/08-example-data/pack_01_clean/manifest.json:5`, `apps/web/lib/questionSet.server.ts:70`, `docs/03-architecture/07_current_poc_runtime.md:16`, `apps/web/app/(api)/folders/[id]/runs/route.ts:270`)

## Recommendations
1. Decide spike closure strategy explicitly (recommended: offline fixture producer first).
2. Add a small spike runner script that writes canonical proof filenames into `.../spike-proofs/` and invokes existing comparator/validator tooling.
3. Eliminate spec drift now (cheap, high leverage):
   - Reconcile `docs/.../specs/list_payload_v0.schema.md` with `packages/core/src/schemas/list_payload_v0.ts` (kinds, exception item fields).
   - Standardize `question_set_version` format between fixture manifests and runtime (pick hashed pinning as canonical).
   - Update `docs/03-architecture/07_current_poc_runtime.md` to reflect current orchestration reality for Quick Start.
4. For SP-2.8, implement a deterministic Recall@K harness against fixture layout text/anchors (per spike stub) and commit results + misses log.

## Preventive Measures
- Add a “proof artefact presence” check for required spikes so the dossier can’t drift into “docs say required filenames” while nothing generates them.
- Keep a single source of truth for payload schemas: either generate docs from Zod schemas or enforce doc/code consistency via CI.
- When orchestration changes (jobs→WDK), require updating `docs/03-architecture/07_current_poc_runtime.md` in the same PR.

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/wdk/stepQueue.server.ts
```ts
import "server-only";

import type { Sql } from "../db.server";
import { ensureSchema, sql } from "../db.server";
import { newId } from "../ids";

export type StepState = "queued" | "running" | "succeeded" | "failed";

export type StepRow = {
  id: string;
  run_id: string;
  step_type: string;
  state: StepState;
  attempt: number;
  step_key: string;
  available_at: Date;
  locked_at: Date | null;
  locked_by: string | null;
  input_json: unknown;
  output_json: unknown;
  trace_id: string | null;
  question_id: string | null;
  metrics_json: unknown;
  error_json: unknown | null;
  created_at: Date;
  updated_at: Date;
};

type JsonArg = Parameters<typeof sql.json>[0];

function withDb(db?: Sql): Sql {
  return db ?? sql;
}

export async function scheduleStep(args: {
  runId: string;
  stepKey: string;
  stepType: string;
  input: unknown;
  availableAt?: Date;
  db?: Sql;
}): Promise<{ id: string; inserted: boolean }> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  // Default to DB time to avoid subtle clock skew between app and Postgres.
  const availableAt: Date | null = args.availableAt ?? null;
  const rows = await s<Array<{ id: string }>>`
    INSERT INTO run_steps (
      id,
      run_id,
      step_type,
      state,
      attempt,
      step_key,
      available_at,
      locked_at,
      locked_by,
      input_json,
      output_json,
      metrics_json,
      error_json,
      created_at,
      updated_at
    )
    VALUES (
      ${newId("stp")},
      ${args.runId},
      ${args.stepType},
      'queued',
      0,
      ${args.stepKey},
      COALESCE(${availableAt}, now()),
      NULL,
      NULL,
      ${s.json(args.input as JsonArg)},
      ${s.json({} as JsonArg)},
      ${s.json({} as JsonArg)},
      NULL,
      now(),
      now()
    )
    ON CONFLICT (run_id, step_key) DO NOTHING
    RETURNING id
  `;

  const inserted = rows[0];
  if (inserted) return { id: inserted.id, inserted: true };

  // Idempotency: if the step already exists, return its id.
  const existing = await s<Array<{ id: string }>>`
    SELECT id
    FROM run_steps
    WHERE run_id = ${args.runId}
      AND step_key = ${args.stepKey}
    LIMIT 1
  `;
  const row = existing[0];
  if (!row) throw new Error("WDK_SCHEDULE_STEP_CONFLICT_MISSING_ROW");
  return { id: row.id, inserted: false };
}

export async function claimNextStep(args: { workerId: string; runId?: string; db?: Sql }): Promise<StepRow | null> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);
  const runId = args.runId ?? null;

  const rows = await s<StepRow[]>`
    WITH next AS (
      SELECT id
      FROM run_steps
      WHERE state = 'queued'
        AND available_at <= now()
        AND run_id = COALESCE(${runId}, run_id)
      ORDER BY available_at ASC, created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE run_steps
    SET state = 'running',
        locked_at = now(),
        locked_by = ${args.workerId},
        attempt = attempt + 1,
        updated_at = now()
    WHERE id = (SELECT id FROM next)
    RETURNING
      id,
      run_id,
      step_type,
      state,
      attempt,
      step_key,
      available_at,
      locked_at,
      locked_by,
      input_json,
      output_json,
      trace_id,
      question_id,
      metrics_json,
      error_json,
      created_at,
      updated_at
  `;

  return rows[0] ?? null;
}

export async function markStepSucceeded(args: {
  stepId: string;
  workerId: string;
  output: unknown;
  metrics?: unknown;
  db?: Sql;
}): Promise<void> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  const metrics = args.metrics ?? {};
  const rows = await s<Array<{ id: string }>>`
    UPDATE run_steps
    SET state = 'succeeded',
        locked_at = NULL,
        locked_by = NULL,
        output_json = ${s.json(args.output as JsonArg)},
        metrics_json = ${s.json(metrics as JsonArg)},
        error_json = NULL,
        updated_at = now()
    WHERE id = ${args.stepId}
      AND state = 'running'
      AND locked_by = ${args.workerId}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("WDK_MARK_SUCCEEDED_LOST_LOCK");
}

export async function rescheduleStep(args: {
  stepId: string;
  workerId: string;
  availableAt: Date;
  error: { code: string; message: string };
  db?: Sql;
}): Promise<void> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  const rows = await s<Array<{ id: string }>>`
    UPDATE run_steps
    SET state = 'queued',
        available_at = ${args.availableAt},
        locked_at = NULL,
        locked_by = NULL,
        output_json = ${s.json({} as JsonArg)},
        error_json = ${s.json(args.error as JsonArg)},
        updated_at = now()
    WHERE id = ${args.stepId}
      AND state = 'running'
      AND locked_by = ${args.workerId}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("WDK_RESCHEDULE_LOST_LOCK");
}

export async function markStepFailed(args: {
  stepId: string;
  workerId: string;
  error: { code: string; message: string };
  db?: Sql;
}): Promise<void> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  const rows = await s<Array<{ id: string }>>`
    UPDATE run_steps
    SET state = 'failed',
        locked_at = NULL,
        locked_by = NULL,
        error_json = ${s.json(args.error as JsonArg)},
        updated_at = now()
    WHERE id = ${args.stepId}
      AND state = 'running'
      AND locked_by = ${args.workerId}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("WDK_MARK_FAILED_LOST_LOCK");
}

export async function requeueStaleRunningSteps(args: { cutoff: Date; limit?: number; db?: Sql }): Promise<{ n: number }> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  const limit = Math.max(1, Math.min(500, args.limit ?? 50));
  const stale = await s<Array<{ id: string }>>`
    WITH next AS (
      SELECT id
      FROM run_steps
      WHERE state = 'running'
        AND locked_at IS NOT NULL
        AND locked_at < ${args.cutoff}
      ORDER BY locked_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${limit}
    )
    UPDATE run_steps
    SET state = 'queued',
        available_at = now(),
        locked_at = NULL,
        locked_by = NULL,
        error_json = COALESCE(
          error_json,
          ${s.json({ code: "STEP_STALE_REQUEUED", message: "Step reclaimed after stale lock." } as JsonArg)}
        ),
        updated_at = now()
    WHERE id IN (SELECT id FROM next)
    RETURNING id
  `;

  return { n: stale.length };
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/scripts/fixtures/lib/args.ts
```ts
export type ParsedArgs = {
  _: string[];
  [key: string]: string | boolean | string[];
};

function pushValue(obj: ParsedArgs, key: string, value: string | boolean) {
  const existing = obj[key];
  if (existing === undefined) {
    obj[key] = value;
    return;
  }
  if (Array.isArray(existing)) {
    existing.push(String(value));
    return;
  }
  obj[key] = [String(existing), String(value)];
}

export function parseArgs(argv: string[]): ParsedArgs {
  const out: ParsedArgs = { _: [] };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") {
      // pnpm forwards a leading "--" sentinel through to the script; treat it as a no-op
      // so `pnpm run <script> -- --flag value` works as expected.
      if (i === 0) continue;
      out._.push(...argv.slice(i + 1));
      break;
    }

    if (!arg.startsWith("--")) {
      out._.push(arg);
      continue;
    }

    const eq = arg.indexOf("=");
    if (eq !== -1) {
      const key = arg.slice(2, eq);
      const value = arg.slice(eq + 1);
      pushValue(out, key, value);
      continue;
    }

    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      pushValue(out, key, true);
      continue;
    }

    pushValue(out, key, next);
    i++;
  }

  return out;
}

export function getStringArg(args: ParsedArgs, key: string): string | undefined {
  const val = args[key];
  if (val === undefined) return undefined;
  if (Array.isArray(val)) return val[val.length - 1];
  if (typeof val === "boolean") return val ? "true" : "false";
  return val;
}

export function getBoolArg(args: ParsedArgs, key: string): boolean {
  const val = args[key];
  if (val === undefined) return false;
  if (Array.isArray(val)) return Boolean(val[val.length - 1]);
  if (typeof val === "boolean") return val;
  return val === "true";
}

export function requireStringArg(args: ParsedArgs, key: string): string {
  const val = getStringArg(args, key);
  if (!val) throw new Error(`Missing required arg --${key}`);
  return val;
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/workflows/quickStartTitleSurveyWorkflow.server.ts
```ts
import "server-only";

import { z } from "zod";

import type { Sql } from "../lib/db.server";
import { loadQuestionSetV1 } from "../lib/questionSet.server";
import { scheduleStep } from "../lib/wdk/stepQueue.server";

const ArgsSchema = z.object({
  runId: z.string().min(1),
  questionSetVersion: z.string().min(1),
  traceId: z.string().min(1).nullable().optional(),
  db: z.any().optional(),
});

export type QuickStartScheduledStep = { stepId: string; inserted: boolean; stepKey: string; stepType: string };

export async function startQuickStartTitleSurveyWorkflow(args: {
  runId: string;
  questionSetVersion: string;
  traceId?: string | null;
  db?: Sql;
}): Promise<{ stepType: string; steps: QuickStartScheduledStep[] }> {
  "use workflow";

  const parsed = ArgsSchema.parse({
    runId: args.runId,
    questionSetVersion: args.questionSetVersion,
    traceId: args.traceId ?? null,
    db: args.db,
  });

  const { questionSet } = await loadQuestionSetV1();
  const stepType = "quick_start_title_survey.write_row_v0";

  const steps: QuickStartScheduledStep[] = [];
  for (const q of questionSet.questions) {
    const stepKey = `quick_start:${parsed.questionSetVersion}:question:${q.question_id}:write_row`;
    const scheduled = await scheduleStep({
      runId: parsed.runId,
      stepKey,
      stepType,
      input: { trace_id: parsed.traceId ?? null, question_id: q.question_id },
      db: args.db,
    });
    steps.push({ stepId: scheduled.id, inserted: scheduled.inserted, stepKey, stepType });
  }

  return { stepType, steps };
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/DECISIONS.md
```md
# Architecture decisions (ADRs)

Append-only log of architecture decisions for Orbital Copilot PoC. Add new ADRs at the end and link the PR.
Doc-sync rule: when an ADR is added or changed, update the relevant downstream docs in the same PR (or add a dated note in `docs/03-architecture/INVESTIGATION.md` describing the drift and owner).

## ADR format (minimal)

```md
## ADR-0000: Title
- Status: proposed | accepted | superseded | deprecated
- Date: YYYY-MM-DD

Context
- Why are we making this decision?

Decision
- What did we decide?

Consequences
- What does this enable/force?
- What are the risks/trade-offs?

Links
- PR:
- Related docs:
```

---

## ADR-0001: Evidence-first outputs with citation IDs and locking
- Status: accepted
- Date: 2026-02-06

Context
- Trust UX is the product: every material claim needs inspectable evidence.

Decision
- Drafting produces structured rows with **candidate citations as chunk IDs** (no free-text citations).
- We **lock** citations by creating immutable `citations` records containing `{snippet, snippet_hash, geometry}`.
- Report rows refer to citations by `citation_id` only.

Consequences
- We can highlight evidence even if chunking/indexing changes later.
- Provenance is sufficient for debugging and replay without re-running the model.

Links
- Related docs: `docs/03-architecture/40_rag_and_agents.md`, `docs/03-architecture/30_data_model.md`

## ADR-0002: Verification is fail-closed
- Status: accepted
- Date: 2026-02-06

Context
- A plausible answer without valid evidence is worse than “not found”.

Decision
- Any citation lock mismatch or verification failure sets row status to `citation_failed`.
- `citation_failed` rows are non-exportable by default.

Consequences
- Reduces false trust at the cost of more “blocked” outputs early.
- Forces us to invest in retrieval + citation integrity.

Links
- Related docs: `docs/03-architecture/20_state_model.md`, `docs/03-architecture/60_observability_and_evals.md`

## ADR-0003: OCR/layout extraction is the default for all PDFs
- Status: accepted
- Date: 2026-02-06

Context
- Scans are common in CRE diligence packs; highlights require geometry.

Decision
- Every uploaded PDF is processed with OCR/layout extraction and persisted to `document_pages` as canonical text + polygons.

Consequences
- More ingest cost/latency, but consistent highlighting and chunking.
- Enables citation hashing and geometric overlays as first-class features.

Links
- Related docs: `docs/03-architecture/05_tech_stack_and_dev_workflow.md`, `docs/03-architecture/30_data_model.md`

## ADR-0004: Hybrid retrieval returning chunk IDs (lexical + vector)
- Status: accepted
- Date: 2026-02-06

Context
- CRE packs mix boilerplate and highly specific clauses; we need both recall and precision.

Decision
- Retrieval is hybrid (tsvector + embeddings) and returns **chunk IDs** (with scores) rather than prose.
- Optional rerank can be added, but must not change the “IDs-only” contract.

Consequences
- Retrieval becomes measurable (Recall@K, drift detection).
- Downstream steps can be schema-driven and deterministic.

Links
- Related docs: `docs/03-architecture/40_rag_and_agents.md`, `docs/03-architecture/60_observability_and_evals.md`

## ADR-0005: Deterministic-ish orchestration via Workflow DevKit steps
- Status: accepted
- Date: 2026-02-06

Context
- We need resumability, retries, and row-by-row progress without “agent loops”.

Decision
- Quick Start is implemented as a WDK workflow that coordinates explicit steps (`retrieve → draft → lock → verify → write`).
- Use `"use workflow"` / `"use step"` directives to make side-effect boundaries explicit.

Consequences
- Workflows remain predictable; side effects are isolated and observable.
- Keeps WDK integration thin (domain logic stays in `packages/core`).

Implementation status
- Target posture: WDK workflows/steps.
- Current repo runtime may temporarily diverge (see `docs/03-architecture/07_current_poc_runtime.md`).
- Planned sequencing and closure of this drift: `docs/04-projects/02-features/0011_chat_interface/plan.program-sequencing.md`.

Links
- Related docs: `docs/03-architecture/06_frameworks_agents_rag_evals.md`, `docs/03-architecture/10_system_architecture.md`

## ADR-0006: Fixture-driven evals are first-class
- Status: accepted
- Date: 2026-02-06

Context
- Demos fail when extraction/retrieval drifts; fixtures let us regress deterministically.

Decision
- Maintain synthetic packs with `/docs`, `/truth`, `/layout`.
- Run `fixture:eval` to produce per-pack eval reports and a cross-pack summary.
- Start as report-only, then gate CI on hard trust metrics (schema + citation integrity).

Consequences
- Faster iteration with fewer demo regressions.
- Forces us to encode “expected failure journeys” as fixtures.

Links
- Related docs: `docs/03-architecture/05_tech_stack_and_dev_workflow.md`, `docs/03-architecture/60_observability_and_evals.md`

## ADR-0007: No external web research inside PoC runs
- Status: accepted
- Date: 2026-02-06

Context
- PoC must be defensible based on provided diligence documents only.

Decision
- Quick Start uses only the uploaded pack for retrieval and reasoning.

Consequences
- Clear provenance and a simpler security posture.
- Some questions will legitimately resolve to `missing_input`.

Links
- Related docs: `docs/03-architecture/00_overview.md`, `docs/03-architecture/06_frameworks_agents_rag_evals.md`

## ADR-0008: Explicit error envelope for APIs
- Status: accepted
- Date: 2026-02-06

Context
- Clients need stable contracts; we must not leak internal errors/provider payloads.

Decision
- Standardise non-2xx responses on a single JSON error envelope with safe `code`, `message`, optional `details`, and optional `trace_id`.

Consequences
- Frontend can implement consistent error handling.
- Makes observability and support workflows simpler.

Links
- Related docs: `docs/03-architecture/50_api_surface.md`, `docs/03-architecture/AGENTS.md`

## ADR-0009: Deployment posture is Hetzner-first (single VM) until proven otherwise
- Status: accepted
- Date: 2026-02-06

Context
- The PoC needs durable orchestration (WDK) and long-running side effects (OCR/embeddings/LLM calls).
- A single-VM deployment reduces moving parts and avoids serverless DB connection pitfalls.

Decision
- Default deployment target is a Hetzner VM running the Next.js server + WDK worker + Postgres (and optionally MinIO).
- Vercel stays optional for later once the runtime shape is stable.
- We may deploy the web app (`apps/web`) to Vercel in the future (including preview deployments), while keeping worker + Postgres on the VM.

Consequences
- Faster path to a stable demo and simpler debugging.
- We own basic ops (TLS, process supervision, backups, monitoring).

Links
- Related docs: `docs/03-architecture/10_system_architecture.md`, `docs/03-architecture/05_tech_stack_and_dev_workflow.md`
- Investigation: `docs/98-tmp/2026-02-06_infra-investigation/deployment.md`

## ADR-0010: Use S3-compatible object storage as the baseline
- Status: accepted
- Date: 2026-02-06

Context
- We need to store raw PDFs and exports and serve pages to pdf.js reliably.
- We want portability between local dev and Hetzner deployment (and optionally Vercel).

Decision
- Use S3-compatible object storage as the baseline contract.
- Local dev: MinIO (or local filesystem for ultra-simple early dev).
- Deployment: prefer managed S3-compatible storage unless explicitly "single VM only".

Consequences
- Standard tooling (AWS SDK) and a clean signed-URL story.
- If we self-host storage (MinIO), we must own backups and durability.

Links
- Related docs: `docs/03-architecture/05_tech_stack_and_dev_workflow.md`
- Investigation: `docs/98-tmp/2026-02-06_infra-investigation/storage.md`

## ADR-0011: Postgres is the primary datastore (local dev; Hetzner in deploy)
- Status: accepted
- Date: 2026-02-06

Context
- Postgres is already the planned "truth store" (rows, runs, steps, citations) and supports pgvector + tsvector.
- The PoC is single-tenant and can start with a single Postgres instance.

Decision
- Local dev: Postgres via Docker Compose or Sprite (ADR-0022).
- Deployment: self-host Postgres on the Hetzner VM with automated backups and monitoring.

Consequences
- Simple data plane and predictable latency.
- If we later put the web/API on Vercel, we must add connection pooling and strict limits.

Links
- Related docs: `docs/03-architecture/05_tech_stack_and_dev_workflow.md`, `docs/03-architecture/30_data_model.md`

## ADR-0012: OCR/layout extraction is abstracted behind a single provider adapter
- Status: accepted
- Date: 2026-02-06

Context
- Highlight overlays require geometry.
- We want to keep the provider choice reversible (Azure Document Intelligence vs AWS Textract).

Decision
- Default provider: Azure Document Intelligence (Layout), unless an AWS-first posture is chosen.
- Implement a single OCR adapter interface returning a canonical per-page schema.

Consequences
- Provider swaps are a bounded change (mostly isolated to the adapter).
- We can tune for cost/quality without rewriting downstream chunking/citations.

Links
- Related docs: `docs/03-architecture/05_tech_stack_and_dev_workflow.md`, `docs/03-architecture/40_rag_and_agents.md`
- Investigation: `docs/98-tmp/2026-02-06_infra-investigation/ocr.md`

## ADR-0013: LLM + embeddings calls go through AI SDK; gateway is default
- Status: accepted
- Date: 2026-02-06

Context
- We need to route between "fast draft" and "strong verify" models and keep observability consistent.
- We want one interface across:
  - streaming UX in Next.js route handlers
  - durable side effects in worker steps (WDK)
- A gateway can simplify auth, provider swaps, and consistent telemetry.

Decision
- Standardize on AI SDK (`ai`) as the only “public API” for LLM + embeddings calls in this repo.
- Default to Vercel AI Gateway (via AI SDK gateway provider) so auth + model routing are consistent across web + worker.
- Keep a small internal router interface (draft, verify, embed) but implement it via AI SDK.
- Direct provider SDKs (OpenAI SDK, Anthropic SDK, etc) are only allowed with an explicit reason (eg missing feature, debugging, or a provider-specific capability).

Consequences
- Consistent auth, retries, and observability patterns for all model calls.
- Model selection becomes an env/config concern (eg `LLM_MODEL_CHAT`, `LLM_MODEL_SUMMARY`, `EMBED_MODEL`), not scattered code changes.
- Gateway auth becomes part of the minimum env contract (eg `AI_GATEWAY_API_KEY` locally/Hetzner; Vercel OIDC where available).

Links
- Related docs: `docs/03-architecture/05_tech_stack_and_dev_workflow.md`
- Investigation: `docs/98-tmp/2026-02-06_infra-investigation/llm-gateways.md`

## ADR-0014: Create a minimal runnable scaffold to validate the architecture
- Status: accepted
- Date: 2026-02-06

Context
- Current repo is docs-first; we need a tracer-bullet implementation to validate the UX (pdf viewer + citations) and workflow plumbing.

Decision
- Add a minimal pnpm workspace scaffold:
  - `apps/web`: Next.js App Router app
  - `packages/core`: Zod schemas + core contracts
  - `docker-compose.yml`: local Postgres (pgvector) (MinIO optional later)
  - wire `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`

Consequences
- Onboarding becomes concrete and repeatable.
- Risk: scaffolding can become premature if we haven't committed to building the PoC; keep it intentionally thin.

Links
- Related docs: `docs/03-architecture/05_tech_stack_and_dev_workflow.md`, `docs/03-architecture/06_frameworks_agents_rag_evals.md`


## ADR-0015: Deterministic page-bounded chunking (line window v1) + index_version bump rules
- Status: accepted
- Date: 2026-02-07

Context
- Retrieval returns chunk IDs (ADR-0004) and drafting cites candidate chunk IDs (ADR-0001).
- Click-to-highlight UX requires that chunks map cleanly to page geometry (ADR-0003).
- Without a pinned chunking strategy, “what is a citable unit?” and “when do we bump index_version?” will drift and break evals.

Decision
- Citable unit:
  - Retrieval returns `chunk_id`s only.
  - Drafting outputs `candidate_citation_chunk_ids: string[]` only.
  - Citation locking resolves `chunk_id` -> immutable `citation_id` (ADR-0001).
- Chunk scope (PoC default):
  - Chunks are **page-bounded**: `page_start = page_end = page_number`.
  - A chunk never spans multiple pages.
- Chunk sizing defaults (PoC):
  - Build chunks from OCR/layout “lines” in `document_pages.layout_json`.
  - Hard limits:
    - `max_lines = 20`
    - `max_chars = 1500`
    - `overlap_lines = 4` (overlap is within a page only)
- Boundary rules:
  - Never split inside an OCR line.
  - Prefer splitting on blank lines.
  - Treat section headers as hard boundaries (e.g. lines matching: `/^(SCHEDULE|EXHIBIT|SECTION)\b/i`, or ALL-CAPS lines above a minimum length).
- Chunk metadata (required fields in `chunks.metadata_json`):
  - `chunker_id`: `line_window_v1`
  - `chunk_params`: `{ max_lines, max_chars, overlap_lines, header_regexes_version }`
  - `page_number`
  - `line_start` / `line_end` (inclusive line indices in the canonical OCR line list)
  - Optional: `doc_type`, `section_hint`
- Index version bumping:
  - `index_version` identifies the retrieval substrate for a folder (chunks + indices).
  - We MUST bump `folders.latest_index_version` when ANY of the following changes:
    - OCR canonicalisation schema or adapter version (ADR-0012)
    - chunker_id or chunk_params
    - lexical indexing config (tsvector build rules)
    - embedding model ID or embedding dimension
  - Fail-closed safety:
    - Each chunk row stores the `chunker_id` + `chunk_params` used to build it.
    - The ingestion/indexing pipeline must refuse to write chunks for an existing `index_version` if the current chunker_id/params do not match the stored metadata (failure code: `CHUNKING_FAIL`).

Consequences
- Highlight overlays become straightforward because a citation’s polygons are always on a single page.
- Chunk IDs remain stable within an `index_version`, and drift is handled by versioning rather than mutation.
- Trade-off: cross-page clauses require retrieving multiple chunks; we accept this for PoC simplicity.

Implementation status (2026-02-10)
- This ADR describes the **target** chunking posture once OCR/layout geometry (canonical line lists) exists for real uploads.
- Current PoC reality: ingest writes `chunks` as 1 chunk per page from `document_pages.text` with `has_geometry=false` (see `docs/03-architecture/07_current_poc_runtime.md`).
- Pre-geometry bridge (planned for `0011a`):
  - Implement `char_window_v0` chunking on `document_pages.text` to unblock retrieval/chat before OCR/layout lines exist.
  - This is an explicit v0 exception; when switching to `line_window_v1`, bump `index_version` per the rules above.
- Sequencing: `docs/04-projects/02-features/0011_chat_interface/plan.program-sequencing.md`.

Links
- PR:
- Related docs:
  - `docs/03-architecture/40_rag_and_agents.md`
  - `docs/03-architecture/30_data_model.md`
  - `docs/03-architecture/20_state_model.md`


## ADR-0016: File-backed, immutable question sets with run pinning and completed invariants
- Status: accepted
- Date: 2026-02-07

Context
- Runs must pin `question_set_version` so we can replay and evaluate outputs deterministically (`docs/03-architecture/20_state_model.md`, `docs/03-architecture/30_data_model.md`).
- If question sets are editable in-place, “completed” becomes ambiguous and fixture truth comparisons drift.
- PoC constraint: single-tenant, minimal infra. We want determinism and code review over dynamic configurability.

Decision
- Storage (v1):
  - Question sets live in-repo as JSON files (source of truth), not in the database.
  - Each version is an immutable file. Do not edit an existing version file; create a new version file.
  - Suggested location:
    - `packages/core/question-sets/<question_set_id>/qs_<version>.json`
- File schema (required fields):
  - `question_set_id` (e.g. `quick_start_title_survey`)
  - `question_set_version` (e.g. `qs:quick_start_title_survey:v1`)
  - `created_at` (ISO date)
  - `questions[]` with:
    - `question_id` (stable identifier, e.g. `BII-01`)
    - `question` (string)
    - optional `artefact_kind` (`requirements_tracker|exceptions_table|survey_issues`)
    - optional `row_schema_id` (pins the row payload schema)
- Run pinning:
  - At run creation, the server selects a question set version for the run type and persists:
    - `runs.question_set_version` = the selected version string
  - `runs.question_set_version` MUST NOT change after creation.
- Completed invariants (mechanics):
  - A run can only enter `runs.state = completed` when:
    - For the pinned `question_set_version`, there is exactly one `report_rows` record per `question_id` in that set.
    - Every `report_rows.status` is terminal (`needs_review|reviewed|missing_input|citation_failed`).
  - Any mismatch (missing question IDs, extra rows, or duplicate rows) is a fail-closed run failure (failure code: `INVARIANT_FAIL`).

Consequences
- Deterministic replays: “what questions did we run?” is answerable from the run record.
- Fixtures and eval truth files can stabilise against explicit question IDs.
- Trade-off: no UI-editable question sets in v1. That is intentional.

Links
- PR:
- Related docs:
  - `docs/03-architecture/20_state_model.md`
  - `docs/03-architecture/30_data_model.md`
  - `docs/03-architecture/50_api_surface.md`


## ADR-0017: Verification v1 is integrity-only (no entailment model)
- Status: accepted
- Date: 2026-02-07

Context
- We must fail closed on trust breaks (ADR-0002), but "verification" can mean different things:
  - integrity/invariants (deterministic checks)
  - semantic entailment (model-based "does evidence support the claim?")
- Introducing entailment early expands the failure surface (false blocks / false passes) without fixture-eval confidence.

Decision
- Verification v1 is integrity-only:
  - citation lock integrity (locked `citation_id`s exist and match `snippet_hash` rules)
  - geometry sanity (page bounds, normalised polygon ranges, page identity)
  - row/run invariants required for export gating (ADR-0002)
- We do **not** include an entailment/verifier model in v1.
  - If we add entailment later, it must be fixture-eval'd and introduced behind explicit gates.

Consequences
- Deterministic, cheap verification with clear debug paths.
- Does not catch "valid evidence, wrong interpretation" errors; reviewer inspection remains the semantic backstop.

Links
- PR:
- Related docs:
  - `docs/03-architecture/20_state_model.md`
  - `docs/03-architecture/30_data_model.md`
  - `docs/03-architecture/60_observability_and_evals.md`


## ADR-0018: Run trace export is `GET /runs/:id/trace` and is admin-token gated
- Status: accepted
- Date: 2026-02-07

Context
- When exports are blocked or rows fail closed, we need a deterministic, debuggable trace without re-running workflows.
- PoC environments may run without full auth; trace export must be treated as admin-only by default.

Decision
- Add a developer-facing trace export endpoint:
  - `GET /runs/:id/trace` returns a JSON trace for the run (minimal + safe by default).
- Access control (PoC v1):
  - Require `X-Orbital-Admin-Token` header to match env `ORBITAL_ADMIN_TOKEN`.
  - Missing/mismatched token returns `403` with the standard error envelope (ADR-0008).
- Safety:
  - No raw PDF bytes.
  - Avoid full extracted document text.
  - No raw provider payload dumps.
  - Prefer opaque IDs + hashes.

Consequences
- Debugging is faster and more repeatable (trace + IDs is enough).
- Operators must manage an admin token even in “no auth” PoC environments.

Links
- PR:
- Related docs:
  - `docs/03-architecture/50_api_surface.md`
  - `docs/03-architecture/60_observability_and_evals.md`


## ADR-0019: Unsafe export override is API-only and gated behind demo flags + admin token
- Status: accepted
- Date: 2026-02-07

Context
- Default posture is fail-closed export blocking when trust breaks (ADR-0002).
- Demos sometimes need an explicit "unsafe export" bypass to show the shape of outputs.

Decision
- `unsafe_override=true` is allowed only when ALL are true:
  - `NODE_ENV=development` (dev-only)
  - `DEMO_MODE=1`
  - `ALLOW_UNSAFE_EXPORTS=1`
  - `X-Orbital-Admin-Token` matches env `ORBITAL_ADMIN_TOKEN` (ADR-0018)
- UI policy (PoC v1):
  - No unsafe override affordance in the Trust Substrate UI; unsafe override is API-only.
- Unsafe export labelling:
  - Artefacts created via unsafe override must be visibly labelled (eg filename suffix `.UNSAFE`) and recorded in artefact metadata.

Consequences
- Preserves default trust posture while enabling controlled demo escape hatches.
- Slightly more flag complexity, but failures remain explicit and safe by default.

Links
- PR:
- Related docs:
  - `docs/03-architecture/50_api_surface.md`
  - `docs/03-architecture/20_state_model.md`


## ADR-0020: RH2 overlay is "verified at 100% zoom only" in PoC v1; regression proof is artifact-based
- Status: accepted
- Date: 2026-02-07

Context
- Misaligned highlight overlays are trust leakage (they look "precise" while being wrong).
- Overlay alignment across zoom/rotation/scanned packs can be gnarly; we need an honest fallback.

Decision
- PoC v1 overlay posture:
  - Highlight overlays are treated as verified only at `zoom=100%`.
  - If zoom is not 100%, we do not render the overlay and show an explicit, honest message explaining the constraint.
- Regression posture:
  - Capture proof artifacts (screenshots + bbox/HUD logs) for fixture packs.
  - Automation may be used to produce artifacts, but v1 does not require automated pixel-diff assertions.

Consequences
- Protects the trust moment while keeping RH2 scope bounded.
- Adds some reviewer friction (must go to 100% to inspect the overlay).

Links
- PR:
- Related docs:
  - `docs/04-projects/02-features/0001_trust-substrate/prd-overall.md`
  - `docs/04-projects/02-features/0001_trust-substrate/prds/0001d_citation-chip-highlight/prd.md`


## ADR-0021: Data handling posture (storage, provider boundaries, and redaction defaults)
- Status: proposed
- Date: 2026-02-07

Context
- We need explicit, shared rules for where data lives, what leaves the system, and how we avoid accidental leakage in logs/telemetry.

Decision
- Storage boundaries (PoC v1):
  - Postgres holds product state + auditability primitives: folders, runs, questions, report rows, citations, errors (sanitized), and metadata.
  - Postgres also stores extracted document text (e.g. `document_pages.text`, `chunks.text`, `citations.snippet`) and must be treated as sensitive.
  - Object storage holds raw PDFs and exported artefacts; we do not store signed URLs.
  - Provider request/response payloads are not persisted by default.
- Provider boundaries (data leaving the system):
  - OCR/layout provider receives PDF bytes and returns text + geometry; we do not transmit customer exports or run traces.
  - LLM/embedding providers receive only the minimum required text for the current step (question text + candidate chunk text + limited system instructions).
  - Object storage providers (S3-compatible) only see object bytes and keys.
- Telemetry/logging redaction defaults:
  - Never log raw PDFs, full extracted document text, or full provider payloads.
  - Log only opaque IDs, hashes, counts, timings, and failure codes.
  - Admin tokens and signed URLs are treated as secrets and must never be logged.
- Signed URL posture:
  - Signed URLs are generated on demand with a short TTL (target 5–15 minutes) and are never persisted.
  - Logs may include `storage_key` and expiry metadata, but must not include the signed URL.
- Encryption + backups:
  - Encrypt object storage and database volumes at rest where possible.
  - Backups (DB dumps, object snapshots) are sensitive and must be protected like primary data.
- Admin token handling:
  - `ORBITAL_ADMIN_TOKEN` is env-only, never stored in DB, never returned in responses, and never logged.
  - Token checks gate admin-only endpoints (e.g., trace export) per ADR-0018/0019.

Consequences
- Forces minimal data exposure to providers and logs.
- Requires explicit redaction discipline in logging and telemetry paths.

Links
- PR:
- Related docs:
  - `docs/03-architecture/50_api_surface.md`
  - `docs/03-architecture/60_observability_and_evals.md`
  - `docs/03-architecture/30_data_model.md`

## ADR-0022: Docker Compose usage (local services) and Sprite as a dev sandbox (both supported)
- Status: accepted
- Date: 2026-02-08

Context
- We need a single, boring way to bring up local dependencies (especially Postgres + pgvector) without turning the entire app into a container-first workflow.
- Some contributors may prefer a more isolated local dev sandbox than "run services with compose, run app on host".

Decision
- We support two local dev modes:
  - Docker Compose mode: use Compose for **local dependency services** (currently `docker-compose.yml` provisions Postgres: pg16 + pgvector); run the app/worker on the host for day-to-day development.
  - Sprite mode: use Sprite as a **local dev sandbox** to run the same dev setup in a more isolated/reproducible environment; Docker Compose may not be needed for local services.
- We do not require containerizing the web app / worker for development, but Sprite mode may choose to do so as an implementation detail of the sandbox.

Consequences
- Local onboarding can match preference:
  - Compose is the simplest path when you only need Postgres running quickly.
  - Sprite is the best path when you want stronger isolation/reproducibility.
- We keep production deployment/containerization decisions separate from local dev ergonomics.

Links
- PR:
- Related docs:
  - `docker-compose.yml`
  - `docs/03-architecture/01_onboarding_checklist.md`
  - `docs/03-architecture/05_tech_stack_and_dev_workflow.md`

## ADR-0023: Demo-prod runtime mode (ORBITAL_MODE) + Basic Auth middleware
- Status: proposed
- Date: 2026-02-10

Context
- We want to demo Orbital PoC as a "real app" (production build on Hetzner) without exposing it publicly.
- Today, many routes/pages are intentionally dev-only (`assertDevOnly*`) and demo tooling is also dev-only (`DEMO_MODE=1`), so a production build either fails (missing env) or hides core flows (404).
- We need a posture where "production build" does not imply "public production" while we are still using synthetic/test data and demo-only affordances.

Decision
- Introduce an explicit runtime mode env var:
  - `ORBITAL_MODE=dev`: local development behavior (existing).
  - `ORBITAL_MODE=demo-prod`: production build demo instance (private).
  - `ORBITAL_MODE=prod` (or unset): locked down by default (deny demo-only surfaces).
- In demo-prod:
  - Require Basic Auth on all routes using Next.js middleware (pages, APIs, PDF bytes, artefact downloads).
  - Enable only an allowlisted set of app routes/pages required for the demo journey.
  - Keep demo tooling/escape hatches (e.g. spikes, unsafe overrides) dev-only unless explicitly promoted.
  - Require production-like configuration (no dev fallbacks): `DATABASE_URL`, `OBJECT_STORE_SIGNING_SECRET`, and a separate worker process/service for durable jobs.
- Keep `DEMO_MODE=1` as **dev-only tooling** (toolbar + local pack loader); do not rely on it to represent a deployable demo posture.

Consequences
- We can deploy a private, production-build demo to Hetzner while keeping the default posture fail-closed.
- Demo operators must run the worker service and provide required secrets/env, which makes the demo closer to real runtime behavior.
- Server-side internal fetches must forward `Authorization` (or avoid loopback fetches) so middleware auth does not break SSR/RSC.

Links
- PR:
- Related docs:
  - `docs/04-projects/02-features/0007_demo-prod-deploy/prd.md`
  - `docs/04-projects/02-features/0007_demo-prod-deploy/plan.md`

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md
```md
# Spike investigation - Quick Start Engine (Initiative 002)

This doc captures planned spikes for the rabbit holes in `risk-register.md`.

How to use:
- Each spike has a plan and a report stub.
- After running a spike: fill in the report stub and update `brief.md`, `breadboard-pack.md`, and `risk-register.md`.
- Keep spikes small: isolate failure modes and use the smallest pack set that proves the point.

Fixture sources:
- Pack list (canonical): `docs/08-example-data/packs_summary.md`
- Truth comparators: `docs/08-example-data/<pack>/truth/*`
- Viewer anchors: `docs/08-example-data/<pack>/layout/*.anchors.json`
- Comparator spec (canonical): `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`
- Spike proof artefacts: `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/`

## Proof contract (apply to every spike)

From `docs/03-architecture/20_state_model.md`:
- For any row with status `needs_review|reviewed`:
  - Must have `>= 1` locked citation, and verification must pass.
- For any row with status `missing_input`:
  - `answer` must be exactly `Not found in provided documents.`
  - citations must be empty
  - `notes` (or provenance) must include an actionable missing-doc checklist
- For any row with status `citation_failed`:
  - provenance must include a safe reason code from the failure taxonomy (prefer: `CITATION_MISMATCH`, `NO_CITATIONS`, `VALIDATION_ERROR`) (see `docs/03-architecture/60_observability_and_evals.md`)

For list-shaped artefacts (B-I/B-II/issues):
- Any item that asserts a concrete field must include item-level `citation_ids[]` for that field.
- Item-level states (e.g. `match_status`, `depicted/not_depicted/unknown`) must not invent new report-row statuses.

Observability expectations (for spike proof capture):
- Correlate failures using `{trace_id, run_id, step_key, question_id}` (see `docs/03-architecture/60_observability_and_evals.md`).
- Retrieval provenance includes retrieved `chunk_id`s + scores and (where safe) `docs_searched` (see `docs/03-architecture/40_rag_and_agents.md`).
- Step inputs/outputs are JSON-serialisable and validated with Zod at the step boundary (see `docs/03-architecture/06_frameworks_agents_rag_evals.md`).

## Execution harness + comparator (required)

Any spike that claims a truth match must produce these artefacts:
- Snapshot JSON for `{pack_id, run_id}` containing pinned versions `{index_version, agent_bundle_version, question_set_version}`, the relevant report rows (`payload_schema_version`, `payload_json`, `status`, `citation_ids`, `provenance_json`), and a citation materialisation map `{citation_id -> {document_filename,page_number,polygons,snippet_hash}}`.
- Row invariant audit output (SP-2.9).
- Comparator PASS/FAIL result plus deterministic diff artefact (JSON), per `comparator_spec_v0.md`.

Tooling:
- `scripts/fixtures/assert_row_invariants.ts`
- `scripts/fixtures/compare_truth.ts`

## Proof capture tooling (optional, but recommended)

To avoid Playwright/Chrome DevTools for quick UI automation and screenshots, prefer `agent-browser`:
```bash
pnpm dlx agent-browser install
pnpm dlx agent-browser --headed open http://localhost:3000
pnpm dlx agent-browser snapshot -i
pnpm dlx agent-browser screenshot --full docs/04-projects/02-features/0002_quick-start-engine/tmp/run.png
```

Alternative (persistent sessions, index-based): `browser-use`:
```bash
uvx "browser-use[cli]" open http://localhost:3000
uvx "browser-use[cli]" state
uvx "browser-use[cli]" screenshot
```

---

# SP-2.1 Practitioner question set review

## Question
Does question set v1 (<=25) match how a senior associate wants to consume a "first pass" title + survey report?

## Why now
If question set v1 is wrong, Initiative 002 can "work" while producing the wrong artefacts.

## Success criteria (proof)
- Practitioner says: "Yes, I'd use this table as a first pass."
- Questions total: `<=25`.
- 3 (and only 3) list-shaped artefacts:
  - B-I requirements tracker
  - B-II exceptions table
  - Reconciliation issues list
- Any added question must be offset by deletions to stay `<=25`.

## Deliverable
- A committed artefact capturing the frozen question set:
  - `docs/04-projects/02-features/0002_quick-start-engine/specs/question_set_v1.json` (preferred)
  - `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.1_practitioner_review.md`
  - plus a short note of cuts/changes in this spike report stub

## Timebox
- <= 0.5 day (one pass)

## Approach
1. Start from the union of `golden_questions.json` across packs.
2. Present the output shapes (scalar vs list-shaped).
3. Record feedback and apply cuts/reorder/rename (no scope expansion beyond 25).

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Practitioner notes (paraphrased):
- Question set version chosen:
- Cuts/patches:

---

# SP-2.8 Retrieval Recall@K (golden questions)

## Question
Before tuning parsing/matching, do we reliably retrieve the expected evidence chunks for golden questions (Recall@K)?

## Packs
- `pack_01_clean`

## Success criteria (proof)
- For each question in `docs/08-example-data/pack_01_clean/truth/golden_questions.json`:
  - retrieval returns at least one chunk overlapping the expected anchor page range (use `layout/*.anchors.json`)
- Report Recall@K for K=10 and K=25.
- Record misses with `{question_id, doc, page}` and the top retrieved chunks.

## Timebox
- <= 0.5 day

## Approach
1. Use the current retrieval pipeline with pinned `index_version`.
2. Compute Recall@K against anchors (small helper script is fine).
3. Decide: Patch retrieval vs accept baseline and move on.

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Recall@10:
- Recall@25:
- Misses logged:
- Cuts/patches:

---

# SP-2.2A Commitment parsing baseline (clean)

## Question
Can we extract Schedule A facts, B-I requirements, and B-II exceptions matching `/truth` key fields on the clean pack?

## Packs
- `pack_01_clean`

## Success criteria (proof)
- Requirements tracker matches `truth/expected_requirements_tracker.csv` on:
  - exact item count
  - exact item numbers (and any truth key fields defined in the comparator)
- Exceptions table matches `truth/expected_exceptions_table.csv` on:
  - exact item count
  - exact item numbers
  - instrument reference fields normalised to a single canonical form (declare the normalisation once)
- Precision rule: 0 false positives (no extra items not present in truth by item number).

## Timebox
- <= 0.5 day

## Approach
1. Use truth CSVs as comparator (diffs, not eyeballing).
2. Record failures precisely (item numbering drift, date formats, instrument ref parsing).
3. Decide: Patch normalisers vs Cut formats.

## Proof artefacts (to commit)
- `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.2A_pack_01_clean.snapshot.json`
- `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.2A_pack_01_clean.result.json`
- `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.2A_pack_01_clean.diff.json`

Notes:
- Snapshot must include rows for `TS-03` (B-I) and `TS-04` (B-II).
- Comparator rules are single-sourced in `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`.

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- Normalisation decisions:
- Cuts/patches:

---

# SP-2.2B Multi-parcel parsing behaviour

## Question
Can the requirements/exceptions payload represent parcel scoping without inventing new report-row statuses?

## Packs
- `pack_04_multi_parcel`

## Success criteria (proof)
- At least one extracted requirement or exception item is explicitly scoped (e.g. Parcel 2) when truth indicates it.
- No silent “applies to all parcels” default unless evidence says so.
- Any parcel assignment cites item-local text (not headers).

## Timebox
- <= 0.5 day

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- Payload field chosen for scoping:
- Cuts/patches:

---

# SP-2.2C Scan torture honesty gating

## Question
On scan torture packs, can we avoid hallucinations and still produce a usable row outcome?

## Packs
- `pack_07_scans_rotated_low_quality`

## Success criteria (proof)
Either:
1. Extracts items with 0 false positives and attaches citations, OR
2. The row is `missing_input` with:
  - exact answer string
  - zero citations
  - checklist that calls out low extraction quality remediation (rotate, re-scan, higher DPI, etc.)

And:
- Record a single threshold decision that triggers (1) vs (2) (no new statuses).

## Proof artefacts (to commit)
- `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.2C_pack_07_scans.snapshot.json`
- `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.2C_pack_07_scans.policy.json`

Notes:
- Threshold decision should be recorded as a constant in `SP-2.2C_pack_07_scans.policy.json` (not just prose).

## Timebox
- <= 0.5 day

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Threshold decision:
- Checklist copy:
- Cuts/patches:

---

# SP-2.3A Matching baseline + missing exception doc

## Question
Can we avoid false matches and surface missing-doc behaviour explicitly?

## Packs
- `pack_01_clean`
- `pack_02_missing_rea`

## Success criteria (proof)
- `pack_01_clean`: for exception items with truth-linked instruments:
  - `match_status: matched` and cites evidence for the match, OR
  - `match_status: ambiguous` with candidates listed (never silent auto-pick)
- `pack_02_missing_rea`:
  - the missing REA is surfaced as item-level `match_status: missing_doc`
  - notes include an actionable missing-doc checklist (include filename `REA.pdf`)
  - only use `missing_input` when an answer truly cannot be supported

## Timebox
- <= 0.5 day

## Proof artefacts (to commit)
- `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.3A_pack_01_02_matching.snapshot.json`
- `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.3A_pack_01_02_matching.result.json`

Notes:
- Missing-doc checklist must include the literal filename `REA.pdf` for `pack_02_missing_rea`.

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- Matching rules:
- Cuts/patches:

---

# SP-2.3B Overlaps + missing attachment detection

## Question
Can we surface ambiguity and detect missing attachments without fabricating summaries?

## Packs
- `pack_06_overlapping_easements`

## Success criteria (proof)
- At least one ambiguous case is surfaced as:
  - item-level `match_status: ambiguous` with >=2 candidates
  - row remains `needs_review` (with citations) and requires manual resolution later
- Missing attachment is detected and recorded as item-level `match_status: missing_attachment` (or equivalent) with:
  - a citation to the clause referencing the exhibit/attachment
  - checklist includes expected missing attachment filename `Utility_Easement_10ft_ExhibitB.pdf` (from `docs/08-example-data/packs_summary.md`)
  - no fabricated summary of missing content

## Timebox
- <= 0.5 day

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- Missing-attachment detector rule:
- Cuts/patches:

---

# SP-2.3C Defined terms / exhibit chase boundedness

## Question
Can we follow defined terms / exhibit references in a bounded, deterministic, auditable way?

## Packs
- `pack_08_defined_terms_and_cross_refs`

## Success criteria (proof)
- Reference following is bounded and logged:
  - `max_depth` chosen and recorded (2 or 3)
  - cycles terminate with a reason code like `REFERENCE_CYCLE` in provenance
  - chain recorded in provenance as ordered `{from_ref, to_doc, to_chunk_id}`
- If the definition target cannot be supported with a locked citation, return `missing_input` honestly.

## Timebox
- <= 0.5 day

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- max_depth:
- Reason codes observed:
- Cuts/patches:

---

# SP-2.4A Survey extraction baseline + cert gap

## Question
Can we reliably extract certification parties and baseline text callouts with citations (and flag cert gaps)?

## Packs
- `pack_01_clean`
- `pack_03_mismatch_and_cert_gap`

## Success criteria (proof)
- Certification extraction outputs a structured set of parties (whatever truth supports), each backed by lockable citations.
- `pack_03_mismatch_and_cert_gap`: missing lender is flagged as a machine-readable issue code (e.g. `CERT_MISSING_LENDER`) with citation to the certification block.

## Timebox
- <= 0.5 day

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- Issue codes used:
- Cuts/patches:

---

# SP-2.4B Survey scan torture behaviour

## Question
On scan torture, can we avoid made-up callouts and still produce a usable row outcome?

## Packs
- `pack_07_scans_rotated_low_quality`

## Success criteria (proof)
Either:
1. Emits callouts where each has >=1 locked citation, OR
2. Row is `missing_input` with remediation checklist (rotate/re-scan/etc).

## Timebox
- <= 0.5 day

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Checklist copy:
- Cuts/patches:

---

# SP-2.5 Reconciliation honesty policy (unknown bias)

## Question
Can we keep reconciliation honest by biasing to item-level `unknown` instead of incorrect item-level `not_depicted`?

## Packs
- `pack_03_mismatch_and_cert_gap`
- `pack_07_scans_rotated_low_quality`

## Success criteria (proof)
- Item classification is one of: `depicted|not_depicted|unknown` (item-level only).
- Hard rule: `not_depicted` requires positive evidence of absence (define narrowly and cite it). Otherwise it must be `unknown`.
- If this cannot be made safe, cut v1 to `depicted|unknown` only and document it.

## Timebox
- <= 0.5 day

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Evidence rules:
- Cut decision (if any):

---

# SP-2.6 Run idempotency + snippet_hash stability

## Question
On restart/retry, do we avoid duplicate rows and keep stable citation `snippet_hash` values (same pinned versions)?

## Packs
- `pack_01_clean`

## Success criteria (proof)
- After two runs with the same pinned versions (`index_version`, `agent_bundle_version`, `question_set_version`), the following are byte-identical after normalisation:
  - row status values
  - payload/answer (canonicalised)
  - ordered list of `citation.snippet_hash` values per row
- Allowed differences: timestamps, run IDs, DB IDs.
- Negative test: deliberately corrupt one locked citation (fixture/test hook) and confirm:
  - affected row becomes `citation_failed` with reason `CITATION_MISMATCH`
  - workflow continues processing remaining questions
  - run can still reach `completed` (exports remain blocked by default)

## Proof artefacts (to commit)
- `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.6_idempotency_pack_01.json`
- `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.6_negative_test.json`

Notes:
- Record the exact normalisation function used as `normalise_row_for_idempotency_v0()` (defined in `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`).

## Timebox
- <= 0.5 day

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- Normalisation function used (expected: `normalise_row_for_idempotency_v0()`):
- Idempotency keys:

---

# SP-2.7 Payload representation decision (rows vs tables)

## Question
Where do we store and version the structured payload for list-shaped artefacts (B-I/B-II/issues) so UI can render it and evals can compare it?

Constraints:
- Must obey the report-row status invariants in `docs/03-architecture/20_state_model.md`.
- Citations must be lockable/immutable and attached to rows, and ideally to item-level entries.

## Packs
- `pack_01_clean`
- `pack_03_mismatch_and_cert_gap` (issues payload truth)

Notes:
- Multi-parcel scoping is covered separately by SP-2.10.

## Options to decide between
1. Store structured payload in `report_rows.provenance_json` and render from it in UI.
2. Store structured payload as JSON in `report_rows.answer` (string) and treat `answer` as machine-readable.
3. Introduce first-class artefact tables and keep report rows as summaries.
4. Add `report_rows.payload_json` (JSONB) + `payload_schema_version` columns (keep `answer` human-readable and provenance debug-only).

## Current decision (doc-level)
- Chosen: Option 4 (`report_rows.payload_json` + `report_rows.payload_schema_version`).
- Schema: `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md` (`payload_schema_version = list_payload_v0`).

## Success criteria (proof)
- Can represent truth comparators faithfully (key fields + item numbering) for the chosen packs.
- Payload supports:
  - stable `item_id` per item (for diffing + idempotency)
  - item-level `citation_ids[]`
  - item-level states (`match_status`, `depicted/not_depicted/unknown`) without inventing new row statuses
- API response exposes `citation_ids[]` and UI renders from locked citations only (no chunk IDs).

## Timebox
- <= 0.5 day

## Oracle notes
- Pending.

## Report (fill after running)
- Decision:
- Why:
- Schema/UX implications:
- Proof note: `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.7_decision.md`

---

# SP-2.9 Row invariant audit helper

## Question
Can we automatically assert report-row invariants so spikes can’t “pass” while violating the trust spine?

## Packs
- none (validator)

## Success criteria (proof)
A CLI or test helper that given a `run_id` asserts:
- Unique `(run_id, question_id)`
- `missing_input`: exact answer string + zero citations + checklist present
- `needs_review|reviewed`: >=1 locked citation
- `citation_failed`: has reason code

## Timebox
- <= 0.5 day

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Tool location:
- Usage:

---

# SP-2.10 Multi-parcel scoping representation (focused)

## Question
Do we have a concrete scoping representation and UI rendering that stays within the row invariants?

## Packs
- `pack_04_multi_parcel`

## Success criteria (proof)
- At least one extracted item is scoped and displayed in the UI (e.g. “Parcel 2 only”) without inventing new report-row statuses.
- Item scoping is backed by lockable citations.

## Timebox
- <= 0.5 day

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- Field + rendering decision:

---

# SP-2.11 Verification semantics for list-shaped rows

## Question
For a list payload (items with multiple claimed fields), what is the smallest safe verification policy that preserves fail-closed posture without creating unnecessary whole-row `citation_failed` outcomes?

## Packs
- `pack_01_clean`

## Success criteria (proof)
- A written v1 verification policy for list payloads that defines:
  - unit of verification (item-level fields, not just the row shell)
  - behavior on partial failures (choose one and justify):
    - downgrade unsupported fields/items to `unknown` (and re-verify), OR
    - fail the entire row as `citation_failed`
  - required provenance fields + reason codes for auditability
- The policy is consistent with the row invariants in `docs/03-architecture/20_state_model.md` and the fail-closed posture in ADR-0002.
- If a “downgrade/repair” path is chosen, the step boundary is explicit: where the repair occurs (draft vs verify) and how citations remain immutable (no mutation of existing `citation_id`s).

## Timebox
- <= 0.5 day

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Policy chosen:
- Cut/patch decisions:

---

# SP-2.12 Run gating vs folder state (`indexed` runnable + warning UX)

## Question
Can Quick Start run on `indexed` folders even when `ready` health checks fail, with explicit warning UX and no blocking?

## Packs
- `pack_07_scans_rotated_low_quality`

## Success criteria (proof)
- Run start is allowed when `folders.state in {indexed, ready}` (matches `docs/03-architecture/20_state_model.md` and `docs/03-architecture/50_api_surface.md`).
- UI shows an explicit “quality warning” state when folder is `indexed` but not `ready` (e.g. low extraction quality) while still allowing the run to start.
- The warning UX is safe and actionable (no internal errors/provider payloads; points to remediation like re-scan/rotate/re-upload).

## Timebox
- <= 0.25 day

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Warning copy:
- Cuts/patches:

---

# SP-2.13 Human-in-the-loop ambiguity resolution semantics (optional; v1 cut)

## Question
If/when a user resolves an ambiguous match, how do we re-run verification without mutating immutable citations and without hand-wavy “choose correct doc” behavior?

## Packs
- `pack_06_overlapping_easements`

## Success criteria (proof)
- A concrete mechanism is chosen and documented (one of):
  - new run type (e.g. `quick_start_repair`) that re-runs a single `question_id`, OR
  - a new run with an override that pins the user selection as input
- Existing citations remain immutable; the resolution produces new locked citations and a newly verified output (no in-place mutation).
- UX/auditability: the system can show what changed (original ambiguous output vs resolved output) and why.

## Timebox
- <= 0.5 day

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Mechanism chosen:
- Data model implications:

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/wdk/wdkWorker.server.ts
```ts
import "server-only";

import type { Sql } from "../db.server";
import {
  claimNextStep,
  markStepFailed,
  markStepSucceeded,
  requeueStaleRunningSteps,
  rescheduleStep,
  type StepRow,
} from "./stepQueue.server";

export type StepHandler = (args: { step: StepRow; workerId: string; db?: Sql }) => Promise<{
  output: unknown;
  metrics?: unknown;
}>;

export type StepHandlerMap = Record<string, StepHandler>;

function safeErrMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function backoffMs(attempt: number): number {
  // attempt is 1-based and increments when the step is claimed.
  const base = 1_000;
  const max = 30_000;
  const ms = base * Math.pow(2, Math.max(0, attempt - 1));
  return Math.min(max, ms);
}

async function handleStep(args: { step: StepRow; workerId: string; handlers: StepHandlerMap; db?: Sql }): Promise<void> {
  const handler = args.handlers[args.step.step_type];
  if (!handler) {
    await markStepFailed({
      stepId: args.step.id,
      workerId: args.workerId,
      error: { code: "STEP_TYPE_UNKNOWN", message: `No handler registered for step_type=${args.step.step_type}` },
      db: args.db,
    });
    return;
  }

  const result = await handler({ step: args.step, workerId: args.workerId, db: args.db });
  await markStepSucceeded({
    stepId: args.step.id,
    workerId: args.workerId,
    output: result.output,
    metrics: result.metrics,
    db: args.db,
  });
}

export async function drainWdkStepsOnce(args: {
  workerId: string;
  runId?: string;
  handlers: StepHandlerMap;
  maxSteps?: number;
  maxAttempts?: number;
  db?: Sql;
}): Promise<number> {
  const maxSteps = args.maxSteps ?? 50;
  const maxAttempts = args.maxAttempts ?? 3;

  let processed = 0;
  for (let i = 0; i < maxSteps; i += 1) {
    const step = await claimNextStep({ workerId: args.workerId, runId: args.runId, db: args.db });
    if (!step) return processed;

    // eslint-disable-next-line no-console
    console.info("wdk.worker.step_claimed", {
      worker_id: args.workerId,
      step_id: step.id,
      run_id: step.run_id,
      step_key: step.step_key,
      step_type: step.step_type,
      attempt: step.attempt,
    });

    try {
      await handleStep({ step, workerId: args.workerId, handlers: args.handlers, db: args.db });
    } catch (err) {
      if (step.attempt < maxAttempts) {
        const ms = backoffMs(step.attempt);
        await rescheduleStep({
          stepId: step.id,
          workerId: args.workerId,
          availableAt: new Date(Date.now() + ms),
          error: { code: "STEP_FAILED_RETRYING", message: "Step failed; retry scheduled." },
          db: args.db,
        });
      } else {
        await markStepFailed({
          stepId: step.id,
          workerId: args.workerId,
          error: { code: "STEP_FAILED", message: "Step failed permanently." },
          db: args.db,
        });
      }

      // eslint-disable-next-line no-console
      console.error("wdk.worker.step_failed", {
        worker_id: args.workerId,
        step_id: step.id,
        run_id: step.run_id,
        step_key: step.step_key,
        step_type: step.step_type,
        attempt: step.attempt,
        message: safeErrMessage(err),
      });
    }

    processed += 1;
  }

  return processed;
}

export async function runContinuousWdkWorker(args: {
  workerId: string;
  handlers: StepHandlerMap;
  pollIntervalMs?: number;
  maxStepsPerTick?: number;
  staleLockMs?: number;
  maxAttempts?: number;
  db?: Sql;
}): Promise<never> {
  const pollIntervalMs = args.pollIntervalMs ?? 1_000;
  const maxStepsPerTick = args.maxStepsPerTick ?? 25;
  const staleLockMs = args.staleLockMs ?? 5 * 60 * 1000;

  // eslint-disable-next-line no-console
  console.info("wdk.worker.started", {
    worker_id: args.workerId,
    poll_interval_ms: pollIntervalMs,
    stale_lock_ms: staleLockMs,
  });

  while (true) {
    try {
      await requeueStaleRunningSteps({
        cutoff: new Date(Date.now() - staleLockMs),
        limit: 100,
        db: args.db,
      });

      const n = await drainWdkStepsOnce({
        workerId: args.workerId,
        handlers: args.handlers,
        maxSteps: maxStepsPerTick,
        maxAttempts: args.maxAttempts,
        db: args.db,
      });

      if (n === 0) {
        await new Promise((r) => setTimeout(r, pollIntervalMs));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("wdk.worker.tick_failed", { worker_id: args.workerId, message: safeErrMessage(err) });
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
  }
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.1_practitioner_review.md
```md
# SP-2.1 Practitioner Review (Template)

Date:
Reviewer role:
Reviewer context (1-2 sentences):

Question set reviewed:
- `docs/04-projects/02-features/0002_quick-start-engine/specs/question_set_v1.json`
- `question_set_version` string used:

Outcome:
- Usable first pass? (Yes/No):
- Biggest gaps (top 3):
- Biggest cuts (top 3):

Notes (paraphrased, max 2 short quotes):

Follow-ups:


```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md
```md
# List Payload v0 (Initiative 0002)

This is the stable, versioned contract for list-shaped artefacts produced by Initiative 0002:
- Schedule B-I requirements tracker
- Schedule B-II exceptions table
- Survey reconciliation issues list

Row status invariants remain unchanged: report rows can only be `needs_review|reviewed|missing_input|citation_failed`.
Item-level states live inside the payload and must not invent new report-row statuses.

## Schema (Zod-ish / TypeScript)

```ts
// payload_schema_version = "list_payload_v0"

export type ListPayloadV0 = {
  kind: "requirements_tracker" | "exceptions_table" | "survey_issues";
  items: Array<RequirementsItemV0 | ExceptionItemV0 | SurveyIssueItemV0>;
};

export type BaseItemV0 = {
  item_id: string;        // deterministic for diffing + idempotency
  citation_ids: string[]; // locked citations only (ADR-0001)
  notes?: string | null;
};

export type ParcelScopeV0 =
  | { scope: "all" }
  | { scope: "parcels"; parcels: number[]; citation_ids: string[] };

export type RequirementsItemV0 = BaseItemV0 & {
  kind: "requirements_tracker_item";
  bi_item: number;
  requirement: string;
  owner: string;
  item_status: "open" | "closed" | "waived"; // item-level only
  parcel_scope?: ParcelScopeV0;
};

export type ExceptionMatchStatusV0 =
  | "matched"
  | "ambiguous"
  | "missing_doc"
  | "missing_attachment";

export type ExceptionItemV0 = BaseItemV0 & {
  kind: "exceptions_table_item";
  bii_item: number;
  type: string;
  instrument_no?: string | null;
  recorded_date?: string | null; // ISO YYYY-MM-DD
  doc?: string | null;           // expected filename
  risk_tags?: string[];          // normalised lower-case tags
  match_status: ExceptionMatchStatusV0;
  candidates?: Array<{ doc: string; instrument_no?: string | null }>;
  parcel_scope?: ParcelScopeV0;
};

export type SurveyIssueItemV0 = BaseItemV0 & {
  kind: "survey_issue_item";
  issue_type: string; // e.g. encroachment, ocr_quality, missing_input
  description: string;
  impact?: string | null;
  suggested_fix?: string | null;

  // optional linkage for reconciliation
  related_exception_item_id?: string | null;
  item_classification?: "depicted" | "not_depicted" | "unknown"; // item-level only
};
```

## Deterministic `item_id` rules

Keep item IDs boring and stable:
- Requirements: `bi:<bi_item>`
- Exceptions: `bii:<bii_item>`
- Issues:
  - Prefer anchor-derived IDs when available: `issue:<issue_type>:<doc>:<anchor>`
  - Otherwise: `issue:<issue_type>:sha256:<desc_hash_12>`

## Notes

- `citation_ids` must refer only to locked `citations.id` values; never expose chunk IDs to the UI.
- "Missing doc" and "missing attachment" are item-level states (e.g. `match_status`) that may require row-level `missing_input` depending on what the question/row can honestly answer.
- Item payloads must not reuse `report_rows.status` values. Item-level states live in fields like `match_status` and `item_classification`.

## Example payload items

These are illustrative only; truth comparators for packs define the concrete expected columns/values.

### B-I requirement item

```json
{
  "kind": "requirements_tracker_item",
  "item_id": "bi:1",
  "bi_item": 1,
  "requirement": "Payment of the full consideration to the Company for the policy(ies) to be issued and all applicable premiums and charges.",
  "owner": "Buyer",
  "item_status": "open",
  "citation_ids": ["cit_..."]
}
```

### B-II exception item

```json
{
  "kind": "exceptions_table_item",
  "item_id": "bii:15",
  "bii_item": 15,
  "type": "Reciprocal Easement Agreement (REA)",
  "instrument_no": "2021-218785",
  "recorded_date": "2021-10-22",
  "doc": "REA.pdf",
  "risk_tags": ["parking", "shared_costs"],
  "match_status": "matched",
  "citation_ids": ["cit_..."]
}
```

### Survey issue item

```json
{
  "kind": "survey_issue_item",
  "item_id": "issue:encroachment:ALTA_Survey.pdf:SURVEY_ENC_01",
  "issue_type": "encroachment",
  "description": "Chain-link fence encroaches approx. 0.4' over the north boundary line near the NW corner.",
  "impact": "May require cure, endorsement, or risk acceptance.",
  "suggested_fix": "Confirm materiality; consider survey revision, boundary agreement, or endorsement evidence package.",
  "citation_ids": ["cit_..."]
}
```

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/spikes/rh4_verification_harness.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { verifyRow } from "../verify/verifier";
import { VerifyInputSchema } from "../verify/verifier.schemas";

function parseArgs(argv: string[]) {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "true";
    args.set(key, val);
    if (val !== "true") i += 1;
  }
  return args;
}

const DatasetCaseSchema = VerifyInputSchema.extend({
  expected: z.enum(["pass", "fail"]),
  expected_reason_code: z.string().optional(),
});
type DatasetCase = z.infer<typeof DatasetCaseSchema>;

const DatasetSchema = z.array(DatasetCaseSchema);

function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const datasetPath =
    args.get("dataset") ??
    "docs/04-projects/02-features/0001_trust-substrate/fixtures/rh4_verification_cases.json";
  const mode = (args.get("mode") ?? "deterministic-only") as "deterministic-only" | "entailment";
  const outDir = args.get("outDir") ?? "docs/97-throwaway/spike-evidence/rh4";

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
  const raw = fs.readFileSync(path.join(root, datasetPath), "utf8");
  const dataset = DatasetSchema.parse(JSON.parse(raw)) as DatasetCase[];

  const results: Array<{
    case_id: string;
    expected: "pass" | "fail";
    got: "pass" | "fail";
    reason_code: string;
    timings_ms: unknown;
  }> = [];

  for (const row of dataset) {
    const input = VerifyInputSchema.parse(row);
    const res = await verifyRow(input, { mode });
    results.push({
      case_id: row.case_id,
      expected: row.expected,
      got: res.verdict,
      reason_code: res.reason_code,
      timings_ms: res.timings_ms,
    });
  }

  const fp = results.filter((r) => r.expected === "fail" && r.got === "pass").length;
  const fn = results.filter((r) => r.expected === "pass" && r.got === "fail").length;
  const tp = results.filter((r) => r.expected === "pass" && r.got === "pass").length;
  const tn = results.filter((r) => r.expected === "fail" && r.got === "fail").length;

  const latencies = results
    .map((r) => (r.timings_ms as any)?.total)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));

  const summary = [
    `# RH4 verification harness summary`,
    ``,
    `- Mode: \`${mode}\``,
    `- Dataset: \`${datasetPath}\``,
    ``,
    `## Confusion matrix`,
    ``,
    `- True pass: ${tp}`,
    `- True fail: ${tn}`,
    `- False pass: ${fp}`,
    `- False fail: ${fn}`,
    ``,
    `## Latency (ms)`,
    ``,
    `- p50: ${percentile(latencies, 50) ?? "n/a"}`,
    `- p95: ${percentile(latencies, 95) ?? "n/a"}`,
    `- max: ${latencies.length ? Math.max(...latencies) : "n/a"}`,
    ``,
  ].join("\n");

  const outRoot = path.join(root, outDir);
  fs.mkdirSync(outRoot, { recursive: true });
  fs.writeFileSync(path.join(outRoot, "results.json"), JSON.stringify({ results }, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(outRoot, "summary.md"), summary, "utf8");

  process.stdout.write(`Wrote ${path.join(outRoot, "results.json")}\n`);
  process.stdout.write(`Wrote ${path.join(outRoot, "summary.md")}\n`);
}

await main();

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/risk-register.md
```md
# Risk register (rabbit holes)

Use this during shaping to capture tail risks and choose mitigations (Cut / Patch / Spike / Out-of-bounds).

Key rule (per `docs/00-strategy/initiatives/001-003_dependency_plan.md`):
- Breadboards + risk register + spikes come before PRDs.

| ID | Risk (write as a question) | Type | Why its risky | Treatment | Next step | Status |
|---|---|---|---|---|---|---|
| RH-2.1 | Does question set v1 (<=25) match practitioner expectations? | product | Wrong questions -> wrong artefacts even if extraction is "correct". | Spike | SP-2.1 practitioner review | open |
| RH-2.2 | How do we represent table-shaped artefacts (B-I/B-II/issues) inside the report-row model without breaking status + citation invariants? | design/tech | If we pick the wrong payload model, we either can't render or we lose traceability/citations. | Spike | SP-2.7 validates Option 4 + `list_payload_v0` against truth (see `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.7_decision.md`) | open |
| RH-2.3 | Can commitment parsing match `/truth` key fields across clean + scan packs? | tech | OCR + format variance can silently degrade item extraction. | Spike | SP-2.2 parsing spike on packs incl `pack_07_scans_rotated_low_quality` | open |
| RH-2.4 | Can exception -> instrument matching avoid false matches and surface ambiguity/missing docs explicitly? | tech/data | Silent mismatches undermine trust more than missing outputs. | Spike | SP-2.3 matching spike on `pack_06_overlapping_easements` + `pack_02_missing_rea` | open |
| RH-2.5 | Can survey extraction reliably find certification parties + baseline callouts on scan packs? | tech | Surveys are messy; OCR noise can cause hallucinated callouts if we're not strict. | Spike | SP-2.4 survey spike on `pack_07_scans_rotated_low_quality` | open |
| RH-2.6 | Can reconciliation stay honest (bias to unknown/needs_review instead of incorrect "not depicted")? | product/tech | A confident wrong "not depicted" is worse than an "unknown". | Spike | SP-2.5 reconciliation honesty spike | open |
| RH-2.7 | Run idempotency: do restarts avoid duplicate rows and keep stable `snippet_hash`? | tech | Retries are normal; drift kills trust and breaks evals. | Spike | SP-2.6 idempotency + hashing spike | open |
| RH-2.8 | Missing attachment inside a provided instrument doc: do we detect and flag without blocking the run? | data | Missing exhibits can produce fabricated summaries unless explicitly flagged. | Spike | SP-2.3B overlaps + missing attachment | open |
| RH-2.9 | Too many `citation_failed` rows early: do we have a usable failure UX without "turning off" trust? | product/ux | Fail-closed is required; if UX is unusable, users will demand unsafe shortcuts. | Patch | Draft guidance copy in `docs/04-projects/02-features/0002_quick-start-engine/specs/failure_ux_copy_v0.md`, then wire drawer UX to reason codes + next actions | open |
| RH-2.10 | Pack naming/fixtures drift: are strategy docs and code/evals aligned to `docs/08-example-data/*`? | process | Misnamed packs/truth files cause wasted work and false pass/fail in spikes. | Patch | Audit proof: `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/RH-2.10_pack_name_audit.txt`; enforced by `scripts/verify.sh` (calls `scripts/fixtures/verify_pack_names.ts`) | closed |
| RH-2.11 | Retrieval recall: do we reliably retrieve the expected evidence chunks for golden questions before drafting? | tech | If retrieval is weak, everything degenerates into `missing_input` (or unsafe guesses), and you'll misdiagnose it as parsing failure. | Spike | SP-2.8 retrieval Recall@K | open |
| RH-2.12 | Run determinism: do runs pin `question_set_version` so “completed” invariants are enforceable and comparisons are stable? | tech/process | If question sets drift, “completed” becomes meaningless and evals become non-reproducible. | Patch | Docs updated; see `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/RH-2.12_pin_audit.md` | closed |
| RH-2.13 | Per-row failure handling vs run-level failure: can a run still reach `completed` with `citation_failed` rows (and sane UX)? | product/tech | If any per-row failure crashes the whole run, you'll get lots of `partial` runs and unstable evals. | Spike | Fold into SP-2.6: force one row to `citation_failed` and prove workflow continues and run can still reach `completed` | open |
| RH-2.14 | Multi-parcel scoping representation: can payloads represent parcel scoping without inventing new report-row statuses? | domain/design | `pack_04_multi_parcel` forces scoping; if payload can't express it, truth matching and UX will be messy. | Spike | SP-2.10 multi-parcel scoping representation | open |
| RH-2.15 | Bounded exhibit chase: can we follow defined terms/exhibits deterministically (depth, cycles) and log evidence? | tech/domain | Unbounded chase creates nondeterminism; bounded chase needs an explicit contract and reason codes. | Spike | SP-2.3C defined terms / exhibit chase boundedness | open |
| RH-2.16 | Human-in-the-loop ambiguity resolution: if users resolve ambiguity, how do we re-verify without mutating immutable citations? | product/tech | This touches run semantics, verification, and UX; implied “choose correct doc” is a footgun without explicit mechanics. | Cut (v1) | Explicitly cut the "choose correct doc" flow for v1; see `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/RH-2.16_cut_note.md` | closed |
| RH-2.17 | Verification semantics for list-shaped rows: what gets verified, and what happens on partial item failure? | tech | Without a clear policy, spikes will “pass” while violating trust invariants or failing whole rows unnecessarily. | Spike | SP-2.11 list verification semantics | open |
| RH-2.18 | Run start gating vs folder state: can Quick Start run on `indexed` folders (with warnings) without blocking on `ready`? | product/tech | Scan packs may never be `ready`; if UI blocks runs until `ready`, you can't test scan torture behaviour. | Patch | SP-2.12 run gating vs folder state (`indexed` runnable + warning UX) | open |
| RH-2.19 | Truth comparator normalisation rules: are diff rules defined once (dates, instrument refs, item numbering) so spikes stay crisp? | process/tech | Without a normalisation contract, spikes devolve into arguing about diffs. | Patch | Spec: `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`; tooling: `scripts/fixtures/compare_truth.ts` + `scripts/fixtures/assert_row_invariants.ts` | open |

Notes:
- Status for report rows must follow `docs/03-architecture/20_state_model.md` (do not invent new row statuses).
- "Unknown" belongs as an item-level classification inside a row payload, not as a report-row status.

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/spikes/us001_pack01_cert_parties.e2e.test.ts
```ts
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromCoreCwd(): string {
  // When invoked via `pnpm -r test`, vitest runs with cwd at the package root.
  return path.resolve(process.cwd(), "../..");
}

function runNode(repoRoot: string, args: string[]): string {
  return execFileSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function loadJson(filePath: string): any {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

describe("US-001 pack_01_clean survey certification parties", () => {
  it("seeds certification parties payload with locked citations", () => {
    const repoRoot = repoRootFromCoreCwd();
    const outRoot = path.join(os.tmpdir(), `orbital-poc-us001-${process.pid}-${Date.now()}`);

    runNode(repoRoot, [
      "--experimental-strip-types",
      "scripts/fixtures/seed.ts",
      "pack_01_clean",
      "--out-root",
      outRoot,
      "--overwrite",
      "--no-bad-citation",
    ]);

    const snapshotPath = path.join(outRoot, "pack_01_clean", "snapshot.json");

    expect(() =>
      runNode(repoRoot, ["--experimental-strip-types", "scripts/fixtures/assert_row_invariants.ts", "--snapshot", snapshotPath]),
    ).not.toThrow();

    expect(() =>
      runNode(repoRoot, [
        "--experimental-strip-types",
        "scripts/fixtures/compare_truth.ts",
        "--snapshot",
        snapshotPath,
        "--datasets",
        "survey_certification_parties,golden_scalar",
      ]),
    ).not.toThrow();

    const snapshot = loadJson(snapshotPath);
    const certRow = (snapshot.rows as any[]).find((r) => r?.payload_json?.kind === "survey_certification_parties");
    expect(certRow).toBeTruthy();

    const items = (certRow.payload_json.items as any[]).filter((it) => it?.kind === "survey_certification_party_item");
    expect(items.length).toBeGreaterThanOrEqual(1);
    for (const it of items) {
      expect(typeof it.party_name).toBe("string");
      expect(Array.isArray(it.citation_ids) && it.citation_ids.length > 0).toBe(true);
    }
  });
});


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/steps/quickStartWriteRowV0.step.server.ts
```ts
import "server-only";

import { z } from "zod";

import {
  LIST_PAYLOAD_V0_SCHEMA_VERSION,
  ListPayloadV0KindSchema,
  ListPayloadV0Schema,
  emptyListPayloadV0,
} from "@orbital-poc/core";

import type { Sql } from "../lib/db.server";
import { ensureSchema, sql } from "../lib/db.server";
import { newId } from "../lib/ids";
import { loadQuestionSetV1 } from "../lib/questionSet.server";
import type { StepRow } from "../lib/wdk/stepQueue.server";

const InputSchema = z.object({
  trace_id: z.string().min(1).nullable().optional(),
  question_id: z.string().min(1),
});

type RunRow = {
  id: string;
  folder_id: string;
  state: string;
  question_set_version: string;
  trace_id: string | null;
  questions_total: number;
  questions_done: number;
};

type QuickStartRowStatus = ReturnType<typeof missingInputRow>["status"] | ReturnType<typeof citationFailedRow>["status"];

type JsonArg = Parameters<typeof sql.json>[0];

function withDb(db?: Sql): Sql {
  return db ?? sql;
}

function missingInputRow(args: { folderId: string; questionSetVersion: string; questionId: string; question: string }) {
  return {
    folder_id: args.folderId,
    question_set_version: args.questionSetVersion,
    question_id: args.questionId,
    question: args.question,
    answer: "Not found in provided documents.",
    status: "missing_input" as const,
    citation_ids: [] as string[],
    notes: null as string | null,
    provenance_json: {
      missing_docs_checklist: [
        {
          label: "Upload the referenced document(s)",
          confidence: 1,
          signals: [
            {
              type: "phrase",
              value: args.question,
              source: "system",
            },
          ],
        },
      ],
    },
    payload_schema_version: null as string | null,
    payload_json: null as unknown | null,
  };
}

function citationFailedRow(args: { folderId: string; questionSetVersion: string; questionId: string; question: string }) {
  return {
    folder_id: args.folderId,
    question_set_version: args.questionSetVersion,
    question_id: args.questionId,
    question: args.question,
    answer: "Unable to produce locked citations in this slice.",
    status: "citation_failed" as const,
    citation_ids: [] as string[],
    notes: null as string | null,
    provenance_json: {
      reason_code: "NO_CITATIONS",
      checklist: [
        "Confirm the correct PDFs are uploaded for this folder.",
        "Re-run the workflow after retrieval+locking is implemented.",
      ],
    },
    payload_schema_version: null as string | null,
    payload_json: null as unknown | null,
  };
}

function attachListPayloadIfNeeded<T extends { payload_schema_version: string | null; payload_json: unknown | null }>(
  row: T,
  question: { response_kind: string; artefact_kind?: string; payload_schema_version?: string },
): T {
  if (question.response_kind !== "list_payload") return row;

  if (question.payload_schema_version !== LIST_PAYLOAD_V0_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported payload_schema_version for list_payload: ${String(question.payload_schema_version ?? "null")}`,
    );
  }

  const kind = ListPayloadV0KindSchema.parse(question.artefact_kind);
  const payload = emptyListPayloadV0(kind);
  ListPayloadV0Schema.parse(payload);

  return {
    ...row,
    payload_schema_version: LIST_PAYLOAD_V0_SCHEMA_VERSION,
    payload_json: payload,
  } as T;
}

export async function quickStartWriteRowV0Step(args: { step: StepRow; workerId: string; db?: Sql }): Promise<{
  output: unknown;
  metrics?: unknown;
}> {
  "use step";

  const input = InputSchema.parse(args.step.input_json);
  const s = withDb(args.db);
  if (!args.db) await ensureSchema();

  // eslint-disable-next-line no-console
  console.info("wdk.quick_start.write_row_v0.started", {
    orchestration: "wdk",
    worker_id: args.workerId,
    step_id: args.step.id,
    run_id: args.step.run_id,
    step_key: args.step.step_key,
    step_type: args.step.step_type,
    attempt: args.step.attempt,
    trace_id: input.trace_id ?? null,
    question_id: input.question_id,
  });

  const startedAt = Date.now();

  const runs = await s<RunRow[]>`
    SELECT id, folder_id, state, question_set_version, trace_id, questions_total, questions_done
    FROM runs
    WHERE id = ${args.step.run_id}
    LIMIT 1
  `;
  const run = runs[0];
  if (!run) {
    return { output: { ok: true, skipped: true, reason: "RUN_NOT_FOUND" }, metrics: { duration_ms: 0, wrote: 0 } };
  }

  if (run.state !== "running") {
    return {
      output: { ok: true, skipped: true, reason: "RUN_NOT_RUNNING", state: run.state },
      metrics: { duration_ms: 0, wrote: 0 },
    };
  }

  const { version: currentQuestionSetVersion, questionSet } = await loadQuestionSetV1();
  if (currentQuestionSetVersion !== run.question_set_version) {
    await s`
      UPDATE runs
      SET state = 'failed',
          error_json = ${s.json({
            code: "QUESTION_SET_MISMATCH",
            message: "Pinned question_set_version does not match current question set.",
          } as JsonArg)},
          updated_at = now()
      WHERE id = ${args.step.run_id}
    `;

    const durationMs = Date.now() - startedAt;
    return {
      output: { ok: false, run_id: args.step.run_id, code: "QUESTION_SET_MISMATCH", duration_ms: durationMs },
      metrics: { duration_ms: durationMs, wrote: 0 },
    };
  }

  let q: (typeof questionSet.questions)[number] | null = null;
  for (const candidate of questionSet.questions) {
    if (candidate.question_id === input.question_id) {
      q = candidate;
      break;
    }
  }

  if (!q) {
    await s`
      UPDATE runs
      SET state = 'failed',
          error_json = ${s.json({
            code: "QUESTION_NOT_FOUND",
            message: "Question not found in current question set.",
            details: { question_id: input.question_id },
          } as JsonArg)},
          updated_at = now()
      WHERE id = ${args.step.run_id}
    `;

    const durationMs = Date.now() - startedAt;
    return {
      output: { ok: false, run_id: args.step.run_id, code: "QUESTION_NOT_FOUND", duration_ms: durationMs },
      metrics: { duration_ms: durationMs, wrote: 0 },
    };
  }

  const docCounts = await s<{ n: number }[]>`
    SELECT COUNT(*)::int as n
    FROM documents
    WHERE folder_id = ${run.folder_id}
      AND upload_completed_at IS NOT NULL
      AND parse_status = 'parsed'
      AND ocr_status = 'done'
  `;
  const hasDocs = (docCounts[0]?.n ?? 0) > 0;

  const baseRow = hasDocs
    ? citationFailedRow({
        folderId: run.folder_id,
        questionSetVersion: run.question_set_version,
        questionId: q.question_id,
        question: q.question,
      })
    : missingInputRow({
        folderId: run.folder_id,
        questionSetVersion: run.question_set_version,
        questionId: q.question_id,
        question: q.question,
      });

  let rowWithPayload: typeof baseRow = baseRow;
  try {
    rowWithPayload = attachListPayloadIfNeeded(baseRow, q);
  } catch {
    rowWithPayload = citationFailedRow({
      folderId: run.folder_id,
      questionSetVersion: run.question_set_version,
      questionId: q.question_id,
      question: q.question,
    });
    rowWithPayload.provenance_json = {
      reason_code: "VALIDATION_ERROR",
      checklist: ["Question set payload metadata is invalid for this row."],
    };
  }

  const reasonCode =
    rowWithPayload.status === "citation_failed"
      ? String((rowWithPayload.provenance_json as { reason_code?: unknown }).reason_code ?? "VALIDATION_ERROR")
      : null;

  const traceId = run.trace_id ?? input.trace_id ?? newId("trc");

  async function attemptWrite(
    row: typeof rowWithPayload,
  ): Promise<{ inserted: boolean; status: QuickStartRowStatus; reason_code: string | null }> {
    const rowReasonCode =
      row.status === "citation_failed"
        ? String((row.provenance_json as { reason_code?: unknown }).reason_code ?? "VALIDATION_ERROR")
        : null;

    const inserted = await s.begin(
      async function (tx) {
        const t = tx as unknown as typeof sql;

        const payload = row.payload_json ?? null;
        const payloadJson = payload === null ? null : t.json(payload as JsonArg);

        const insertedRows = await t<{ id: string }[]>`
          INSERT INTO report_rows (
            id,
            run_id,
            folder_id,
            question_set_version,
            question_id,
            question,
            answer,
            status,
            notes,
            provenance_json,
            payload_schema_version,
            payload_json,
            created_at,
            updated_at
          )
          VALUES (
            ${newId("row")},
            ${args.step.run_id},
            ${row.folder_id},
            ${row.question_set_version},
            ${row.question_id},
            ${row.question},
            ${row.answer},
            ${row.status},
            ${row.notes},
            ${t.json(row.provenance_json)},
            ${row.payload_schema_version},
            ${payloadJson},
            now(),
            now()
          )
          ON CONFLICT (run_id, question_id) DO NOTHING
          RETURNING id
        `;

        if (!insertedRows[0]) return false;

        const reasonKey = rowReasonCode ?? "VALIDATION_ERROR";

        await t`
          UPDATE runs
          SET questions_done = LEAST(questions_total, questions_done + 1),
              failure_counts_json = CASE
                WHEN ${row.status} = 'citation_failed' THEN jsonb_set(
                  failure_counts_json,
                  ARRAY[${reasonKey}]::text[],
                  to_jsonb(COALESCE((failure_counts_json->>${reasonKey})::int, 0) + 1),
                  true
                )
                ELSE failure_counts_json
              END,
              updated_at = now()
          WHERE id = ${args.step.run_id}
        `;

        return true;
      },
    );

    return { inserted, status: row.status, reason_code: rowReasonCode };
  }

  let wrote = false;
  let rowStatus = rowWithPayload.status;
  let finalReasonCode = reasonCode;

  try {
    const res = await attemptWrite(rowWithPayload);
    wrote = res.inserted;
    rowStatus = res.status;
    finalReasonCode = res.reason_code;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("wdk.quick_start.write_row_v0.write_failed", {
      orchestration: "wdk",
      worker_id: args.workerId,
      step_id: args.step.id,
      run_id: args.step.run_id,
      step_key: args.step.step_key,
      question_id: input.question_id,
      trace_id: traceId,
      message: err instanceof Error ? err.message : String(err),
    });

    const fallback = citationFailedRow({
      folderId: run.folder_id,
      questionSetVersion: run.question_set_version,
      questionId: q.question_id,
      question: q.question,
    });
    fallback.provenance_json = {
      reason_code: "VALIDATION_ERROR",
      checklist: [
        "Retry the run (step idempotency should avoid duplicates).",
        "Inspect server logs using the run_id and trace_id for correlation.",
      ],
    };
    let fallbackWithPayload: typeof fallback = fallback;
    try {
      fallbackWithPayload = attachListPayloadIfNeeded(fallback, q);
    } catch {
      // Keep the fallback row writable even if question metadata is malformed.
    }

    const fallbackRes = await attemptWrite(fallbackWithPayload);
    wrote = fallbackRes.inserted;
    rowStatus = fallbackRes.status;
    finalReasonCode = fallbackRes.reason_code;
  }

  const completed = await s<Array<{ id: string }>>`
    UPDATE runs
    SET state = 'completed',
        updated_at = now()
    WHERE id = ${args.step.run_id}
      AND state = 'running'
      AND questions_done >= questions_total
    RETURNING id
  `;
  if (completed[0]) {
    // eslint-disable-next-line no-console
    console.info("run.completed", { run_id: args.step.run_id, trace_id: run.trace_id ?? null });
  }

  const durationMs = Date.now() - startedAt;

  // eslint-disable-next-line no-console
  console.info("wdk.quick_start.write_row_v0.completed", {
    orchestration: "wdk",
    worker_id: args.workerId,
    step_id: args.step.id,
    run_id: args.step.run_id,
    step_key: args.step.step_key,
    step_type: args.step.step_type,
    attempt: args.step.attempt,
    duration_ms: durationMs,
    trace_id: traceId,
    question_id: input.question_id,
    wrote,
    row_status: rowStatus,
    reason_code: finalReasonCode,
  });

  return {
    output: {
      ok: true,
      run_id: args.step.run_id,
      trace_id: traceId,
      question_id: input.question_id,
      wrote,
      row_status: rowStatus,
      reason_code: finalReasonCode,
      duration_ms: durationMs,
    },
    metrics: { duration_ms: durationMs, wrote: wrote ? 1 : 0 },
  };
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/db/schema/core.server.ts
```ts
import "server-only";

import type { Sql } from "../../db.server";

export async function ensureCoreSchema(sql: Sql): Promise<void> {
  // Folders (Matters)
  await sql`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('empty','ingesting','indexed','ready','failed')),
      latest_index_version TEXT NOT NULL DEFAULT 'v1',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // Documents
  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      mime TEXT NOT NULL,
      bytes BIGINT NOT NULL,
      sha256 TEXT NULL,
      storage_key TEXT UNIQUE,
      upload_completed_at TIMESTAMPTZ NULL,
      parse_status TEXT NOT NULL CHECK (parse_status IN ('queued','parsing','parsed','failed')),
      ocr_status TEXT NOT NULL CHECK (ocr_status IN ('queued','running','done','failed')),
      page_count INT NULL,
      extraction_quality REAL NULL,
      metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // Per-page OCR/layout output.
  await sql`
    CREATE TABLE IF NOT EXISTS document_pages (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      page_number INT NOT NULL,
      text TEXT NOT NULL,
      layout_json JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (document_id, page_number)
    );
  `;

  // Minimal durable job queue (replaces in-memory queues).
  await sql`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('queued','running','succeeded','failed')),
      job_key TEXT NOT NULL,
      payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      attempts INT NOT NULL DEFAULT 0,
      available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      locked_at TIMESTAMPTZ NULL,
      locked_by TEXT NULL,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (type, job_key)
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS jobs_state_available_idx
    ON jobs(state, available_at);
  `;

  // Runs (Quick Start execution attempts)
  await sql`
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('created','running','completed','partial','failed','cancelled')),
      index_version TEXT NOT NULL,
      agent_bundle_version TEXT NOT NULL,
      question_set_version TEXT NOT NULL,
      idempotency_key TEXT NULL,
      trace_id TEXT NULL,
      questions_total INT NOT NULL DEFAULT 0,
      questions_done INT NOT NULL DEFAULT 0,
      failure_counts_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (folder_id, idempotency_key)
    );
  `;

  // Durable step execution log. Steps are responsible for idempotency via step_key.
  await sql`
    CREATE TABLE IF NOT EXISTS run_steps (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
      step_type TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('queued','running','succeeded','failed')),
      -- attempt is 1-based when running; queued steps start at 0 and increment on claim.
      attempt INT NOT NULL DEFAULT 0,
      step_key TEXT NOT NULL,
      available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      locked_at TIMESTAMPTZ NULL,
      locked_by TEXT NULL,
      input_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      output_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      trace_id TEXT NULL,
      question_id TEXT NULL,
      metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (run_id, step_key)
    );
  `;

  // Enforce idempotency even if an older dev DB pre-dates the table constraint.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS run_steps_run_step_key_uidx
    ON run_steps(run_id, step_key);
  `;

  // Add WDK queue fields for existing dev DBs (CREATE TABLE IF NOT EXISTS won't backfill).
  await sql`ALTER TABLE run_steps ALTER COLUMN attempt SET DEFAULT 0;`;
  await sql`ALTER TABLE run_steps ADD COLUMN IF NOT EXISTS available_at TIMESTAMPTZ NOT NULL DEFAULT now();`;
  await sql`ALTER TABLE run_steps ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ NULL;`;
  await sql`ALTER TABLE run_steps ADD COLUMN IF NOT EXISTS locked_by TEXT NULL;`;
  await sql`ALTER TABLE run_steps ADD COLUMN IF NOT EXISTS input_json JSONB NOT NULL DEFAULT '{}'::jsonb;`;
  await sql`ALTER TABLE run_steps ADD COLUMN IF NOT EXISTS output_json JSONB NOT NULL DEFAULT '{}'::jsonb;`;

  await sql`
    CREATE INDEX IF NOT EXISTS run_steps_state_available_idx
    ON run_steps(state, available_at);
  `;

  // Report rows are the durable, per-question output of a run (terminal statuses only).
  await sql`
    CREATE TABLE IF NOT EXISTS report_rows (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      question_set_version TEXT NOT NULL,
      question_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('needs_review','reviewed','missing_input','citation_failed')),
      notes TEXT NULL,
      provenance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      payload_schema_version TEXT NULL,
      payload_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (run_id, question_id),
      CHECK (status <> 'missing_input' OR answer = 'Not found in provided documents.')
    );
  `;

  // Enforce row uniqueness even if an older dev DB pre-dates the table constraint.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS report_rows_run_question_uidx
    ON report_rows(run_id, question_id);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS report_rows_folder_run_idx
    ON report_rows(folder_id, run_id);
  `;

  // Locked citations associated to either a report row or a chat message (exactly one).
  await sql`
    CREATE TABLE IF NOT EXISTS citations (
      id TEXT PRIMARY KEY,
      report_row_id TEXT NULL REFERENCES report_rows(id) ON DELETE CASCADE,
      chat_message_id TEXT NULL,
      document_id TEXT NOT NULL,
      page_number INT NOT NULL,
      snippet TEXT NOT NULL,
      snippet_hash TEXT NOT NULL,
      polygons_json JSONB NOT NULL,
      locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT citations_assoc_oneof_chk
        CHECK ((report_row_id IS NULL) <> (chat_message_id IS NULL))
    );
  `;

  // Backfill for older dev DBs (CREATE TABLE IF NOT EXISTS won't update existing schemas).
  await sql`ALTER TABLE citations ADD COLUMN IF NOT EXISTS chat_message_id TEXT NULL;`;

  const reportRowNotNull = await sql<Array<{ attnotnull: boolean }>>`
    SELECT a.attnotnull
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'citations'
      AND n.nspname = current_schema()
      AND a.attname = 'report_row_id'
      AND a.attnum > 0
      AND NOT a.attisdropped
    LIMIT 1
  `;
  if (reportRowNotNull[0]?.attnotnull) {
    await sql`ALTER TABLE citations ALTER COLUMN report_row_id DROP NOT NULL;`;
  }

  const oneOfConstraintExists = await sql<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM pg_constraint con
      JOIN pg_class c ON c.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE con.conname = 'citations_assoc_oneof_chk'
        AND c.relname = 'citations'
        AND n.nspname = current_schema()
    ) AS exists
  `;
  if (!oneOfConstraintExists[0]?.exists) {
    await sql`
      ALTER TABLE citations
      ADD CONSTRAINT citations_assoc_oneof_chk
        CHECK ((report_row_id IS NULL) <> (chat_message_id IS NULL));
    `;
  }

  await sql`
    CREATE INDEX IF NOT EXISTS citations_report_row_idx
    ON citations(report_row_id);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS citations_chat_message_idx
    ON citations(chat_message_id)
    WHERE chat_message_id IS NOT NULL;
  `;

  // Exported artefacts (CSV, docx, etc).
  // Signed download URLs are generated at read-time and are never persisted.
  await sql`
    CREATE TABLE IF NOT EXISTS artefacts (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      kind TEXT NOT NULL,
      filename TEXT NOT NULL,
      storage_key TEXT NOT NULL UNIQUE,
      source_run_id TEXT NULL,
      metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS artefacts_folder_created_idx
    ON artefacts(folder_id, created_at);
  `;
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/questionSet.server.ts
```ts
import "server-only";

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

const QuestionSchema = z.object({
  question_id: z.string().min(1),
  group: z.string().min(1),
  question: z.string().min(1),
  response_kind: z.string().min(1),
  artefact_kind: z.string().min(1).optional(),
  payload_schema_version: z.string().min(1).optional(),
});

const QuestionSetSchema = z.object({
  question_set_id: z.string().min(1),
  question_set_version_format: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
});

type QuestionSet = z.infer<typeof QuestionSetSchema>;

type GlobalCache = typeof globalThis & {
  __orbitalQuestionSetV1?: Promise<{ questionSet: QuestionSet; version: string }>;
};

function stableStringify(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
  }
  // JSON does not support undefined/functions/symbols; treat them as null.
  return "null";
}

function sha256Hex(bytes: string): string {
  return createHash("sha256").update(bytes, "utf8").digest("hex");
}

function questionSetV1Path(): string {
  // Keep the source of truth in docs until we extract it into a dedicated package.
  // In Next dev, `process.cwd()` resolves to `apps/web`, so probe both locations.
  const rel = "docs/04-projects/02-features/0002_quick-start-engine/specs/question_set_v1.json";
  const direct = path.resolve(process.cwd(), rel);
  if (fs.existsSync(direct)) return direct;
  return path.resolve(process.cwd(), "../..", rel);
}

export async function loadQuestionSetV1(): Promise<{ questionSet: QuestionSet; version: string }> {
  const g = globalThis as GlobalCache;
  if (!g.__orbitalQuestionSetV1) {
    g.__orbitalQuestionSetV1 = (async () => {
      const filePath = questionSetV1Path();
      const rawText = fs.readFileSync(filePath, "utf8");
      const rawJson = JSON.parse(rawText) as unknown;
      const parsed = QuestionSetSchema.parse(rawJson);

      // v1 is pinned as 1.0 for the PoC; the hash guards immutability.
      const canonical = stableStringify(rawJson);
      const hex = sha256Hex(canonical);
      const version = `qs:0002:v1.0:sha256:${hex}`;

      return { questionSet: parsed, version };
    })();
  }
  return g.__orbitalQuestionSetV1;
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/40_rag_and_agents.md
```md
# RAG + agents (Quick Start)

> Note: This document describes the **target** RAG/agent pipeline. For what is implemented today, see
> `docs/03-architecture/07_current_poc_runtime.md`.

This doc describes the end-to-end "evidence-first" pipeline for Quick Start. It is intentionally implementation-oriented.

Canonical related docs:
- `docs/03-architecture/06_frameworks_agents_rag_evals.md` (WDK conventions and why)
- `docs/03-architecture/20_state_model.md` (statuses + invariants)
- `docs/03-architecture/30_data_model.md` (tables + hashing + immutability rules)
- `docs/03-architecture/60_observability_and_evals.md` (failure taxonomy + eval posture)

## Current PoC status (implemented today)
The repo does not yet implement the end-to-end retrieve/draft/lock pipeline described below.

Current behavior:
- Ingest extracts text via pdf.js (not OCR) and stores per-page text with `has_geometry=false`.
  - Code: `apps/web/lib/ingest/ingestQueue.server.ts`
- Quick Start runs are executed in-process and write placeholder terminal `report_rows` (no retrieval/draft/lock).
  - Code: `apps/web/lib/quickStartRunQueue.server.ts`
- Citations/highlights and trace export are fixture-backed for demos (seed snapshots under `tmp/fixture-seed`).
  - Code: `apps/web/lib/fixtureSeed.server.ts`, `apps/web/app/(api)/citations/[id]/route.ts`

Treat the remainder of this doc as the **target** pipeline to build towards.

## Why RAG exists here
RAG is the mechanism that makes “evidence-first” possible:
- It finds evidence in the uploaded pack.
- It turns evidence into stable references (chunk IDs).
- It enables citation locking and verification (ADR-0001/0002).

## Non-negotiable invariants (PoC defaults)
- Retrieval returns **IDs**, not prose (ADR-0004). Steps pass around `chunk_id`s and `citation_id`s, not paragraphs.
- Drafting produces structured outputs with **candidate citations as chunk IDs** (ADR-0001).
- Citations are **locked** and **immutable** once created (ADR-0001).
- Verification is **fail-closed** (ADR-0002).
- No external web research inside a run (ADR-0007).

## Ingestion (RAG substrate)
Target default: OCR everything for consistent geometry
- store per-page text + polygons (`document_pages.layout_json`)
- chunk into citable units
- index:
  - lexical (tsvector)
  - semantic (pgvector)

### Geometry maturity ladder (explicit)
Until OCR/layout geometry is implemented for real uploads, we need to be honest about what “highlight” means.

Geometry levels:
- v0: **page-level** highlight only (full-page polygon). This is the required fallback when `document_pages.layout_json.has_geometry = false`.
- v1: line-level polygons (OCR/layout provider returns per-line boxes).
- v2: word/span-level polygons (higher precision, higher complexity).

Canonical v0 fallback polygon (normalized coordinates):
```json
[[[0,0],[1,0],[1,1],[0,1]]]
```

UI rule (v0): label the highlight as “page-level” so users do not infer precision.

Implementation notes:
- OCR/layout is abstracted behind one adapter interface (ADR-0012; accepted).
- Chunking must be deterministic for a given `(document_id, index_version)`; if you change chunking logic, bump the folder `index_version`.

### Pre-geometry bridge (explicit)
Until OCR/layout geometry exists for real uploads (`has_geometry=false`), we may ship a pre-geometry retrieval substrate that chunks
`document_pages.text` directly using a deterministic char-window chunker:
- `chunker_id`: `char_window_v0`
- metadata: `page_number`, `char_start`, `char_end`

This is a deliberate v0 exception to ADR-0015's target `line_window_v1` posture. When migrating to OCR/layout lines, bump
folder `index_version` and rebuild chunks/embeddings.

## Chunking (what makes a chunk citable)
Chunking strategy is pinned in ADR-0015. Baseline requirements still apply:
- A chunk must map back to a document page range (`page_start`, `page_end`) and stable evidence geometry.
- A chunk must be retrievable by ID alone (no dependency on an LLM re-run).
- Chunk metadata must be sufficient for filtering/rerank later (doc type, section hints, etc).

PoC defaults (ADR-0015):
- Page-bounded chunks only (`page_start = page_end = page_number`).
- Chunk sizing: `max_lines = 20` OR `max_chars = 1500` (whichever comes first), with `overlap_lines = 4` (within a page only).
- Boundary rules: never split inside an OCR line; prefer splitting on blank lines; treat section headers as hard boundaries.
- Required metadata (store on the chunk row, e.g. `chunks.metadata_json`):
  - `chunker_id` (e.g. `line_window_v1`)
  - `chunk_params` (max_lines/max_chars/overlap_lines + header regex version)
  - `page_number`
  - `line_start` / `line_end` (inclusive line indices in the canonical OCR line list)
  - optional `doc_type`, `section_hint`

## Retrieval (per question)
Contract:
- Input: `{ folder_id, index_version, question_id, question_text, filters? }`
- Output: ordered list of hits `{ chunk_id, score, document_id, page_start, page_end }`

Algorithm (PoC default):
- Hybrid search (tsvector + pgvector) scoped to `index_version`.
- Apply filters (eg doc_type) if present.
- Optional rerank (but preserve the "IDs-only" contract).

Hard rules:
- Return chunk IDs, not prose.
- Include scores for observability/evals (Recall@K and debug).
- Cap K for cost and stability (eg K=10 by default; pin per fixture suite).

## Hydration (IDs -> evidence)
Retrieval produces IDs only. Hydration resolves those IDs into evidence payloads for drafting.

Contract:
- Input: `{ index_version, hits: [{chunk_id, score}] }`
- Output: `evidence: [{ chunk_id, document_id, page_start, page_end, snippet, polygons, snippet_hash? }]`

Hard rules:
- Hydration is read-only and deterministic for a given `index_version`.
- The hydrated `snippet` must come from the canonical chunk store (not an LLM).

## Drafting (from hydrated evidence only)
Contract:
- Input: `{ question_id, question_text, evidence: HydratedEvidence[] }`
- Output: structured row JSON:
  - `answer` (string or structured JSON-as-string; decide per artefact)
  - `notes` (optional)
  - `candidate_citation_chunk_ids: string[]`

Hard rules:
- The draft must be derived from the provided evidence only.
- If the evidence set cannot support an answer, the draft must output the exact string:
  `Not found in provided documents.` (and provide an actionable missing-doc checklist in notes/provenance).

## Citation locking (creates immutable citations)
Locking converts "candidate chunk IDs" into immutable citation records.

Contract:
- Input: `{ index_version, candidate_chunk_ids: string[] }`
- Output:
  - `citations[]` persisted: `{ citation_id, document_id, page_number, polygons, snippet, snippet_hash, index_version, chunk_id? }`
  - mapping `chunk_id -> citation_id` used to rewrite the report row

Hard rules:
- `snippet_hash` must follow the canonical hashing rule in `docs/03-architecture/30_data_model.md`.
- Store enough geometry to render highlights without re-running retrieval.
- Do not persist "signed URLs" or transient provider URLs; only keys and stable metadata.

Failure modes:
- `CITATION_MISMATCH`: chunk resolves to a different snippet than expected, or hash check fails.
- `RETRIEVAL_MISS`: candidate chunk IDs do not exist for this `index_version`.

## Verification (fail-closed)
PoC v1 verification is integrity-only (ADR-0017). No entailment model or runtime verifier is called.

Deterministic integrity checks (runtime):
- row JSON validates against the Zod schema (hard gate)
- every `citation_id` resolves and has polygons + snippet_hash

Output mapping (see `docs/03-architecture/20_state_model.md`):
- `needs_review`: integrity checks pass.
- `missing_input`: answer is exactly `Not found in provided documents.` and there are zero citations.
- `citation_failed`: anything else that fails (hash mismatch, missing polygons, schema fail).

Reason codes should align with the failure taxonomy in `docs/03-architecture/60_observability_and_evals.md`.

## Agent mapping (PoC implementation)
This is the "4 agents" story implemented as a constrained workflow (ADR-0005):
- Orchestrator: WDK workflow controller (`"use workflow"`)
- Retrieval agent: retrieval step(s) (`"use step"`)
- Drafting agent: drafting step (`"use step"`)
- Verification agent: lock + verify steps (`"use step"`)
- Research agent: out-of-scope (no external web; ADR-0007)

## Idempotency and determinism (step-level rules)
Because WDK can replay/retry, each step must be safely repeatable:
- Use a deterministic `step_key` stored in `run_steps` (see `docs/03-architecture/30_data_model.md`).
- Steps must not create duplicate `report_rows` or `citations`.
- Any "randomness" (sampling temperature, top_p) should be pinned/recorded in provenance.

## Open decisions to pin (candidate ADRs)
- Whether rerank is enabled by default and what model it uses.
- What the report row payload schemas are for each artefact type (CSV vs JSON vs hybrid).

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/steps/quickStartStepHandlers.server.ts
```ts
import "server-only";

import type { StepHandlerMap } from "../lib/wdk/wdkWorker.server";

import { quickStartWriteRowV0Step } from "./quickStartWriteRowV0.step.server";

export const quickStartStepHandlers: StepHandlerMap = {
  "quick_start_title_survey.write_row_v0": quickStartWriteRowV0Step,
};

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/04-refactors/0004_quick-start-to-wdk/prd.json
```json
{
  "version": 1,
  "project": "Quick Start to WDK (Workstream C)",
  "overview": "Refactor Quick Start run execution from the legacy durable jobs worker to the WDK runtime so Quick Start runs are WDK-owned, observable via run state, and no longer create execute_run job rows.",
  "goals": [
    "Move Quick Start execution to WDK with minimal product-semantic change.",
    "Preserve run-level idempotency (folder_id + idempotency_key) and step-level idempotency (deterministic step_key).",
    "Make orchestration mode explicit (WDK) via logs and durable DB state.",
    "Remove legacy execute_run job enqueue/handling for Quick Start while allowing jobs to remain temporarily for ingest."
  ],
  "nonGoals": [
    "Implement retrieval/draft/lock/verify for Quick Start.",
    "Migrate ingest to WDK in this workstream.",
    "Change question set, report row schemas, or status taxonomy.",
    "Introduce a second evidence/citations system.",
    "Implement a first-class \"worker not running\" indicator (heartbeat + UI state machine); lack of progress + logs are sufficient for this slice."
  ],
  "successMetrics": [
    "Starting Quick Start progresses under the WDK worker and reaches a terminal run state without relying on the legacy jobs worker.",
    "Starting Quick Start does not create jobs(type=execute_run) rows.",
    "Idempotency-Key behavior remains: repeated POST returns the same run for the same (folder_id, idempotency_key)."
  ],
  "openQuestions": [],
  "stack": {
    "framework": "Next.js (App Router, Node runtime)",
    "packageManager": "pnpm",
    "database": "Postgres (runtime DDL via ensureSchema)",
    "runtime": {
      "target": "WDK worker + workflows/steps",
      "legacy": "Postgres-backed jobs table + worker loop (kept temporarily for ingest)"
    }
  },
  "routes": [
    {
      "path": "/folders/:id/runs",
      "name": "Start Run",
      "purpose": "Create a Quick Start run and start WDK workflow execution"
    },
    {
      "path": "/runs/:id",
      "name": "Run JSON",
      "purpose": "Poll run state and progress"
    }
  ],
  "uiNotes": [
    "No UI change required for this slice; existing Quick Start panel continues to call POST /folders/:id/runs.",
    "If the WDK worker is not running, the run may remain running with no progress; this is acceptable for PoC but must be observable via GET /runs/:id and logs."
  ],
  "qualityGates": [
    "pnpm --filter @orbital-poc/web typecheck",
    "pnpm --filter @orbital-poc/web test",
    "pnpm --filter @orbital-poc/web lint"
  ],
  "verificationPacks": {
    "packs": [
      "pack_01_clean",
      "pack_02_missing_rea"
    ],
    "seedCommandExamples": [
      "pnpm fixture:seed pack_01_clean",
      "pnpm fixture:seed pack_01_clean pack_02_missing_rea --overwrite"
    ]
  },
  "stories": [
    {
      "id": "US-001",
      "title": "Quick Start is executed by a WDK workflow",
      "status": "done",
      "dependsOn": [],
      "description": "As a developer, I want Quick Start run execution to be orchestrated by WDK so that the repo has one durable runtime posture and Quick Start is resumable under the worker.",
      "acceptanceCriteria": [
        "Starting Quick Start schedules a WDK workflow execution with an explicit Quick Start workflow type.",
        "Example: POST /folders/:id/runs returns a run in running state and the WDK worker begins executing WDK steps for that run.",
        "Negative: If the WDK worker is not running, the run does not silently complete in-process via the legacy jobs worker.",
        "The initial WDK step implementation may be a thin integration that calls processQuickStartRun(runId).",
        "Logs clearly indicate orchestration mode (WDK) for the run and step execution."
      ],
      "startedAt": "2026-02-10T14:28:00.661741+00:00",
      "completedAt": "2026-02-10T14:58:35.771432+00:00",
      "updatedAt": "2026-02-10T14:58:35.771391+00:00"
    },
    {
      "id": "US-002",
      "title": "Run-start route uses WDK immediately (no rollout flag)",
      "status": "in_progress",
      "dependsOn": [
        "US-001"
      ],
      "description": "As a developer, I want Quick Start to switch to WDK immediately so that the system stops accumulating drift and the legacy path is removed quickly.",
      "acceptanceCriteria": [
        "POST /folders/:id/runs starts WDK workflow execution unconditionally for Quick Start.",
        "Example: With the WDK worker running, the run progresses to a terminal state.",
        "Negative: The route does not enqueue jobs(type=execute_run) and does not kick the legacy inline jobs worker.",
        "Run idempotency is preserved.",
        "Example: repeating POST /folders/:id/runs with the same Idempotency-Key returns the previously created run.",
        "Negative: duplicate runs are not created for the same (folder_id, idempotency_key)."
      ],
      "startedAt": "2026-02-10T14:58:38.041558+00:00",
      "completedAt": null,
      "updatedAt": "2026-02-10T14:58:38.041576+00:00"
    },
    {
      "id": "US-003",
      "title": "Legacy execute_run jobs path is removed (jobs remain for ingest)",
      "status": "open",
      "dependsOn": [
        "US-002"
      ],
      "description": "As a developer, I want the legacy Quick Start enqueue and worker handler removed so that Quick Start cannot accidentally execute via jobs.",
      "acceptanceCriteria": [
        "Starting Quick Start creates no new jobs(type=execute_run) rows.",
        "Example: after starting a run, there is no execute_run job row for that run.",
        "Negative: there is no remaining code path that enqueues execute_run for Quick Start.",
        "The legacy jobs worker no longer supports the execute_run job type (removed or explicitly rejected).",
        "Any remaining jobs runtime behavior is clearly marked legacy-only in code comments."
      ]
    },
    {
      "id": "US-004",
      "title": "Quick Start uses per-question WDK steps (avoid a single job-like step)",
      "status": "open",
      "dependsOn": [
        "US-003"
      ],
      "description": "As a developer, I want Quick Start to be broken into per-question durable steps so that restarts do not re-run the entire processor and progress is naturally incremental.",
      "acceptanceCriteria": [
        "The workflow schedules deterministic per-question step keys (one per question_id).",
        "Example: killing the worker mid-run and restarting continues without duplicate report_rows.",
        "Negative: already completed question writes are not re-run.",
        "GET /runs/:id progress increments as steps complete."
      ]
    }
  ],
  "functionalRequirements": [
    "Define a Quick Start workflow type in the WDK registry (e.g. quick_start_title_survey).",
    "Implement WDK step(s) for Quick Start execution (initially allowed: one step calls processQuickStartRun(runId); recommended: per-question write_row steps).",
    "Update the run-start route to create/reuse the run row (via idempotency) and start WDK workflow execution with input { run_id }.",
    "Remove execute_run job enqueue surface and worker handler.",
    "Ensure the WDK worker is the only mechanism that can advance Quick Start runs (no silent in-process completion)."
  ],
  "rollback": {
    "strategy": "Code revert (not live)",
    "notes": "If WDK is incomplete, complete Workstream B rather than silently falling back to jobs for Quick Start."
  },
  "metrics": {
    "logging": [
      "run.created includes orchestration=wdk",
      "step-level logs include run_id, step_key, step_type, state"
    ]
  },
  "sources": [
    "docs/04-projects/04-refactors/0004_quick-start-to-wdk/plan.md",
    "docs/04-projects/04-refactors/0003_wdk-runtime/plan.md",
    "apps/web/app/(api)/folders/[id]/runs/route.ts",
    "apps/web/lib/quickStartRunQueue.server.ts",
    "apps/web/lib/jobs/jobWorker.server.ts",
    "apps/web/lib/quickStartRunProcessor.server.ts"
  ]
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/07_current_poc_runtime.md
```md
# Current PoC Runtime (Implemented Today)

This document describes what is actually implemented in the repo today. It exists to prevent “docs imply WDK/OCR/RAG exists” confusion while the target architecture continues to evolve.

Target architecture docs remain in `docs/03-architecture/*` (e.g. WDK durable steps, OCR/layout geometry, retrieve/draft/lock pipeline). Treat those as **target** unless this doc says a component exists in the current PoC.

## High-level summary

Current PoC is:
- Next.js App Router (`apps/web`) using Node runtime route handlers
- Postgres via `postgres` driver with runtime DDL (`apps/web/lib/db.server.ts`)
- Local filesystem “object store” under `tmp/object-store` (`apps/web/lib/objectStore.server.ts`)
- WDK durable workflows/steps for document ingest (`runs` + `run_steps`) with a worker loop (`apps/web/lib/wdk/wdkWorker.server.ts`)
  - In dev (`pnpm dev`): ingest enqueue kicks an inline WDK worker drainer (same process)
  - Outside dev: run the worker process (`pnpm --filter @orbital-poc/web worker`)
- Postgres-backed durable jobs for Quick Start runs (`apps/web/lib/jobs/jobQueue.server.ts`) with a worker loop (`apps/web/lib/jobs/jobWorker.server.ts`)
  - Today, `pnpm --filter @orbital-poc/web worker` runs both the jobs worker and the WDK worker (until Quick Start is ported to WDK in refactor 0004).
- PDF extraction via `pdfjs-dist` text extraction (not OCR; no geometry) (`apps/web/lib/ingest/ingestProcessor.server.ts`)
- Fixture-backed “evidence” for demos (seed snapshots under `tmp/fixture-seed`) used by citations, trace export, and spike export flows (`apps/web/lib/fixtureSeed.server.ts`, `scripts/fixtures/seed.ts`)

## Current component map

```mermaid
flowchart LR
  subgraph FE["Browser UI (apps/web)"]
    UI["Matter list + detail pages
upload + run + exports"]
    PDFV["pdf.js viewer
highlight overlay (fixture citations)"]
  end

  subgraph WEB["Next.js server (apps/web)"]
    API["Route handlers
Zod boundary validation"]
    JOBS["Durable jobs table (Postgres)
(Quick Start run queue)"]
    WDKQ["WDK run_steps table (Postgres)
(ingest queue)"]
    WKR["Jobs worker
(standalone)"]
    WDKWKR["WDK worker
(dev inline + standalone)"]
  end

  subgraph DATA["Data plane"]
    PG["Postgres (runtime DDL)
folders/documents/pages/chunks/runs/rows/etc"]
    FS["Local FS object store
tmp/object-store"]
    SEED["Fixture seed snapshots
tmp/fixture-seed"]
  end

  UI --> API
  API --> PG
  API --> FS
  API --> JOBS
  JOBS --> WKR
  API --> WDKQ
  WDKQ --> WDKWKR
  WKR --> PG
  WKR --> FS
  WDKWKR --> PG
  WDKWKR --> FS
  API --> SEED
  PDFV --> API
  PDFV --> FS
```

## What “ingest” means today
- Upload writes the raw PDF to the local FS object store via signed headers.
- Ingest starts a WDK workflow (`runs.type = 'ingest_document'`) and schedules a WDK step (`run_steps.step_type = 'ingest_document.process'`).
- Ingest is processed by the WDK worker; it does not enqueue a legacy `jobs` row.
- The worker reads the PDF bytes from local FS and extracts per-page text using pdf.js.
- Extracted text is persisted to:
  - `document_pages.text` (per page)
  - `chunks.text` (currently 1 chunk per page)
- Layout/citations geometry is not produced. `document_pages.layout_json.has_geometry = false`.
- `documents.ocr_status` currently represents “extraction done” for this path; extraction method is tracked in `documents.metadata_json`.

Code:
- `apps/web/lib/ingest/ingestQueue.server.ts` (start ingest workflow)
- `apps/web/workflows/ingestDocumentWorkflow.server.ts` (workflow start + step scheduling)
- `apps/web/steps/ingestDocumentProcess.step.server.ts` (step handler)
- `apps/web/lib/ingest/ingestProcessor.server.ts` (processing logic)
- `apps/web/lib/objectStore.server.ts`

## What “Quick Start run” means today
- Runs are executed via a durable job (`type="execute_run"`) processed by the worker.
- Current run implementation writes placeholder terminal `report_rows` for each question.
- It does not do retrieval, drafting, locking citations, or verification against real data.

Code:
- `apps/web/lib/quickStartRunQueue.server.ts` (enqueue)
- `apps/web/lib/quickStartRunProcessor.server.ts` (processing)

## Evidence and citations (current state)
Evidence-first UX exists for fixture packs only:
- `GET /citations/:id` resolves citations from seed snapshots (`tmp/fixture-seed`) and returns polygons/snippets for viewer overlay.
- Trace export (`GET /runs/:id/trace`) is synthesized from seed snapshots; it does not read persisted `runs/run_steps/...` execution artifacts.
- CSV export under `/spikes/export/csv` uses seed snapshots and deterministic integrity checks; it is not the target production export pipeline.

Code:
- `apps/web/lib/fixtureSeed.server.ts`
- `apps/web/app/(api)/citations/[id]/route.ts`
- `apps/web/app/(api)/runs/[id]/trace/route.ts`
- `apps/web/app/(api)/spikes/export/csv/route.ts`
- `scripts/fixtures/seed.ts`

## Environment and gating (current)
- Object store signing:
  - Set `OBJECT_STORE_SIGNING_SECRET` for stable signed URLs.
  - Dev-only escape hatch: set `ALLOW_DEV_OBJECT_STORE_SECRET=1` to use a per-process fallback secret.
- Many API routes are dev-only today via `assertDevOnlyApi()` (returning `404` outside dev):
  - `apps/web/lib/devOnlyApi.server.ts`
- Spike routes are additionally gated by `SPIKES_ENABLED=1`:
  - `apps/web/lib/spikes.server.ts`
- Trace export is gated by `FEATURE_TRACE_EXPORT=1` and an admin token (`ORBITAL_ADMIN_TOKEN`) with an explicit dev-only bypass.

## Known drift vs target architecture
The largest gaps relative to target docs:
- WDK exists and is used for ingest, but Quick Start run execution is still jobs-based (until refactor 0004 completes).
- No OCR/layout provider and no geometry-backed citations.
- No retrieval/draft/lock pipeline; current runs write placeholder rows.
- “Evidence-first” is implemented for fixture/demo mode, not for real uploaded documents.

If you are implementing features, prefer grounding changes in code reality first (this doc), then updating the target docs as the target evolves.

## Planned closures (near-term)

This doc stays “implemented today”. For the intended sequence of upcoming refactors/features (including “WDK now”, Quick Start refactor, retrieval, and chat), see:
- `docs/04-projects/02-features/0011_chat_interface/plan.program-sequencing.md`

Key planned closures (not implemented yet, at time of writing):
- Finish retiring the durable jobs worker orchestration once Quick Start is ported to WDK (refactor 0004).
- Make citations DB-backed for real uploaded documents (with fixture fallback only where explicitly gated).
  - Ship behind `FEATURE_CITATIONS_API` (default off until RH3 evidence is recorded).
- Implement hybrid retrieval (lexical + semantic) as the retrieval substrate enabling grounded chat and evidence-first features beyond fixtures.

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md
```md
# Breadboard Pack - Quick Start Engine (Initiative 002)

This pack is the wiring diagram and parts list for Initiative 002. It is intentionally "how it works" rather than "what to build first" (PRDs come after spikes).

## Context

- Canonical strategy: `docs/00-strategy/initiatives/002-quick-start-engine.md`
- Canonical architecture:
  - `docs/03-architecture/00_overview.md`
  - `docs/03-architecture/06_frameworks_agents_rag_evals.md` (WDK conventions)
  - `docs/03-architecture/20_state_model.md` (status invariants)
  - `docs/03-architecture/30_data_model.md` (citation locking + hashing)
  - `docs/03-architecture/DECISIONS.md` (ADRs)

Dependencies:
- Initiative 001 ("trust substrate") provides viewer, citation locking, and fail-closed verification primitives. Initiative 002 consumes them.

Constraints (non-negotiable):
- No external web research inside runs.
- OCR/layout extraction is the default for all PDFs.
- Draft -> lock citations -> verify is the required trust spine.

Acceptance packs (fixtures):
- `pack_01_clean`
- `pack_02_missing_rea`
- `pack_03_mismatch_and_cert_gap`
- `pack_04_multi_parcel`
- `pack_05_partial_release`
- `pack_06_overlapping_easements`
- `pack_07_scans_rotated_low_quality`
- `pack_08_defined_terms_and_cross_refs`

## Global wiring diagram (reference)

Legend:
- Solid = triggers/writes
- Dashed = reads/observes

```mermaid
flowchart LR
  U[User] -->|Start Quick Start| UI[Quick Start UI\n(Matter workspace)]
  UI -->|POST /folders/:id/runs| API[Runs API\n(Next.js route handler)]

  API -->|start| WF[WDK workflow\nQuickStartTitleSurveyWorkflow]
  WF -->|loop question_id| RET[Step: retrieve_evidence]
  RET --> DRAFT[Step: draft_row_json]
  DRAFT --> LOCK[Step: lock_citations\n(chunk_id -> citation_id)]
  LOCK --> VERIFY[Step: verify_row\n(fail-closed)]
  VERIFY --> WRITE[Step: write_report_row]

  WRITE --> PG[(Postgres\nruns, run_steps,\nreport_rows, citations)]
  UI -. "GET /runs/:id + GET /folders/:id/report?run_id=... (poll/SSE)" .-> API
  API -. read .-> PG

  UI -->|open row drawer| CITS_API[Citations API]
  CITS_API -->|GET /citations/:id| PG
  UI --> PDFV[PDF Viewer\n(pdf.js + highlight overlay)]
```

Notes:
- Ingestion (OCR/layout, chunking, indexing) is a prerequisite substrate and is not redefined here.
- For list-shaped outputs (requirements/exceptions/issues), keep a stable report-row "shell" but attach a structured payload with a stable item-level contract (versioned). Item-level states must not reuse report-row statuses.
- Canonical API contracts live in `docs/03-architecture/50_api_surface.md` (prefer matching those endpoint shapes over inventing new ones here).

---

# Breadboard 2.1 - Question set v1 + report schema freeze

## Goal

Freeze question set v1 (<=25) and a stable row shell schema so we can build deterministic steps and evals without scope creep.

## Places and affordances

- Place: Quick Start setup
  - Affordance: see the question set version and what this run will produce
- Place: Report table
  - Affordance: stable columns (question, status, updated_at) with row drawer for details
- Place: Row drawer
  - Affordance: answer, citations, and a single "Mark as reviewed" action (user-driven transition)

## UI affordances

| # | Place | Affordance | Control | Writes | Reads |
|---|---|---|---|---|---|
| U1 | Setup | Question set version label (pinned per run) | render | - | run record + question set registry |
| U2 | Setup | "Start run" CTA | click | create run | folder state |
| U3 | Table | Row status badge | render | - | report rows |
| U4 | Drawer | Citation list + click-to-jump + failure guidance (reason code -> next action) | click/render | - | citations + row provenance |
| U5 | Drawer | Mark as reviewed | click | row status -> reviewed | row |

## Code affordances

| # | Component/service | Affordance | Control | Notes |
|---|---|---|---|---|
| N1 | Question set registry | `getQuestionSetV1()` | read | Start with `golden_questions.json` per pack, then unify. |
| N2 | Row schema validator | `validateRow(row)` | call | Hard gate: invalid schema is a run failure (not silent). |
| N3 | Row renderer | `renderRow(row)` | call | For list-shaped answers, render a table view from structured payload. |
| N4 | Status invariants | `assertRowStatus(row)` | call | Must match `docs/03-architecture/20_state_model.md`. |

## Parts list (BOM)

| Part | Name | Mechanism |
|---|---|---|
| F2.1.1 | Question set v1 | JSON list with stable `question_id`s and a version tag. |
| F2.1.2 | Stable row shell schema | `{question_id, question, answer, citation_ids[], status, notes?, payload_json?, payload_schema_version?, provenance_json}`. |
| F2.1.3 | UI table + row drawer | Fixed columns, drawer detail, mark reviewed action. |

### Row invariants (always enforce)

From `docs/03-architecture/20_state_model.md`:
- `needs_review|reviewed`: row has >= 1 locked citation.
- `missing_input`: `answer` is exactly `Not found in provided documents.` and citations are empty; `notes` (or provenance) includes an actionable missing-doc checklist.
- `citation_failed`: include a safe reason code in provenance (e.g. `CITATION_MISMATCH`, `NO_CITATIONS`).

### List payload contract v0 (for B-I/B-II/issues)

Regardless of storage location (SP-2.7), list-shaped artefacts should share a stable, versioned item contract:
- `payload_schema_version`: string (e.g. `list_payload_v0`)
- `payload_json.items[]`:
  - `item_id`: string (stable/deterministic for diffing and idempotency)
  - `citation_ids[]`: locked citation IDs for any claimed fields on the item
  - Optional item-level fields:
    - `match_status`: `matched|ambiguous|missing_doc|missing_attachment`
    - `item_classification`: `depicted|not_depicted|unknown`
    - `notes?`
Item-level states do not change the report-row status machine.

## Fit check

| Requirement | Fixture anchor | Fit |
|---|---|---|
| <=25 stable questions | `golden_questions.json` across packs | ⚠️ spike (practitioner alignment) |
| Stable status machine | `docs/03-architecture/20_state_model.md` | ✅ |
| List-shaped outputs renderable | `expected_*` CSVs in `/truth` | ⚠️ design spike (payload representation) |

Cuts / out of bounds:
- No editable question sets in v1.
- No "confidence" used as a correctness signal (only UX hint).

---

# Breadboard 2.2 - Commitment parsing (Schedule A / B-I / B-II extraction)

## Goal

Extract Schedule A facts, B-I requirements list, and B-II exceptions list for fixture packs, matching `/truth` key fields (not wording).

## Places and affordances

- Place: Run progress
  - Affordance: "Parsing commitment" step shows progress and failure reasons
- Place: Requirements tracker (rendered from row payload)
  - Affordance: list of items with `bi_item`, owner placeholder, and citations
- Place: Exceptions table (rendered from row payload)
  - Affordance: list of items with `bii_item`, instrument refs, and citations

## Code affordances

| # | Component/service | Affordance | Control | Notes |
|---|---|---|---|---|
| N1 | Doc classifier | `classifyCommitment(document)` | step | Must be auditable; unknown -> `needs_review` (not silent ignore). |
| N2 | Commitment parser | `parseCommitment(text)` | step | Output is structured and schema-validated. |
| N3 | Item normalizer | `normalizeItemFields()` | pure | Dates, instrument numbers, item numbers. |
| N4 | Citation seeding | `seedSectionCitations()` | step | Allowed only to support section existence (e.g. “Schedule B-II”), never as the sole evidence for item content. If item-local evidence can’t be locked, downgrade the item to `unknown` rather than fabricating fields. |

## Parts list (BOM)

| Part | Name | Mechanism |
|---|---|---|
| F2.2.1 | Schedule A extraction | Proposed insured, insured estate, legal desc basics (as required by question set). |
| F2.2.2 | B-I extraction | `bi_item`, requirement text, owner placeholder. |
| F2.2.3 | B-II extraction | `bii_item`, type, instrument refs (instrument_no, recorded). |
| F2.2.4 | Uncertainty surfacing | When parsing is weak: row status remains `needs_review` with reason code (no hallucinated rows). |

## Fit check

| Requirement | Packs | Fit |
|---|---|---|
| B-I key fields match truth | `pack_01_clean`, `pack_04_multi_parcel` | ⚠️ spike |
| B-II key fields match truth | `pack_01_clean`, `pack_06_overlapping_easements` | ⚠️ spike |
| Works on scan torture pack | `pack_07_scans_rotated_low_quality` | ⚠️ spike (quality gating) |

Cuts / out of bounds:
- Not solving every title company format.
- No semantic interpretation of requirement meaning.

---

# Breadboard 2.3 - Exception instruments matching + per-instrument summary extraction

## Goal

Link exceptions to the correct instrument PDFs, extract short summaries + risk tags with citations, and surface ambiguity or missing docs explicitly.

## Places and affordances

- Place: Exceptions table row
  - Affordance: matched doc name + match state badge (`matched`, `ambiguous`, `missing_doc`)
- Place: Exception detail drawer
  - Affordance: summary, risk tags, citations, and candidate docs when ambiguous (resolution is out of scope for v1)

## Code affordances

| # | Component/service | Affordance | Control | Notes |
|---|---|---|---|---|
| N1 | Instrument matcher | `matchExceptionToDoc(exception, docs)` | step | Uses deterministic heuristics; never auto-picks when confidence is low. |
| N2 | Reference follower | `followReference(refString)` | step | For `pack_08_defined_terms_and_cross_refs` style exhibit chase. |
| N3 | Summary extractor | `summarizeInstrument(doc)` | step | Structured JSON output; citations must be lockable. |
| N4 | Missing attachment detector | `detectMissingAttachment(doc)` | step | For instruments referencing exhibits not present. |

## Parts list (BOM)

| Part | Name | Mechanism |
|---|---|---|
| F2.3.1 | Matching heuristics | instrument number, book/page, filename, and "defined terms" reference chain (bounded). |
| F2.3.2 | Ambiguity UI | Show candidates + guidance (no user selection in v1; keep row `needs_review`). |
| F2.3.3 | Missing-doc journey | If instrument doc absent (e.g. `pack_02_missing_rea`): item is `missing_doc` and row includes a missing-doc checklist. |
| F2.3.4 | Missing-attachment flag | If exhibit referenced but not provided: flag `missing_attachment` and keep going. |

## Fit check

| Requirement | Packs | Fit |
|---|---|---|
| Correct matches on happy path | `pack_01_clean` | ⚠️ spike |
| Disambiguation for overlaps | `pack_06_overlapping_easements` | ⚠️ spike |
| Missing exception doc handled | `pack_02_missing_rea` | ✅ (fixture exists) |
| Exhibit chase bounded | `pack_08_defined_terms_and_cross_refs` | ⚠️ spike |

Cuts / out of bounds:
- No deep semantic "scope" interpretation.
- No materiality scoring.

---

# Breadboard 2.4 - Survey parsing (certification + key callouts) with citations

## Goal

Extract survey certification parties and at least a baseline set of text callouts (encroachments/easements/access) with citations.

## Places and affordances

- Place: Survey extract row
  - Affordance: certification parties + callouts list
- Place: Quality indicator
  - Affordance: extraction quality badge and "needs manual review" when OCR is weak

## Code affordances

| # | Component/service | Affordance | Control | Notes |
|---|---|---|---|---|
| N1 | Survey classifier | `classifySurvey(document)` | step | Must tolerate scan-only PDFs. |
| N2 | Survey parser | `parseSurvey(layout)` | step | Focus on text callouts first; graphics are out of scope. |
| N3 | Quality scorer | `scoreSurveyExtraction()` | pure | Drives `needs_review` and UX copy. |

## Fit check

| Requirement | Packs | Fit |
|---|---|---|
| Certification extracted | `pack_01_clean` | ⚠️ spike |
| Cert gap flagged | `pack_03_mismatch_and_cert_gap` | ⚠️ spike |
| Works on scan torture pack | `pack_07_scans_rotated_low_quality` | ⚠️ spike |

Cuts / out of bounds:
- No property visualizer.
- No attempt to infer geometry-only labels without text support.

---

# Breadboard 2.5 - Title <-> survey reconciliation (honest issues list)

## Goal

Cross-check exception items against survey evidence and produce a reconciliation issues list that prefers "unknown/needs_review" over incorrect "not depicted".

Important alignment:
- The state machine for report rows remains `needs_review|reviewed|missing_input|citation_failed`.
- "depicted/not depicted/unknown" is an item-level classification inside the issues payload, not a new report-row status.

## Places and affordances

- Place: Issues list table (rendered from row payload)
  - Affordance: filters by classification and shows dual citations (instrument + survey)
- Place: Issue detail drawer
  - Affordance: guidance copy for "unknown" and what evidence is missing

## Code affordances

| # | Component/service | Affordance | Control | Notes |
|---|---|---|---|---|
| N1 | Reconciliation rules | `classifyIssue(exception, survey)` | pure | Deterministic rules first; model only as fallback with strict schema. |
| N2 | Evidence thresholding | `evidenceStrength()` | pure | When below threshold -> classify `unknown` and keep row `needs_review`. |
| N3 | Guidance generator | `buildGuidance()` | pure | "What to do next" copy for the drawer. |

## Fit check

| Requirement | Packs | Fit |
|---|---|---|
| Basic issues exist | `pack_01_clean` | ⚠️ spike |
| Mismatch/cert gap triggers issues | `pack_03_mismatch_and_cert_gap` | ⚠️ spike |
| Unknown bias works | `pack_07_scans_rotated_low_quality` | ⚠️ spike |

Cuts / out of bounds:
- No geometry overlays.
- No semantic interpretation of easement scope.

---

# Breadboard 2.6 - Run orchestration + incremental report population (WDK)

## Goal

Implement a WDK workflow that executes deterministic-ish steps per `question_id` and writes terminal report rows incrementally with progress events.

## Places and affordances

- Place: Run progress view
  - Affordance: step indicator and safe restart
- Place: Report table
  - Affordance: rows appear progressively during run

## Code affordances

| # | Component/service | Affordance | Control | Notes |
|---|---|---|---|---|
| N1 | Runs API | `POST /folders/:id/runs` | handler | Pins `index_version` + `agent_bundle_version` + `question_set_version`. Support `Idempotency-Key` and record `trace_id` for correlation (see `docs/03-architecture/50_api_surface.md`, `docs/03-architecture/60_observability_and_evals.md`). |
| N2 | Workflow controller | QuickStart workflow | workflow | Must start with `"use workflow"` and contain no side effects. |
| N3 | Steps | retrieve/draft/lock/verify/write | step | Must start with `"use step"`; steps own idempotency via a deterministic `step_key` stored in `run_steps`. |
| N4 | Row upsert invariant | unique `(run_id, question_id)` | DB constraint | Prevents duplicates on restart. |
| N5 | Status + export gating | fail-closed | policy | `citation_failed` rows are non-exportable by default. |

## Fit check

| Requirement | Packs | Fit |
|---|---|---|
| Rows stream in during run | `pack_01_clean` | ✅ |
| Missing-doc run fails safely | `pack_02_missing_rea` | ✅ |
| Restart is idempotent | any | ⚠️ spike |

Cuts / out of bounds:
- No free-running agent loops.
- No freeform chat.

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/02-features/0002_quick-start-engine/prd.md
```md
# PRD (Consolidated): 0002 Quick Start Engine (Quick Start: Title + Survey)

Owner:
Status: Draft (NO-GO until key spikes close)
Date: 2026-02-08
Slug: 0002-quick-start-engine

This doc consolidates the initiative spine (`prd-overall.md`) plus all slice PRDs under `prds/` into one place so a single Ralph loop can reference one canonical PRD. Slice PRDs remain the thin executable units and are still the most precise “what to build” references.

## Summary

Implement the deterministic-ish “Quick Start: Title + Survey” run that turns a fixture pack into three evidence-backed artefacts:
1. Schedule B-I requirements tracker
2. Schedule B-II exceptions table (linked to instruments)
3. Survey reconciliation issues list (title ↔ survey)

## Non-Negotiable Constraints (From Architecture)

From `docs/03-architecture/*` and `docs/03-architecture/DECISIONS.md`:
- Evidence-first (ADR-0001): drafting uses candidate `chunk_id`s; rows refer to locked `citation_id`s only.
- Verification is fail-closed (ADR-0002): integrity/invariant failures → `citation_failed`; blocked from export by default. (ADR-0017: v1 is integrity-only.)
- OCR/layout extraction is default for all PDFs (ADR-0003) for geometry highlights.
- Retrieval returns IDs (ADR-0004): chunk IDs + scores; provenance stores IDs, not prose.
- Orchestration via WDK (ADR-0005): `"use workflow"` controller; `"use step"` side effects; step idempotency via deterministic `step_key`.
- Fixtures + evals are first-class (ADR-0006): success is measurable vs `/truth`.
- No external web research inside runs (ADR-0007).
- APIs use a safe error envelope with `trace_id` (ADR-0008); never leak internal errors/provider payloads.

## Dependencies

- Initiative 0001 “trust substrate” must exist for:
  - citation locking + immutable citations
  - click-to-jump PDF viewer highlights
  - report-row status invariants and export gating UX

## Acceptance Anchors (Fixtures)

Canonical pack list: `docs/08-example-data/packs_summary.md`.

Primary near-term anchors for this initiative:
- `pack_01_clean`
- `pack_02_missing_rea`
- `pack_03_mismatch_and_cert_gap`
- `pack_07_scans_rotated_low_quality`

## Global Non-Goals (Do Not Re-Introduce In Slices)

These were previously spread across slices; they are single-sourced here to avoid drift.

- Any external web research inside runs (ADR-0007).
- Any approach that weakens fail-closed verification or evidence-first contracts.
- Freeform chat / open-ended “research agent” browsing.
- Legal advice, negotiation posture, or materiality decisions.
- Universal coverage of all title company formats or survey styles (fixture-first scope).
- Geometry overlays for easements (link to evidence; do not render corridors).
- Human-in-the-loop ambiguity resolution / selection persistence (v1 shows candidates only; no “choose correct doc” flow).
- Any prose-parsing fallback when structured payload is missing/invalid for list-shaped artefacts (fail safely; stay honest).

## Dependency Map (Slices)

```mermaid
graph TD
  S1[0002a Run skeleton]
  S2[0002b Row payload contract + rendering]
  S3[0002c Commitment parsing (pack_01_clean)]
  S4[0002d Exception -> instrument matching (pack_01_clean + pack_02_missing_rea)]
  S5[0002e Survey extraction (pack_01_clean + pack_03)]
  S6[0002f Reconciliation honesty (pack_03 + pack_07)]

  S1 --> S2
  S2 --> S3
  S3 --> S4
  S2 --> S5
  S4 --> S6
  S5 --> S6
```

## Spike Gates (Implementation Is NO-GO Until Closed)

These gates come from `brief.md`, `risk-register.md`, and `spike-investigation.md`.

Contracts frozen:
- SP-2.1 question set v1 (<=25) + practitioner review: `docs/04-projects/02-features/0002_quick-start-engine/specs/question_set_v1.json`
- SP-2.7 payload storage decision (Option 4) + schema doc: `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md`
- Comparator spec v0 is canonical and referenced everywhere: `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`

Fixture-verifiable spikes passed (proof artefacts committed under `spike-proofs/`):
- SP-2.8 Retrieval Recall@K baseline on `pack_01_clean`
- SP-2.2A Commitment parsing baseline on `pack_01_clean` (truth comparators)
- SP-2.3A Exception matching baseline + missing-doc journey on `pack_02_missing_rea`
- SP-2.4A Survey extraction baseline + cert gap issue code on `pack_03_mismatch_and_cert_gap`
- SP-2.5 Reconciliation honesty policy proven on `pack_03` + `pack_07`
- SP-2.6 Idempotency + snippet_hash stability; run continues and can still reach `completed` with a `citation_failed` row
- SP-2.11 List verification semantics pinned (policy doc) consistent with fail-closed + immutable citations

Explicit cut (must remain cut in v1):
- RH-2.16 human-in-loop ambiguity resolution is cut (v1). See `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/RH-2.16_cut_note.md`

---

# Consolidated Slice Details

The sections below are the slice PRDs reassembled into a single doc. Where the same concept repeats across slices (architecture constraints, “no web research”, evidence-first), it is intentionally single-sourced above.

## Slice 0002a: Run Skeleton + Version Pinning + Incremental Progress

Source: `docs/04-projects/02-features/0002_quick-start-engine/prds/0002a_run-skeleton/prd.md`

### Introduction / Overview

#### Problem
We need a durable, resumable, observable Quick Start run surface (API + workflow + UI) before we can safely iterate on parsing/matching/extraction logic.

#### Goal
Ship the canonical run API + WDK workflow skeleton that:
- pins versions (`index_version`, `agent_bundle_version`, `question_set_version`)
- writes rows incrementally with correct terminal statuses and invariants
- is fully debuggable (`trace_id`, `step_key`, reason codes)

#### Slice
Implement the run skeleton only:
- Question set v1 is loaded and pinned per run.
- Workflow executes the step machine (`retrieve -> draft -> lock -> verify -> write`) but may return placeholder `missing_input` rows until parsing/matching slices ship.

#### Primary Observable Effect
On a Matter built from a fixture pack, a user can click "Quick Start: Title + Survey" and see:
- a running progress indicator (questions_total/questions_done)
- rows appearing in the report table as each question completes
- stable, terminal statuses per row

#### In Scope
- API endpoints (canonical): `POST /folders/:id/runs`, `GET /runs/:id`, `GET /folders/:id/report?run_id=...`
- Error envelope + `trace_id` on non-2xx (ADR-0008)
- Run + step correlation: `{trace_id, run_id, step_key, question_id}` (observability doc)
- WDK workflow/step boundaries (`"use workflow"`, `"use step"`) and deterministic step idempotency via `step_key`
- Unique `(run_id, question_id)` enforcement (no duplicate rows on retries)

### Goals

- A run can start, progress, and complete deterministically on fixture Matters without producing duplicate rows.
- Every produced row obeys `docs/03-architecture/20_state_model.md` invariants.
- Debugging is possible from persisted state and logs (no “black box” runs).

### User Stories

#### US-001: Start Quick Start run and observe progress
As a user, I can start a Quick Start run and watch progress so I know it’s working and can inspect partial results.

Acceptance criteria:
- `POST /folders/:id/runs` only allows start when `folders.state in {indexed, ready}`; otherwise returns `409` with `error.code="CONFLICT"` and the standard error envelope including `trace_id`.
- The created run pins `index_version`, `agent_bundle_version`, and `question_set_version` and returns them in the response.
- `GET /runs/:id` returns progress counts and failure taxonomy counts (shape per `docs/03-architecture/50_api_surface.md`).

Verification:
- Packs: `docs/08-example-data/pack_01_clean`, `docs/08-example-data/pack_02_missing_rea`
- Manual: start run from UI; observe progress updates; refresh mid-run and confirm state is consistent.

#### US-002: Rows appear incrementally and always obey invariants
As a user, I can see rows appear in the report table as they finish, and every row is in a terminal status with correct evidence behavior.

Acceptance criteria:
- `GET /folders/:id/report?run_id=...` returns rows for the selected run; UI never reads Postgres directly.
- `completed` runs have exactly one row per `question_id` for the run’s `question_set_version`.
- If a row is `missing_input`, `answer` is exactly `Not found in provided documents.`, citations are empty, and `notes` (or provenance) includes an actionable checklist.
- If a row is `citation_failed`, provenance includes a safe taxonomy reason code (e.g. `CITATION_MISMATCH`, `NO_CITATIONS`).
- Row-level failures do not crash the run: if a question yields `citation_failed`, the workflow continues and the run can still reach `completed` after writing terminal rows for all questions (exports remain blocked by default).

Verification:
- Packs: `pack_01_clean`, `pack_02_missing_rea`
- Automated: DB constraint for unique `(run_id, question_id)`; row invariant audit helper (if present).

### Functional Requirements

- API layer validates external inputs with Zod and returns the safe error envelope (ADR-0008).
- `POST /folders/:id/runs` supports `Idempotency-Key` (for safe retries).
- Workflow controller contains no side effects; all side effects occur in steps.
- Steps record a deterministic `step_key` in `run_steps` and short-circuit repeats.
- Workflow and steps use the WDK directive string literal as the first statement (`"use workflow"`, `"use step"`).
- Logs/events are correlate-able with `{trace_id, run_id, step_key, question_id}` and avoid raw PDF/text logging (logging safety rules).

### Non-Goals (Slice-Specific)

- Correct parsing/matching/extraction outputs (handled in later slices).

### Failure States & UX

- Folder not runnable (`empty|ingesting|failed`): disable CTA + show safe error reason (no stack traces).
- Run step failure: run becomes `partial` with a visible failure banner; completed rows remain inspectable.
- Row failure: write a terminal `citation_failed` row with reason code and guidance, then continue to the next question; run may still reach `completed`.

### Metrics / Logging

- `run_duration_ms` (p50/p95), retries per step, counts by row status, counts by failure taxonomy code.

### Rollback / Disable Plan

- Feature flag: `quick_start_enabled` (default off until slice 2+ ship).

### Slice Sources

- `docs/03-architecture/50_api_surface.md` (canonical endpoints + error envelope)
- `docs/03-architecture/06_frameworks_agents_rag_evals.md` (WDK conventions)
- `docs/03-architecture/20_state_model.md` (row/run invariants)
- `docs/03-architecture/60_observability_and_evals.md` (taxonomy + correlation)
- `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md`

## Slice 0002b: Row Payload Contract + Artefact Table Rendering

Source: `docs/04-projects/02-features/0002_quick-start-engine/prds/0002b_row-payload-contract/prd.md`

### Introduction / Overview

#### Problem
The Quick Start UX is “artefacts-first”, but the canonical report row model is a flat `{answer, citation_ids[], status}` shell. Without a stable, versioned structured payload contract, we can’t:
- render B-I/B-II/issues as tables deterministically
- diff outputs for evals
- keep item-level evidence honest without inventing new row statuses

#### Goal
Introduce a versioned, list-shaped payload contract for artefact rows and make it renderable in the UI from locked citations only.

#### Slice
Ship the payload contract + storage + API exposure + UI rendering for list-shaped artefacts.

#### Primary Observable Effect
In the report table, list-shaped artefact rows render as tables backed by structured `payload_json` (not prose parsing), with item-level citations that jump-to-evidence.

#### In Scope
- A single, stable “list payload v0” schema with:
  - stable `item_id`
  - item-level `citation_ids[]`
  - optional item-level states (`match_status`, `item_classification`) that do not change report-row statuses
  - canonical schema doc: `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md`
- Storage + versioning for structured payload (see decision below)
- API returns payload + schema version alongside the existing row shell
- UI renders artefact tables from payload (table view + row drawer)

### Decision (Pinned by SP-2.7)

Implement Option 4:
- Add `report_rows.payload_json` (JSONB) and `report_rows.payload_schema_version` (string)
- Keep `report_rows.answer` as a human-readable summary string
- Keep `report_rows.provenance_json` as debug-only (do not rely on it as a product contract)

### Goals

- List-shaped artefacts can be rendered deterministically from structured payload (no prose parsing).
- Payload is stable and versioned for eval comparators and UI.
- Item-level evidence is honest: unsupported fields/items are downgraded (no fabrication).

### User Stories

#### US-001: Artefact rows have a versioned list payload
As a user, I want B-I/B-II/issues to be structured so that the UI can render them as tables and evals can compare them reliably.

Acceptance criteria:
- Artefact rows include `payload_schema_version = "list_payload_v0"` and `payload_json.items[]`.
- Each item has a stable `item_id` and item-level `citation_ids[]` for any claimed fields.
- Item-level states do not invent new report-row statuses.

Verification:
- Packs: `pack_01_clean` (seeded payload acceptable for this slice)
- Automated: Zod schema validation for payload_json; JSON round-trip stability.

#### US-002: UI renders artefact tables from payload and locked citations
As a user, I can view B-I/B-II/issues as tables, open a row drawer, and click citations to jump to evidence.

Acceptance criteria:
- UI renders artefact rows from `payload_json` only (no parsing `answer` prose).
- Clicking an item’s citation chip uses locked citations (`GET /citations/:id`) and highlights evidence in the viewer (dependency: Initiative 0001).
- If payload is missing or invalid, UI shows a safe error state (no internal leak) and the row remains inspectable.

Verification:
- Manual: seeded fixture run shows tables render; citations click-to-highlight.

### Functional Requirements

- Payload schemas live in `packages/core/schemas` (Zod) and are validated at the step boundary (see `docs/03-architecture/06_frameworks_agents_rag_evals.md`).
- Add DB columns `report_rows.payload_json` (JSONB) and `report_rows.payload_schema_version` (string).
- `GET /folders/:id/report?run_id=...` includes payload fields (nullable) in each row response, without breaking existing clients.
- Item-level citations are locked `citation_id`s only; no chunk IDs are exposed to the UI (ADR-0001).
- Error handling uses the standard error envelope with `trace_id` (ADR-0008).

### Non-Goals (Slice-Specific)

- Defining the final set of fields for each artefact (owned by later parsing/matching/survey slices and truth comparators).
- Any human-in-the-loop editing or mutation of row content.

### Failure States & UX

- Invalid payload schema: show “row payload invalid” banner with safe `error.code=INTERNAL` and `trace_id`.
- Missing payload for an artefact row: show “payload not available yet” guidance; do not attempt prose parsing.

### Metrics / Logging

- Count of payload schema validation failures (hard gate in evals).
- UI render failures by payload_schema_version (should be 0 for v0).

### Rollback / Disable Plan

- Feature flag: `artefact_table_rendering_enabled` (default off until seeded payload renders correctly).

### Slice Sources

- SP-2.7: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- State invariants: `docs/03-architecture/20_state_model.md`
- API contract: `docs/03-architecture/50_api_surface.md`
- Evidence-first ADRs: `docs/03-architecture/DECISIONS.md` (ADR-0001, ADR-0002)

## Slice 0002c: Commitment Parsing Baseline (pack_01_clean)

Source: `docs/04-projects/02-features/0002_quick-start-engine/prds/0002c_commitment-parsing-pack-01-clean/prd.md`

### Introduction / Overview

#### Problem
We need deterministic, fixture-verifiable extraction of commitment structure (B-I requirements + B-II exceptions) before we can claim the Quick Start artefacts are real.

#### Goal
For `pack_01_clean`, produce B-I + B-II structured payloads that match `/truth` key fields with locked citations and fail-closed verification.

#### Slice
Implement commitment parsing for the clean pack only:
- Identify the commitment doc(s)
- Extract B-I and B-II items into the list payload contract
- Attach lockable citations per item and verify fail-closed

#### Primary Observable Effect
On `pack_01_clean`, the report table shows:
- a B-I requirements tracker artefact row with items matching truth key fields
- a B-II exceptions table artefact row with items matching truth key fields
Both rows are `needs_review` with lockable citations; no extra hallucinated items.

#### In Scope
- `pack_01_clean` only
- Output comparison vs:
  - `truth/expected_requirements_tracker.csv`
  - `truth/expected_exceptions_table.csv`
- Item normalisation rules for item numbering and instrument reference canonical form (when present in truth)

### Goals

- 0 false positives: never emit an item that is not present in truth by item number.
- Evidence-backed items: claimed fields have lockable citations; verification passes.
- Comparator-driven proof: diffs vs truth are computed, not eyeballed.

### User Stories

#### US-001: Extract B-I requirements tracker (clean pack)
As a user, I can see a B-I requirements tracker table derived from the commitment and backed by evidence.

Acceptance criteria:
- For `pack_01_clean`, extracted requirements item count equals truth item count.
- Every extracted item has the correct truth item number and required key fields as defined by the comparator.
- Precision rule: no extra items not present in truth by item number.
- Each extracted item has item-level `citation_ids[]` that lock and verify (no header-only evidence for item content).

Verification:
- Pack: `docs/08-example-data/pack_01_clean`
- Automated: comparator diffs vs `truth/expected_requirements_tracker.csv` (rules single-sourced in `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`); row invariant audit; citation integrity checks.

#### US-002: Extract B-II exceptions table (clean pack)
As a user, I can see a B-II exceptions table derived from the commitment and backed by evidence.

Acceptance criteria:
- For `pack_01_clean`, extracted exceptions item count equals truth item count.
- Every extracted exception has the correct item number and required key fields as defined by the comparator.
- Instrument references are normalised to a single canonical form (declared once and reused everywhere).
- Each extracted exception item has item-level `citation_ids[]` that lock and verify.

Verification:
- Pack: `pack_01_clean`
- Automated: comparator diffs vs `truth/expected_exceptions_table.csv` (rules single-sourced in `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`); citation integrity checks.

### Functional Requirements

- Retrieval returns chunk IDs + scores (ADR-0004) and stores retrieved IDs/scores in row provenance (debug-only).
- Drafting output includes candidate citations as chunk IDs (ADR-0001), which are then locked into immutable citations before verification.
- Verification is fail-closed (ADR-0002). Any mismatch yields `citation_failed` with taxonomy reason code.
- Step boundaries follow WDK conventions (`"use workflow"`, `"use step"`), and step inputs/outputs are JSON-serialisable and Zod-validated.
- The list payload contract from slice 0002b is used (`payload_schema_version=list_payload_v0`, stable `item_id`).
- Any model calls (draft/verify/embed) go through AI SDK per the repo’s provider posture; do not call provider SDKs directly without an explicit reason.

### Non-Goals (Slice-Specific)

- Scan torture behavior (`pack_07_scans_rotated_low_quality`).
- Multi-parcel scoping (`pack_04_multi_parcel`).
- Exception → instrument PDF matching (slice 0002d).

### Failure States & UX

- If evidence cannot be locked for an item field, downgrade that field/item to `unknown` rather than fabricating it; keep row `needs_review`.
- If verification fails for the row, row becomes `citation_failed` with reason code and guidance.

### Metrics / Logging

- Comparator pass rate for B-I and B-II on pack_01_clean.
- Failure taxonomy counts (`RETRIEVAL_MISS`, `NO_CITATIONS`, `CITATION_MISMATCH`).

### Rollback / Disable Plan

- Feature flag: `quick_start_commitment_parsing_enabled` (default off until pack_01_clean passes).

### Slice Sources

- `docs/03-architecture/40_rag_and_agents.md`, `docs/03-architecture/20_state_model.md`, `docs/03-architecture/60_observability_and_evals.md`
- SP-2.2A: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- Comparator spec: `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`

## Slice 0002d: Exception -> Instrument Matching (pack_01_clean + pack_02_missing_rea)

Source: `docs/04-projects/02-features/0002_quick-start-engine/prds/0002d_exception-matching-pack-01-02/prd.md`

### Introduction / Overview

#### Problem
Even if we extract a correct B-II exceptions list, it’s not useful unless each exception can be linked to the correct instrument PDF (or explicitly marked missing/ambiguous) without silent false matches.

#### Goal
For `pack_01_clean` and `pack_02_missing_rea`, deterministically match exceptions to instrument docs and surface missing/ambiguous states explicitly, backed by locked citations.

#### Slice
Implement matching baseline + missing-doc journey:
- Deterministic matching rules (instrument number, book/page, filename hints)
- Item-level `match_status` with candidates (no silent auto-pick)
- Missing-doc checklist behavior for `pack_02_missing_rea`

#### Primary Observable Effect
In the B-II exceptions table:
- Each exception item shows a match badge (`matched|ambiguous|missing_doc`) and matched doc name (or candidates list)
- Missing docs show an actionable checklist

#### In Scope
- Packs: `pack_01_clean`, `pack_02_missing_rea`
- Item-level match states: `matched|ambiguous|missing_doc`
- Candidate display (no selection/persistence in v1)

### Goals

- No silent false matches: ambiguous cases are surfaced, not auto-picked.
- Missing-doc journey is explicit and actionable.
- Matching evidence is inspectable (citations point to the reference fields used for matching).

### User Stories

#### US-001: Match exceptions to instrument PDFs (clean pack)
As a user, I can click an exception item and see which instrument it matched to, with evidence.

Acceptance criteria:
- For `pack_01_clean`, exception items with truth-linked instruments resolve to `match_status=matched`.
- Each matched item includes citations that support the match (e.g. instrument no / recording reference).
- No silent auto-pick: if >1 candidate matches, the item is `match_status=ambiguous` with candidates listed.

Verification:
- Pack: `docs/08-example-data/pack_01_clean`
- Automated: spot-check candidate lists vs expected; ensure no items are marked matched when multiple candidates exist.

#### US-002: Surface missing-doc journey (pack_02_missing_rea)
As a user, I see missing instrument docs called out explicitly with a checklist so I can fix the pack.

Acceptance criteria:
- For `pack_02_missing_rea`, exceptions referencing the missing REA are `match_status=missing_doc`.
- Row notes include an actionable checklist, including the expected filename when known (e.g. `REA.pdf`).
- Row status uses `missing_input` only when an answer truly cannot be supported; otherwise row remains `needs_review` with item-level missing states.

Verification:
- Pack: `docs/08-example-data/pack_02_missing_rea`
- Manual: verify checklist copy is actionable and specific (no generic “upload doc” only).

### Functional Requirements

- Matching runs as a workflow step (`"use step"`) and is idempotent via deterministic `step_key`.
- Item-level match state is stored in the list payload (not as a report-row status).
- Evidence-first: matching references are backed by locked citations; if citations can’t be locked, downgrade to `ambiguous` or `missing_doc` (no fabricated match).
- Errors use the standard error envelope with `trace_id` (ADR-0008) and avoid leaking provider payloads.
- Reason codes align with the failure taxonomy when matching fails in a row-blocking way (e.g. `RETRIEVAL_MISS`).

### Non-Goals (Slice-Specific)

- Missing attachment detection (`pack_06_overlapping_easements`) and exhibit chase (`pack_08_defined_terms_and_cross_refs`) (handled in later slices/spikes).
- Human-in-the-loop “choose correct doc” persistence (v1 cut; must re-verify and must not mutate immutable citations if added later).

### Failure States & UX

- Ambiguous match: show candidates + guidance; keep row `needs_review`.
- Missing doc: show checklist; keep row inspectable; allow upload + re-run.

### Rollback / Disable Plan

- Feature flag: `exception_matching_enabled` (default off until `pack_01_clean` and `pack_02_missing_rea` pass).

### Slice Sources

- SP-2.3A: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- `docs/03-architecture/20_state_model.md`
- `docs/03-architecture/40_rag_and_agents.md`

## Slice 0002e: Survey Extraction Baseline + Cert Gap (pack_01_clean + pack_03)

Source: `docs/04-projects/02-features/0002_quick-start-engine/prds/0002e_survey-extraction-pack-01-03/prd.md`

### Introduction / Overview

#### Problem
Survey reconciliation is only as honest as the underlying survey extraction. If we can’t reliably extract certification parties and baseline text callouts with evidence, reconciliation will drift into hallucinations.

#### Goal
For `pack_01_clean` and `pack_03_mismatch_and_cert_gap`, extract:
- certification parties (including lender presence/absence where truth supports it)
- baseline text callouts (where truth supports them)
with locked citations and fail-closed verification.

#### Slice
Implement survey extraction baseline:
- Survey doc classification/routing
- Structured output for certification + callouts in list payload
- `CERT_MISSING_LENDER` (or equivalent) issue code for cert gap pack

#### Primary Observable Effect
In the survey artefact row drawer:
- certification section shows extracted parties with citations
- issues include a cert gap issue code for `pack_03_mismatch_and_cert_gap` with evidence

#### In Scope
- Packs: `pack_01_clean`, `pack_03_mismatch_and_cert_gap`
- Outputs compared to `truth/expected_survey_issues.csv` where applicable (key fields, not wording)
- Comparator rules are single-sourced in `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`

### Goals

- No invented callouts: if evidence can’t be locked, downgrade or fail safely.
- Cert gap is explicit and machine-readable (issue code), not just prose.
- Outputs are fixture-verifiable and support later reconciliation safely.

### User Stories

#### US-001: Extract certification parties with citations
As a user, I can see certification parties (where present) backed by evidence so I can trust the survey extraction.

Acceptance criteria:
- For `pack_01_clean`, certification parties extracted match truth key fields where truth supports them.
- Each extracted party field has lockable citations; row is `needs_review` when verification passes.

Verification:
- Pack: `pack_01_clean`
- Automated: comparator against truth key fields; citation integrity checks.

#### US-002: Flag certification gap as structured issue code
As a user, I see a structured cert gap issue (missing lender) backed by evidence, not a vague note.

Acceptance criteria:
- For `pack_03_mismatch_and_cert_gap`, missing lender certification is surfaced as a structured issue code (e.g. `CERT_MISSING_LENDER`) with citation to the certification block.
- No fabricated lender name is emitted when lender is missing; field is absent/unknown.

Verification:
- Pack: `pack_03_mismatch_and_cert_gap`
- Manual: open row drawer and confirm issue code + evidence jump.

### Functional Requirements

- Survey extraction runs in steps (`"use step"`) and records deterministic `step_key` and provenance (retrieved chunk IDs + scores) safely.
- Candidate citations are chunk IDs; citations are locked and immutable before verification (ADR-0001).
- Verification is fail-closed (ADR-0002) and uses taxonomy reason codes from `docs/03-architecture/60_observability_and_evals.md`.
- Model calls go through the repo’s AI gateway posture; do not leak provider payloads to clients/logs.
- On low-quality behavior where no citations can be locked, row must fall back safely to `missing_input` with remediation checklist (no invented callouts).

### Non-Goals (Slice-Specific)

- Scan torture survey behavior (`pack_07_scans_rotated_low_quality`) beyond the safe fallback policy (handled in follow-up slice/spike).
- Geometry-only callouts without text support.

### Rollback / Disable Plan

- Feature flag: `survey_extraction_enabled` (default off until `pack_01_clean` and `pack_03_mismatch_and_cert_gap` pass).

### Slice Sources

- SP-2.4A: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- `docs/03-architecture/40_rag_and_agents.md`, `docs/03-architecture/60_observability_and_evals.md`
- Comparator spec: `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`

## Slice 0002f: Reconciliation Issues List Honesty Policy (pack_03 + pack_07)

Source: `docs/04-projects/02-features/0002_quick-start-engine/prds/0002f_reconciliation-honesty-pack-03-07/prd.md`

### Introduction / Overview

#### Problem
Reconciliation is high-trust and high-risk. A confident but wrong “not depicted” claim is worse than “unknown”. We need an explicit, evidence-thresholded policy that keeps outputs honest under uncertainty.

#### Goal
Generate a reconciliation issues list with item-level classifications and strict evidence rules:
- bias to item-level `unknown` when evidence is weak
- only emit item-level `not_depicted` when there is positive evidence of absence (narrowly defined and cited)

#### Slice
Ship the reconciliation issues list generator + UI guidance copy under the list payload contract, proven on:
- `pack_03_mismatch_and_cert_gap` (forces mismatch issues)
- `pack_07_scans_rotated_low_quality` (forces uncertainty)

#### Primary Observable Effect
In the reconciliation issues artefact row drawer:
- issues are classified as `depicted|not_depicted|unknown`
- “unknown” issues include guidance about what evidence is missing
- the row remains `needs_review` (unless it truly must be `missing_input` or `citation_failed`)

#### In Scope
- Explicit evidence thresholds and downgrade rules
- Item-level classification only (no new report-row statuses)
- Guidance copy generation for “unknown”

### Goals

- No hallucinated negatives: `not_depicted` is rare and requires strong evidence.
- Under scan/noisy evidence, issues downgrade to `unknown` or `missing_input` safely.
- Outputs remain verifiable (locked citations) and fail-closed.

### User Stories

#### US-001: Produce honest reconciliation classifications (unknown bias)
As a user, I can trust that “not depicted” is only emitted when strongly supported, and uncertainty is surfaced as “unknown”.

Acceptance criteria:
- Reconciliation items use item-level classification `depicted|not_depicted|unknown`.
- `not_depicted` requires positive evidence of absence that is narrowly defined and cited.
- When evidence is weak or ambiguous, items are downgraded to `unknown` (no fabricated “not shown”).

Verification:
- Packs: `pack_03_mismatch_and_cert_gap`, `pack_07_scans_rotated_low_quality`
- Manual: review a small set of issues and confirm evidence thresholds are applied consistently.

#### US-002: Unknown issues are actionable (guidance copy)
As a user, when an issue is “unknown”, I see what evidence is missing and what to do next.

Acceptance criteria:
- Issue drawer includes guidance copy explaining what evidence is missing (survey callout text, instrument match, etc).
- Guidance does not leak internal errors/provider payloads and avoids vague “try again” copy; it points to concrete remediation.

Verification:
- Manual: run on `pack_07_scans_rotated_low_quality` and confirm guidance is specific to the observed failure mode.

### Functional Requirements

- Reconciliation runs as steps (`"use step"`) and is idempotent; step outputs are JSON-serialisable and Zod-validated.
- Issues payload uses list payload contract v0 with stable `item_id` and item-level `citation_ids[]` for claimed fields.
- Cross-evidence citations (instrument clause + survey callout) are required for “depicted” classifications when the claim spans both sources; if either can’t be locked, downgrade to `unknown`.
- Verification is fail-closed and uses taxonomy reason codes (e.g. `NO_CITATIONS`, `CITATION_MISMATCH`).
- On low-quality scan behavior where no citations can be locked, row must fall back safely to `missing_input` with remediation checklist.
- If any model fallback is used, it must run via the repo’s AI gateway posture with strict schemas and safe telemetry; determinism-first rules remain the default.

### Non-Goals (Slice-Specific)

- Geometry overlays or corridor plotting.
- Human-in-the-loop mutation of existing citations/rows.

### Rollback / Disable Plan

- Feature flag: `reconciliation_enabled` (default off until `pack_03` and `pack_07` pass).

### Slice Sources

- SP-2.5: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- `docs/03-architecture/20_state_model.md`
- `docs/03-architecture/60_observability_and_evals.md`

## Sources

- Spine PRD: `docs/04-projects/02-features/0002_quick-start-engine/prd-overall.md`
- Brief: `docs/04-projects/02-features/0002_quick-start-engine/brief.md`
- Breadboard: `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md`
- Risks: `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md`
- Spikes: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- Slice PRDs: `docs/04-projects/02-features/0002_quick-start-engine/prds/`

```

File: /Users/marc/Code/personal-projects/orbital-poc/scripts/fixtures/lib/csv.ts
```ts
export type CsvTable = {
  headers: string[];
  rows: Array<Record<string, string>>;
};

function parseCsvToRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };

  const pushRow = () => {
    // Ignore a trailing empty line.
    if (row.length === 1 && row[0] === "" && rows.length > 0) {
      row = [];
      return;
    }
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === "\"") {
        const next = text[i + 1];
        if (next === "\"") {
          field += "\"";
          i++;
          continue;
        }
        inQuotes = false;
        continue;
      }
      field += c;
      continue;
    }

    if (c === "\"") {
      inQuotes = true;
      continue;
    }

    if (c === ",") {
      pushField();
      continue;
    }

    if (c === "\n") {
      pushField();
      pushRow();
      continue;
    }

    if (c === "\r") {
      continue;
    }

    field += c;
  }

  if (inQuotes) throw new Error("CSV parse error: unterminated quote");

  if (field.length || row.length) {
    pushField();
    pushRow();
  }

  return rows;
}

export function parseCsv(text: string): CsvTable {
  const rows = parseCsvToRows(text);
  if (!rows.length) throw new Error("CSV parse error: empty input");

  const headers = rows[0].map((h) => h.trim());
  if (!headers.length || headers.some((h) => !h)) throw new Error("CSV parse error: invalid headers");

  const outRows: Array<Record<string, string>> = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r.length || r.every((v) => v === "")) continue;
    if (r.length !== headers.length) {
      throw new Error(`CSV parse error: row ${i + 1} has ${r.length} fields, expected ${headers.length}`);
    }
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = r[j];
    }
    outRows.push(obj);
  }

  return { headers, rows: outRows };
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/04-refactors/0004_quick-start-to-wdk/prd.md
```md
# PRD: Quick Start to WDK (Workstream C)

Owner: marc
Status: Draft
Date: 2026-02-10
Slug: quick-start-to-wdk

## Introduction / Overview

### Problem
Quick Start run execution is currently orchestrated via the durable `jobs` runtime (`apps/web/lib/jobs/*`). Workstream B introduces WDK as the durable orchestration runtime going forward, but until Quick Start is moved over, we have two competing orchestration systems and continued drift from the "WDK now" posture.

### Goal
Make Quick Start runs WDK-owned:
- `POST /folders/:id/runs` starts a WDK workflow for Quick Start.
- Quick Start execution is driven by the WDK worker.
- Quick Start no longer creates `jobs(type=execute_run)` rows.

### Primary Observable Effect
- With the WDK worker running, starting Quick Start results in durable progress (visible via `GET /runs/:id`) and a terminal run state without relying on the legacy jobs worker.

### Scope / Slice
This PRD is intentionally scoped to **2a**:
- Remove **only** Quick Start's dependency on the durable jobs runtime.
- Jobs may remain temporarily for ingest (or other legacy uses) until those are ported to WDK.

## Goals
- Move Quick Start execution to WDK with minimal product-semantic change.
- Preserve run-level idempotency (folder_id + idempotency_key) and step-level idempotency (deterministic step_key).
- Keep the system debuggable: logs and DB rows should make it obvious whether WDK or jobs executed a run.
- Remove `execute_run` job handling and any enqueue path for Quick Start.

## Non-goals (explicit cuts)
- Do not implement retrieval/draft/lock/verify for Quick Start (this slice is orchestration refactor).
- Do not migrate ingest to WDK in this workstream.
- Do not change question set, report row schemas, or status taxonomy.
- Do not change evidence/citations primitives.
- Do not implement a first-class "worker not running" indicator (heartbeat + UI state machine); lack of progress + logs are sufficient for this slice.

## Users
- Developer (local): wants Quick Start to run durably under WDK without managing two runtimes.
- Operator (demo/PoC): wants fewer moving parts and a single durable runtime posture.

## User Stories

### US-001: Quick Start is executed by a WDK workflow
As a developer, I want Quick Start run execution to be orchestrated by WDK so that the repo has one durable runtime posture and Quick Start is resumable under the worker.

#### Acceptance Criteria
- AC-001: Starting Quick Start schedules a WDK workflow execution (workflow type is explicitly Quick Start).
  - Example: `POST /folders/:id/runs` returns a run in `running` state and the worker begins executing WDK steps for that run.
  - Negative: If the WDK worker is not running, the run does not silently complete in-process via the legacy jobs worker.
- AC-002: The WDK step implementation can initially be a thin integration that calls the existing `processQuickStartRun(runId)` logic.
- AC-003: Logs clearly indicate orchestration mode for a run (WDK).

#### Verification
- Manual: start web + worker; start a run; observe progress via `GET /runs/:id`.

### US-002: `POST /folders/:id/runs` uses WDK immediately (no rollout flag)
As a developer, I want Quick Start to switch to WDK immediately (we are not live) so that the system stops accumulating drift and the legacy path is removed quickly.

#### Acceptance Criteria
- AC-004: `POST /folders/:id/runs` starts WDK workflow execution unconditionally (no feature flag required).
  - Example: with a worker running, a run progresses to terminal state.
  - Negative: the route does not enqueue `jobs(type=execute_run)` or kick the legacy inline jobs worker.
- AC-005: Run idempotency behavior is preserved.
  - Example: repeated POST with the same `Idempotency-Key` returns the previously created run.
  - Negative: duplicate runs are not created for the same `(folder_id, idempotency_key)`.

#### Verification
- Automated: unit test around route behavior ensuring it does not call `enqueueQuickStartRun`.
- Manual: POST twice with same key, confirm same run id.

### US-003: Legacy `execute_run` jobs path is removed (jobs remain for ingest)
As a developer, I want the legacy Quick Start enqueue and worker handler removed so that Quick Start cannot accidentally execute via jobs.

#### Acceptance Criteria
- AC-006: No new `jobs(type=execute_run)` rows are created by starting Quick Start.
  - Example: after starting a run, querying DB shows no matching execute_run job for that run.
  - Negative: there is no code path remaining that enqueues `execute_run` for Quick Start.
- AC-007: The jobs worker no longer supports the `execute_run` job type (removed or explicitly rejected).
- AC-008: Any remaining jobs runtime behavior is clearly marked legacy-only in code comments.

#### Verification
- Automated: unit test for worker handler map (execute_run unsupported).
- Manual: start run; confirm no execute_run jobs appear.

### US-004 (recommended follow-up within this PRD if feasible): Quick Start uses real WDK steps, not a single "job-like" step
As a developer, I want Quick Start to be broken into per-question durable steps so that restarts do not re-run the entire processor and progress is naturally incremental.

#### Acceptance Criteria
- AC-009: The workflow schedules deterministic per-question step keys (one per `question_id`).
  - Example: killing the worker mid-run and restarting continues without duplicate `report_rows`.
  - Negative: the system does not re-run already completed question writes.
- AC-010: `GET /runs/:id` progress increments as steps complete.

#### Verification
- Manual: start run, kill worker mid-flight, restart worker, confirm run finishes and progress increments.

## Functional Requirements
- FR-001: Define a Quick Start workflow type in the WDK registry (e.g. `quick_start_title_survey`).
- FR-002: Implement WDK step(s) for Quick Start execution.
  - Initial allowed implementation: one step calls `processQuickStartRun(runId)`.
  - Recommended evolution: per-question `write_row` steps.
- FR-003: Update the run-start route to create/reuse the run row (via idempotency) and start WDK workflow execution with input `{ run_id }`.
- FR-004: Remove `execute_run` job enqueue surface and worker handler.
- FR-005: Ensure WDK worker is the only mechanism that can advance Quick Start runs (no silent in-process completion).

## Failure States + UX
- If the worker is not running, the run may stay `running` with no progress. This is acceptable in the PoC, but must be observable:
  - logs should indicate workflow started
  - `GET /runs/:id` shows no progress

## Metrics / Logging
- Log `run.created` with an explicit `orchestration: "wdk"` field.
- Log a WDK step-level event with `{ run_id, step_key, step_type, state }` (or equivalent) to support traceability.

## Rollback / Disable Path
- No production rollout concerns (not live). Rollback is via code revert.
- For safety during development, if WDK is incomplete, the correct fix is to complete Workstream B rather than silently falling back to jobs.

## Quality Gates
- `pnpm --filter @orbital-poc/web typecheck`
- `pnpm --filter @orbital-poc/web test`
- `pnpm --filter @orbital-poc/web lint`

## Verification Plan
Automated:
- Unit test that `POST /folders/:id/runs` does not call `enqueueQuickStartRun`.
- Unit test that the legacy jobs worker rejects/does not handle `execute_run`.

Manual smoke:
1. `pnpm dev`
2. `pnpm --filter @orbital-poc/web worker`
3. In the UI, click "Run Quick Start" (or POST `/folders/:id/runs`).
4. Poll `GET /runs/:id` until terminal.
5. Kill worker mid-run and restart; confirm idempotency (no duplicate rows) and eventual terminal state.

Packs:
- Use fixture packs as a deterministic baseline:
  - `pack_01_clean`
  - `pack_02_missing_rea`

## Risks & Dependencies
- Dependency: Workstream B must provide a functional WDK worker + world schema.
- Risk: A single-step "execute" implementation is a job-in-disguise; mitigate by moving to per-question steps (US-004).
- Risk: Removing legacy jobs path may break dev UX if WDK is incomplete; mitigate by ensuring Workstream B entry criteria are met first.

## Open Questions
- None (resolved 2026-02-10).

## Sources
- `docs/04-projects/04-refactors/0004_quick-start-to-wdk/plan.md`
- `docs/04-projects/04-refactors/0003_wdk-runtime/plan.md`
- `apps/web/app/(api)/folders/[id]/runs/route.ts`
- `apps/web/lib/quickStartRunQueue.server.ts`
- `apps/web/lib/jobs/jobWorker.server.ts`
- `apps/web/lib/quickStartRunProcessor.server.ts`

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/spikes/rh5_missing_docs_harness.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { detectMissingDocs } from "../missing-docs/detectMissingDocs";

function parseArgs(argv: string[]) {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "true";
    args.set(key, val);
    if (val !== "true") i += 1;
  }
  return args;
}

const ManifestSchema = z.object({
  pack_id: z.string(),
  documents: z.array(
    z.object({
      filename: z.string(),
      role: z.string().optional(),
      anchors_file: z.string().optional(),
    }),
  ),
});

async function extractPageText(pdfPath: string, pageNumber: number): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = fs.readFileSync(pdfPath);
  const loadingTask = pdfjs.getDocument({ data, disableWorker: true });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();
  const items = (textContent.items ?? []) as any[];
  return items.map((it) => String(it.str ?? "")).join(" ");
}

function loadJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

function pickTitleCommitment(manifest: z.infer<typeof ManifestSchema>) {
  const doc =
    manifest.documents.find((d) => d.role === "title_commitment") ??
    manifest.documents.find((d) => /TitleCommitment\.pdf$/i.test(d.filename));
  if (!doc) throw new Error(`Could not find TitleCommitment.pdf in manifest for ${manifest.pack_id}`);
  return doc;
}

function getScheduleBiiPageFromAnchors(packRoot: string, anchorsFileRel?: string): number {
  if (!anchorsFileRel) return 3;
  const anchorsPath = path.join(packRoot, anchorsFileRel);
  const anchors = loadJson<Record<string, { page: number }>>(anchorsPath);
  return anchors["SCHEDULE_BII_HEADER"]?.page ?? 3;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = args.get("outDir") ?? "docs/97-throwaway/spike-evidence/rh5";

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
  const packs = ["pack_01_clean", "pack_02_missing_rea"] as const;

  const perPack: any[] = [];
  for (const packId of packs) {
    const packRoot = path.join(root, "docs/08-example-data", packId);
    const manifest = ManifestSchema.parse(loadJson(path.join(packRoot, "manifest.json")));

    const title = pickTitleCommitment(manifest);
    const titlePdfPath = path.join(packRoot, "docs", title.filename);
    const pageNumber = getScheduleBiiPageFromAnchors(packRoot, title.anchors_file);
    const text = await extractPageText(titlePdfPath, pageNumber);

    const providedFilenames = manifest.documents.map((d) => d.filename).filter((f) => /\.pdf$/i.test(f));

    perPack.push(
      detectMissingDocs({
        packId,
        providedFilenames,
        referenceText: text,
        referenceSource: { source: title.filename, page: pageNumber },
      }),
    );
  }

  const pack01 = perPack.find((r) => r.pack_id === "pack_01_clean");
  const pack02 = perPack.find((r) => r.pack_id === "pack_02_missing_rea");

  const fp = (pack01?.missing_docs?.length ?? 0) > 0 ? 1 : 0;
  const fn =
    pack02?.missing_docs?.some((d: any) => String(d.label).toLowerCase() === "rea.pdf") === true ? 0 : 1;

  const summary = [
    `# RH5 missing-doc detection summary`,
    ``,
    `- pack_01_clean missing count: ${pack01?.missing_docs?.length ?? 0}`,
    `- pack_02_missing_rea missing count: ${pack02?.missing_docs?.length ?? 0}`,
    `- False positives (pack_01): ${fp}`,
    `- False negatives (pack_02 for REA): ${fn}`,
    ``,
  ].join("\n");

  const outRoot = path.join(root, outDir);
  fs.mkdirSync(outRoot, { recursive: true });
  fs.writeFileSync(path.join(outRoot, "results.json"), JSON.stringify({ results: perPack }, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(outRoot, "summary.md"), summary, "utf8");

  process.stdout.write(`Wrote ${path.join(outRoot, "results.json")}\n`);
  process.stdout.write(`Wrote ${path.join(outRoot, "summary.md")}\n`);
}

await main();

```

File: /Users/marc/Code/personal-projects/orbital-poc/scripts/fixtures/lib/fs.ts
```ts
import { readdir } from "node:fs/promises";
import { join } from "node:path";

export async function walkFiles(
  rootDir: string,
  opts?: {
    includeExtensions?: string[];
    excludeDirNames?: string[];
  },
): Promise<string[]> {
  const includeExt = opts?.includeExtensions?.map((e) => e.toLowerCase());
  const excludeDirs = new Set((opts?.excludeDirNames ?? []).map((d) => d.toLowerCase()));

  const out: string[] = [];

  const visit = async (dir: string) => {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = join(dir, ent.name);
      if (ent.isDirectory()) {
        if (excludeDirs.has(ent.name.toLowerCase())) continue;
        await visit(full);
        continue;
      }
      if (!ent.isFile()) continue;
      if (includeExt) {
        const dot = ent.name.lastIndexOf(".");
        const ext = dot === -1 ? "" : ent.name.slice(dot).toLowerCase();
        if (!includeExt.includes(ext)) continue;
      }
      out.push(full);
    }
  };

  await visit(rootDir);
  return out;
}

```
</file_contents>
<user_instructions>
<taskname="Quick Start Oracle"/>

<task>
Create an external-oracle consultation prompt that asks for the best next steps to unblock/ship Quick Start, given current repo reality.

The oracle must compare:
- 0002 Quick Start Engine feature dossier vs
- 0004 Quick Start to WDK refactor initiative
…and recommend sequencing, cuts, and concrete deliverables.

Treat the investigation facts as true (see selected docs/code).
</task>

<architecture>
- Quick Start is intended to be orchestrated as WDK workflows/steps (ADR-0005), producing evidence-first rows with locked citations (ADR-0001) and fail-closed verification posture (ADR-0002).
- Fixtures/evals are first-class (ADR-0006). Retrieval is hybrid and returns chunk IDs (ADR-0004).
- Question sets are file-backed and pinned per-run (ADR-0016).

Code reality today (see selected TS files):
- API route starts Quick Start runs and schedules WDK workflow.
- Workflow builds per-question step keys and dispatches to step handlers.
- The `quickStartWriteRowV0` step currently writes placeholder rows (`missing_input` / `citation_failed`) and for list rows attaches empty `list_payload_v0` items.
- Fixture tooling exists for snapshotting/comparing produced outputs vs truth, but there is no deterministic producer layer that emits canonical spike proof artifacts for 0002.
</architecture>

<selected_context>
- docs/04-projects/02-features/0002_quick-start-engine/investigation-report.md: current-state evidence and drift summary.
- docs/04-projects/02-features/0002_quick-start-engine/stuck-extract.md: the “stuck” checklist.
- docs/04-projects/02-features/0002_quick-start-engine/prd.md + prd.json + prd-overall.md: feature intent + requirements.
- docs/04-projects/02-features/0002_quick-start-engine/specs/*:
  - list payload contract and verification policy: `list_payload_v0.schema.md`, `list_verification_policy_v1.md`
  - comparator spec: `comparator_spec_v0.md`
  - question set: `question_set_v1.json`
- docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/*: current spike closure notes (RH-2.* / SP-2.*).

- docs/04-projects/04-refactors/0004_quick-start-to-wdk/prd.md + prd.json + plan.md: the refactor proposal and why it was blocked.

- docs/03-architecture/DECISIONS.md: ADR constraints that may force sequencing.
- docs/03-architecture/07_current_poc_runtime.md: explicit statement of current runtime drift vs target.
- docs/03-architecture/20_state_model.md, docs/03-architecture/30_data_model.md, docs/03-architecture/40_rag_and_agents.md: state/data/provenance context referenced by ADRs.

Implementation (current reality):
- apps/web/steps/quickStartWriteRowV0.step.server.ts: placeholder row writing; empty list payload V0.
- apps/web/steps/quickStartExecuteV0.step.server.ts + apps/web/steps/quickStartStepHandlers.server.ts: step dispatch.
- apps/web/workflows/quickStartTitleSurveyWorkflow.server.ts: workflow step-key formation.
- apps/web/lib/quickStartRunProcessor.server.ts + apps/web/lib/quickStartRunQueue.server.ts: run processing/queueing and row writes.
- apps/web/lib/questionSet.server.ts: loads question set version; pinning/drift checks.
- apps/web/lib/wdk/*: step queue + worker + directive guardrail.
- apps/web/app/(api)/folders/[id]/runs/route.ts: run creation + workflow start.
- apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx: UI entry point.
- apps/web/lib/db/schema/core.server.ts: DB schema for runs/steps/report_rows/citations tables (ground truth contract).

Fixture tooling (current capabilities):
- scripts/fixtures/compare_truth.ts: compares produced outputs vs fixture truth.
- scripts/fixtures/assert_row_invariants.ts: validates row-level invariants.
- scripts/fixtures/assert_citation_integrity.ts: validates citations integrity.
- scripts/fixtures/lib/*: snapshot + CSV + filesystem helpers.

Shared contracts:
- packages/core/src/schemas/list_payload_v0.ts: canonical list payload schema in code (source of drift vs docs).
- packages/core/src/verify/* and packages/core/src/spikes/*: existing harnesses/schemas for verification/spike-style checks.
</selected_context>

<relationships>
- QuickStartPanel.tsx -> calls API route `apps/web/app/(api)/folders/[id]/runs/route.ts` -> creates run + schedules `startQuickStartTitleSurveyWorkflow()`.
- quickStartTitleSurveyWorkflow.server.ts -> step keys like `quick_start:${questionSetVersion}:question:${question_id}:write_row` -> quickStartStepHandlers.server.ts -> quickStartWriteRowV0.step.server.ts.
- quickStartWriteRowV0.step.server.ts and quickStartRunProcessor.server.ts both write into `report_rows` (schema defined in apps/web/lib/db/schema/core.server.ts) and depend on question set version pinning (apps/web/lib/questionSet.server.ts).
- Fixture scripts under scripts/fixtures/* are the current deterministic validators/comparators, but no dedicated producer exists for the missing 0002 spike proofs.
</relationships>

<oracle_questions>
Use these questions verbatim (do not simplify):
1) Given 0002 (feature) vs 0004 (refactor to WDK), what sequencing is actually optimal now?
   - Option A: close 0002 gating spikes offline via fixture producer+runner first (layout/anchors -> snapshot -> compare_truth), then port runtime.
   - Option B: finish 0004 refactor (port runtime fully to WDK/jobs removal) first, then do spike closures.
   - Option C: hybrid: small runtime changes only to enable spike outputs; defer full refactor.

2) Does `docs/03-architecture/DECISIONS.md` introduce constraints that force one option (e.g. fail-closed policy, immutable citations, WDK-only orchestration, retrieval posture)?

3) What is the smallest set of concrete deliverables that would unblock shipping:
   - exact scripts/modules to add (producer + spike runner + retrieval Recall@K harness)
   - which docs must be updated to remove drift (list payload schema doc, question set version expectations, runtime-orchestration “implemented today” docs)
   - how to define “GO” for the refactor vs “GO” for the feature (so we don’t deadlock)

4) Risk call: is it acceptable to close spikes using fixture layout/anchors as the substrate (deterministic offline producer) before retrieval/locking exists in runtime, or does that create a false sense of confidence?

5) Provide a recommended plan with:
   - first 1-3 steps to take this week
   - explicit decision points
   - what evidence/proofs to commit and where
   - which items can be cut/de-scoped safely
</oracle_questions>

<ambiguities>
- Drift details to check while drafting the oracle prompt (do not resolve here): exact `question_set_version` string format used at runtime vs fixture/spec expectations; any mismatch between docs spec list payload contract vs `packages/core` schema; current meaning of `missing_input` vs `citation_failed` in placeholder row logic.
</ambiguities>

</user_instructions>
