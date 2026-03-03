<file_map>
/Users/marc/Code/personal-projects/legaltech-poc
├── apps
│   └── web
│       ├── app
│       │   ├── (api)
│       │   │   ├── citations
│       │   │   │   └── [id]
│       │   │   │       └── route.ts * +
│       │   │   ├── demo
│       │   │   │   └── load-pack
│       │   │   │       └── route.ts * +
│       │   │   ├── documents
│       │   │   │   └── [id]
│       │   │   │       ├── complete
│       │   │   │       │   └── route.ts * +
│       │   │   │       ├── pdf
│       │   │   │       │   └── route.ts * +
│       │   │   │       ├── render
│       │   │   │       │   └── route.ts * +
│       │   │   │       └── upload
│       │   │   │           └── route.ts * +
│       │   │   ├── folders
│       │   │   │   ├── [id]
│       │   │   │   │   ├── documents
│       │   │   │   │   │   └── route.ts * +
│       │   │   │   │   └── route.ts * +
│       │   │   │   └── route.ts * +
│       │   │   ├── ...
│       │   ├── (app)
│       │   │   ├── matters
│       │   │   │   ├── [id]
│       │   │   │   │   └── page.tsx * +
│       │   │   │   ├── viewer
│       │   │   │   │   ├── CitationViewerClient.tsx * +
│       │   │   │   │   └── page.tsx * +
│       │   │   │   ├── MattersToolbar.tsx * +
│       │   │   │   ├── actions.ts * +
│       │   │   │   └── page.tsx * +
│       │   │   ├── ...
│       │   ├── ui
│       │   │   ├── Alert.tsx * +
│       │   │   ├── Badge.tsx * +
│       │   │   ├── Button.tsx * +
│       │   │   ├── Card.tsx * +
│       │   │   ├── Chip.tsx * +
│       │   │   ├── InlineStatus.tsx * +
│       │   │   ├── Input.tsx * +
│       │   │   ├── Table.tsx * +
│       │   │   ├── ThemeProvider.tsx * +
│       │   │   ├── ThemeToggle.tsx * +
│       │   │   └── cn.ts * +
│       │   ├── DemoToolbar.tsx * +
│       │   ├── globals.css *
│       │   ├── head.tsx * +
│       │   ├── layout.tsx * +
│       │   ├── page.tsx * +
│       │   └── tokens.css *
│       ├── lib
│       │   ├── ingest
│       │   │   └── ingestQueue.server.ts * +
│       │   ├── jobs
│       │   │   └── ...
│       │   ├── db.server.ts * +
│       │   ├── demoMode.server.ts * +
│       │   ├── devOnly.ts * +
│       │   ├── devOnlyApi.server.ts * +
│       │   ├── fixtureSeed.server.ts * +
│       │   ├── folderState.server.ts * +
│       │   ├── httpRange.server.ts * +
│       │   ├── ids.ts * +
│       │   ├── objectStore.server.ts * +
│       │   ├── overlayHighlight.ts * +
│       │   ├── safePdfFilename.server.ts * +
│       │   ├── trace.server.ts * +
│       │   ├── validateNormPolygons.ts * +
│       │   ├── artefacts.routes.test.ts +
│       │   ├── exportCsv.server.test.ts +
│       │   ├── exportCsv.server.ts +
│       │   ├── exportDocx.routes.test.ts +
│       │   ├── httpRange.server.test.ts +
│       │   ├── memoDocx.server.ts +
│       │   ├── objectStore.server.test.ts +
│       │   ├── questionSet.server.ts +
│       │   ├── quickStartRunQueue.server.ts +
│       │   └── spikes.server.ts +
│       ├── test
│       │   ├── stubs
│       │   │   └── ...
│       │   └── demoChecklist.sync.test.ts +
│       ├── types
│       │   └── pdfjs-dist.d.ts
│       ├── AGENTS.md *
│       ├── package.json *
│       ├── .eslintrc.json
│       ├── next-env.d.ts
│       ├── next.config.js +
│       ├── postcss.config.js +
│       ├── tailwind.config.ts +
│       ├── tailwind.preset.ts +
│       ├── tsconfig.json
│       ├── tsconfig.tsbuildinfo
│       └── vitest.config.ts +
├── docs
│   ├── 03-architecture
│   │   ├── 00_overview.md *
│   │   ├── 05_tech_stack_and_dev_workflow.md *
│   │   ├── 06_frameworks_agents_rag_evals.md *
│   │   ├── 07_current_poc_runtime.md *
│   │   ├── 10_system_architecture.md *
│   │   ├── 20_state_model.md *
│   │   ├── 30_data_model.md *
│   │   ├── 40_rag_and_agents.md *
│   │   ├── 50_api_surface.md *
│   │   ├── 60_observability_and_evals.md *
│   │   ├── DECISIONS.md *
│   │   ├── .gitkeep
│   │   ├── 01_onboarding_checklist.md
│   │   ├── AGENTS.md
│   │   └── INVESTIGATION.md
│   ├── 04-projects
│   │   ├── 02-features
│   │   │   ├── 0001_trust-substrate
│   │   │   │   ├── breadboard-pack.md *
│   │   │   │   ├── brief.md *
│   │   │   │   ├── risk-register.md *
│   │   │   │   ├── ...
│   │   │   ├── 0002_quick-start-engine
│   │   │   │   ├── specs
│   │   │   │   │   ├── failure_ux_copy_v0.md *
│   │   │   │   │   └── question_set_v1.json *
│   │   │   │   ├── breadboard-pack.md *
│   │   │   │   ├── brief.md *
│   │   │   │   ├── risk-register.md *
│   │   │   │   ├── ...
│   │   │   ├── 0003_demo-grade-outputs
│   │   │   │   └── ...
│   │   │   ├── 0004_csv-export
│   │   │   │   └── ...
│   │   │   ├── 0005_word-export
│   │   │   │   └── ...
│   │   │   ├── 0006_eval-harness
│   │   │   │   └── ...
│   │   │   ├── 0007_demo-reliability
│   │   │   │   └── ...
│   │   │   ├── 0008_artefacts-foundation
│   │   │   │   └── ...
│   │   │   └── .gitkeep
│   │   ├── _templates
│   │   │   ├── .gitkeep *
│   │   │   ├── README.md *
│   │   │   ├── breadboard.md *
│   │   │   ├── json-prd.schema.json *
│   │   │   ├── pack.md *
│   │   │   ├── prd.md *
│   │   │   ├── release-checklist.md *
│   │   │   └── spike-plan.md *
│   │   ├── 01-experiments-prototypes
│   │   │   └── .gitkeep
│   │   ├── 03-fixes
│   │   │   ├── 0001_drift
│   │   │   │   └── ...
│   │   │   ├── 0002_arch-drift-guardrails
│   │   │   │   └── ...
│   │   │   └── .gitkeep
│   │   ├── 04-refactors
│   │   │   ├── 0001_v5-ui-alignment
│   │   │   │   └── ...
│   │   │   └── .gitkeep
│   │   ├── 05-migrations
│   │   │   └── .gitkeep
│   │   ├── .gitkeep
│   │   ├── AGENTS.md
│   │   └── README.md
│   ├── 06-release
│   │   ├── demo-runbook
│   │   │   └── 2026-02-09_legaltech-poc-demo
│   │   │       ├── demo-operator-checklist.md *
│   │   │       ├── demo-script.md *
│   │   │       ├── walkthrough.md *
│   │   │       ├── ...
│   │   ├── postmortems
│   │   │   └── .gitkeep
│   │   ├── .gitkeep
│   │   ├── AGENTS.md
│   │   └── CHANGELOG.md
│   ├── 08-example-data
│   │   ├── pack_01_clean
│   │   │   ├── docs
│   │   │   │   └── ...
│   │   │   ├── layout
│   │   │   │   └── ...
│   │   │   ├── truth
│   │   │   │   └── ...
│   │   │   └── manifest.json *
│   │   ├── pack_02_missing_rea
│   │   │   ├── docs
│   │   │   │   └── ...
│   │   │   ├── layout
│   │   │   │   └── ...
│   │   │   ├── truth
│   │   │   │   └── ...
│   │   │   └── manifest.json
│   │   ├── pack_03_mismatch_and_cert_gap
│   │   │   ├── docs
│   │   │   │   └── ...
│   │   │   ├── layout
│   │   │   │   └── ...
│   │   │   ├── truth
│   │   │   │   └── ...
│   │   │   └── manifest.json
│   │   ├── pack_04_multi_parcel
│   │   │   ├── docs
│   │   │   │   └── ...
│   │   │   ├── layout
│   │   │   │   └── ...
│   │   │   ├── truth
│   │   │   │   └── ...
│   │   │   └── manifest.json
│   │   ├── pack_05_partial_release
│   │   │   ├── docs
│   │   │   │   └── ...
│   │   │   ├── layout
│   │   │   │   └── ...
│   │   │   ├── truth
│   │   │   │   └── ...
│   │   │   └── manifest.json
│   │   ├── pack_06_overlapping_easements
│   │   │   ├── docs
│   │   │   │   └── ...
│   │   │   ├── layout
│   │   │   │   └── ...
│   │   │   ├── truth
│   │   │   │   └── ...
│   │   │   └── manifest.json
│   │   ├── pack_07_scans_rotated_low_quality
│   │   │   ├── docs
│   │   │   │   └── ...
│   │   │   ├── layout
│   │   │   │   └── ...
│   │   │   ├── truth
│   │   │   │   └── ...
│   │   │   └── manifest.json
│   │   ├── pack_08_defined_terms_and_cross_refs
│   │   │   ├── docs
│   │   │   │   └── ...
│   │   │   ├── layout
│   │   │   │   └── ...
│   │   │   ├── truth
│   │   │   │   └── ...
│   │   │   └── manifest.json
│   │   ├── pack_09_bad_citation
│   │   │   ├── docs
│   │   │   │   └── ...
│   │   │   ├── layout
│   │   │   │   └── ...
│   │   │   ├── produced
│   │   │   │   └── ...
│   │   │   ├── truth
│   │   │   │   └── ...
│   │   │   └── manifest.json
│   │   ├── README.md *
│   │   ├── packs_summary.md *
│   │   └── packs_summary.csv
│   ├── 98-tmp
│   │   ├── handoffs
│   │   │   ├── handoff_2026-02-09_10-07-28_demo-setup-runbook-app.md *
│   │   │   └── handoff_2026-02-06_17-35-25_shape-split-commits.md
│   │   ├── 2026-02-06_infra-investigation
│   │   │   ├── README.md
│   │   │   ├── deployment.md
│   │   │   ├── llm-gateways.md
│   │   │   ├── ocr.md
│   │   │   ├── oracle_bundles.md
│   │   │   ├── recommended-stack.md
│   │   │   └── storage.md
│   │   ├── oracle
│   │   │   ├── oracle-bundles
│   │   │   │   └── ...
│   │   │   ├── oracle-arch-drift.md
│   │   │   └── oracle-prompt_demo-architecture-alignment_2026-02-07.md
│   │   ├── .gitkeep
│   │   ├── README.md
│   │   ├── oracle-03-architecture-review-manual.md
│   │   ├── oracle-prompt_0002-response.md
│   │   ├── oracle-prompt_trust-substrate_2026-02-07.md
│   │   └── oracle-prompt_trust-substrate_2026-02-07_v2.md
│   ├── 00-strategy
│   │   ├── initiatives
│   │   │   ├── 001-003_dependency_plan.md
│   │   │   ├── 001-003_handoff.md
│   │   │   ├── 001-trust-substrate.md
│   │   │   ├── 002-quick-start-engine.md
│   │   │   ├── 003-polishing-for-demo-and-non-func-hardening.md
│   │   │   ├── initiative-overview-001-002-003.md
│   │   │   └── prd-slicing-rules.md
│   │   ├── opportunity-solution-tree.md
│   │   ├── product-principles.md
│   │   ├── product-strategy-1-pager.md
│   │   ├── product-strategy-detailed.md
│   │   ├── roadmap.md
│   │   ├── sales-pitch.md
│   │   └── segmentation-notes.md
│   ├── 01-insights
│   │   ├── capabilities
│   │   │   ├── .gitkeep
│   │   │   ├── PoC-architecture-brainstorming2_chatGPT.md
│   │   │   ├── PoC-architecture-brainstorming3_claude.md
│   │   │   ├── PoC-architecture-brainstorming_chatGPT.md
│   │   │   └── README.md
│   │   ├── competitors
│   │   │   ├── .gitkeep
│   │   │   ├── competitor_overview_chatGPT.md
│   │   │   └── competitor_overview_claude.md
│   │   ├── customers
│   │   │   ├── product-metrics
│   │   │   │   └── ...
│   │   │   ├── user-calls
│   │   │   │   └── ...
│   │   │   └── .gitkeep
│   │   ├── tech-and-market
│   │   │   ├── .gitkeep
│   │   │   └── US-CRE-due-diligence_codex.md
│   │   └── .gitkeep
│   ├── 02-guidelines
│   │   ├── archive
│   │   │   ├── brand-preview.html
│   │   │   ├── design-system-v1-warm-light.html
│   │   │   ├── design-system-v2-dark-editorial.html
│   │   │   ├── design-system-v3-orange-energy.html
│   │   │   ├── design-system-v4-soft-cyan.html
│   │   │   ├── design-system-v5-purple-accent.html
│   │   │   └── design-system-v6-earthy-organic.html
│   │   ├── inspiration
│   │   │   ├── brand-dna-2026-02-06
│   │   │   │   └── ...
│   │   │   ├── tailwind
│   │   │   │   └── ...
│   │   │   ├── .gitkeep
│   │   │   ├── README.md
│   │   │   ├── brand_guidelines.md
│   │   │   ├── design_tokens.json
│   │   │   └── prompt_library.json
│   │   ├── v1-warm-editorial
│   │   │   ├── design-system.html
│   │   │   ├── tailwind.preset.ts +
│   │   │   └── tokens.css
│   │   ├── v2-refined-neutral
│   │   │   ├── design-system.html
│   │   │   ├── tailwind.preset.ts +
│   │   │   └── tokens.css
│   │   ├── v3-deep-ink
│   │   │   ├── design-system.html
│   │   │   ├── tailwind.preset.ts +
│   │   │   └── tokens.css
│   │   ├── v4-frost-and-fire
│   │   │   ├── design-system.html
│   │   │   ├── tailwind.preset.ts +
│   │   │   └── tokens.css
│   │   ├── v5-final
│   │   │   ├── design-system.html
│   │   │   ├── tailwind.preset.ts +
│   │   │   └── tokens.css
│   │   ├── .gitkeep
│   │   ├── AGENTS.md
│   │   ├── brand-guidelines.md
│   │   └── brand-tone.md
│   ├── 05-reviews-audits
│   │   ├── e2e-testing
│   │   │   ├── 0001_citation-viewer-highlight
│   │   │   │   └── ...
│   │   │   ├── 0002_missing-input-checklist
│   │   │   │   └── ...
│   │   │   └── 0003_fail-closed-export-gating
│   │   │       └── ...
│   │   ├── .gitkeep
│   │   └── governance.md
│   ├── 96-engineering-tutor-learnings
│   │   ├── 2026-02-06_brand-dna-web-app-design-language.md
│   │   ├── 2026-02-07_orbital-architecture-decisions-and-overview.md
│   │   ├── 2026-02-07_trust-substrate-verification-overrides-and-rh2-fallbacks.md
│   │   ├── 2026-02-08_adr-0001_evidence-first-outputs-with-citation-ids-and-locking.md
│   │   ├── 2026-02-08_adr-0002_verification-is-fail-closed.md
│   │   ├── 2026-02-08_adr-0003_ocr-layout-extraction-is-the-default-for-all-pdfs.md
│   │   ├── 2026-02-08_adr-0004_hybrid-retrieval-returning-chunk-ids-lexical-vector.md
│   │   ├── 2026-02-08_adr-0005_deterministic-ish-orchestration-via-workflow-devkit-steps.md
│   │   ├── 2026-02-08_adr-0006_fixture-driven-evals-are-first-class.md
│   │   ├── 2026-02-08_adr-0007_no-external-web-research-inside-poc-runs.md
│   │   ├── 2026-02-08_adr-0008_explicit-error-envelope-for-apis.md
│   │   ├── 2026-02-08_adr-0009_deployment-posture-is-hetzner-first-single-vm-until-proven-otherwise.md
│   │   ├── 2026-02-08_adr-0010_use-s3-compatible-object-storage-as-the-baseline.md
│   │   ├── 2026-02-08_adr-0011_postgres-is-the-primary-datastore-local-dev-hetzner-in-deploy.md
│   │   ├── 2026-02-08_adr-0012_ocr-layout-extraction-is-abstracted-behind-a-single-provider-adapter.md
│   │   ├── 2026-02-08_adr-0013_llm-embeddings-calls-go-through-ai-sdk-gateway-is-default.md
│   │   ├── 2026-02-08_adr-0014_create-a-minimal-runnable-scaffold-to-validate-the-architecture.md
│   │   ├── 2026-02-08_adr-0015_deterministic-page-bounded-chunking-line-window-v1-index-version-bump-rules.md
│   │   ├── 2026-02-08_adr-0016_file-backed-immutable-question-sets-with-run-pinning-and-completed-invariants.md
│   │   ├── 2026-02-08_adr-0017_verification-v1-is-integrity-only-no-entailment-model.md
│   │   ├── 2026-02-08_adr-0018_run-trace-export-is-and-is-admin-token-gated.md
│   │   ├── 2026-02-08_adr-0019_unsafe-export-override-is-api-only-and-gated-behind-demo-flags-admin-token.md
│   │   ├── 2026-02-08_adr-0020_rh2-overlay-is-verified-at-100-zoom-only-in-poc-v1-regression-proof-is-artifact-based.md
│   │   ├── 2026-02-08_adr-0021_data-handling-posture-storage-provider-boundaries-and-redaction-defaults.md
│   │   ├── 2026-02-08_adr-0022_docker-compose-and-sprite.md
│   │   └── 2026-02-08_adr-0022_docker-compose-usage-local-services-and-sprite-as-a-dev-sandbox-both-supported.md
│   ├── 99-archive
│   │   └── .gitkeep
│   ├── AGENTS.md
│   └── LEARNINGS.md
├── packages
│   ├── core
│   │   ├── src
│   │   │   ├── citations
│   │   │   │   ├── snippet.ts * +
│   │   │   │   ├── ...
│   │   │   ├── fixtures
│   │   │   │   ├── fixtureIds.ts * +
│   │   │   │   ├── ...
│   │   │   ├── geometry
│   │   │   │   ├── anchors.ts * +
│   │   │   │   ├── mapToViewport.ts * +
│   │   │   │   ├── ...
│   │   │   ├── missing-docs
│   │   │   │   ├── detectMissingDocs.ts * +
│   │   │   │   ├── schemas.ts * +
│   │   │   │   ├── ...
│   │   │   ├── schemas
│   │   │   │   ├── list_payload_v0.ts * +
│   │   │   │   ├── ...
│   │   │   ├── verify
│   │   │   │   ├── verifier.schemas.ts * +
│   │   │   │   └── verifier.ts * +
│   │   │   ├── exception-matching
│   │   │   │   └── ...
│   │   │   ├── spikes
│   │   │   │   └── ...
│   │   │   ├── index.ts * +
│   │   │   ├── safe-error.ts * +
│   │   │   └── server.ts * +
│   │   ├── package.json *
│   │   ├── tsconfig.build.json
│   │   └── tsconfig.json
│   └── .gitkeep
├── .agents
│   ├── backup
│   │   └── 2026-02-08T12-17-42-189Z
│   │       └── manifest.json
│   ├── hooks
│   │   ├── git
│   │   │   ├── commit-msg
│   │   │   ├── post-merge
│   │   │   ├── pre-commit
│   │   │   ├── pre-push
│   │   │   └── prepare-commit-msg
│   │   └── README.md
│   ├── skills
│   │   ├── 00-utilities
│   │   │   ├── agent-browser
│   │   │   │   └── ...
│   │   │   ├── agentation
│   │   │   │   └── ...
│   │   │   ├── ask-questions-if-underspecified
│   │   │   │   └── ...
│   │   │   ├── beautiful-mermaid
│   │   │   │   └── ...
│   │   │   ├── brand-dna-extractor
│   │   │   │   └── ...
│   │   │   ├── browser-use
│   │   │   │   └── ...
│   │   │   ├── commit
│   │   │   │   └── ...
│   │   │   ├── create-cli
│   │   │   │   └── ...
│   │   │   ├── dev-browser
│   │   │   │   └── ...
│   │   │   ├── docs-list
│   │   │   │   └── ...
│   │   │   ├── engineering-tutor
│   │   │   │   └── ...
│   │   │   ├── every-style-editor
│   │   │   │   └── ...
│   │   │   ├── file-todos
│   │   │   │   └── ...
│   │   │   ├── firecrawl
│   │   │   │   └── ...
│   │   │   ├── framework-docs-researcher
│   │   │   │   └── ...
│   │   │   ├── handoff
│   │   │   │   └── ...
│   │   │   ├── landpr
│   │   │   │   └── ...
│   │   │   ├── markdown-converter
│   │   │   │   └── ...
│   │   │   ├── nano-banana-pro
│   │   │   │   └── ...
│   │   │   ├── openai-image-gen
│   │   │   │   └── ...
│   │   │   ├── oracle
│   │   │   │   └── ...
│   │   │   ├── parallel-web-tools
│   │   │   │   └── ...
│   │   │   ├── pickup
│   │   │   │   └── ...
│   │   │   └── video-transcript-downloader
│   │   │       └── ...
│   │   ├── 02-shape
│   │   │   ├── breadboarding
│   │   │   │   └── ...
│   │   │   ├── brief
│   │   │   │   └── ...
│   │   │   ├── create-json-prd
│   │   │   │   └── ...
│   │   │   ├── create-prd
│   │   │   │   └── ...
│   │   │   ├── spike-investigation
│   │   │   │   └── ...
│   │   │   └── wf-shape
│   │   │       └── ...
│   │   ├── 03-plan
│   │   │   ├── best-practices-researcher
│   │   │   │   └── ...
│   │   │   ├── bug-reproduction-validator
│   │   │   │   └── ...
│   │   │   ├── deepen-plan
│   │   │   │   └── ...
│   │   │   ├── plan-review
│   │   │   │   └── ...
│   │   │   ├── repo-research-analyst
│   │   │   │   └── ...
│   │   │   ├── reproduce-bug
│   │   │   │   └── ...
│   │   │   ├── spec-flow-analyzer
│   │   │   │   └── ...
│   │   │   ├── triage
│   │   │   │   └── ...
│   │   │   └── wf-plan
│   │   │       └── ...
│   │   ├── 04-develop
│   │   │   ├── 00-frontend-general
│   │   │   │   └── ...
│   │   │   ├── 01-ui-skills-dot-com
│   │   │   │   └── ...
│   │   │   ├── pr-comment-resolver
│   │   │   │   └── ...
│   │   │   ├── use-ai-sdk
│   │   │   │   └── ...
│   │   │   ├── verify
│   │   │   │   └── ...
│   │   │   ├── wf-develop
│   │   │   │   └── ...
│   │   │   └── wf-ralph
│   │   │       └── ...
│   │   ├── 05-review
│   │   │   ├── agent-native-architecture
│   │   │   │   └── ...
│   │   │   ├── agent-native-reviewer
│   │   │   │   └── ...
│   │   │   ├── architecture-strategist
│   │   │   │   └── ...
│   │   │   ├── code-simplicity-reviewer
│   │   │   │   └── ...
│   │   │   ├── data-integrity-guardian
│   │   │   │   └── ...
│   │   │   ├── data-migration-expert
│   │   │   │   └── ...
│   │   │   ├── git-history-analyzer
│   │   │   │   └── ...
│   │   │   ├── kieran-python-reviewer
│   │   │   │   └── ...
│   │   │   ├── kieran-typescript-reviewer
│   │   │   │   └── ...
│   │   │   ├── pattern-recognition-specialist
│   │   │   │   └── ...
│   │   │   ├── performance-oracle
│   │   │   │   └── ...
│   │   │   ├── security
│   │   │   │   └── ...
│   │   │   ├── security-sentinel
│   │   │   │   └── ...
│   │   │   ├── test-browser
│   │   │   │   └── ...
│   │   │   └── wf-review
│   │   │       └── ...
│   │   ├── 06-release
│   │   │   ├── changelog
│   │   │   │   └── ...
│   │   │   ├── demo-runbook
│   │   │   │   └── ...
│   │   │   ├── deployment-verification-agent
│   │   │   │   └── ...
│   │   │   └── wf-release
│   │   │       └── ...
│   │   ├── 07-compound
│   │   │   └── compound-docs
│   │   │       └── ...
│   │   ├── 10-audit
│   │   │   └── agent-native-audit
│   │   │       └── ...
│   │   └── 98-skill-maintenance
│   │       ├── create-agent-skills
│   │       │   └── ...
│   │       ├── heal-skill
│   │       │   └── ...
│   │       ├── modular-skills-architect
│   │       │   └── ...
│   │       └── skill-creator
│   │           └── ...
│   └── register.json
├── .claude
│   └── skills
├── .gemini
├── .github
│   └── workflows
│       └── fixture-eval-reports.yml
├── scripts
│   ├── db
│   │   └── init.sql
│   ├── fixtures
│   │   ├── lib
│   │   │   ├── args.ts +
│   │   │   ├── csv.ts +
│   │   │   ├── fs.ts +
│   │   │   ├── geometry.ts +
│   │   │   └── snapshot.ts +
│   │   ├── README.md
│   │   ├── assert_citation_integrity.ts +
│   │   ├── assert_row_invariants.ts +
│   │   ├── compare_truth.ts +
│   │   ├── eval.ts +
│   │   ├── export_truth_match.ts +
│   │   ├── seed.ts +
│   │   └── verify_pack_names.ts +
│   ├── ast-grep.sh
│   ├── build.sh
│   ├── install_codex_skills_copy.sh
│   ├── install_git_hooks.sh
│   ├── knip.sh
│   ├── lint.sh
│   ├── test.sh
│   ├── typecheck.sh
│   ├── us001_render_smoke.ts +
│   ├── us002_smoke.ts +
│   └── verify.sh
├── tmp
│   ├── test-browser
│   │   ├── export-exceptions.png
│   │   ├── home.png
│   │   ├── load-demo-pack-after.png
│   │   ├── load-demo-pack.png
│   │   ├── matter-db.png
│   │   ├── matters.png
│   │   └── viewer.png
│   ├── .gitkeep
│   ├── oracle-prompt_arch-drift-security_2026-02-09.md
│   ├── oracle-prompt_arch-drift-security_2026-02-09_concise.md
│   ├── oracle-prompt_arch-drift-security_2026-02-09_concise_code-excerpts.md
│   └── oracle-prompt_arch-drift-security_2026-02-09_concise_evidence.md
├── docker-compose.yml *
├── package.json *
├── .gitignore
├── .sprite
├── AGENTS.md
├── LICENSE
├── README.md
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── ralph


(* denotes selected files)
(+ denotes code-map available)
Config: depth cap 3.
</file_map>
<file_contents>
File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/db.server.ts
```ts
import "server-only";

import postgres from "postgres";

export type Sql = ReturnType<typeof postgres>;

type GlobalDb = typeof globalThis & {
  __orbitalSql?: Sql;
  __orbitalSchemaReady?: Promise<void>;
};

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Some Sprite environments route `localhost` to an IPv6 host that Postgres
    // does not accept by default. Normalise to IPv4 for local/dev.
    if (process.env.NODE_ENV !== "production" && url.includes("@localhost:")) {
      return url.replace("@localhost:", "@127.0.0.1:");
    }
    return url;
  }

  // PoC default for local dev (matches docker-compose.yml).
  if (process.env.NODE_ENV !== "production") {
    return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
  }

  // Important: Next.js evaluates route modules at build time with
  // `NODE_ENV=production`, even when a database is not available/required.
  // Defer the hard failure until the first DB operation is attempted.
  return "";
}

function createThrowingSql(message: string): Sql {
  const err = new Error(message);
  const fn = (() => {
    throw err;
  }) as unknown as Sql;

  return new Proxy(fn, {
    apply() {
      throw err;
    },
    get(_target, prop) {
      // Ensure even helper calls like `sql.json()` fail loudly and consistently.
      if (prop === "unsafe") return createThrowingSql(message);
      return new Proxy(() => {
        throw err;
      }, {
        apply() {
          throw err;
        },
      });
    },
  });
}

function createSql(): Sql {
  const url = databaseUrl();
  if (!url) {
    return createThrowingSql("DATABASE_URL is required in production.");
  }

  return postgres(url, {
    // Keep the pool small; Next dev reloads modules frequently.
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const g = globalThis as GlobalDb;

function getSql(): Sql {
  if (!g.__orbitalSql) g.__orbitalSql = createSql();
  return g.__orbitalSql;
}

// Lazy, build-safe SQL client.
// Next.js may import route modules during `next build` without runtime env vars.
export const sql: Sql = new Proxy((() => {}) as unknown as Sql, {
  apply(_target, _thisArg, argArray) {
    const real = getSql() as unknown as (...args: unknown[]) => unknown;
    return real(...argArray);
  },
  get(_target, prop) {
    const real = getSql() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(real);
    }
    return value;
  },
});

async function ensureSchemaInner(): Promise<void> {
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

  // Minimal chunk substrate to satisfy folder state invariants.
  await sql`
    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      index_version TEXT NOT NULL,
      chunk_index INT NOT NULL,
      page_start INT NULL,
      page_end INT NULL,
      text TEXT NOT NULL,
      metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      text_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (document_id, index_version, chunk_index)
    );
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
      attempt INT NOT NULL DEFAULT 1,
      step_key TEXT NOT NULL,
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

  // Locked citations associated to a report row. In this slice we may emit zero citations.
  await sql`
    CREATE TABLE IF NOT EXISTS citations (
      id TEXT PRIMARY KEY,
      report_row_id TEXT NOT NULL REFERENCES report_rows(id) ON DELETE CASCADE,
      document_id TEXT NOT NULL,
      page_number INT NOT NULL,
      snippet TEXT NOT NULL,
      snippet_hash TEXT NOT NULL,
      polygons_json JSONB NOT NULL,
      locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS citations_report_row_idx
    ON citations(report_row_id);
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

export async function ensureSchema(): Promise<void> {
  if (!g.__orbitalSchemaReady) {
    g.__orbitalSchemaReady = ensureSchemaInner();
  }
  await g.__orbitalSchemaReady;
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/02-features/0002_quick-start-engine/risk-register.md
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

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/ui/Alert.tsx
```tsx
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

export type AlertVariant = "info" | "success" | "warning" | "destructive";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
  title?: ReactNode;
};

export function alertClassName(args?: { variant?: AlertVariant; className?: string }) {
  const variant = args?.variant ?? "info";
  return cn(
    "flex gap-3 items-start rounded-ui-md border p-4 text-sm",
    variant === "success"
      ? "bg-success/[0.06] border-success/20"
      : variant === "warning"
        ? "bg-warning/[0.06] border-warning/20"
        : variant === "destructive"
          ? "bg-destructive/[0.06] border-destructive/20"
          : "bg-info/[0.06] border-info/20",
    args?.className,
  );
}

export function Alert({ className, variant, title, children, ...props }: AlertProps) {
  return (
    <div className={alertClassName({ variant, className })} role="alert" {...props}>
      <div>
        {title ? <div className="font-semibold">{title}</div> : null}
        {children ? <div className={cn(title && "mt-1", "text-xs text-muted-foreground")}>{children}</div> : null}
      </div>
    </div>
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(api)/citations/[id]/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { assertDevOnlyApi } from "../../../../lib/devOnlyApi.server";
import { listSeededPackIds, loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  // Keep IDs intentionally constrained so we can safely validate and fail closed.
  // Fixture seed IDs look like: cit_TS-04_1, cit_TB_BAD_1
  id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^cit_[a-z0-9_-]+$/i, "Invalid citation id"),
});

const QuerySchema = z.object({
  // Optional escape hatch for dev seed data where multiple packs may share ids.
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i)
    .optional(),
});

function findCitationInSeedSnapshots(args: {
  citationId: string;
  packId?: string;
}):
  | { ok: true; citation: { document_id: string; page_number: number; polygons: unknown; snippet: string; snippet_hash: string } }
  | { ok: false; code: "NOT_FOUND" | "CONFLICT" | "INTERNAL"; message: string; details?: unknown } {
  const packIds = args.packId ? [args.packId] : listSeededPackIds();
  const hits: Array<{
    pack_id: string;
    citation: {
      document_id: string;
      page_number: number;
      polygons: unknown;
      snippet: string;
      snippet_hash: string;
    };
  }> = [];

  for (const packId of packIds) {
    let snapshot: ReturnType<typeof loadSeedSnapshot> | null;
    try {
      snapshot = loadSeedSnapshot(packId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("loadSeedSnapshot failed", {
        packId,
        message: err instanceof Error ? err.message : String(err),
      });
      return { ok: false, code: "INTERNAL", message: "Failed to load seed snapshot." };
    }
    if (!snapshot) continue;

    const cit = snapshot.citations?.[args.citationId];
    if (!cit) continue;

    hits.push({
      pack_id: packId,
      citation: {
        document_id: cit.document_id,
        page_number: cit.page_number,
        polygons: cit.polygons,
        snippet: cit.snippet,
        snippet_hash: cit.snippet_hash,
      },
    });
  }

  if (hits.length === 0) return { ok: false, code: "NOT_FOUND", message: "Citation not found." };
  if (hits.length > 1) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "Citation id is ambiguous across seeded packs.",
      details: { packs: hits.map((h) => h.pack_id) },
    };
  }

  return { ok: true, citation: hits[0]!.citation };
}

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

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

  const url = new URL(req.url);
  const parsedQuery = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsedQuery.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsedQuery.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const citationId = parsedParams.data.id;

  const found = findCitationInSeedSnapshots({ citationId, packId: parsedQuery.data.pack });
  if (!found.ok) {
    const status =
      found.code === "NOT_FOUND" ? 404 : found.code === "CONFLICT" ? 409 : found.code === "INTERNAL" ? 500 : 500;
    return Response.json(
      safeErrorEnvelope({
        code: found.code,
        message: found.message,
        details: found.details,
        traceId,
      }),
      { status, headers },
    );
  }

  return Response.json(
    {
      citation: {
        id: citationId,
        document_id: found.citation.document_id,
        page_number: found.citation.page_number,
        polygons: found.citation.polygons,
        snippet: found.citation.snippet,
        snippet_hash: found.citation.snippet_hash,
      },
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/packages/core/src/geometry/mapToViewport.ts
```ts
import type { NormPolygons } from "./anchors";

export type ViewBox = readonly [xMin: number, yMin: number, xMax: number, yMax: number];

export type CssPoint = readonly [x: number, y: number];
export type CssPolygon = readonly CssPoint[];
export type CssPolygons = readonly CssPolygon[];

export interface PdfJsViewportLike {
  readonly width: number;
  readonly height: number;
  convertToViewportPoint(xPdf: number, yPdf: number): [number, number];
}

export function mapNormPointToPdfPoint(point: readonly [number, number], viewBox: ViewBox): [number, number] {
  const [xNorm, yNorm] = point;
  const [xMin, yMin, xMax, yMax] = viewBox;

  const xPdf = xMin + xNorm * (xMax - xMin);
  const yPdf = yMax - yNorm * (yMax - yMin);

  return [xPdf, yPdf];
}

export function mapNormPolygonsToViewportCss(args: {
  polygons: NormPolygons;
  viewBox: ViewBox;
  viewport: PdfJsViewportLike;
}): CssPolygons {
  const { polygons, viewBox, viewport } = args;

  return polygons.map((poly) =>
    poly.map((p) => {
      const [xPdf, yPdf] = mapNormPointToPdfPoint(p, viewBox);
      const [xCss, yCss] = viewport.convertToViewportPoint(xPdf, yPdf);
      return [xCss, yCss] as const;
    }),
  );
}

export function bboxFromCssPolygons(polygons: CssPolygons): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  let points = 0;
  for (const poly of polygons) {
    for (const [x, y] of poly) {
      points += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (points === 0) return null;

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/packages/core/src/fixtures/fixtureIds.ts
```ts
const PACK_ID_RE = /^pack_\d{2}_[a-z0-9_]+$/i;
const PDF_FILENAME_RE = /^[A-Za-z0-9_-]+\.pdf$/i;
const STEM_RE = /^[A-Za-z0-9_-]+$/;

export function fixtureDocumentId(args: { packId: string; filename: string }): string {
  const packId = args.packId.trim();
  if (!PACK_ID_RE.test(packId)) throw new Error("INVALID_PACK_ID");

  const filename = args.filename.trim();
  if (!PDF_FILENAME_RE.test(filename)) throw new Error("INVALID_PDF_FILENAME");

  const stem = filename.replace(/\.pdf$/i, "");
  if (!STEM_RE.test(stem)) throw new Error("INVALID_PDF_STEM");

  // Fixture docs are addressed via a deterministic id so the viewer can use the
  // canonical /documents/:id/* contract without depending on DB ingestion.
  return `fx_${packId}__${stem}`;
}

export function parseFixtureDocumentId(
  documentId: string,
):
  | { ok: true; packId: string; filename: string; stem: string }
  | { ok: false } {
  if (typeof documentId !== "string") return { ok: false };
  if (!documentId.startsWith("fx_")) return { ok: false };

  const rest = documentId.slice("fx_".length);
  const parts = rest.split("__");
  if (parts.length !== 2) return { ok: false };

  const [packId, stem] = parts;
  if (!packId || !PACK_ID_RE.test(packId)) return { ok: false };
  if (!stem || !STEM_RE.test(stem)) return { ok: false };

  return { ok: true, packId, stem, filename: `${stem}.pdf` };
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/ids.ts
```ts
import { randomUUID } from "node:crypto";

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/packages/core/src/server.ts
```ts
export * from "./citations/snippet";
export * from "./verify/verifier";


```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(app)/matters/actions.ts
```ts
"use server";

import { z } from "zod";

import { redirect } from "next/navigation";

import { assertDevOnly } from "../../../lib/devOnly";
import { loadSeedSnapshot, saveSeedSnapshot } from "../../../lib/fixtureSeed.server";

const FormSchema = z.object({
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i),
  question_id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_-]+$/),
});

type ReviewErrorCode =
  | "INVALID_REQUEST"
  | "SNAPSHOT_NOT_FOUND"
  | "ROW_NOT_FOUND"
  | "NOT_NEEDS_REVIEW"
  | "NO_LOCKED_CITATIONS";

function toRedirectUrl(args: { pack?: string; reviewed?: string; error?: { code: ReviewErrorCode; qid?: string } }) {
  const params = new URLSearchParams();
  if (args.pack) params.set("pack", args.pack);
  if (args.reviewed) params.set("reviewed", args.reviewed);
  if (args.error) {
    params.set("review_error", args.error.code);
    if (args.error.qid) params.set("qid", args.error.qid);
  }
  const qs = params.toString();
  return qs ? `/matters?${qs}` : "/matters";
}

function fdString(fd: FormData, key: string): string | undefined {
  const val = fd.get(key);
  return typeof val === "string" ? val : undefined;
}

export async function markRowReviewed(formData: FormData): Promise<void> {
  assertDevOnly();

  const parsed = FormSchema.safeParse({
    pack: fdString(formData, "pack"),
    question_id: fdString(formData, "question_id"),
  });
  if (!parsed.success) {
    redirect(toRedirectUrl({ error: { code: "INVALID_REQUEST" } }));
  }

  const packId = parsed.data.pack;
  const questionId = parsed.data.question_id;

  const snapshot = loadSeedSnapshot(packId);
  if (!snapshot) {
    redirect(toRedirectUrl({ pack: packId, error: { code: "SNAPSHOT_NOT_FOUND" } }));
  }

  const row = snapshot.rows.find((r) => r.question_id === questionId);
  if (!row) {
    redirect(toRedirectUrl({ pack: packId, error: { code: "ROW_NOT_FOUND", qid: questionId } }));
  }

  if (row.status !== "needs_review") {
    redirect(toRedirectUrl({ pack: packId, error: { code: "NOT_NEEDS_REVIEW", qid: questionId } }));
  }

  const lockedCount = row.citation_ids.filter((cid) => Boolean(snapshot.citations?.[cid])).length;
  if (lockedCount < 1) {
    redirect(toRedirectUrl({ pack: packId, error: { code: "NO_LOCKED_CITATIONS", qid: questionId } }));
  }

  row.status = "reviewed";
  saveSeedSnapshot(packId, snapshot);
  redirect(toRedirectUrl({ pack: packId, reviewed: questionId }));
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/ui/InlineStatus.tsx
```tsx
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

export type InlineStatusKind = "idle" | "loading" | "success" | "error" | "warning";

export type InlineStatusProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  kind: InlineStatusKind;
  children?: ReactNode;
};

export function InlineStatus({ kind, className, children, ...props }: InlineStatusProps) {
  if (kind === "idle") return null;

  const isError = kind === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "text-xs font-medium",
        kind === "loading" && "text-muted-foreground",
        kind === "success" && "text-success",
        kind === "error" && "text-destructive",
        kind === "warning" && "text-warning",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-operator-checklist.md
```md
# Demo Operator Checklist (2026-02-09)

Goal: keep the live demo smooth and honest. The UI shown is a dev-only demo slice proving the trust substrate.

## Preflight (10 minutes before)

- [ ] Start Postgres (local Docker):

```bash
docker compose up -d db
```

- [ ] Seed fixture packs:

```bash
pnpm fixture:seed pack_01_clean pack_02_missing_rea pack_07_scans_rotated_low_quality pack_09_bad_citation --overwrite
```

- [ ] Start the app in dev mode (required):

```bash
pnpm dev
```

- [ ] Open `http://localhost:3000/matters?pack=pack_01_clean`
- [ ] Open `docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-runbook.html` in a browser tab.
- [ ] Confirm at least one citation chip opens the viewer and renders an overlay (at 100% zoom).
- [ ] Confirm the bad-citation fixture shows `citation_failed` and renders no overlay.
- [ ] Confirm `pack_02_missing_rea` shows a missing-doc checklist on the `missing_input` row.

Optional:
- [ ] Enable CSV export endpoint (so it returns `EXPORT_BLOCKED` vs `404`): set `SPIKES_ENABLED=1` and restart `pnpm dev`.
- [ ] Enable trace export (dev-only): set `FEATURE_TRACE_EXPORT=1` and `ALLOW_ADMIN_BYPASS=1`, then restart `pnpm dev`.

## If something breaks (quick fixes)

- `/matters` is 404:
  - You are not running dev mode. Use `pnpm dev` (not `pnpm start`).
- "No seeded data" banner appears:
  - Rerun `pnpm fixture:seed pack_01_clean --overwrite`.
- Viewer cannot find a PDF:
  - Confirm fixture pack files exist under `docs/08-example-data/<pack_id>/docs/`.
- Citation is `NOT_FOUND`:
  - Seed snapshots may be stale. Rerun `pnpm fixture:seed ... --overwrite`.
- Export CSV shows `NOT_FOUND` / request is 404:
  - The export endpoint is gated. Set `SPIKES_ENABLED=1` and restart `pnpm dev`.
- Export CSV always blocked:
  - That is expected if any row fails verification. Use it as the trust posture moment.

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(api)/demo/load-pack/route.ts
```ts
import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDemoModeEnabledApi } from "../../../../lib/demoMode.server";
import { assertDevOnlyApi } from "../../../../lib/devOnlyApi.server";
import { refreshFolderState } from "../../../../lib/folderState.server";
import { enqueueDocumentIngest } from "../../../../lib/ingest/ingestQueue.server";
import { newId } from "../../../../lib/ids";
import { putObjectWriteOnce, validateStorageKey } from "../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const BodySchema = z.object({
  pack_id: z.enum(["pack_01_clean", "pack_02_missing_rea"]),
});

const PDF_FILENAME_RE = /^[A-Za-z0-9_-]+\.pdf$/i;

function packsRoot(): string {
  // In Next dev, `process.cwd()` resolves to `apps/web`.
  return path.resolve(process.cwd(), "../../docs/08-example-data");
}

function listPackPdfFiles(packId: string): Array<{ filename: string; absPath: string; bytes: number }> {
  const root = packsRoot();
  const packDir = path.resolve(root, packId);
  if (!packDir.startsWith(root + path.sep)) throw new Error("PATH_TRAVERSAL");

  const docsDir = path.resolve(packDir, "docs");
  if (!docsDir.startsWith(packDir + path.sep)) throw new Error("PATH_TRAVERSAL");

  if (!fs.existsSync(docsDir)) return [];

  const entries = fs.readdirSync(docsDir, { withFileTypes: true });
  const pdfs = entries
    .filter((e) => e.isFile() && PDF_FILENAME_RE.test(e.name))
    .map((e) => {
      const absPath = path.join(docsDir, e.name);
      const st = fs.statSync(absPath);
      return { filename: e.name, absPath, bytes: st.size };
    })
    .filter((f) => f.bytes > 0)
    .sort((a, b) => a.filename.localeCompare(b.filename));

  return pdfs;
}

function demoFolderName(packId: string): string {
  const ts = new Date().toISOString().replace(/:/g, "").replace(/\..*$/, "Z");
  return `DEMO: ${packId} ${ts}`;
}

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  const demoGate = assertDemoModeEnabledApi(traceId, headers);
  if (demoGate) return demoGate;

  await ensureSchema();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const packId = parsed.data.pack_id;

  let files: Array<{ filename: string; absPath: string; bytes: number }>;
  try {
    files = listPackPdfFiles(packId);
  } catch {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid pack path.",
        details: { pack_id: packId },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  if (files.length === 0) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Pack docs not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const folderId = newId("fld");
  const folderName = demoFolderName(packId);

  try {
    await sql`
      INSERT INTO folders (id, name, state, latest_index_version, created_at, updated_at)
      VALUES (${folderId}, ${folderName}, 'empty', 'v1', now(), now())
    `;

    const seededDocIds: string[] = [];
    for (const f of files) {
      const documentId = newId("doc");
      const storageKey = `folders/${folderId}/documents/${documentId}.pdf`;
      const keyValid = validateStorageKey(storageKey);
      if (!keyValid.ok) {
        throw new Error("INVALID_STORAGE_KEY");
      }

      await sql`
        INSERT INTO documents (
          id,
          folder_id,
          filename,
          mime,
          bytes,
          storage_key,
          parse_status,
          ocr_status,
          created_at,
          updated_at
        )
        VALUES (
          ${documentId},
          ${folderId},
          ${f.filename},
          'application/pdf',
          ${f.bytes},
          ${storageKey},
          'queued',
          'queued',
          now(),
          now()
        )
      `;

      const bytes = await fs.promises.readFile(f.absPath);
      const result = await putObjectWriteOnce({ storageKey, bytes: new Uint8Array(bytes) });

      await sql`
        UPDATE documents
        SET upload_completed_at = now(),
            sha256 = ${result.sha256},
            updated_at = now()
        WHERE id = ${documentId}
          AND upload_completed_at IS NULL
      `;

      seededDocIds.push(documentId);
    }

    await refreshFolderState(folderId);

    for (const docId of seededDocIds) {
      enqueueDocumentIngest(docId);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("demo.load-pack failed", {
      trace_id: traceId,
      pack_id: packId,
      folder_id: folderId,
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Failed to load demo pack.", traceId }), {
      status: 500,
      headers,
    });
  }

  return Response.json(
    {
      folder: {
        id: folderId,
        name: folderName,
      },
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/ui/Card.tsx
```tsx
import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-ui-lg border border-border bg-card text-card-foreground shadow-ui-sm", className)}
      {...props}
    />
  );
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/03-architecture/05_tech_stack_and_dev_workflow.md
```md
# Tech stack + dev workflow (PoC)

> Note: This document describes the **target** stack and workflows. For what is implemented today, see
> `docs/03-architecture/07_current_poc_runtime.md`.

This doc pins the stack and how we build, run, debug, and regression-test the PoC.

## PoC posture (constraints)
- Single-tenant environment
- PDF-first ingestion (scans are common)
- Trust UX is the product: citations + highlight overlays must work
- Deterministic-ish orchestration (step machine)
- Minimal infra surface area, but production-minded plumbing (jobs, retries, idempotency, traces)

---

## Recommended stack (opinionated)

### Frontend
- Next.js (App Router) for the workspace UI
- Tailwind for styling
- TanStack Table for report table
- pdf.js for PDF rendering + custom highlight overlay layer
  - PDF source must support byte-range requests (Range/Accept-Ranges) for fast page rendering.
  - Signed URLs must allow Range headers and have short TTL. Default to a privacy-first cache posture (e.g. `Cache-Control: private, no-store`) unless we explicitly choose otherwise.

### Backend and orchestration
- Next.js route handlers for HTTP APIs (PoC convenience)
- Workflow DevKit (WDK) for durable orchestration
  - Quick Start runs as a workflow
  - Side effects isolated into steps (OCR, embeddings, LLM calls, DB writes)
  - Supports incremental progress updates

### Workers and queue
- Workflow DevKit Postgres World for durability (backed by Postgres)
- Additional worker processes only where needed (eg OCR/embedding throughput)

### Data and storage
- Postgres for:
  - metadata, runs, steps
  - report rows, citations, artefacts
  - lexical search using tsvector
  - embeddings via pgvector
- Object storage for raw PDFs + exported artefacts
  - Must support Range requests for pdf.js rendering.
  - Signed URL + caching posture must be deliberate (sensitive documents). If we enable caching for performance, prefer `private` and keep TTLs short.

### OCR/layout extraction
PoC default: OCR everything for consistent geometry
- Provider: Azure Document Intelligence or AWS Textract (choose one, wrap it)
- Persist: per-page text + geometry in `document_pages`

### LLM + embeddings
- All model + embeddings calls go through AI SDK (defaulting to Vercel AI Gateway)
- Simple model router (env/config driven):
  - Drafting: fast model
  - Rerank: fast model (or skip early)
  - Verification: integrity-only checks (no verify model in PoC v1; ADR-0017)
  - Vision fallback: only for bad pages if needed
- Model selection is env-driven (eg `LLM_MODEL_CHAT`, `LLM_MODEL_SUMMARY`, `EMBED_MODEL`)
- Prompt versioning stored in git and stamped into runs (`agent_bundle_version`)

---

## LLM + embeddings (AI SDK)

We should treat the **AI SDK** as the only “public API” for model calls in this repo.
No direct provider SDKs sprinkled around (OpenAI SDK, Anthropic SDK, etc) unless we have a very specific reason.

Why this is the default
- One interface for:
  - streaming UI (Next.js route handlers)
  - background/durable workflow steps (worker)
- Easy provider swaps (gateway, direct provider, self-hosted proxy later)
- Keeps auth + retries + observability patterns consistent

### What we use

Packages
- `ai` (AI SDK core, includes the default Vercel AI Gateway provider)
- `@ai-sdk/react` (UI hooks like `useChat`)
- `zod` (tool input schemas, structured validation)

Install
```bash
pnpm add ai @ai-sdk/react zod
```

Optional (only when we intentionally go direct to OpenAI instead of the gateway)

```bash
pnpm add @ai-sdk/openai
```

### Runtime placement (important)

* Vercel “web”

  * Next.js App Router UI
  * Route handlers for streaming UX (chat, explain, etc)
  * Avoid long-running or retry-heavy side effects here

* Hetzner worker

  * Runs WDK steps for OCR / embeddings / LLM calls as side effects
  * Same AI SDK calls as Vercel, but wrapped in durable steps with idempotency

### Auth + env vars

Minimum contract (works locally, on Vercel, and on Hetzner)

* `AI_GATEWAY_API_KEY=...`

Notes

* If deployed on Vercel, the gateway provider can also auth via OIDC automatically (no API key required).
* Local dev with OIDC is fiddly unless you use `vercel dev` (tokens expire and need refresh). For this PoC, the simplest path is: just set `AI_GATEWAY_API_KEY` everywhere.
* Footgun: if `AI_GATEWAY_API_KEY` is present, it’s used even if it’s invalid. So don’t leave a stale key lying around.

Suggested model config (strings are examples, pick from gateway model list)

* `LLM_MODEL_CHAT=anthropic/claude-sonnet-4.5`
* `LLM_MODEL_SUMMARY=openai/gpt-5`
* `EMBED_MODEL=openai/text-embedding-3-large` (or whatever we standardise on)

### “one way to do it” code patterns

#### 1) Streaming chat route (Vercel web)

`apps/web/app/api/chat/route.ts`

```ts
import { streamText, UIMessage, convertToModelMessages } from 'ai';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    // Prefer model ids stored in env vars, this is an example:
    model: process.env.LLM_MODEL_CHAT ?? 'anthropic/claude-sonnet-4.5',
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

#### 2) Chat UI hook (client)

```tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat(); // defaults to POST /api/chat

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        sendMessage({ text: input });
        setInput('');
      }}
    >
      <input value={input} onChange={e => setInput(e.currentTarget.value)} />
      <div>
        {messages.map(m => (
          <div key={m.id}>
            <strong>{m.role}:</strong>
            {m.parts.map((p, i) => (p.type === 'text' ? <div key={i}>{p.text}</div> : null))}
          </div>
        ))}
      </div>
    </form>
  );
}
```

#### 3) Worker-safe calls (WDK step body)

Rule: worker calls happen inside durable steps.
We add tracing metadata so we can correlate “this model call” to “this workflow step”.

```ts
import { generateText } from 'ai';

export async function runLlmStep(opts: {
  prompt: string;
  workflowRunId: string;
  stepId: string;
}) {
  const result = await generateText({
    model: process.env.LLM_MODEL_SUMMARY ?? 'openai/gpt-5',
    prompt: opts.prompt,
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'wdk.step.llm',
      metadata: {
        workflowRunId: opts.workflowRunId,
        stepId: opts.stepId,
      },
    },
  });

  return { text: result.text, usage: result.usage };
}
```

### Observability

We should enable AI SDK telemetry on:

* worker steps (always)
* web routes (only where it helps, and watch PII)

Notes

* `experimental_telemetry` is opt-in per call.
* If prompts or doc text can contain sensitive info, consider `recordInputs: false` / `recordOutputs: false`.

### Model discovery (dev only)

If you don’t know model ids available via the gateway, you can programmatically list them:

```ts
import { gateway } from 'ai';

const availableModels = await gateway.getAvailableModels();
availableModels.models.forEach(m => console.log(m.id));
```

### Sources

* AI SDK Next.js App Router quickstart

  * [https://ai-sdk.dev/docs/getting-started/nextjs-app-router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)
* AI Gateway provider behaviour (env vars, OIDC, model discovery)

  * [https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway](https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway)
* Telemetry docs (`experimental_telemetry`)

  * [https://ai-sdk.dev/docs/ai-sdk-core/telemetry](https://ai-sdk.dev/docs/ai-sdk-core/telemetry)
* Vercel AI Gateway docs (overview)

  * [https://vercel.com/docs/ai-gateway](https://vercel.com/docs/ai-gateway)

---

## Dev workflow (how to run locally)

### Local services
- Postgres (docker compose mode or Sprite mode)
- Redis only if you introduce a separate queue outside WDK (prefer not)
- Object storage:
  - local filesystem in dev (if acceptable)
  - or MinIO as an S3-compatible local bucket

### Core commands (fixture-driven)
Synthetic packs are first-class fixtures. Current scripts:

- `pnpm fixture:seed pack_01_clean`
- `pnpm fixtures:verify-pack-names`
- `pnpm fixtures:assert-row-invariants -- --snapshot <snapshot.json>`
- `pnpm fixtures:compare-truth -- --snapshot <snapshot.json>` (auto mode compares datasets present in the snapshot)
- `pnpm verify` (runs `scripts/verify.sh`)

Planned commands (not wired yet):

- `pnpm fixture:ingest pack_01_clean`
- `pnpm fixture:run pack_01_clean`
- `pnpm fixture:eval pack_01_clean`
- `pnpm fixture:eval:all`
- `pnpm demo:smoke` (ingest + run + eval summary for 1–2 packs)

### What “demo:smoke” must prove
- Run completes on `pack_01_clean`
- Missing-doc flow triggers on `pack_02_missing_rea`
- At least one deliberate bad citation triggers `citation_failed`
- Citation chips open the viewer and highlight evidence

---

## Repo layout (suggested)
```
/apps/web
  /app
  /components
  /viewer (pdf.js + highlight overlay)
  /api (route handlers)
  /workflows (WDK workflow entrypoints)
  /steps (WDK step implementations)

/packages/core
  /schemas (zod JSON contracts)
  /retrieval (hybrid search + rerank)
  /citations (locking + hashing)
  /prompts (drafter/verifier prompts)
  /evals (fixture-based checks)

/docs/03-architecture
/docs/04-projects (shaping dossiers)
```

---

## Guardrails (must exist)
- Schema validation on every drafted row JSON (hard gate)
- Citation locking (chunk_id → snippet/hash/geometry) before verification
- Integrity checks fail-closed by default (ADR-0017; no verify model in PoC v1)
- Row statuses persisted and visible (no silent failures)
- “Not found in provided documents.” is a valid output, tracked as `missing_input`

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/demoMode.server.ts
```ts
import "server-only";

import { safeErrorEnvelope } from "@legaltech-poc/core";

export function isDemoModeEnabled(): boolean {
  // Demo tooling must remain dev-only even if someone mistakenly enables the flag elsewhere.
  if (process.env.NODE_ENV !== "development") return false;
  return process.env.DEMO_MODE === "1";
}

export function assertDemoModeEnabledApi(traceId: string, headers: Headers): Response | null {
  if (isDemoModeEnabled()) return null;
  return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Demo mode is disabled.", traceId }), {
    status: 403,
    headers,
  });
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(app)/matters/[id]/page.tsx
```tsx
import { z } from "zod";

import Link from "next/link";

import { assertDevOnly } from "../../../../lib/devOnly";
import { ensureSchema, sql } from "../../../../lib/db.server";
import { createSignedGetHeaders, validateStorageKey } from "../../../../lib/objectStore.server";

import { ArtefactsList } from "../ArtefactsList";
import { ExportCsvButton } from "../ExportCsvButton";

import { ExportMemoButton } from "./ExportMemoButton";
import { QuickStartPanel } from "./QuickStartPanel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

type FolderRow = {
  id: string;
  name: string;
  state: string;
  latest_index_version: string;
  created_at: Date;
  updated_at: Date;
};

type DocRow = {
  id: string;
  filename: string;
  storage_key: string | null;
  upload_completed_at: Date | null;
  parse_status: string;
  ocr_status: string;
  page_count: number | null;
  extraction_quality: number | null;
  error_json: unknown | null;
  created_at: Date;
};

type RunSummaryRow = {
  id: string;
  state: string;
  questions_total: number;
  questions_done: number;
  created_at: Date;
  updated_at: Date;
};

function renderUrl(doc: DocRow): string | null {
  if (!doc.storage_key || !doc.upload_completed_at) return null;
  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) return null;

  const signed = createSignedGetHeaders({ storageKey: doc.storage_key });
  return `/documents/${encodeURIComponent(doc.id)}/pdf?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
  }).toString()}`;
}

export default async function MatterPage(props: { params: Promise<Record<string, string | string[] | undefined>> }) {
  assertDevOnly();

  const rawParams = await props.params;
  const parsed = ParamsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold">Matter</h1>
        <p className="mt-2 text-sm text-destructive">Invalid route params.</p>
      </main>
    );
  }

  await ensureSchema();

  const folderId = parsed.data.id;
  const folders = await sql<FolderRow[]>`
    SELECT id, name, state, latest_index_version, created_at, updated_at
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = folders[0] ?? null;
  if (!folder) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold">Matter</h1>
        <p className="mt-2 text-sm text-muted-foreground">Matter not found.</p>
      </main>
    );
  }

  const docs = await sql<DocRow[]>`
    SELECT id, filename, storage_key, upload_completed_at, parse_status, ocr_status, page_count, extraction_quality, error_json, created_at
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at ASC
  `;

  const runs = await sql<RunSummaryRow[]>`
    SELECT id, state, questions_total, questions_done, created_at, updated_at
    FROM runs
    WHERE folder_id = ${folderId}
      AND type = 'quick_start_title_survey'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const latestRun = runs[0] ?? null;

  const artefactsListEnabled = process.env.FEATURE_ARTEFACTS_LIST === "1";
  const completedRunId = latestRun?.state === "completed" ? latestRun.id : null;

  const runnable = folder.state === "indexed" || folder.state === "ready";
  let quickStartDisabledReason: string | null = null;
  if (latestRun) {
    quickStartDisabledReason =
      "Quick Start already started for this matter. Load the pack again to create a fresh matter (no cleanup).";
  } else if (!runnable) {
    quickStartDisabledReason = `Quick Start is disabled until the matter is indexed/ready (current state: ${folder.state}). Refresh in a moment.`;
  }

  const unsafeOverrideEnabled =
    process.env.DEMO_MODE === "1" &&
    process.env.ALLOW_UNSAFE_EXPORTS === "1" &&
    Boolean(process.env.ORBITAL_ADMIN_TOKEN?.trim());

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Matter</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {folder.id}
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span className="font-medium text-foreground">{folder.name}</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/60">
              {folder.state}
            </span>
          </div>
        </div>

        <Link className="text-xs font-medium text-muted-foreground underline hover:text-foreground" href="/matters">
          Back to matters
        </Link>
      </div>

      <section className="mt-6 rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="text-sm font-semibold text-foreground">Seeded documents</div>
        <p className="mt-1 text-xs text-muted-foreground">
          This matter was created by the demo pack loader. Documents ingest in the background.
        </p>

        {docs.length === 0 ? (
          <div className="mt-4 text-sm text-muted-foreground">No documents.</div>
        ) : (
          <div className="mt-4 grid gap-2">
            {docs.map((d) => {
              const url = renderUrl(d);
              const ingest = `${d.parse_status}/${d.ocr_status}`;
              return (
                <div key={d.id} className="rounded-ui-md border border-border bg-muted p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="rounded-ui-sm bg-foreground px-2 py-0.5 font-mono text-xs text-background">
                        {d.id}
                      </div>
                      <div className="text-sm font-medium text-foreground">{d.filename}</div>
                      <div className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/60">
                        {ingest}
                      </div>
                      {typeof d.extraction_quality === "number" ? (
                        <div className="text-xs text-muted-foreground">
                          quality: {Math.round(d.extraction_quality * 100)}%
                        </div>
                      ) : null}
                      {typeof d.page_count === "number" ? (
                        <div className="text-xs text-muted-foreground">pages: {d.page_count}</div>
                      ) : null}
                    </div>

                    {url ? (
                      <a
                        className="text-xs font-medium text-muted-foreground underline hover:text-foreground"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open PDF
                      </a>
                    ) : (
                      <div className="text-xs text-muted-foreground">PDF not ready</div>
                    )}
                  </div>

                  {d.error_json ? (
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-destructive">
                      {JSON.stringify(d.error_json, null, 2)}
                    </pre>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Quick Start</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Start the Quick Start run for this matter. To run the same demo again, load the pack again to create a
              fresh matter.
            </p>
          </div>

          <QuickStartPanel folderId={folderId} disabledReason={quickStartDisabledReason} />
        </div>

        {latestRun ? (
          <div className="mt-4 grid gap-1 text-xs text-muted-foreground">
            <div>
              latest run: <span className="font-mono">{latestRun.id}</span> ({latestRun.state})
            </div>
            <div>
              progress: {latestRun.questions_done}/{latestRun.questions_total} questions
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                className="underline hover:text-foreground"
                href={`/runs/${encodeURIComponent(latestRun.id)}`}
                target="_blank"
                rel="noreferrer"
              >
                Run JSON
              </a>
              <a
                className="underline hover:text-foreground"
                href={`/folders/${encodeURIComponent(folderId)}/report?${new URLSearchParams({
                  run_id: latestRun.id,
                }).toString()}`}
                target="_blank"
                rel="noreferrer"
              >
                Report JSON
              </a>
            </div>
            <div className="text-xs text-muted-foreground">
              created: {latestRun.created_at.toISOString()} • updated: {latestRun.updated_at.toISOString()}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-xs text-muted-foreground">No Quick Start runs yet.</div>
        )}
      </section>

      <section className="mt-6 rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Exports</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Export a Word memo (.docx) and CSV artefacts for the latest completed run. Exports are disabled until a run
              completes.
            </p>
          </div>

          <div className="grid justify-items-end gap-2">
            <ExportMemoButton
              folderId={folderId}
              runId={latestRun?.id ?? null}
              runState={latestRun?.state ?? null}
              unsafeOverrideEnabled={unsafeOverrideEnabled}
            />
            <div className="flex flex-wrap items-start justify-end gap-2">
              <ExportCsvButton
                folderId={folderId}
                runId={completedRunId}
                kind="requirements_tracker"
                label="Export requirements"
              />
              <ExportCsvButton folderId={folderId} runId={completedRunId} kind="exceptions_table" label="Export exceptions" />
              <ExportCsvButton folderId={folderId} runId={completedRunId} kind="survey_issues" label="Export survey issues" />
            </div>
          </div>
        </div>
      </section>

      {artefactsListEnabled ? (
        <div className="mt-6">
          <ArtefactsList folderId={folderId} />
        </div>
      ) : null}
    </main>
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/packages/core/package.json
```json
{
  "name": "@legaltech-poc/core",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./server": "./src/server.ts",
    "./citations/snippet": "./src/citations/snippet.ts",
    "./fixtures/fixtureIds": "./src/fixtures/fixtureIds.ts",
    "./geometry/anchors": "./src/geometry/anchors.ts",
    "./geometry/mapToViewport": "./src/geometry/mapToViewport.ts",
    "./missing-docs/detectMissingDocs": "./src/missing-docs/detectMissingDocs.ts",
    "./missing-docs/schemas": "./src/missing-docs/schemas.ts",
    "./safe-error": "./src/safe-error.ts",
    "./spikes/rh1.schemas": "./src/spikes/rh1.schemas.ts",
    "./verify/verifier": "./src/verify/verifier.ts",
    "./verify/verifier.schemas": "./src/verify/verifier.schemas.ts"
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "lint": "echo \"(lint skipped)\""
  },
  "dependencies": {
    "ai": "^4.0.0",
    "pdfjs-dist": "^4.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/08-example-data/pack_01_clean/manifest.json
```json
{
  "pack_id": "pack_01_clean",
  "schema_version": "fixture_pack_v1",
  "default_run_type": "quick_start_title_survey",
  "expected_question_set_version": "qs:quick_start_title_survey:v1",
  "documents": [
    {
      "filename": "ALTA_Survey.pdf",
      "role": "alta_survey",
      "layout_file": "layout/ALTA_Survey.layout.json",
      "anchors_file": "layout/ALTA_Survey.anchors.json"
    },
    {
      "filename": "ALTA_Survey_SCANNED.pdf",
      "role": "alta_survey_scanned"
    },
    {
      "filename": "CCRs.pdf",
      "role": "ccrs",
      "layout_file": "layout/CCRs.layout.json",
      "anchors_file": "layout/CCRs.anchors.json"
    },
    {
      "filename": "Ingress_Egress_Easement.pdf",
      "role": "ingress_egress_easement",
      "layout_file": "layout/Ingress_Egress_Easement.layout.json",
      "anchors_file": "layout/Ingress_Egress_Easement.anchors.json"
    },
    {
      "filename": "Legal_Description.docx",
      "role": "legal_description"
    },
    {
      "filename": "Memorandum_of_Lease.pdf",
      "role": "memorandum_of_lease",
      "layout_file": "layout/Memorandum_of_Lease.layout.json",
      "anchors_file": "layout/Memorandum_of_Lease.anchors.json"
    },
    {
      "filename": "REA.pdf",
      "role": "rea",
      "layout_file": "layout/REA.layout.json",
      "anchors_file": "layout/REA.anchors.json"
    },
    {
      "filename": "TitleCommitment.pdf",
      "role": "title_commitment",
      "layout_file": "layout/TitleCommitment.layout.json",
      "anchors_file": "layout/TitleCommitment.anchors.json"
    },
    {
      "filename": "TitleCommitment_SCANNED.pdf",
      "role": "titlecommitment_scanned"
    },
    {
      "filename": "Utility_Easement.pdf",
      "role": "utility_easement",
      "layout_file": "layout/Utility_Easement.layout.json",
      "anchors_file": "layout/Utility_Easement.anchors.json"
    }
  ],
  "layout": {
    "polygon_space": "page_viewbox_norm_v1"
  },
  "truth": {
    "requirements_tracker_csv": "truth/expected_requirements_tracker.csv",
    "exceptions_table_csv": "truth/expected_exceptions_table.csv",
    "survey_issues_csv": "truth/expected_survey_issues.csv",
    "golden_questions_json": "truth/golden_questions.json"
  }
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/devOnly.ts
```ts
import { notFound } from "next/navigation";

export function assertDevOnly(): void {
  if (process.env.NODE_ENV !== "development") notFound();
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(api)/documents/[id]/complete/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { enqueueDocumentIngest } from "../../../../../lib/ingest/ingestQueue.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const BodySchema = z.object({
  storage_key: z.string().min(1),
});

export async function POST(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
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

  const documentId = parsedParams.data.id;
  const docs = await sql<
    Array<{
      id: string;
      storage_key: string | null;
      upload_completed_at: Date | null;
      parse_status: "queued" | "parsing" | "parsed" | "failed";
      ocr_status: "queued" | "running" | "done" | "failed";
    }>
  >`
    SELECT id, storage_key, upload_completed_at, parse_status, ocr_status
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (!doc.storage_key || doc.storage_key !== parsedBody.data.storage_key) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "storage_key did not match document.",
        details: { storage_key: "mismatch" },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  if (!doc.upload_completed_at) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload not completed yet.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (doc.parse_status === "queued" && doc.ocr_status === "queued") {
    enqueueDocumentIngest(documentId);
  }

  return Response.json(
    {
      document: {
        id: doc.id,
        parse_status: doc.parse_status,
        ocr_status: doc.ocr_status,
      },
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/trace.server.ts
```ts
import { newId } from "./ids";

export function createTraceContext(): { traceId: string; headers: Headers } {
  const traceId = newId("trc");
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Trace-Id": traceId,
  });
  return { traceId, headers };
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/02-features/0002_quick-start-engine/specs/failure_ux_copy_v0.md
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

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/globals.css
```css
@import "./tokens.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  height: 100%;
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/ingest/ingestQueue.server.ts
```ts
import "server-only";

import { hashSnippet } from "@legaltech-poc/core/citations/snippet";

import { ensureSchema, sql } from "../db.server";
import { refreshFolderState } from "../folderState.server";
import { newId } from "../ids";
import { readObject } from "../objectStore.server";

type PdfJsTextItem = { str?: string };

type PdfJsPage = {
  getTextContent: () => Promise<{ items: PdfJsTextItem[] }>;
};

type PdfJsDoc = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
};

type PdfJsModule = {
  GlobalWorkerOptions?: { workerSrc?: string };
  getDocument: (opts: { data: Uint8Array }) => { promise: Promise<PdfJsDoc> };
};

// Defensive caps: this ingest path runs in-process and writes extracted text into Postgres.
const MAX_PAGES = 200;
const MAX_TEXT_CHARS_PER_PAGE = 50_000;
const MAX_TOTAL_TEXT_CHARS = 2_000_000;

let pdfjsPromise: Promise<PdfJsModule> | null = null;
let pdfjsConfigured = false;

async function loadPdfjs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs") as unknown as Promise<PdfJsModule>;
  }
  const pdfjs = await pdfjsPromise;
  if (!pdfjsConfigured) {
    // Next's server bundler relocates pdf.js files into vendor chunks, breaking
    // the default relative worker import ("./pdf.worker.mjs"). Force a package
    // specifier so Node can resolve it from node_modules at runtime.
    if (pdfjs.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";
    }
    pdfjsConfigured = true;
  }
  return pdfjs;
}

type DocForIngest = {
  id: string;
  folder_id: string;
  storage_key: string | null;
  upload_completed_at: string | null;
  parse_status: "queued" | "parsing" | "parsed" | "failed";
  ocr_status: "queued" | "running" | "done" | "failed";
};

const queue: string[] = [];
const running = new Set<string>();
let draining = false;

export function enqueueDocumentIngest(documentId: string): void {
  if (running.has(documentId)) return;
  if (queue.includes(documentId)) return;
  queue.push(documentId);
  void drain();
}

async function drain(): Promise<void> {
  if (draining) return;
  draining = true;
  try {
    while (queue.length) {
      const next = queue.shift();
      if (!next) continue;
      if (running.has(next)) continue;
      running.add(next);
      try {
        await ingestOne(next);
      } finally {
        running.delete(next);
      }
    }
  } finally {
    draining = false;
  }
}

type SafeErrorJson = { code: string; message: string };

function safeError(code: string, message: string): SafeErrorJson {
  return { code, message };
}

async function failDocument(args: {
  documentId: string;
  folderId: string;
  error: SafeErrorJson;
}): Promise<void> {
  await sql`
    UPDATE documents
    SET parse_status = 'failed',
        ocr_status = 'failed',
        error_json = ${sql.json(args.error)},
        updated_at = now()
    WHERE id = ${args.documentId}
  `;
  await refreshFolderState(args.folderId);
}

async function ingestOne(documentId: string): Promise<void> {
  await ensureSchema();

  const docs = await sql<DocForIngest[]>`
    SELECT id, folder_id, storage_key, upload_completed_at, parse_status, ocr_status
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) return;

  // Idempotency: don't restart successful/failed ingests.
  if (doc.parse_status === "parsed" && doc.ocr_status === "done") return;
  if (doc.parse_status === "failed" || doc.ocr_status === "failed") return;

  if (!doc.storage_key) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("MISSING_STORAGE_KEY", "Document is missing storage_key."),
    });
    return;
  }

  if (!doc.upload_completed_at) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("UPLOAD_NOT_COMPLETE", "Upload has not completed yet."),
    });
    return;
  }

  await sql`
    UPDATE documents
    SET parse_status = 'parsing',
        ocr_status = 'running',
        error_json = NULL,
        updated_at = now()
    WHERE id = ${documentId}
      AND parse_status = 'queued'
      AND ocr_status = 'queued'
  `;
  await refreshFolderState(doc.folder_id);
  // Yield a tiny window so polling UIs can observe progress states.
  await new Promise((r) => setTimeout(r, 150));

  let bytes: Uint8Array;
  try {
    bytes = await readObject(doc.storage_key);
  } catch {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("UPLOAD_MISSING", "Raw PDF not found for storage_key."),
    });
    return;
  }

  const pdfjs = await loadPdfjs();

  let pdf: PdfJsDoc;
  try {
    pdf = await pdfjs.getDocument({ data: bytes }).promise;
  } catch (err) {
    // Server-side only: keep client errors safe, but log detail for debugging.
    // Do not log raw PDF bytes.
    // eslint-disable-next-line no-console
    console.error("pdfjs getDocument failed", {
      documentId,
      message: err instanceof Error ? err.message : String(err),
    });
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("PDF_PARSE_FAILED", "Unable to parse PDF."),
    });
    return;
  }

  const pageCount = typeof pdf.numPages === "number" && Number.isFinite(pdf.numPages) ? pdf.numPages : 0;
  if (pageCount <= 0) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("PDF_PAGE_COUNT_INVALID", "Parsed PDF had no pages."),
    });
    return;
  }

  if (pageCount > MAX_PAGES) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("INGEST_TOO_MANY_PAGES", `PDF has too many pages (${pageCount}); max is ${MAX_PAGES}.`),
    });
    return;
  }

  await sql`
    UPDATE documents
    SET parse_status = 'parsed',
        page_count = ${pageCount},
        updated_at = now()
    WHERE id = ${documentId}
  `;
  await refreshFolderState(doc.folder_id);

  type LayoutJson = {
    source: "pdfjs";
    schema_version: "layout_v0";
    has_geometry: boolean;
    item_count: number;
  };

  const pages: Array<{ page_number: number; text: string; layout_json: LayoutJson }> = [];
  let totalChars = 0;
  let remainingChars = MAX_TOTAL_TEXT_CHARS;

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = Array.isArray(content.items) ? content.items : [];
    const rawText = items.map((i) => String(i?.str ?? "")).join(" ").replace(/\s+/g, " ").trim();
    const perPageCapped =
      rawText.length > MAX_TEXT_CHARS_PER_PAGE ? rawText.slice(0, MAX_TEXT_CHARS_PER_PAGE) : rawText;
    const text = remainingChars <= 0 ? "" : perPageCapped.slice(0, remainingChars);
    remainingChars = Math.max(0, remainingChars - text.length);
    totalChars += text.length;
    const layout_json: LayoutJson = {
      source: "pdfjs",
      schema_version: "layout_v0",
      has_geometry: false,
      item_count: items.length,
    };

    pages.push({
      page_number: pageNumber,
      text,
      layout_json,
    });
  }

  const avgCharsPerPage = totalChars / pageCount;
  // Heuristic PoC score: clean, text-heavy PDFs should typically clear the
  // 0.60 "ready" threshold; scans with little/no text should remain low.
  const extractionQuality = Math.max(0, Math.min(1, avgCharsPerPage / 600));
  const extractionQualityMethod = "pdfjs_text_chars_per_page_v2";
  const extractionMethod = "pdfjs";

  const folders = await sql<{ latest_index_version: string }[]>`
    SELECT latest_index_version
    FROM folders
    WHERE id = ${doc.folder_id}
    LIMIT 1
  `;
  const indexVersion = folders[0]?.latest_index_version ?? "v1";

  try {
    await sql.begin(async (tx) => {
      // postgres.js TransactionSql types lose call signatures; cast for tagged template usage.
      const t = tx as unknown as typeof sql;

      await t`DELETE FROM document_pages WHERE document_id = ${documentId}`;
      for (const p of pages) {
        await t`
          INSERT INTO document_pages (id, document_id, page_number, text, layout_json, created_at, updated_at)
          VALUES (
            ${newId("pg")},
            ${documentId},
            ${p.page_number},
            ${p.text},
            ${t.json(p.layout_json)},
            now(),
            now()
          )
        `;
      }

      await t`
        UPDATE documents
        SET ocr_status = 'done',
            extraction_quality = ${extractionQuality},
            metadata_json = metadata_json || ${t.json({
              extraction_method: extractionMethod,
              extraction_has_geometry: false,
              extraction_quality_method: extractionQualityMethod,
            })},
            updated_at = now()
        WHERE id = ${documentId}
      `;

      await t`
        DELETE FROM chunks
        WHERE document_id = ${documentId}
          AND index_version = ${indexVersion}
      `;

      // Minimal chunking: one chunk per page.
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i]!;
        const textHash = hashSnippet(p.text);
        await t`
          INSERT INTO chunks (
            id,
            document_id,
            index_version,
            chunk_index,
            page_start,
            page_end,
            text,
            metadata_json,
            text_hash,
            created_at
          )
          VALUES (
            ${newId("chk")},
            ${documentId},
            ${indexVersion},
            ${i},
            ${p.page_number},
            ${p.page_number},
            ${p.text},
            ${t.json({ page_number: p.page_number })},
            ${textHash},
            now()
          )
        `;
      }
    });
  } catch {
    await sql`
      UPDATE documents
      SET ocr_status = 'failed',
          error_json = ${sql.json(safeError("INGEST_FAILED", "Ingest failed while writing extracted pages."))},
          updated_at = now()
      WHERE id = ${documentId}
    `;
    await refreshFolderState(doc.folder_id);
    return;
  }

  await refreshFolderState(doc.folder_id);
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx
```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  bboxFromCssPolygons,
  mapNormPolygonsToViewportCss,
  type CssPolygons,
  type NormPolygons,
  type PdfJsViewportLike,
  type ViewBox,
} from "@legaltech-poc/core";
import { overlayHighlightPolygonProps } from "../../../../lib/overlayHighlight";
import { validateNormPolygons } from "../../../../lib/validateNormPolygons";

import { Select } from "../../../ui/Input";

type Props = {
  packId: string;
  citationId: string;
  pdfUrl: string;
  documentId: string;
  pageNumber: number;
  polygons: NormPolygons;
  snippet: string;
  snippetHash: string;
  computedSnippetHash: string;
  errorCode: string | null;
};

type PdfRenderTask = {
  promise: Promise<void>;
  cancel?: () => void;
};

type PdfPageLike = {
  rotate?: number;
  view?: unknown;
  getViewport: (args: { scale: number; rotation: number }) => PdfJsViewportLike;
  render: (args: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfJsViewportLike;
    transform?: readonly [number, number, number, number, number, number];
  }) => PdfRenderTask;
};

type PdfDocLike = {
  numPages?: number;
  getPage: (pageNumber: number) => Promise<PdfPageLike>;
};

type PdfJsModule = {
  version?: string;
  GlobalWorkerOptions?: { workerSrc: string };
  getDocument: (opts: { url: string }) => { promise: Promise<PdfDocLike> };
};

function coerceViewBox(view: unknown): ViewBox {
  if (Array.isArray(view) && view.length >= 4) {
    const [xMin, yMin, xMax, yMax] = view;
    if (
      typeof xMin === "number" &&
      Number.isFinite(xMin) &&
      typeof yMin === "number" &&
      Number.isFinite(yMin) &&
      typeof xMax === "number" &&
      Number.isFinite(xMax) &&
      typeof yMax === "number" &&
      Number.isFinite(yMax)
    ) {
      return [xMin, yMin, xMax, yMax] as const;
    }
  }
  throw new Error("INVALID_VIEWBOX");
}

export function CitationViewerClient(props: Props) {
  const [zoomPercent, setZoomPercent] = useState(100);
  const [userRotation, setUserRotation] = useState(0);

  const [pdfjs, setPdfjs] = useState<PdfJsModule | null>(null);
  const [pdf, setPdf] = useState<PdfDocLike | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);

  const [overlay, setOverlay] = useState<CssPolygons>([]);
  const renderTaskRef = useRef<PdfRenderTask | null>(null);

  const [hud, setHud] = useState<{
    pageRotate: number | null;
    totalRotation: number | null;
    viewport: { width: number; height: number } | null;
    overlayBbox: { minX: number; minY: number; maxX: number; maxY: number } | null;
    errorCode: string | null;
    pdfjsVersion: string | null;
  }>({
    pageRotate: null,
    totalRotation: null,
    viewport: null,
    overlayBbox: null,
    errorCode: props.errorCode,
    pdfjsVersion: null,
  });

  const polygonError = validateNormPolygons(props.polygons);
  const highlightActive = props.errorCode === null && polygonError === null;
  const effectiveZoomPercent = highlightActive ? 100 : zoomPercent;

  // Cut: highlight overlays are verified at 100% only. Snap to 100% and
  // disable zoom while highlight is active to avoid accidental drift.
  useEffect(() => {
    if (!highlightActive) return;
    if (zoomPercent !== 100) setZoomPercent(100);
  }, [highlightActive, zoomPercent]);

  // Load pdf.js + PDF
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setPdf(null);
      setPdfPageCount(null);
      setOverlay([]);
      setHud((h) => ({ ...h, errorCode: props.errorCode, viewport: null, overlayBbox: null }));

      const m = (await import("pdfjs-dist/build/pdf.mjs")) as unknown as PdfJsModule;
      if (m.GlobalWorkerOptions) {
        m.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
      }

      const loadingTask = m.getDocument({ url: props.pdfUrl });
      const loadedPdf = await loadingTask.promise;
      if (cancelled) return;

      setPdfjs(m);
      setPdf(loadedPdf);
      setPdfPageCount(typeof loadedPdf.numPages === "number" ? loadedPdf.numPages : null);
      setHud((h) => ({ ...h, pdfjsVersion: m.version ?? null }));
    }

    run().catch((err) => {
      if (cancelled) return;
      const message = err instanceof Error ? err.message : String(err);
      setHud((h) => ({ ...h, errorCode: message }));
    });

    return () => {
      cancelled = true;
    };
  }, [props.errorCode, props.pdfUrl]);

  // Render page + overlay
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const canvas = document.getElementById("citation-canvas") as HTMLCanvasElement | null;
      if (!canvas || !pdf || !pdfjs) return;

      try {
        renderTaskRef.current?.cancel?.();
      } catch {
        // ignore
      }

      const page = await pdf.getPage(props.pageNumber);
      const pageRotate = Number(page.rotate ?? 0);
      const totalRotation = (pageRotate + userRotation) % 360;

      const scale = effectiveZoomPercent / 100;
      const viewport = page.getViewport({ scale, rotation: totalRotation });
      const viewBox = coerceViewBox(page.view);

      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("NO_2D_CONTEXT");

      const transform = dpr !== 1 ? ([dpr, 0, 0, dpr, 0, 0] as const) : undefined;
      const renderTask = page.render({ canvasContext: ctx, viewport, transform });
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      if (props.errorCode) {
        setOverlay([]);
        setHud((h) => ({
          ...h,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          overlayBbox: null,
          errorCode: props.errorCode,
        }));
        return;
      }

      const polyErr = polygonError;
      if (polyErr) {
        setOverlay([]);
        setHud((h) => ({
          ...h,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          overlayBbox: null,
          errorCode: polyErr,
        }));
        return;
      }

      const mapped = mapNormPolygonsToViewportCss({ polygons: props.polygons, viewBox, viewport });
      const bbox = bboxFromCssPolygons(mapped);
      const overlayBbox =
        bbox && Number.isFinite(bbox.minX)
          ? { minX: bbox.minX, minY: bbox.minY, maxX: bbox.maxX, maxY: bbox.maxY }
          : null;

      if (!cancelled) {
        setOverlay(mapped);
        setHud((h) => ({
          ...h,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          overlayBbox,
          errorCode: null,
        }));
      }
    }

    run().catch((err) => {
      setOverlay([]);
      const message = err instanceof Error ? err.message : String(err);
      setHud((h) => ({ ...h, errorCode: message, overlayBbox: null }));
    });

    return () => {
      cancelled = true;
    };
  }, [
    effectiveZoomPercent,
    pdf,
    pdfjs,
    polygonError,
    props.errorCode,
    props.pageNumber,
    props.polygons,
    userRotation,
  ]);

  const overlayPath = useMemo(() => {
    if (!overlay.length) return [];
    return overlay.map((poly) => poly.map(([x, y]) => `${x},${y}`).join(" "));
  }, [overlay]);

  return (
    <div className="grid gap-4">
      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">document_id:</span> {props.documentId}{" "}
              <span className="ml-2 font-medium text-foreground">page:</span> {props.pageNumber}{" "}
              {pdfPageCount ? <span className="text-muted-foreground">(of {pdfPageCount})</span> : null}
            </div>
            <div>
              <span className="font-medium text-foreground">pack:</span> {props.packId}{" "}
              <span className="ml-2 font-medium text-foreground">pdfjs:</span>{" "}
              {hud.pdfjsVersion ?? "(loading)"}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Zoom</span>
              <Select
                value={effectiveZoomPercent}
                disabled={highlightActive}
                onChange={(e) => setZoomPercent(Number(e.currentTarget.value))}
              >
                {[75, 100, 125, 150].map((z) => (
                  <option key={z} value={z}>
                    {z}%
                  </option>
                ))}
              </Select>
              {highlightActive ? (
                <span className="text-xs text-muted-foreground">Locked to 100% while highlighting</span>
              ) : null}
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Rotation</span>
              <Select
                value={userRotation}
                onChange={(e) => setUserRotation(Number(e.currentTarget.value))}
              >
                {[0, 90, 180, 270].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="text-xs text-muted-foreground">snippet</div>
          <pre className="overflow-auto rounded-ui-md bg-foreground p-3 font-mono text-xs text-background">
            {props.snippet}
          </pre>

          <div className="grid gap-1 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">snippet_hash:</span>{" "}
              <span className="font-mono">{props.snippetHash}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">computed:</span>{" "}
              <span className="font-mono">{props.computedSnippetHash}</span>
            </div>
          </div>

          {hud.errorCode ? (
            <div className="rounded-ui-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <div className="font-semibold">citation_failed</div>
              <div className="mt-1 text-xs">reason_code: {hud.errorCode}</div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="text-sm text-muted-foreground">PDF + highlight overlay</div>
        <div className="relative mt-3 inline-block overflow-auto rounded-ui-md border border-border bg-muted p-2">
          <div className="relative">
            <canvas id="citation-canvas" className="block" />

            {hud.errorCode ? (
              <div className="absolute inset-0 grid place-items-center bg-background/80 p-6 text-center">
                <div>
                  <div className="text-sm font-semibold text-foreground">citation_failed</div>
                  <div className="mt-1 text-xs text-muted-foreground">reason_code: {hud.errorCode}</div>
                </div>
              </div>
            ) : (
              <svg
                className="absolute left-0 top-0"
                width={hud.viewport?.width ?? 0}
                height={hud.viewport?.height ?? 0}
                viewBox={`0 0 ${hud.viewport?.width ?? 0} ${hud.viewport?.height ?? 0}`}
              >
                {overlayPath.map((points, idx) => (
                  <polygon
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    points={points}
                    {...overlayHighlightPolygonProps}
                  />
                ))}
              </svg>
            )}
          </div>
        </div>

        {hud.overlayBbox ? (
          <div className="mt-3 text-xs text-muted-foreground">
            overlay bbox:{" "}
            <span className="font-mono">
              {`{minX:${Math.round(hud.overlayBbox.minX)}, minY:${Math.round(hud.overlayBbox.minY)}, maxX:${Math.round(
                hud.overlayBbox.maxX,
              )}, maxY:${Math.round(hud.overlayBbox.maxY)}}`}
            </span>
          </div>
        ) : null}
      </section>
    </div>
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/walkthrough.md
```md
# Walkthrough: Orbital Copilot PoC (Trust Substrate)

Scope: **US only**. This is a dev-only PoC slice to prove a “trust substrate” (evidence locking + verification posture), not a production system.

## The user (and what “better” feels like)

Organisation: US CRE law firm (title + survey diligence).

Buyer: partner / practice lead / ops lead.
Success metric: faster turnaround without increasing miss risk or liability.

End user: junior associate / paralegal doing first-pass diligence under time pressure.

Job to be done: turn a messy diligence pack (title commitment, exception instruments, survey) into **reviewable work product** a senior can sign off without hunting for evidence.

Starting feelings: rushed, uncertain, “too many tabs”, worried about being wrong.

Desired feelings: confident, clear, faster, fewer guesses, an audit trail when challenged.

Business success outcome (target): reduce first-pass diligence time from hours to **<30 minutes per matter** while keeping **zero uncited material claims** in outputs (measured on fixture packs first, then pilot matters).

## The problem (why the status quo fails)

CRE diligence is time-sensitive, but a single miss can blow up insurability, lender comfort, or value.

The bottleneck is not drafting prose. It is:
- finding the right clause in messy PDFs
- turning it into artefacts that match the firm’s deliverables
- giving a senior reviewer a fast path to verify evidence without re-reading the whole pack

In practice, the strongest competitor is often “no decision”: teams stick with manual workflows because adopting a tool feels riskier than living with the pain.

## The solution approach (the “trust substrate”)

The PoC is built around one wedge: **make trust checkable in the UI**.

Instead of treating citations as an afterthought (“here are some quotes and page numbers”), we treat evidence as a **first-class object** with explicit integrity properties. This is the core idea:

- Retrieval finds evidence and returns **IDs**, not prose.
- Drafting can reference only those retrieved IDs.
- We then **lock** citations into immutable records with explicit fields: snippet (what we claim the evidence is), `snippet_hash` (tamper/drift detection), and geometry polygons (so the UI can highlight the clause on the page).
- Verification runs before anything is exportable.
- If integrity breaks, we **fail closed** (explicit `citation_failed`, no highlight overlay, export blocked by default).
- If evidence is missing, that is a first-class outcome (`missing_input` with a checklist), not “best effort”.

Two IDs matter (and it is intentional):
- `chunk_id`: a retrieval address within a specific `index_version` (useful for ranking, evals, and repeatability, but not stable across reindexing).
- `citation_id`: an immutable evidence “receipt” created by the lock step (stores snippet + hash + geometry and stays stable even if chunking/indexing changes later).

Why start here (instead of “full automation”)?
- In high-stakes workflows, a fluent answer with weak provenance creates **false trust**.
- If the trust moment is not solid, everything downstream is noise.
- Evidence locking + fail-closed verification gives you a stable spine to build larger workflows on top of (more packs, more artefacts, more automation).

What this looks like end-to-end (conceptually):
- Ingestion: OCR/layout (for geometry) -> deterministic chunking -> hybrid index
- Run: retrieve chunk IDs -> draft row -> lock citations -> verify integrity -> write row status + artefacts
- UI: citation chips -> viewer -> click-to-highlight overlay (at 100% zoom) -> explicit row status

In this demo slice, the UI is driven by **fixture-seeded snapshots** so we can prove the trust behaviour deterministically before wiring the full LLM pipeline.

## Solution options considered (and why we did not pick them for v1)

Option: “chat with PDFs” as the product.
Trade-off: great for drafting; weak for defensible work product.
Why not: it optimises for fluent answers, but the diligence workflow needs checkable artefacts and a senior-review path.

Option: best-effort citations (quotes + page numbers) and “warn-but-export”.
Trade-off: fewer hard failures; easier to ship early.
Why not: warnings do not reliably travel with exported artefacts; “plausible but unprovable” output trains users to trust the system at the wrong moment.

Option: fail-open verification (export even if evidence integrity breaks).
Trade-off: fewer blocked exports early; seemingly “more useful”.
Why not: in this domain, a broken trust chain is worse than “not found”.

Option: agent loops (open-ended tools) to “figure it out”.
Trade-off: flexible; can appear more capable.
Why not: side effects and retries become hard to reason about. We prefer a fixed, resumable step pipeline.

Option: semantic verification (entailment/NLI model) in v1.
Trade-off: could catch “evidence exists but claim is wrong”.
Why not (for v1): adds a probabilistic failure surface without fixture-eval confidence; we start with deterministic integrity checks first.

Option: external vector DB / managed RAG service.
Trade-off: can be powerful; reduces some self-hosting work.
Why not (initially): Postgres keeps one source of truth and makes joins (runs/rows/citations/chunks) straightforward; adds less infra for a PoC.

## Key ADRs (decision record)

These are the “keystone” decisions shaping the PoC posture:

- ADR-0001 Evidence-first outputs (lock citation IDs with snippet hashes): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0001_evidence-first-outputs-with-citation-ids-and-locking.md`
- ADR-0002 Verification is fail-closed (blocked-by-default export posture): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0002_verification-is-fail-closed.md`
- ADR-0003 OCR/layout extraction is default for PDFs (geometry-first): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0003_ocr-layout-extraction-is-the-default-for-all-pdfs.md`
- ADR-0004 Hybrid retrieval returns chunk IDs (tsvector + pgvector), not prose: `docs/96-engineering-tutor-learnings/2026-02-08_adr-0004_hybrid-retrieval-returning-chunk-ids-lexical-vector.md`
- ADR-0005 Orchestration is a fixed step pipeline (retrieve -> draft -> lock -> verify -> write): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0005_deterministic-ish-orchestration-via-workflow-devkit-steps.md`
- ADR-0013 LLM + embeddings calls go through AI SDK; gateway default (planned): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0013_llm-embeddings-calls-go-through-ai-sdk-gateway-is-default.md`
- ADR-0015 Deterministic, page-bounded chunking + index versioning: `docs/96-engineering-tutor-learnings/2026-02-08_adr-0015_deterministic-page-bounded-chunking-line-window-v1-index-version-bump-rules.md`
- ADR-0017 Verification v1 is integrity-only (no entailment model): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0017_verification-v1-is-integrity-only-no-entailment-model.md`
- ADR-0020 Overlay verification posture (100% zoom only in v1): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0020_rh2-overlay-is-verified-at-100-zoom-only-in-poc-v1-regression-proof-is-artifact-based.md`

## Tech stack (what exists today vs what is planned)

Implemented in the demo slice:
- Web app: Next.js (App Router) + React + Tailwind: `apps/web/`
- PDF rendering: `pdfjs-dist` + a highlight overlay layer (viewer route): `apps/web/app/(app)/matters/viewer/`
- Validation: Zod at boundaries
- DB dependency: local Postgres via Docker Compose (pgvector image): `docker-compose.yml`
- Fixture seed/eval tooling: TypeScript Node scripts: `scripts/fixtures/`
- Domain logic: `@legaltech-poc/core` (citations, geometry, fixture schemas): `packages/core/`

Planned / architecture intent (not all wired in this UI slice yet):
- Orchestration: Workflow DevKit step runner (durable, retryable steps)
- OCR/layout: Azure Document Intelligence (Layout) behind a provider adapter (swappable to Textract)
- LLM calls: Vercel AI SDK via a gateway/router (for model routing + consistent telemetry); model selection is env-driven (`LLM_MODEL_CHAT`, `LLM_MODEL_SUMMARY`, `EMBED_MODEL`) and the current demo runbook assumes Claude for drafting + `openai/text-embedding-3-large` for embeddings
- Retrieval substrate: Postgres `tsvector` + `pgvector` hybrid retrieval returning chunk IDs

## Design system walkthrough (web app)

The web app uses a small token-driven design system designed for “trust work”:

- Tokens (CSS variables): `apps/web/app/tokens.css`
- Tailwind preset mapping tokens to utilities: `apps/web/tailwind.preset.ts`
- Fonts are loaded in Next `<head>`: `apps/web/app/head.tsx`
- UI primitives: `apps/web/app/ui/Button.tsx`, `apps/web/app/ui/Badge.tsx`, `apps/web/app/ui/Card.tsx`, `apps/web/app/ui/Input.tsx`

Key characteristics:
- Canvas: warm cream in light mode, pure-black dark mode.
- Typography: Inter (UI), Crimson Pro (headings), JetBrains Mono (IDs/citations).
- Colour posture: orange is reserved for high-signal moments; semantic colours are used for status and risk posture.
- Shape: consistent radii (`--radius-*`) and small, quiet shadows (`shadow-ui-*`) to keep focus on evidence.

Where you see it in the demo UI:
- Status chips are explicit and terminal.
- `needs_review` uses warning styling.
- `reviewed` uses success styling.
- `missing_input` is muted and accompanied by a checklist.
- `citation_failed` is destructive and blocks export by default.

## Test/example data (fixture packs)

Fixture packs are the source of truth for deterministic demos and evals:

- Packs live in `docs/08-example-data/<pack_id>/`
- `manifest.json` (required; loaders/evals must read this and must not infer file paths)
- `docs/` (source PDFs)
- `layout/` (anchors/layout JSON for highlight overlays and chunking)
- `truth/` (expected outputs and golden questions)

Seeding uses those packs to generate a snapshot the demo UI can load:
- `pnpm fixture:seed pack_01_clean pack_02_missing_rea pack_07_scans_rotated_low_quality pack_09_bad_citation --overwrite`
- Outputs: `tmp/fixture-seed/<pack_id>/snapshot.json`

## A few end-to-end scenarios (what to show and what “success” looks like)

Setup (dev-only):
- `docker compose up -d db`
- `pnpm fixture:seed pack_01_clean pack_02_missing_rea pack_07_scans_rotated_low_quality pack_09_bad_citation --overwrite`
- `pnpm dev`

Scenario 1: Evidence verification (happy path)
- Open `http://localhost:3000/matters?pack=pack_01_clean`
- Click any `cit_*` chip on a `needs_review` row
- Expected: PDF opens, highlight overlay renders at 100% zoom, snippet + `snippet_hash` are visible
- Optional: mark a row reviewed and confirm the status change is explicit

Scenario 2: Missing document is a first-class outcome
- Open `http://localhost:3000/matters?pack=pack_02_missing_rea`
- Expected: a `missing_input` row with answer exactly `Not found in provided documents.` and a “missing document checklist” showing evidence signals

Scenario 3: Fail-closed citation (integrity break)
- On `pack_01_clean`, find `TB-BAD-CITATION` and click `cit_TB_BAD_1`
- Expected: viewer shows `citation_failed` (e.g. `SNIPPET_HASH_MISMATCH`), renders **no overlay**, and export posture remains blocked by default

Scenario 4: Scans and rotation resilience
- Open `http://localhost:3000/matters?pack=pack_07_scans_rotated_low_quality`
- Expected: viewer remains usable on scan-heavy PDFs; rotation works; highlight either aligns at 100% zoom or fails closed with an explicit reason code

For the full talk track + diagrams, see:
- `docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-script.md`
- `docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-runbook.html`

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/folderState.server.ts
```ts
import "server-only";

import { ensureSchema, sql } from "./db.server";

export type FolderState = "empty" | "ingesting" | "indexed" | "ready" | "failed";

type DocRow = {
  id: string;
  parse_status: "queued" | "parsing" | "parsed" | "failed";
  ocr_status: "queued" | "running" | "done" | "failed";
  page_count: number | null;
  extraction_quality: number | null;
};

export async function deriveFolderState(folderId: string): Promise<FolderState> {
  await ensureSchema();

  const folders = await sql<{ latest_index_version: string }[]>`
    SELECT latest_index_version
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = folders[0];
  if (!folder) throw new Error("FOLDER_NOT_FOUND");

  const docs = await sql<DocRow[]>`
    SELECT id, parse_status, ocr_status, page_count, extraction_quality
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at ASC
  `;

  if (docs.length === 0) return "empty";

  if (docs.some((d) => d.parse_status === "failed" || d.ocr_status === "failed")) return "failed";

  const allTerminalSuccess = docs.every((d) => d.parse_status === "parsed" && d.ocr_status === "done");
  if (!allTerminalSuccess) return "ingesting";

  // All docs ingested; ensure chunks exist for the latest index version.
  const docIds = docs.map((d) => d.id);
  const chunks = await sql<{ document_id: string; n: number }[]>`
    SELECT document_id, count(*)::int AS n
    FROM chunks
    WHERE index_version = ${folder.latest_index_version}
      AND document_id = ANY(${sql.array(docIds)})
    GROUP BY document_id
  `;
  const chunked = new Map(chunks.map((r) => [r.document_id, r.n]));
  if (docIds.some((id) => (chunked.get(id) ?? 0) <= 0)) return "ingesting";

  // Health checks for "ready".
  const meetsQuality = docs.every((d) => (d.extraction_quality ?? 0) >= 0.6);
  if (!meetsQuality) return "indexed";

  const pageCounts = new Map(docs.map((d) => [d.id, d.page_count ?? null]));
  if ([...pageCounts.values()].some((n) => typeof n !== "number" || n <= 0)) return "indexed";

  const pageRows = await sql<{ document_id: string; n: number }[]>`
    SELECT document_id, count(*)::int AS n
    FROM document_pages
    WHERE document_id = ANY(${sql.array(docIds)})
    GROUP BY document_id
  `;
  const pages = new Map(pageRows.map((r) => [r.document_id, r.n]));
  const pagesMatch = docIds.every((id) => {
    const expected = pageCounts.get(id);
    if (typeof expected !== "number" || expected <= 0) return false;
    return (pages.get(id) ?? 0) === expected;
  });

  return pagesMatch ? "ready" : "indexed";
}

export async function refreshFolderState(folderId: string): Promise<FolderState> {
  const state = await deriveFolderState(folderId);
  await sql`
    UPDATE folders
    SET state = ${state}, updated_at = now()
    WHERE id = ${folderId}
  `;
  return state;
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/overlayHighlight.ts
```ts
import type { SVGProps } from "react";

export const overlayHighlightPolygonProps = {
  fill: "rgb(var(--secondary) / 0.35)",
  stroke: "rgb(var(--secondary) / 0.7)",
  strokeWidth: 2,
} satisfies Pick<SVGProps<SVGPolygonElement>, "fill" | "stroke" | "strokeWidth">;


```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/_templates/pack.md
```md
# Pack: <title>

## Purpose

## Context

## Scope

## Constraints

## Assets

## References

## Verification

## Notes

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/_templates/json-prd.schema.json
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PRD",
  "type": "object",
  "required": [
    "project",
    "branchName",
    "description",
    "userStories"
  ],
  "properties": {
    "project": {
      "type": "string",
      "minLength": 1
    },
    "branchName": {
      "type": "string",
      "minLength": 1
    },
    "description": {
      "type": "string"
    },
    "userStories": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "id",
          "title",
          "description",
          "acceptanceCriteria",
          "priority"
        ],
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1
          },
          "title": {
            "type": "string",
            "minLength": 1
          },
          "description": {
            "type": "string",
            "minLength": 1
          },
          "acceptanceCriteria": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "priority": {
            "type": "integer",
            "minimum": 1
          },
          "passes": {
            "type": "boolean"
          },
          "notes": {
            "type": "string"
          }
        },
        "additionalProperties": true
      }
    }
  },
  "additionalProperties": true
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/98-tmp/handoffs/handoff_2026-02-09_10-07-28_demo-setup-runbook-app.md
```md
# Handoff: Demo Setup + Runbook/App Copy

## 1) Scope/status

- Goal: get set up for the demo runbook + operator checklist and remove on-screen “tracer bullet” wording.
- Done:
  - DB started (`docker compose up -d db`) and healthy.
  - Fixture packs seeded into `tmp/fixture-seed/*/snapshot.json`:
    - `pack_01_clean`
    - `pack_02_missing_rea`
    - `pack_07_scans_rotated_low_quality`
    - `pack_09_bad_citation`
  - Dev server started (`pnpm dev`) and demo URLs opened.
  - Copy cleanup: removed “tracer bullet” wording from UI + demo docs.
- Pending (manual demo checks):
  - Click a citation chip and confirm viewer overlay renders at 100% zoom.
  - Confirm bad-citation fixture yields `citation_failed` and no overlay.
  - Confirm `pack_02_missing_rea` shows missing-doc checklist on `missing_input`.

## 2) Working tree

- On `main` (no local commits created).
- `git status -sb` currently shows more changes than just the demo-copy edits. Verify intent before committing anything:

```text
## main...origin/main
 M apps/web/app/(app)/matters/ExportCsvButton.tsx
 M apps/web/app/(app)/matters/ExportTraceButton.tsx
 M apps/web/app/(app)/matters/page.tsx
 M apps/web/app/page.tsx
 M apps/web/app/tokens.css
 M apps/web/app/ui/Button.tsx
 M apps/web/tailwind.preset.ts
 M docs/04-projects/04-refactors/0001_v5-ui-alignment/plan.md
 M docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-operator-checklist.md
 M docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-script.md
?? apps/web/app/ui/Alert.tsx
?? apps/web/app/ui/Chip.tsx
?? apps/web/app/ui/InlineStatus.tsx
?? apps/web/app/ui/Table.tsx
?? docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/walkthrough.md
?? docs/98-tmp/handoffs/handoff_2026-02-09_10-07-28_demo-setup-runbook-app.md
```

- Known-intent edits from this session were only:
  - `apps/web/app/(app)/matters/page.tsx` (copy: “Demo-only UI…”)
  - `apps/web/app/page.tsx` (copy: “Matters: demo UI…”)
  - `docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-operator-checklist.md` (copy cleanup)
  - `docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-script.md` (copy cleanup)
  - plus this handoff note file.

## 3) Branch/PR

- Branch: `main`
- PR: none
- CI: not run

## 4) Running processes

- tmux: none (`tmux ls` empty)
- DB: `docker compose ps db` shows `legaltech-poc-db` healthy, port `5432` mapped.
- Dev server:
  - Started via `pnpm dev` (reachable at `http://localhost:3000`).
  - Note: port `3000` shows a `sprite proxy` listener in `lsof`; avoid fighting it. If the app isn’t responding, just restart `pnpm dev`.

Quick smoke commands:

```bash
curl -I "http://localhost:3000/matters?pack=pack_01_clean"
curl -I "http://localhost:3000/matters?pack=pack_02_missing_rea"
```

## 5) Tests/checks

- Ran:
  - `docker compose up -d db`
  - `pnpm fixture:seed pack_01_clean pack_02_missing_rea pack_07_scans_rotated_low_quality pack_09_bad_citation --overwrite`
  - `pnpm dev`
  - `curl -I` checks on the `/matters` pages
- Not run: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`

## 6) Next steps

1. Decide what to do with the unrelated working-tree changes:
   - `apps/web/app/tokens.css`
   - `docs/04-projects/04-refactors/0001_v5-ui-alignment/plan.md`
2. If committing demo copy cleanup: stage and commit the 4 demo-related files only.
3. Run the operator checklist at `docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-operator-checklist.md` end-to-end and confirm the 3 manual checks above.

## 7) Risks/gotchas

- Demo toolbar (pack loader) is gated behind `DEMO_MODE=1` (dev-only). Without it, use the fixture-seeded `/matters?pack=...` pages.
- Export “unsafe override” is intentionally hard-gated (requires `DEMO_MODE=1`, `ALLOW_UNSAFE_EXPORTS=1`, `ORBITAL_ADMIN_TOKEN`).
- “Chat with documents” is not implemented in the app and is explicitly cut from 0001/0002; don’t promise ChatGPT-style chat in the demo.

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/03-architecture/06_frameworks_agents_rag_evals.md
```md
# Frameworks, agents, RAG, and evals

> Note: This document describes the **target** framework posture. For what is implemented today, see
> `docs/03-architecture/07_current_poc_runtime.md`.

This doc answers:
- why we picked Workflow DevKit for orchestration
- what we do (and do not) use agent frameworks for
- where RAG fits in the system
- how evals are wired in for demo reliability

## Framework selection

### Target for PoC: Workflow DevKit (WDK)
Why:
- Our core requirement is a durable, resumable, deterministic-ish workflow:
  `retrieve → draft → lock → verify → write` per row
- WDK naturally models this with workflows and steps:
  - workflow is the deterministic controller
  - steps encapsulate non-deterministic side effects (OCR, embeddings, LLM calls, DB writes)
- It supports incremental progress which maps to “table populates row-by-row”

Risk:
- WDK is early-stage, so keep integration thin:
  - keep domain logic in `packages/core`
  - treat WDK as orchestration and durability, not as the place where business rules live

### WDK conventions in this repo
WDK is the durable orchestration runtime we refer to as `workflow` in code. It provides:
- a **workflow** function (deterministic controller) that can be resumed/replayed
- **step** functions that perform side effects (OCR, embeddings, LLM calls, DB writes)
- a Postgres-backed “world” for state, retries, and progress events

Conventions we follow (to keep the integration thin and predictable):
- Workflow entrypoints must start with the directive string literal **`"use workflow"`** as the first statement in the async function body.
- Step implementations must start with **`"use step"`** as the first statement in the async function body.
- Workflows do **not** perform side effects directly (no network/LLM/OCR/DB writes). They only call steps and assemble results.
- Steps are responsible for idempotency (safe re-run). Where the provider call cannot be naturally idempotent, store a deterministic idempotency key in `run_steps` and short-circuit on repeats.
- Step inputs/outputs must be JSON-serialisable and validated with Zod schemas from `packages/core/schemas`.

Why the directives matter:
- they make it obvious (in code review) whether a function is allowed to do side effects
- they reduce drift into “free-running agents” by forcing work to be split into explicit steps

See also: `docs/03-architecture/20_state_model.md` (state invariants) and `docs/03-architecture/30_data_model.md` (provenance + replay).

### Alternatives (when you might choose them)
- Mastra: integrated TS framework for agents, workflows, RAG, evals. Strong if you want one unified AI platform.
  - For this PoC, it risks overreach unless you keep Quick Start as a workflow graph rather than agent loops.
- LangGraph.js: good if you want graphs/state machines as the primary abstraction.
  - In our setup WDK already owns orchestration, so LangGraph can become duplicate complexity.
- OpenAI Agents SDK: good for interactive tool-using assistants.
  - For Quick Start we prefer a strict workflow. Agents SDK can still be used later for a chat slice.

---

## Where “agents” fit in this PoC
We keep the 4-agent mental model as a product narrative, but implement it as constrained functions under the workflow’s control.

### Orchestrator (workflow controller)
- Encoded as the WDK workflow
- Loads question set v1
- Runs per-question loop with strict ordering and budgets
- Owns progress and run steps

### Retrieval agent (evidence gatherer)
- Implemented as a step: `retrieve_evidence_step(question_id, filters)`
- Output: chunk IDs + scores + docs_searched

### Drafting agent (row writer)
- Implemented as a step: `draft_row_step(question_id, evidence_chunk_ids)`
- Output: structured row JSON with candidate citations as chunk IDs (not free text)

### Verification agent (citation QA)
- Implemented as a step: `verify_row_step(row_json, locked_citations)`
- Output: pass/fail + reason codes (integrity-only in v1)
- Fail-closed is the default

Research agent:
- Out of scope for PoC (no external web research)
- If needed, implement as a static internal snippet tool, not web browsing

---

## Where RAG fits (end-to-end)
RAG is the engine inside Quick Start. It spans ingestion and runtime.

### Ingestion (creates retrieval substrate)
- OCR/layout extraction → canonical per-page text + geometry
- Chunking → citable chunks with metadata
- Indexing:
  - lexical search via tsvector
  - semantic search via pgvector embeddings

### Runtime (per question)
1) Retrieve: hybrid search + rerank returns chunk IDs (IDs-only contract)
2) Hydrate: resolve chunk IDs → authoritative snippet + hash + geometry
3) Draft: generate row JSON using only hydrated evidence (no free-text citations)
4) Lock citations: map draft citations → locked citation IDs + hashes
5) Verify: deterministic integrity checks (hash + geometry + invariants) (ADR-0017)
6) Write: store report row + citations + status

Key invariant:
- if we cannot retrieve evidence, the system must output “Not found in provided documents.” and set `missing_input`

---

## Evals (fixture-driven, tied to /truth)
Evals are first-class because trust is the product. The synthetic packs allow repeatable regression testing.

### Minimum eval suite
1) Extraction correctness (per pack)
- Requirements count and key fields match `/truth/expected_requirements_tracker.csv`
- Exceptions count and key fields match `/truth/expected_exceptions_table.csv`
- Survey issues match `/truth/expected_survey_issues.csv` (allow “unknown” where designed)

2) Retrieval quality (golden questions)
- Recall@K: do we retrieve the expected chunk/page for each question in `golden_questions.json`?

3) Citation validity
- Code checks:
  - cited page exists
  - polygons exist
  - snippet_hash matches canonical snippet
- Judge checks (eval-only, not part of runtime verification):
  - entailment: snippet supports claim, conservative rubric

4) Failure journeys
- `pack_02_missing_rea` should reliably produce `missing_input` rows with a missing-doc checklist
- at least one deliberately corrupted citation should produce `citation_failed`

### How evals run
- `fixture:eval pack_x` produces:
  - per-pack JSON report with pass/fail and metrics
  - failure taxonomy counts
- `fixture:eval:all` produces a summary table across packs
- CI can start as “report only” then become “gate on thresholds”

---

## What we scaffold vs what must be real
Scaffold early:
- use `/layout/*.anchors.json` for highlighting before OCR geometry is perfect
- seed some rows from `/truth` to validate viewer UX

Must be real early:
- citation object contract and snippet hashing rules
- fail-closed verification and row status transitions
- missing-doc behaviour and explicit “not found” outputs

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/head.tsx
```tsx
/* eslint-disable @next/next/no-page-custom-font */

export default function Head() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
    </>
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/_templates/spike-plan.md
```md
# Spike Plan: <title>

## Goal

## Questions

## Approach

## Constraints

## Timebox

## Deliverables

## Exit Criteria

## Verification

## Links

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(app)/matters/page.tsx
```tsx
import { z } from "zod";

import { ListPayloadV0Schema, MissingDocCandidateSchema } from "@legaltech-poc/core";

import { assertDevOnly } from "../../../lib/devOnly";
import { listSeededPackIds, loadSeedSnapshot } from "../../../lib/fixtureSeed.server";

import { ExportCsvButton } from "./ExportCsvButton";
import { ExportTraceButton } from "./ExportTraceButton";
import { MattersToolbar } from "./MattersToolbar";
import { ArtefactsList } from "./ArtefactsList";
import { markRowReviewed } from "./actions";

import { Badge, type BadgeVariant } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Chip } from "../../ui/Chip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SearchSchema = z.object({
  pack: z
    .string()
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i)
    .optional(),
  reviewed: z.string().min(1).max(200).optional(),
  review_error: z.string().min(1).max(200).optional(),
  qid: z.string().min(1).max(200).optional(),
});

function statusVariant(status: string): BadgeVariant {
  if (status === "reviewed") return "success";
  if (status === "needs_review") return "warning";
  if (status === "citation_failed") return "destructive";
  return "muted";
}

function reviewErrorMessage(code: string): string {
  if (code === "NO_LOCKED_CITATIONS") return "Cannot mark reviewed: row has no locked citations.";
  if (code === "NOT_NEEDS_REVIEW") return "Cannot mark reviewed: only needs_review rows can be reviewed.";
  if (code === "ROW_NOT_FOUND") return "Cannot mark reviewed: row not found.";
  if (code === "SNAPSHOT_NOT_FOUND") return "Cannot mark reviewed: seed snapshot not found.";
  if (code === "INVALID_REQUEST") return "Cannot mark reviewed: invalid request.";
  return "Cannot mark reviewed.";
}

function matchStatusVariant(status: string): BadgeVariant {
  if (status === "matched") return "success";
  if (status === "ambiguous") return "warning";
  return "muted";
}

const MissingDocsProvenanceSchema = z
  .object({
    missing_docs_checklist: z.array(MissingDocCandidateSchema).optional(),
    missing_docs_candidates_low_confidence: z.array(MissingDocCandidateSchema).optional(),
  })
  .passthrough();

function CitationChips(props: {
  packId: string;
  citationIds: string[];
  citations: Record<string, { document_id: string; page_number: number }> | undefined;
}) {
  if (!props.citationIds.length) return <div className="text-xs text-muted-foreground">(no citations)</div>;

  return props.citationIds.map((cid) => {
    const cit = props.citations?.[cid];
    const params = new URLSearchParams({ pack: props.packId, citation: cid });
    if (cit) {
      params.set("document_id", cit.document_id);
      params.set("page", String(cit.page_number));
    }

    return (
      <Chip key={cid} variant="citation" as="a" href={`/matters/viewer?${params.toString()}`}>
        {cid}
      </Chip>
    );
  });
}

function ExceptionsPayload(props: {
  packId: string;
  payload: unknown;
  citations: Record<string, { document_id: string; page_number: number }> | undefined;
}) {
  const parsed = ListPayloadV0Schema.safeParse(props.payload);
  if (!parsed.success) return null;
  if (parsed.data.kind !== "exceptions_table") return null;

  const items = parsed.data.items
    .filter((it) => it.kind === "exceptions_table_item")
    .slice()
    .sort((a, b) => a.bii_item - b.bii_item);

  if (!items.length) return null;

  return (
    <section className="mt-4 rounded-ui-lg border border-border bg-muted p-3">
      <div className="text-sm font-semibold text-foreground">Exceptions table</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Click an item to see its matched instrument PDF and the locked citations used as evidence.
      </p>

      <div className="mt-3 grid gap-2">
        {items.map((it) => (
          <details key={it.item_id} className="rounded-ui-md border border-border bg-card p-3">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {it.item_id}
                </div>
                <div className="text-sm font-medium text-foreground">{it.type}</div>
                <Badge variant={matchStatusVariant(it.match_status)}>{it.match_status}</Badge>
                {it.match_status === "matched" && it.doc ? (
                  <div className="text-xs text-muted-foreground">
                    matched: <span className="font-mono">{it.doc}</span>
                  </div>
                ) : null}
                {it.match_status === "ambiguous" && it.candidates?.length ? (
                  <div className="text-xs text-muted-foreground">candidates: {it.candidates.length}</div>
                ) : null}
              </div>
            </summary>

            <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="font-medium text-foreground">Instrument</span>:{" "}
                  <span className="font-mono">{it.instrument_no ?? "(none)"}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Recorded</span>:{" "}
                  <span className="font-mono">{it.recorded_date ?? "(none)"}</span>
                </div>
              </div>

              {it.match_status === "missing_doc" ? (
                <section className="rounded-ui-md border border-border bg-muted p-3">
                  <div className="font-medium text-foreground">Missing instrument document</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expected filename: <span className="font-mono">{it.doc ?? "(unknown)"}</span>
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                    <li>
                      Request{" "}
                      <span className="font-mono">{it.doc ?? "the instrument PDF"}</span>{" "}
                      from the title company/seller.
                    </li>
                    <li>
                      Confirm the PDF is the full recorded instrument (not a summary) and that the instrument number
                      matches <span className="font-mono">{it.instrument_no ?? "(unknown)"}</span>.
                    </li>
                    <li>Add the missing PDF to the diligence pack, then re-run this workflow.</li>
                  </ul>
                </section>
              ) : null}

              {it.match_status === "ambiguous" && it.candidates?.length ? (
                <div>
                  <div className="font-medium text-foreground">Candidates</div>
                  <ul className="mt-1 list-disc pl-5">
                    {it.candidates.map((c) => (
                      <li key={`${c.doc}:${String(c.instrument_no ?? "")}`}>
                        <span className="font-mono">{c.doc}</span>
                        {c.instrument_no ? (
                          <>
                            <span> (</span>
                            <span className="font-mono">{c.instrument_no}</span>
                            <span>)</span>
                          </>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <div className="font-medium text-foreground">Evidence (locked citations)</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CitationChips
                    packId={props.packId}
                    citationIds={it.citation_ids}
                    citations={props.citations}
                  />
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function MissingDocsChecklist(props: { provenance: unknown }) {
  const parsed = MissingDocsProvenanceSchema.safeParse(props.provenance);
  if (!parsed.success) return null;

  const highConfidence = (parsed.data.missing_docs_checklist ?? []).filter((c) => c.confidence >= 0.8);
  const lowConfidence = (parsed.data.missing_docs_candidates_low_confidence ?? []).filter((c) => c.confidence < 0.8);

  if (!highConfidence.length && !lowConfidence.length) return null;

  return (
    <section className="mt-3 rounded-ui-lg border border-border bg-muted p-3">
      <div className="text-sm font-semibold text-foreground">Missing document checklist</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Use the evidence signals below to request the exact PDF(s), verify the filename, then re-run the workflow.
      </p>

      {highConfidence.length ? (
        <ul className="mt-3 grid gap-2">
          {highConfidence.map((cand) => (
            <li key={cand.label} className="rounded-ui-md border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {cand.label}
                </div>
                <div className="text-xs text-muted-foreground">confidence: {Math.round(cand.confidence * 100)}%</div>
              </div>
              {cand.signals.length ? (
                <div className="mt-2 text-xs text-muted-foreground">
                  <div className="font-medium text-foreground">Evidence signals</div>
                  <ul className="mt-1 list-disc pl-5">
                    {cand.signals.map((s, idx) => (
                      <li key={`${s.type}:${s.value}:${s.source}:${String(s.page ?? "")}:${idx}`}>
                        <span className="font-medium">{s.source}</span>
                        {s.page ? <span> p.{s.page}</span> : null}
                        <span>: </span>
                        <span className="font-mono">
                          {s.type}={JSON.stringify(s.value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="mt-2 text-xs text-muted-foreground">
                <div className="font-medium text-foreground">Checklist</div>
                <ul className="mt-1 list-disc pl-5">
                  <li>
                    Request <span className="font-mono">{cand.label}</span> from the title company/seller.
                  </li>
                  <li>
                    Confirm the file name matches <span className="font-mono">{cand.label}</span> (or adjust to match).
                  </li>
                  <li>Add it to the diligence pack and re-run the workflow.</li>
                </ul>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {lowConfidence.length ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
            Show low-confidence candidates ({lowConfidence.length})
          </summary>
          <ul className="mt-2 grid gap-2">
            {lowConfidence.map((cand) => (
              <li key={cand.label} className="rounded-ui-md border border-border bg-card p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                    {cand.label}
                  </div>
                  <div className="text-xs text-muted-foreground">confidence: {Math.round(cand.confidence * 100)}%</div>
                </div>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

export default async function MattersPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  assertDevOnly();

  const searchParams = (await props.searchParams) ?? {};
  const seeded = listSeededPackIds();
  const parsed = SearchSchema.safeParse(searchParams);
  const selected = parsed.success ? parsed.data.pack : undefined;
  const packId = selected ?? seeded[0] ?? "pack_01_clean";

  const snapshot = loadSeedSnapshot(packId);
  const runId =
    snapshot && typeof snapshot.meta.run_id === "string"
      ? snapshot.meta.run_id
      : null;
  const traceExportEnabled = process.env.FEATURE_TRACE_EXPORT === "1";
  const artefactsListEnabled = process.env.FEATURE_ARTEFACTS_LIST === "1";

  const reviewedQid = parsed.success ? parsed.data.reviewed : undefined;
  const reviewErrorCode = parsed.success ? parsed.data.review_error : undefined;
  const reviewErrorQid = parsed.success ? parsed.data.qid : undefined;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Matters</h1>
      <p className="mt-2 text-muted-foreground">
        Demo-only UI: rows with citation chips that open a PDF viewer + highlight overlay (fail-closed on invalid
        citations).
      </p>

      <div className="mt-6">
        <MattersToolbar packIds={seeded} selectedPackId={packId} />
      </div>

      {reviewErrorCode && !reviewErrorQid ? (
        <section className="mt-6 rounded-ui-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive shadow-ui-sm">
          <div className="font-semibold">Review not saved</div>
          <div className="mt-1 text-xs">{reviewErrorMessage(reviewErrorCode)}</div>
        </section>
      ) : null}

      {!snapshot ? (
        <section className="mt-6 rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
          <div className="text-sm font-medium text-foreground">No seeded data for {packId}</div>
          <p className="mt-2 text-sm text-muted-foreground">Seed it locally, then refresh this page:</p>
          <pre className="mt-3 overflow-auto rounded-ui-md bg-foreground p-3 font-mono text-xs text-background">
            {`pnpm fixture:seed ${packId}`}
          </pre>
        </section>
      ) : (
        <>
          <section className="mt-6 flex flex-wrap items-center gap-3 rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">pack_id:</span> {snapshot.meta.pack_id}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">run_id:</span> {String(snapshot.meta.run_id ?? "(none)")}
            </div>
            <div className="ml-auto flex items-start gap-4">
              <div className="flex flex-wrap items-start justify-end gap-2">
                <ExportCsvButton
                  folderId={packId}
                  runId={runId}
                  kind="requirements_tracker"
                  label="Export requirements"
                />
                <ExportCsvButton folderId={packId} runId={runId} kind="exceptions_table" label="Export exceptions" />
                <ExportCsvButton folderId={packId} runId={runId} kind="survey_issues" label="Export survey issues" />
              </div>
              {traceExportEnabled ? <ExportTraceButton folderId={packId} runId={runId} /> : null}
            </div>
          </section>

          {artefactsListEnabled ? (
            <div className="mt-6">
              <ArtefactsList folderId={packId} />
            </div>
          ) : null}

          <section className="mt-6 grid gap-4">
            {snapshot.rows.map((row) => (
              <div key={row.question_id} className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                    {row.question_id}
                  </div>
                  <div className="text-sm font-semibold text-foreground">{row.question}</div>
                  <Badge variant={statusVariant(row.status)}>{row.status}</Badge>

                  {row.status === "needs_review" ? (
                    <div className="ml-auto flex items-center gap-2">
                      <form action={markRowReviewed}>
                        <input type="hidden" name="pack" value={packId} />
                        <input type="hidden" name="question_id" value={row.question_id} />
                        <Button variant="success" size="sm" type="submit">
                          Mark reviewed
                        </Button>
                      </form>
                    </div>
                  ) : null}
                </div>

                {reviewErrorCode && reviewErrorQid === row.question_id ? (
                  <div className="mt-3 rounded-ui-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <div className="font-semibold">Review not saved</div>
                    <div className="mt-1 text-xs">{reviewErrorMessage(reviewErrorCode)}</div>
                  </div>
                ) : reviewedQid === row.question_id && row.status === "reviewed" ? (
                  <div className="mt-3 rounded-ui-md border border-success/30 bg-success/10 p-3 text-sm text-success">
                    <div className="font-semibold">Saved</div>
                    <div className="mt-1 text-xs">Marked as reviewed.</div>
                  </div>
                ) : null}

                <div className="mt-2 text-sm text-muted-foreground">{row.answer}</div>

                {row.notes ? (
                  <section className="mt-3 rounded-ui-md border border-border bg-muted p-3">
                    <div className="text-xs font-semibold text-foreground">Notes</div>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{row.notes}</pre>
                  </section>
                ) : null}

                {row.payload_schema_version === "list_payload_v0" ? (
                  <ExceptionsPayload
                    packId={packId}
                    payload={(row as { payload_json?: unknown }).payload_json}
                    citations={snapshot.citations}
                  />
                ) : null}

                {row.status === "missing_input" ? (
                  <MissingDocsChecklist provenance={(row as { provenance_json?: unknown }).provenance_json} />
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CitationChips packId={packId} citationIds={row.citation_ids} citations={snapshot.citations} />
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/03-architecture/07_current_poc_runtime.md
```md
# Current PoC Runtime (Implemented Today)

This document describes what is actually implemented in the repo today. It exists to prevent “docs imply WDK/OCR/RAG exists” confusion while the target architecture continues to evolve.

Target architecture docs remain in `docs/03-architecture/*` (e.g. WDK durable steps, OCR/layout geometry, retrieve/draft/lock pipeline). Treat those as **target** unless this doc says a component exists in the current PoC.

## High-level summary

Current PoC is:
- Next.js App Router (`apps/web`) using Node runtime route handlers
- Postgres via `postgres` driver with runtime DDL (`apps/web/lib/db.server.ts`)
- Local filesystem “object store” under `tmp/object-store` (`apps/web/lib/objectStore.server.ts`)
- In-memory “queues” for ingest and quick-start runs (`apps/web/lib/ingest/ingestQueue.server.ts`, `apps/web/lib/quickStartRunQueue.server.ts`)
- PDF extraction via `pdfjs-dist` text extraction (not OCR; no geometry) (`apps/web/lib/ingest/ingestQueue.server.ts`)
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
    INMEM["In-process queues
ingest + quick-start run"]
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
  API --> INMEM
  INMEM --> PG
  INMEM --> FS
  API --> SEED
  PDFV --> API
  PDFV --> FS
```

## What “ingest” means today
- Upload writes the raw PDF to the local FS object store via signed headers.
- Ingest reads the PDF bytes from local FS and extracts per-page text using pdf.js.
- Extracted text is persisted to:
  - `document_pages.text` (per page)
  - `chunks.text` (currently 1 chunk per page)
- Layout/citations geometry is not produced. `document_pages.layout_json.has_geometry = false`.
- `documents.ocr_status` currently represents “extraction done” for this path; extraction method is tracked in `documents.metadata_json`.

Code:
- `apps/web/lib/ingest/ingestQueue.server.ts`
- `apps/web/lib/objectStore.server.ts`

## What “Quick Start run” means today
- Runs are executed via an in-process queue.
- Current run implementation writes placeholder terminal `report_rows` for each question.
- It does not do retrieval, drafting, locking citations, or verification against real data.

Code:
- `apps/web/lib/quickStartRunQueue.server.ts`

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
- No durable orchestration runtime (WDK not implemented).
- No OCR/layout provider and no geometry-backed citations.
- No retrieval/draft/lock pipeline; current runs write placeholder rows.
- “Evidence-first” is implemented for fixture/demo mode, not for real uploaded documents.

If you are implementing features, prefer grounding changes in code reality first (this doc), then updating the target docs as the target evolves.

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/package.json
```json
{
  "name": "@legaltech-poc/web",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@legaltech-poc/core": "workspace:*",
    "docx": "^9.5.1",
    "next": "^15.0.0",
    "pdfjs-dist": "^4.0.0",
    "postgres": "^3.4.8",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/_templates/prd.md
```md
# PRD: <title>

Owner:
Status:
Date:

## Summary

## Problem

## Goals

## Non-goals

## Users

## Solution

## Scope

## Success Metrics

## Risks

## Acceptance Criteria

## Verification Plan

## Open Questions

## Links

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(api)/folders/[id]/documents/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { newId } from "../../../../../lib/ids";
import { createSignedPutHeaders, validateStorageKey } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const InitUploadSchema = z.object({
  filename: z.string().trim().min(1),
  mime: z.literal("application/pdf"),
  bytes: z.number().int().positive(),
});

export async function GET(_req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
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

  const folderId = parsedParams.data.id;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const documents = await sql<
    Array<{
      id: string;
      folder_id: string;
      filename: string;
      parse_status: string;
      ocr_status: string;
      extraction_quality: number | null;
      page_count: number | null;
      error_json: unknown | null;
      created_at: Date;
    }>
  >`
    SELECT id, folder_id, filename, parse_status, ocr_status, extraction_quality, page_count, error_json, created_at
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;

  return Response.json(
    {
      documents: documents.map((d) => ({
        id: d.id,
        folder_id: d.folder_id,
        filename: d.filename,
        parse_status: d.parse_status,
        ocr_status: d.ocr_status,
        extraction_quality: d.extraction_quality,
        page_count: d.page_count,
        error_json: d.error_json,
        created_at: d.created_at.toISOString(),
      })),
    },
    { status: 200, headers },
  );
}

export async function POST(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
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

  const parsedBody = InitUploadSchema.safeParse(body);
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

  const folderId = parsedParams.data.id;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const documentId = newId("doc");
  const storageKey = `folders/${folderId}/documents/${documentId}.pdf`;
  const validKey = validateStorageKey(storageKey);
  if (!validKey.ok) {
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Failed to create storage key.", traceId }), {
      status: 500,
      headers,
    });
  }

  await sql`
    INSERT INTO documents (
      id,
      folder_id,
      filename,
      mime,
      bytes,
      storage_key,
      parse_status,
      ocr_status,
      created_at,
      updated_at
    )
    VALUES (
      ${documentId},
      ${folderId},
      ${parsedBody.data.filename},
      ${parsedBody.data.mime},
      ${parsedBody.data.bytes},
      ${storageKey},
      'queued',
      'queued',
      now(),
      now()
    )
  `;

  const origin = new URL(req.url).origin;
  const signed = createSignedPutHeaders({ storageKey });

  return Response.json(
    {
      document: {
        id: documentId,
        folder_id: folderId,
        filename: parsedBody.data.filename,
        parse_status: "queued",
        ocr_status: "queued",
      },
      upload: {
        storage_key: storageKey,
        url: `${origin}/documents/${documentId}/upload`,
        method: "PUT",
        headers: {
          "Content-Type": parsedBody.data.mime,
          "X-Orbital-Upload-Expires": String(signed.expires_at_ms),
          "X-Orbital-Upload-Signature": signed.signature,
        },
      },
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/safePdfFilename.server.ts
```ts
import "server-only";

const DEFAULT_FILENAME = "document.pdf";

export function safePdfFilename(val: unknown): string {
  if (typeof val !== "string") return DEFAULT_FILENAME;
  const s = val.trim();
  if (!s) return DEFAULT_FILENAME;
  if (s.length > 200) return DEFAULT_FILENAME;
  if (!/^[A-Za-z0-9_.-]+\.pdf$/i.test(s)) return DEFAULT_FILENAME;
  return s;
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/02-features/0001_trust-substrate/risk-register.md
```md
# Risk register (rabbit holes)

Treatments must be one of: `Cut` / `Patch` / `Spike` / `Out-of-bounds`.

| ID | Rabbit hole | Category | Packs to prove | Treatment | Mitigation (concrete) | Status |
|---|---|---|---|---|---|---|
| RH1 | pdf.js performance on scanned/rotated PDFs (page jumps, zoom) | technical | `pack_07_scans_rotated_low_quality` | Spike | Build a minimal viewer + page-jump harness; measure render times; patch with skeletons + progressive rendering if needed. | open |
| RH2 | Highlight overlay coordinate transforms (verified at 100% zoom only) | technical | `pack_01_clean`, `pack_07_scans_rotated_low_quality` | Spike | Pick a single coordinate spec (normalised [0..1], origin top-left) + implement mapping util: norm -> PDF points via page `viewBox` -> `viewport.convertToViewportPoint()`; render overlay in viewport CSS pixels (not canvas backing store). Prove alignment at 100% zoom + rotation + fail-closed cases. Cut: lock citation highlight to 100% zoom (viewer enforces 100% while highlight active). Patch: render+crop “evidence card” instead of live overlay alignment. | open |
| RH3 | Snippet normalisation + stable `snippet_hash` rule works in practice | data | `pack_01_clean` | Spike | Implement canonical `normalise()` exactly per `docs/03-architecture/30_data_model.md` (trim; CRLF->LF; collapse whitespace runs to a single space) and reuse it everywhere (ideally `packages/core`). Validate hash stability across repeated runs with the same source snippet. | open |
| RH4 | Verification avoids false passes at acceptable latency/cost | technical | negative set across `pack_01_clean`, `pack_02_missing_rea` | Spike | PoC v1 is integrity-only (ADR-0017): start with code checks. Future: if entailment is added later, tune for precision-first (0 false passes target) and accept more `citation_failed`. | open |
| RH5 | Missing-doc detection heuristics are reliable (low false positives) | data | `pack_02_missing_rea` vs `pack_01_clean` | Spike | Heuristics: referenced instrument IDs/filenames → docs present; patch with manual confirm UX if heuristics are noisy. | open |
| RH6 | Provenance/log volume and PII risk | security/design | all | Patch | Keep trace schema minimal, safe, and redacted by default; store opaque IDs + hashes, not raw provider payloads. | open |
| RH7 | Storage access pattern for pdf.js (signed URLs vs proxy) | dependency/security | all | Patch | Decide one contract early; prefer signed render URLs (`GET /documents/:id/render?page=N`) and avoid proxying raw PDFs through the app unless needed. | open |
| RH8 | Client/server boundary mistakes with viewer + APIs (Next.js App Router) | architecture | all | Patch | Enforce `client-only`/`server-only` boundaries; viewer is client; APIs validate with Zod and return safe error envelopes. | open |

## Notes
- Per `docs/00-strategy/initiatives/prd-slicing-rules.md`, slice PRDs should not be created until Spike items are closed (or explicitly Cut/Out-of-bounds).
- A draft `prd-overall.md`/`prd-overall.json` overall (spine) PRD can exist pre-spike, but treat it as blocked until spikes are closed and perimeter is re-locked.
- Oracle review is mandatory per Spike (bundle + notes captured in `spike-investigation.md`).

```

File: /Users/marc/Code/personal-projects/legaltech-poc/packages/core/src/missing-docs/detectMissingDocs.ts
```ts
import type { DetectMissingDocsResult, MissingDocCandidate, MissingDocSignal } from "./schemas";

const PHRASE_TO_ACRONYM: ReadonlyArray<[phrase: RegExp, acronym: string]> = [
  [/\bReciprocal\s+Easement\s+Agreement\b/i, "REA"],
];

function filenameTokenSet(filename: string): Set<string> {
  const stem = filename.replace(/\.[^.]+$/, "");
  const tokens = stem.split(/[^A-Za-z0-9]+/g).filter(Boolean);
  return new Set(tokens.map((t) => t.toUpperCase()));
}

export function detectMissingDocs(args: {
  packId: string;
  providedFilenames: string[];
  referenceText: string;
  referenceSource: { source: string; page?: number };
}): DetectMissingDocsResult {
  const providedTokens = args.providedFilenames.map((f) => ({
    filename: f,
    tokens: filenameTokenSet(f),
  }));

  const signals: MissingDocSignal[] = [];

  // 1) Direct file references like "REA.pdf"
  for (const match of args.referenceText.matchAll(/\b([A-Za-z0-9_-]+\.(?:pdf|PDF))\b/g)) {
    signals.push({
      type: "file_ref",
      value: match[1],
      source: args.referenceSource.source,
      page: args.referenceSource.page,
    });
  }

  // 2) Acronyms in parentheses like "(REA)"
  for (const match of args.referenceText.matchAll(/\(([A-Z]{2,6})\)/g)) {
    signals.push({
      type: "acronym",
      value: match[1],
      source: args.referenceSource.source,
      page: args.referenceSource.page,
    });
  }

  // 3) Known phrases -> acronym
  for (const [re, acronym] of PHRASE_TO_ACRONYM) {
    if (re.test(args.referenceText)) {
      signals.push({
        type: "phrase",
        value: re.source.replace(/\\b/g, ""),
        source: args.referenceSource.source,
        page: args.referenceSource.page,
      });
      signals.push({
        type: "acronym",
        value: acronym,
        source: args.referenceSource.source,
        page: args.referenceSource.page,
      });
    }
  }

  const byLabel = new Map<string, MissingDocCandidate>();

  const recordCandidate = (label: string, confidence: number, signal: MissingDocSignal) => {
    const existing = byLabel.get(label);
    if (!existing) {
      byLabel.set(label, { label, confidence, signals: [signal] });
      return;
    }
    existing.confidence = Math.max(existing.confidence, confidence);
    existing.signals.push(signal);
  };

  const hasFilenameOrToken = (acronym: string) =>
    args.providedFilenames.some((f) => f.toUpperCase() === `${acronym}.PDF`) ||
    providedTokens.some(({ tokens }) => tokens.has(acronym.toUpperCase()));

  for (const s of signals) {
    if (s.type === "file_ref") {
      const label = s.value;
      const stem = label.replace(/\.[^.]+$/, "").toUpperCase();
      if (!hasFilenameOrToken(stem)) recordCandidate(label, 0.95, s);
      continue;
    }

    if (s.type === "acronym") {
      const acronym = s.value.toUpperCase();
      if (!hasFilenameOrToken(acronym)) recordCandidate(`${acronym}.pdf`, 0.8, s);
      continue;
    }

    if (s.type === "phrase") {
      // Phrase alone shouldn't create a missing-doc claim; it only boosts confidence via acronym signal.
      continue;
    }
  }

  const missing_docs: MissingDocCandidate[] = [];
  const candidates_low_confidence: MissingDocCandidate[] = [];

  for (const cand of byLabel.values()) {
    if (cand.confidence >= 0.8) missing_docs.push(cand);
    else candidates_low_confidence.push(cand);
  }

  return {
    pack_id: args.packId,
    missing_docs,
    candidates_low_confidence: candidates_low_confidence.length ? candidates_low_confidence : undefined,
  };
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(api)/folders/[id]/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../lib/devOnlyApi.server";
import { refreshFolderState } from "../../../../lib/folderState.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

export async function GET(_req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
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

  const folderId = parsedParams.data.id;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  // Keep folder state consistent with latest persisted facts.
  await refreshFolderState(folderId);

  const folders = await sql<
    Array<{
      id: string;
      name: string;
      state: string;
      latest_index_version: string;
      created_at: Date;
      updated_at: Date;
    }>
  >`
    SELECT id, name, state, latest_index_version, created_at, updated_at
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = folders[0];
  if (!folder) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  return Response.json(
    {
      folder: {
        id: folder.id,
        name: folder.name,
        state: folder.state,
        latest_index_version: folder.latest_index_version,
        created_at: folder.created_at.toISOString(),
        updated_at: folder.updated_at.toISOString(),
      },
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/03-architecture/10_system_architecture.md
```md
# System architecture

> Note: This document describes the **target** architecture. For what is implemented today, see
> `docs/03-architecture/07_current_poc_runtime.md`.

This doc is the canonical high-level map of the Orbital Copilot PoC **target** runtime. It should stay stable while code is added.

Goals (PoC)
- Evidence-first UX: click `citation_id` -> see highlighted PDF evidence.
- Deterministic-ish runs: row-by-row progress, resumability, retries, explicit side effects.
- Thin API layer: mostly triggers workflows and reads state.
- Production-minded plumbing, PoC-sized surface area (single-tenant; minimal infra).

Non-goals (for now)
- Multi-tenant admin, SSO/RBAC, billing.
- External web research inside a run (ADR-0007).
- Microservices decomposition (one app + worker is the baseline).

## Glossary
- Folder: DB/API name for a workspace container. UI calls it a Matter.
- Run: one execution of a Quick Start workflow for a folder.
- Step: a single side-effect boundary. Target execution is durable via Workflow DevKit (WDK); current PoC execution is in-process and documented in `docs/03-architecture/07_current_poc_runtime.md`.
- Index version: identifies the retrieval substrate built for a folder (chunks + indices).
- Agent bundle version: pins prompts + schemas + logic used by a run (git SHA is fine for PoC).
- Question set version: pins the question set used by a run (see `docs/03-architecture/20_state_model.md` and `docs/03-architecture/30_data_model.md`).
- Citation locking: resolving candidate chunk IDs into immutable citation records with snippet/hash/geometry (ADR-0001).

## High-level component map

Conventions:
- The meaning of `(use workflow)` / `(use step)` is defined in `docs/03-architecture/06_frameworks_agents_rag_evals.md`.

Target (aspirational):

```mermaid
flowchart LR
  subgraph FE["Browser (Frontend)"]
    UI["Matter Workspace
Doc list + Report table + Run progress"]
    PDFV["PDF Viewer
pdf.js + highlight overlay"]
  end

  subgraph WEB["Next.js Web Server"]
    RSC["RSC pages + Server components"]
    API["Route handlers (HTTP API)
thin controllers"]
  end

  subgraph WDK["Workflow DevKit (Durable Orchestration)"]
    WF["Quick Start workflow controller
(use workflow)"]
    STEPS["Steps
(use step)
OCR, embed, retrieve, draft, lock, verify, write, export"]
  end

  subgraph DATA["Data plane"]
    PG["Postgres
app tables + WDK 'world'
pgvector + tsvector"]
    OBJ["Object storage (S3-compatible)
raw PDFs + exports"]
  end

  subgraph EXT["External providers"]
    OCR["OCR/layout provider
(Azure DI or Textract)"]
    LLM["LLM calls (AI SDK)
draft only (no verify model v1)"]
    EMB["Embeddings (AI SDK)"]
  end

  UI --> WEB
  PDFV --> WEB

  WEB --> PG
  WEB --> OBJ

  API --> WF
  WF --> STEPS
  STEPS --> PG
  STEPS --> OBJ

  STEPS --> OCR
  STEPS --> LLM
  STEPS --> EMB
```

Notes:
- Target: WDK owns durability, retries, resumability, and step-level progress events (ADR-0005).
- Current: ingest and quick-start execution is in-process (non-durable) and does not yet implement the retrieve/draft/lock pipeline. See `docs/03-architecture/07_current_poc_runtime.md`.
- Domain logic should live outside the WDK integration layer (eg `packages/core`) and be called from steps.
- This repo started docs-first; keep the same conceptual boundaries even if directories differ.

## Data flow + trust boundaries

```mermaid
flowchart LR
  subgraph TB1["Trust boundary: Browser"]
    UI["Browser UI"]
  end

  subgraph TB2["Trust boundary: App servers"]
    API["Next.js API"]
    WF["WDK workflow/steps"]
  end

  subgraph TB3["Trust boundary: Data plane"]
    PG["Postgres"]
    OBJ["Object storage"]
  end

  subgraph TB4["Trust boundary: External providers"]
    OCR["OCR/layout"]
    LLM["LLM (draft only)"]
    EMB["Embeddings"]
  end

  UI --> API
  API --> PG
  API --> OBJ
  API --> WF
  WF --> PG
  WF --> OBJ
  WF --> OCR
  WF --> LLM
  WF --> EMB
```

Safety notes:
- Provider calls are adapted and mediated; persist only canonical outputs, never raw provider payloads.
- Signed URLs are short-lived; only storage keys and stable metadata are persisted.
- Export is gated on locked citations + fail-closed verification (ADR-0001/0002).

## Ownership and boundaries

### Browser / frontend
Responsibilities:
- Matter workspace UI: upload documents, show ingest/run status, show report rows, show export links.
- PDF rendering with highlight overlay (render page from object storage; overlay locked citation polygons).

Must not:
- Fetch data via client-side effects by default (server-first; see `apps/web/AGENTS.md`).
- Invent trust: the UI should reflect row statuses and export gating rules from `docs/03-architecture/20_state_model.md`.

### Web/API (Next.js route handlers)
Responsibilities:
- Validate external inputs with Zod at the boundary (request bodies, route params).
- Translate domain errors into the safe error envelope (`docs/03-architecture/50_api_surface.md`, ADR-0008).
- Trigger workflows (start run, enqueue ingest/export) and read state for the UI.
- Provide signed URLs for PDF rendering and artefact downloads.

Must not:
- Implement heavy/long-running work inline (OCR, embeddings, LLM calls).
- Leak provider payloads or stack traces to clients.

### Workflow runtime + workers (WDK)
Responsibilities:
- Orchestrate the row-by-row flow for Quick Start:
  `retrieve -> draft -> lock -> verify -> write` (ADR-0005).
- Encapsulate non-deterministic side effects in explicit steps (ADR-0005).
- Guarantee idempotent replays/retries at the step boundary (see `docs/03-architecture/06_frameworks_agents_rag_evals.md`).

### Data plane (Postgres + object storage)
Responsibilities:
- Postgres is the source of truth for state: folders, documents, chunks, runs, steps, report rows, citations, artefacts (`docs/03-architecture/30_data_model.md`).
- Object storage holds raw PDFs and exported artefacts (ADR-0010).

Invariant:
- A claim is only "exportable" when its citations are locked and verification passes (ADR-0001/0002).

### External providers
Responsibilities:
- OCR/layout provider produces canonical per-page text + geometry (ADR-0003; ADR-0012).
- LLM + embeddings calls go through AI SDK and are routed/configured via env (ADR-0013).
- Verification v1 is integrity-only (no entailment model); do not call a "verify" model in PoC v1 (ADR-0017).

## Key sequences

### Create matter -> upload -> ingest -> indexed/ready
```mermaid
sequenceDiagram
  participant U as User
  participant UI as Web UI
  participant API as Next.js API
  participant OBJ as Object storage
  participant W as WDK workflow/steps
  participant PG as Postgres

  U->>UI: Create matter
  UI->>API: POST /folders
  API->>PG: insert folders row (state=empty)
  API-->>UI: folder{id,state}

  U->>UI: Upload PDF
  UI->>API: POST /folders/:id/documents (init upload)
  API->>PG: insert documents row (parse_status=queued, ocr_status=queued)
  API-->>UI: upload{url,storage_key}, document{id}
  UI->>OBJ: PUT pdf bytes to signed URL
  UI->>API: POST /documents/:id/complete
  API->>W: enqueue ingest steps (OCR -> pages -> chunks -> embed -> index)
  W->>PG: update document+folder states as steps complete
  API-->>UI: 202 Accepted (ingest enqueued)
```

State rules live in `docs/03-architecture/20_state_model.md`. Data persistence rules live in `docs/03-architecture/30_data_model.md`.

### View a citation highlight
```mermaid
sequenceDiagram
  participant UI as Web UI
  participant API as Next.js API
  participant OBJ as Object storage
  participant PG as Postgres

  UI->>API: GET /citations/:id
  API->>PG: read locked citation (snippet_hash + polygons + page_number)
  API-->>UI: citation{document_id,page_number,polygons,snippet}

  UI->>API: GET /documents/:id/render?page=N
  API-->>UI: render_url (signed)
  UI->>OBJ: fetch PDF page bytes via render_url
  UI-->>UI: render page + overlay polygons
```

### Quick Start run (row-by-row)
High-level loop (details in `docs/03-architecture/40_rag_and_agents.md`):
1) Retrieve evidence: hybrid search returns chunk IDs (ADR-0004).
2) Draft structured row JSON from evidence only (candidate citations are chunk IDs).
3) Lock citations: create immutable `citations` rows and replace candidate IDs with `citation_id`s (ADR-0001).
4) Verify: fail-closed; any mismatch sets `citation_failed` (ADR-0002).
5) Write: persist `report_rows` and update progress.

### Export artefacts
Export is a step-driven process (can be immediate or async):
- default is to block export if any row is `citation_failed` unless an explicit override is provided (see `docs/03-architecture/20_state_model.md` and `docs/03-architecture/50_api_surface.md`).

## Deployment topology (PoC)

### Local dev (expected once scaffold exists)
- Web server: Next.js dev server.
- Worker: WDK worker process.
- Postgres: docker compose mode or Sprite mode (ADR-0011, ADR-0022).
- Object storage: local filesystem (ultra-simple) or MinIO for S3 parity (ADR-0010).

### Single VM (Hetzner-first; ADR-0009)
Baseline deployment shape:
- One VM running:
  - Next.js server (web/API)
  - WDK worker(s)
  - Postgres (with backups)
  - Optional MinIO (or managed S3-compatible storage)

Rationale:
- Keeps network latencies simple and avoids serverless connection pitfalls while the PoC is stabilising.

### Optional: Vercel for previews (later)
If/when we move web/API to Vercel:
- Keep WDK worker + Postgres off-Vercel (worker on VM or managed runtime).
- Add connection pooling and hard timeouts/limits.

## Scaling and failure modes (design notes)
- Backpressure: ingest and runs should be queued and rate-limited per folder to avoid stampedes (OCR + embeddings are the expensive knobs).
- Retries: step retries must not duplicate `report_rows` or `citations` (idempotency keys in `run_steps`).
- Cost control: cap evidence chunks per question, cap tokens, log usage per run (see `docs/03-architecture/60_observability_and_evals.md`).
- Consistency: the UI should always render from persisted state; do not show "draft" answers without locked citations.

## Open questions to pin (candidate ADRs)
- Embeddings posture: model choice, dimension standardization, and re-embed triggers (`docs/03-architecture/00_overview.md`).
- Auth posture for the PoC (what is protected in demo environments) (`docs/03-architecture/00_overview.md`).
- Data handling posture: retention windows, export redaction defaults, and log/snapshot hygiene (`docs/03-architecture/00_overview.md`).

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/ui/Table.tsx
```tsx
import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { cn } from "./cn";

export function TableFrame({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-auto rounded-ui-lg border border-border bg-card", className)} {...props} />;
}

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("min-w-full border-collapse text-sm", className)} {...props} />;
}

export function TH({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-2 bg-muted font-mono text-2xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border text-left",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TD({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-3 py-2.5 border-b border-border/60", className)} {...props} />;
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/_templates/.gitkeep
```

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/_templates/breadboard.md
```md
# Breadboard: <title>

## Goal

## Actors

## System Components

## Flow

## Edge Cases

## Risks

## Open Questions

## Links

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/03-architecture/50_api_surface.md
```md
# API surface (PoC)

> Note: This document describes the **target** HTTP contract. For what is implemented today (including dev-only and
> fixture-backed routes), see `docs/03-architecture/07_current_poc_runtime.md`.

This doc is the canonical HTTP contract for the PoC. Keep it small, but explicit.

Important: This is the **target** API surface. During development we may ship dev-only spike endpoints, but they must live under `/spikes/*`, be gated behind `SPIKES_ENABLED=1`, and return `404` unless spikes are explicitly enabled.

See also:
- State machines + invariants: `docs/03-architecture/20_state_model.md`
- Persistence + hashing rules: `docs/03-architecture/30_data_model.md`

## Conventions
- All request/response bodies are JSON unless noted.
- IDs are opaque strings.
- Timestamps are ISO 8601.
- For POST endpoints that create work, support an optional `Idempotency-Key` header.
  - Spike endpoints must live under `/spikes/*` and are never part of the target contract.

### Versioning (PoC)
For now, paths are unversioned. Treat this document as "v1". If we need breaking changes later, introduce `/v2` explicitly.

### Auth (PoC)
Auth is an open decision (`docs/03-architecture/00_overview.md`). The contract still defines:
- `UNAUTHENTICATED`: missing/invalid auth
- `UNAUTHORISED`: authenticated but not allowed

PoC default assumption: single-tenant; environments may run without auth in local/dev, but production-minded deployments should turn auth on.

Non-negotiable rules for shared/demo environments:
- No unauthenticated access to PDFs or extracted text.
- All download/render URLs must be signed with a short TTL.
- Never log auth tokens or signed URLs (server logs, traces, analytics, or error reports).

### Admin token (PoC)
Some developer-facing endpoints are "admin-only" even in a no-auth PoC environment. PoC v1 contract:
- Require `X-Orbital-Admin-Token` header to match env `ORBITAL_ADMIN_TOKEN`.
- If missing/mismatched, return `403` with `error.code = "UNAUTHORISED"` (standard error envelope).

### Correlation and tracing
- The server should generate/propagate a `trace_id` per request and include it in the error envelope and as an `X-Trace-Id` response header.
- Workflow runs should record the `trace_id` that created them in `runs`/`run_steps` metadata (implementation detail, but required for debugging).

## Error envelope (required)
All non-2xx responses must use the same envelope (no stack traces, no internal provider payloads):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable summary",
    "details": { "field": "optional safe detail" },
    "trace_id": "optional-trace-id"
  }
}
```

Minimum error codes (PoC):
- `VALIDATION_ERROR`
- `UNAUTHENTICATED` / `UNAUTHORISED`
- `NOT_FOUND`
- `CONFLICT`
- `RATE_LIMITED`
- `EXPORT_BLOCKED` (default when any row is `citation_failed`)
- `INTERNAL`

Internal vs external errors:
- External errors are safe for clients and must map to a stable `error.code` above with a human-readable `message`.
- Internal errors (unexpected exceptions, provider failures, stack traces) must be mapped to `error.code = "INTERNAL"` with a safe message. Log the internal detail server-side only (never return it to the client).

HTTP status mapping (PoC default):
- `VALIDATION_ERROR` -> `400`
- `UNAUTHENTICATED` -> `401`
- `UNAUTHORISED` -> `403`
- `NOT_FOUND` -> `404`
- `CONFLICT` -> `409`
- `RATE_LIMITED` -> `429`
- `EXPORT_BLOCKED` -> `409`
- `INTERNAL` -> `500`

## Demo controls (dev-only)

These endpoints are dev-only and must follow the spike endpoint conventions:
- Paths live under `/spikes/*`.
- They are gated behind `SPIKES_ENABLED=1` and return `404` unless spikes are explicitly enabled.

### POST /spikes/demo/load-pack (admin)
Load a known fixture pack from `docs/08-example-data/` and seed a fresh folder ("matter") with documents only.

Access control (PoC v1):
- Requires `X-Orbital-Admin-Token` header matching env `ORBITAL_ADMIN_TOKEN` (see Admin token (PoC) above).

Feature flags:
- Requires `SPIKES_ENABLED=1` and `DEMO_MODE=1`.
  - Otherwise return `404` with `error.code = "NOT_FOUND"`.

Request:
```json
{ "pack_id": "pack_01_clean" }
```

Response:
```json
{ "folder_id": "fld_123" }
```

Notes:
- `pack_id` must be allowlisted. Do not accept filesystem paths.
- Loader must read `docs/08-example-data/<pack_id>/manifest.json` and fail if missing; do not infer pack structure from directory listing.
- Never return local filesystem paths or signed URLs from this endpoint.

## Folder + documents

### GET /folders
List matters (folders). This is the minimal "home screen" API.

Response:
```json
{
  "folders": [
    {
      "id": "fld_123",
      "name": "123 Main St - Title + Survey",
      "state": "ready",
      "latest_index_version": "v1",
      "created_at": "2026-02-07T00:00:00Z"
    }
  ]
}
```

### POST /folders
Create a new matter (folder).

Request:
```json
{ "name": "123 Main St - Title + Survey" }
```

Response:
```json
{
  "folder": {
    "id": "fld_123",
    "name": "123 Main St - Title + Survey",
    "state": "empty",
    "latest_index_version": "v1"
  }
}
```

### GET /folders/:id
Fetch a folder.

Response:
```json
{
  "folder": {
    "id": "fld_123",
    "name": "123 Main St - Title + Survey",
    "state": "ingesting",
    "latest_index_version": "v1",
    "created_at": "2026-02-07T00:00:00Z",
    "updated_at": "2026-02-07T00:01:23Z"
  }
}
```

### POST /folders/:id/documents (init upload)
Initialise a document upload and return a storage target (signed URL or similar).

Request:
```json
{ "filename": "Title Commitment.pdf", "mime": "application/pdf", "bytes": 10485760 }
```

Response (shape only; storage fields depend on provider):
```json
{
  "document": {
    "id": "doc_123",
    "folder_id": "fld_123",
    "filename": "Title Commitment.pdf",
    "parse_status": "queued",
    "ocr_status": "queued"
  },
  "upload": {
    "storage_key": "folders/fld_123/documents/doc_123.pdf",
    "url": "https://…",
    "method": "PUT",
    "headers": { "Content-Type": "application/pdf" }
  }
}
```

### POST /documents/:id/complete
Mark the upload complete and enqueue ingest (parse + OCR + indexing).

Request:
```json
{ "storage_key": "folders/fld_123/documents/doc_123.pdf" }
```

Response:
```json
{ "document": { "id": "doc_123", "parse_status": "queued", "ocr_status": "queued" } }
```

### GET /folders/:id/documents
List documents in a folder.

Response:
```json
{
  "documents": [
    {
      "id": "doc_123",
      "filename": "Title Commitment.pdf",
      "parse_status": "parsed",
      "ocr_status": "done",
      "extraction_quality": 0.82,
      "page_count": 142
    }
  ]
}
```

### GET /documents/:id/render?page=N
Return a signed URL suitable for pdf.js to render the PDF.

Note (PoC v1 semantics):
- `render_url` is a signed URL to the **whole PDF** (what pdf.js loads).
- The `page` query param is **1-indexed** and is used for initial viewer state (and optional validation).
- This endpoint does not rasterise pages server-side.
- If we ever add server-rendered images, introduce a new endpoint (e.g. `/documents/:id/pages/:n.png`) rather than changing this contract.

Response:
```json
{
  "document_id": "doc_123",
  "page": 1,
  "render_url": "https://…"
}
```

## Runs + report

### POST /folders/:id/runs (Quick Start)
Start a Quick Start run for a folder.

Preconditions:
- Folder state must be `indexed` or `ready`.
  - If `empty|ingesting`, return `409` with `error.code = "CONFLICT"` and a message like: `Folder is not runnable yet.`
  - If `failed`, return `409` with guidance to retry ingest/re-index.

Request:
```json
{ "type": "quick_start_title_survey" }
```

Response:
```json
{
  "run": {
    "id": "run_123",
    "folder_id": "fld_123",
    "state": "running",
    "index_version": "v1",
    "agent_bundle_version": "git:abc123",
    "question_set_version": "qs:0002:v1.0:sha256:..."
  }
}
```

### GET /runs/:id (progress)
Response:
```json
{
  "run": {
    "id": "run_123",
    "state": "running",
    "index_version": "v1",
    "agent_bundle_version": "git:abc123",
    "question_set_version": "qs:0002:v1.0:sha256:...",
    "progress": { "questions_total": 9, "questions_done": 3 },
    "failure_counts": { "RETRIEVAL_MISS": 2, "CITATION_MISMATCH": 1 }
  }
}
```

### GET /folders/:id/report?run_id=…
Return report rows for a specific run. If `run_id` is omitted, return the latest run for the folder.

Response:
```json
{
  "run": {
    "id": "run_123",
    "state": "completed",
    "index_version": "v1",
    "agent_bundle_version": "git:abc123",
    "question_set_version": "qs:0002:v1.0:sha256:..."
  },
  "rows": [
    {
      "id": "row_123",
      "question_id": "TS-04",
      "question": "List the recorded exceptions in Schedule B-II.",
      "answer": "Extracted exceptions table (see payload).",
      "status": "needs_review",
      "citation_ids": ["cit_123", "cit_124"],
      "payload_schema_version": "list_payload_v0",
      "payload_json": {
        "kind": "exceptions_table",
        "items": [
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
            "item_status": "needs_review",
            "citation_ids": ["cit_123"]
          }
        ]
      },
      "notes": null
    }
  ]
}
```

### GET /runs/:id/trace (admin)
Return a minimal, safe-by-default run trace JSON for debugging.

Access control (PoC v1):
- Requires `X-Orbital-Admin-Token` header matching env `ORBITAL_ADMIN_TOKEN` (see Admin token (PoC) above).

Safety:
- No raw PDF bytes.
- Avoid full extracted document text.
- No raw provider payload dumps.
- Prefer opaque IDs + hashes.

Response (shape only; exact contents may evolve but must remain safe):
```json
{
  "trace": {
    "run": {
      "id": "run_123",
      "folder_id": "fld_123",
      "state": "completed",
      "index_version": "v1",
      "agent_bundle_version": "git:abc123",
      "question_set_version": "qs:0002:v1.0:sha256:..."
    },
    "steps": [
      {
        "step_key": "retrieve",
        "step_type": "workflow_step",
        "state": "succeeded",
        "attempt": 1,
        "duration_ms": 123,
        "metrics_json": {},
        "error_json": null
      }
    ],
    "rows": [
      {
        "question_id": "TS-04",
        "status": "needs_review",
        "citation_ids": ["cit_123"],
        "provenance_json": {}
      }
    ]
  }
}
```

## Citations

### GET /citations/:id
Return locked geometry + snippet for a citation ID.

Response:
```json
{
  "citation": {
    "id": "cit_123",
    "document_id": "doc_123",
    "page_number": 12,
    "polygons": [[[0.1, 0.2], [0.4, 0.2], [0.4, 0.25], [0.1, 0.25]]],
    "snippet": "…",
    "snippet_hash": "sha256:…"
  }
}
```

## Export

### POST /export/csv
Export a run to a CSV artefact.

Preconditions:
- `runs.state` must be `completed` (PoC default)
  - else return `409` with `error.code = "CONFLICT"` and a safe message (e.g. `Run is not completed yet.`)
- Default behaviour is to block if any row is `citation_failed`.
  - Return a non-2xx response with `error.code = "EXPORT_BLOCKED"`.

Request:
```json
{
  "folder_id": "fld_123",
  "run_id": "run_123",
  "kind": "requirements_tracker",
  "unsafe_override": false
}
```

Response:
```json
{
  "artefact": {
    "id": "art_123",
    "type": "csv",
    "kind": "requirements_tracker",
    "filename": "requirements_tracker.csv",
    "storage_key": "folders/fld_123/artefacts/art_123.csv",
    "source_run_id": "run_123",
    "created_at": "2026-02-07T00:00:00Z",
    "download_url": "https://…"
  }
}
```

Notes:
- `kind` (CSV) must be one of:
  - `requirements_tracker`
  - `exceptions_table`
  - `survey_issues`
- Naming collision: there is a current dev-only exporter using `/export/csv`. Prefer to keep this as the target path and move the dev-only exporter under `/spikes/export/csv` (or similar), with dev-only gating and `404` outside dev.
- `unsafe_override` is reserved for demo-only "unsafe" exports:
  - Allowed only when `DEMO_MODE=1` and `ALLOW_UNSAFE_EXPORTS=1` and the request includes a valid admin token (see Admin token (PoC) above).
  - Otherwise return `403` with `error.code = "UNAUTHORISED"`.
- If an unsafe export is ever allowed, it must be visibly labelled and recorded in artefact metadata (see `docs/03-architecture/20_state_model.md` + `docs/03-architecture/30_data_model.md`).

### POST /export/docx
Export a run to a Word artefact (.docx).

Preconditions:
- `runs.state` must be `completed` (PoC default) else `409 CONFLICT` as above.
- Default behaviour is to block if any row is `citation_failed` (`EXPORT_BLOCKED`).

Request:
```json
{
  "folder_id": "fld_123",
  "run_id": "run_123",
  "kind": "memo",
  "unsafe_override": false
}
```

Response:
```json
{
  "artefact": {
    "id": "art_456",
    "type": "docx",
    "kind": "memo",
    "filename": "memo.docx",
    "storage_key": "folders/fld_123/artefacts/art_456.docx",
    "source_run_id": "run_123",
    "created_at": "2026-02-07T00:00:00Z",
    "download_url": "https://…"
  }
}
```

Notes:
- `unsafe_override` semantics match `POST /export/csv` (demo-only, gated behind `DEMO_MODE=1` + `ALLOW_UNSAFE_EXPORTS=1` + admin token).

### GET /folders/:id/artefacts
List exported artefacts for a folder.

Response:
```json
{
  "artefacts": [
    {
      "id": "art_123",
      "type": "csv",
      "kind": "requirements_tracker",
      "filename": "requirements_tracker.csv",
      "storage_key": "folders/fld_123/artefacts/art_123.csv",
      "source_run_id": "run_123",
      "created_at": "2026-02-07T00:00:00Z",
      "download_url": "https://…"
    }
  ]
}
```

Notes:
- `download_url` values are ephemeral signed URLs. Do not persist them in the DB; generate on demand.

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/ui/ThemeProvider.tsx
```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContext = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const Ctx = createContext<ThemeContext>({ theme: "system", setTheme: () => {} });

export function useTheme() {
  return useContext(Ctx);
}

const STORAGE_KEY = "orbital-theme";

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
      applyThemeClass(stored);
    } else {
      applyThemeClass("system");
    }
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyThemeClass("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyThemeClass(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * Inline script string to prevent FOUC. Inject this as a <script> in <head>
 * or before <body> content so the correct class is applied before first paint.
 */
export const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem("${STORAGE_KEY}");
    if (t === "dark") document.documentElement.classList.add("dark");
    else if (t !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      document.documentElement.classList.add("dark");
  } catch(e) {}
})();
`.trim();

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/objectStore.server.ts
```ts
import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type GlobalObj = typeof globalThis & {
  __orbitalObjectStoreSecret?: string;
};

const STORAGE_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/documents\/[A-Za-z0-9_-]+\.pdf$/;
const ARTEFACT_CSV_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/artefacts\/art_[0-9a-f-]+\.csv$/i;
const ARTEFACT_DOCX_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/artefacts\/art_[0-9a-f-]+\.docx$/i;
const ARTEFACT_META_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/artefacts\/art_[0-9a-f-]+\.meta\.json$/i;

function objectStoreRoot(): string {
  // In Next dev, `process.cwd()` resolves to `apps/web`.
  return path.resolve(process.cwd(), "../../tmp/object-store");
}

export function validateStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!STORAGE_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactCsvStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!ARTEFACT_CSV_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactDocxStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!ARTEFACT_DOCX_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactMetadataStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!ARTEFACT_META_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (ARTEFACT_CSV_KEY_RE.test(storageKey)) return { ok: true };
  if (ARTEFACT_DOCX_KEY_RE.test(storageKey)) return { ok: true };
  return { ok: false, reason: "INVALID_STORAGE_KEY" };
}

function resolveObjectPath(storageKey: string): string {
  const base = objectStoreRoot();
  const candidate = path.resolve(base, storageKey);
  if (!candidate.startsWith(base + path.sep)) throw new Error("PATH_TRAVERSAL");
  return candidate;
}

function secret(): string {
  const fromEnv = process.env.OBJECT_STORE_SIGNING_SECRET;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();

  // Fail closed unless explicitly allowed in dev.
  const devFallbackAllowed = process.env.NODE_ENV === "development" && process.env.ALLOW_DEV_OBJECT_STORE_SECRET === "1";
  if (!devFallbackAllowed) {
    throw new Error("OBJECT_STORE_SIGNING_SECRET_MISSING");
  }

  // Dev-only fallback so local upload works out of the box.
  const g = globalThis as GlobalObj;
  if (!g.__orbitalObjectStoreSecret) {
    g.__orbitalObjectStoreSecret = `dev-${randomBytes(32).toString("hex")}`;
  }
  return g.__orbitalObjectStoreSecret;
}

function b64url(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

const SIGNATURE_PAYLOAD_VERSION = "v1";

function sign(args: { purpose: string; storageKey: string; expiresAtMs: number }): string {
  const payload = `${SIGNATURE_PAYLOAD_VERSION}\n${args.purpose}\n${args.storageKey}\n${args.expiresAtMs}`;
  const digest = createHmac("sha256", secret()).update(payload).digest();
  return b64url(digest);
}

export function verifySignature(args: { purpose: string; storageKey: string; expiresAtMs: number; sig: string }): boolean {
  const expiresAtMs = args.expiresAtMs;
  if (!Number.isFinite(expiresAtMs)) return false;

  // Defensive-in-depth: signatures are not valid once expired, even if the HMAC matches.
  const now = Date.now();
  if (expiresAtMs < now) return false;

  // Cap far-future signatures so callers can't accidentally mint "near-permanent" URLs.
  const maxFutureMs = 24 * 60 * 60 * 1000;
  if (expiresAtMs > now + maxFutureMs) return false;

  const expected = sign({ purpose: args.purpose, storageKey: args.storageKey, expiresAtMs: args.expiresAtMs });
  const a = Buffer.from(expected);
  const b = Buffer.from(args.sig);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function createSignedHeaders(args: {
  purpose: string;
  storageKey: string;
  expiresInSeconds?: number;
}): { expires_at_ms: number; signature: string } {
  const expiresInSeconds = args.expiresInSeconds ?? 10 * 60;
  const expiresAtMs = Date.now() + expiresInSeconds * 1000;
  const signature = sign({ purpose: args.purpose, storageKey: args.storageKey, expiresAtMs });
  return { expires_at_ms: expiresAtMs, signature };
}

export function createSignedPutHeaders(args: {
  storageKey: string;
  expiresInSeconds?: number;
}): { expires_at_ms: number; signature: string } {
  return createSignedHeaders({ purpose: "put", ...args });
}

export function createSignedGetHeaders(args: {
  storageKey: string;
  expiresInSeconds?: number;
}): { expires_at_ms: number; signature: string } {
  return createSignedHeaders({ purpose: "get", ...args });
}

export function objectExists(storageKey: string): boolean {
  const p = resolveObjectPath(storageKey);
  return fs.existsSync(p);
}

function sha256Digest(bytes: Uint8Array): string {
  const hash = createHash("sha256").update(bytes).digest("hex");
  return `sha256:${hash}`;
}

async function writeObjectFile(p: string, bytes: Uint8Array, opts?: { writeOnce?: boolean }): Promise<void> {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (opts?.writeOnce) {
    await fs.promises.writeFile(p, bytes, { flag: "wx" });
    return;
  }
  await fs.promises.writeFile(p, bytes);
}

export async function putObject(args: {
  storageKey: string;
  bytes: Uint8Array;
}): Promise<{ bytesWritten: number; sha256: string }> {
  const p = resolveObjectPath(args.storageKey);
  await writeObjectFile(p, args.bytes);
  return { bytesWritten: args.bytes.byteLength, sha256: sha256Digest(args.bytes) };
}

export async function putObjectWriteOnce(args: {
  storageKey: string;
  bytes: Uint8Array;
}): Promise<{ bytesWritten: number; sha256: string }> {
  const p = resolveObjectPath(args.storageKey);
  await writeObjectFile(p, args.bytes, { writeOnce: true });
  return { bytesWritten: args.bytes.byteLength, sha256: sha256Digest(args.bytes) };
}

export async function readObject(storageKey: string): Promise<Uint8Array> {
  const p = resolveObjectPath(storageKey);
  const buf = await fs.promises.readFile(p);
  return new Uint8Array(buf);
}

export async function statObject(storageKey: string): Promise<fs.Stats> {
  const p = resolveObjectPath(storageKey);
  return fs.promises.stat(p);
}

export function createObjectReadStream(
  storageKey: string,
  opts?: { start?: number; end?: number },
): fs.ReadStream {
  const p = resolveObjectPath(storageKey);
  return fs.createReadStream(p, opts);
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/tokens.css
```css
/*
 * Orbital Design System — V5 "Final"
 * Warm cream canvas, pure-black dark mode, Crimson Pro serif.
 * Orange reserved for high-signal moments; cyan user bubbles.
 *
 * Color format: space-separated RGB triplets for Tailwind alpha support.
 *   Usage: rgb(var(--primary) / 0.5)
 */

/* ─── Fixed colour scales (mode-independent) ─── */
:root {
  /* Primary — Orange */
  --primary-50:  255 247 240;
  --primary-100: 254 224 200;
  --primary-200: 253 189 148;
  --primary-300: 252 154 96;
  --primary-400: 252 126 61;
  --primary-500: 251 99 27;     /* brand orange */
  --primary-600: 232 85 16;
  --primary-700: 196 74 14;
  --primary-800: 154 58 11;
  --primary-900: 114 44 9;

  /* Secondary — Cyan */
  --secondary-50:  240 250 254;
  --secondary-100: 220 244 251;
  --secondary-200: 192 240 251;  /* brand cyan */
  --secondary-300: 151 226 245;
  --secondary-400: 109 207 235;
  --secondary-500: 72 184 217;
  --secondary-600: 42 153 187;
  --secondary-700: 29 122 150;
  --secondary-800: 21 92 113;
  --secondary-900: 13 62 77;

  /* Accent — Purple */
  --accent-50:  248 240 255;
  --accent-100: 239 217 255;
  --accent-200: 228 195 255;
  --accent-300: 216 172 255;    /* brand purple */
  --accent-400: 200 143 255;
  --accent-500: 181 114 255;
  --accent-600: 155 79 239;
  --accent-700: 126 56 204;
  --accent-800: 98 43 163;
  --accent-900: 71 32 122;

  /* Semantic — Success (Green) */
  --success-50:  236 249 243;
  --success-100: 209 240 225;
  --success-200: 153 218 188;
  --success-300: 96 196 151;
  --success-400: 59 170 120;
  --success-500: 45 138 95;
  --success-600: 36 114 78;
  --success-700: 28 90 62;
  --success-800: 22 70 48;
  --success-900: 15 48 33;

  /* Semantic — Warning (Amber) */
  --warning-50:  255 249 235;
  --warning-100: 254 237 198;
  --warning-200: 250 214 130;
  --warning-300: 245 191 68;
  --warning-400: 232 166 22;
  --warning-500: 212 146 11;
  --warning-600: 178 120 8;
  --warning-700: 142 96 6;
  --warning-800: 108 73 5;
  --warning-900: 76 52 4;

  /* Semantic — Destructive (Red) */
  --destructive-50:  254 242 242;
  --destructive-100: 252 218 218;
  --destructive-200: 247 175 175;
  --destructive-300: 239 132 132;
  --destructive-400: 232 100 100;
  --destructive-500: 220 74 74;
  --destructive-600: 193 54 54;
  --destructive-700: 160 42 42;
  --destructive-800: 126 33 33;
  --destructive-900: 92 24 24;

  /* Semantic — Info (Blue) */
  --info-50:  236 247 254;
  --info-100: 204 232 248;
  --info-200: 150 203 237;
  --info-300: 96 174 226;
  --info-400: 50 148 212;
  --info-500: 13 110 165;
  --info-600: 10 90 138;
  --info-700: 8 72 110;
  --info-800: 6 55 84;
  --info-900: 4 38 58;
}

/* ─── Light mode (default) ─── */
/* Note: this file is imported directly by Next.js; keep it unlayered to avoid requiring postcss-import. */
:root {
    --background: 255 251 245;        /* #FFFBF5 — warm cream */
    --foreground: 26 26 26;           /* #1A1A1A */
    --card: 255 255 255;
    --card-foreground: 26 26 26;
    --popover: 255 255 255;
    --popover-foreground: 26 26 26;
    --muted: 240 237 232;            /* #F0EDE8 — warm muted */
    --muted-foreground: 122 117 110; /* #7A756E */

    --primary: 251 99 27;            /* #FB631B */
    --primary-foreground: 255 255 255;
    --secondary: 192 240 251;        /* #C0F0FB */
    --secondary-foreground: 26 26 26;
    --accent: 216 172 255;           /* #D8ACFF */
    --accent-foreground: 26 26 26;

    --destructive: 220 74 74;
    --destructive-foreground: 255 255 255;
    --success: 45 138 95;
    --success-foreground: 255 255 255;
    --warning: 212 146 11;
    --warning-foreground: 26 26 26;
    --info: 13 110 165;
    --info-foreground: 255 255 255;

    --border: 232 229 224;           /* #E8E5E0 */
    --input: 232 229 224;
    --ring: 216 172 255;

    /* Chat-specific */
    --user-bubble: 220 244 251;      /* secondary-100 — soft cyan */
    --user-bubble-foreground: 26 26 26;

    /* Sidebar */
    --sidebar: 240 237 232;
    --sidebar-foreground: 26 26 26;
    --sidebar-accent: 255 251 245;
    --sidebar-accent-foreground: 26 26 26;
    --sidebar-border: 232 229 224;
    --sidebar-ring: 216 172 255;

    /* Radius */
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-2xl: 24px;
    --radius-pill: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 14px rgba(0,0,0,0.07);
    --shadow-lg: 0 8px 28px rgba(0,0,0,0.10);
  }

/* ─── Dark mode ─── */
.dark {
    --background: 10 10 10;          /* #0A0A0A — pure black */
    --foreground: 245 245 245;       /* #F5F5F5 */
    --card: 23 23 23;               /* #171717 */
    --card-foreground: 245 245 245;
    --popover: 28 28 28;
    --popover-foreground: 245 245 245;
    --muted: 36 36 36;              /* #242424 */
    --muted-foreground: 163 163 163; /* #A3A3A3 */

    --primary: 255 90 20;           /* #FF5A14 — boosted for dark */
    --primary-foreground: 10 10 10;
    --secondary: 192 240 251;
    --secondary-foreground: 10 10 10;
    --accent: 216 172 255;
    --accent-foreground: 10 10 10;

    --destructive: 239 100 100;
    --destructive-foreground: 10 10 10;
    --success: 74 190 133;
    --success-foreground: 10 10 10;
    --warning: 245 178 55;
    --warning-foreground: 10 10 10;
    --info: 70 160 220;
    --info-foreground: 10 10 10;

    --border: 46 46 46;             /* #2E2E2E */
    --input: 46 46 46;
    --ring: 216 172 255;

    /* Chat-specific */
    --user-bubble: 20 38 46;        /* deep teal */
    --user-bubble-foreground: 220 235 240;

    /* Sidebar */
    --sidebar: 18 18 18;
    --sidebar-foreground: 245 245 245;
    --sidebar-accent: 28 28 28;
    --sidebar-accent-foreground: 245 245 245;
    --sidebar-border: 46 46 46;
    --sidebar-ring: 216 172 255;

    /* Shadows (dark — heavier for depth on dark surfaces) */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 14px rgba(0,0,0,0.4);
    --shadow-lg: 0 8px 28px rgba(0,0,0,0.5);
  }

html {
  color: rgb(var(--foreground));
  background: rgb(var(--background));
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(app)/matters/MattersToolbar.tsx
```tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { Select } from "../../ui/Input";

type Props = {
  packIds: string[];
  selectedPackId: string;
};

export function MattersToolbar(props: Props) {
  const router = useRouter();
  const [pack, setPack] = useState(props.selectedPackId);

  const hasSeeded = props.packIds.length > 0;
  const options = useMemo(
    () => (hasSeeded ? props.packIds : [props.selectedPackId]),
    [hasSeeded, props.packIds, props.selectedPackId],
  );

  // Keep local state aligned when navigating (back/forward, etc).
  useEffect(() => {
    setPack(props.selectedPackId);
  }, [props.selectedPackId]);

  return (
    <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Seeded pack</span>
          <Select
            className="min-w-64"
            value={pack}
            onChange={(e) => {
              const next = e.currentTarget.value;
              setPack(next);
              router.push(`/matters?${new URLSearchParams({ pack: next }).toString()}`);
            }}
          >
            {options.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </Select>
        </label>

        {!hasSeeded ? (
          <div className="text-xs text-muted-foreground">
            No seeded packs found. Run <code className="font-mono">pnpm fixture:seed pack_01_clean</code>.
          </div>
        ) : null}
      </div>
    </section>
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/packages/core/src/schemas/list_payload_v0.ts
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

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/_templates/release-checklist.md
```md
# Release Checklist: <title>

## Release Summary

## Preconditions

## Rollout Steps

## Rollback Plan

## Monitoring

## Post-release Verification

## Communication

## Links

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/02-features/0001_trust-substrate/breadboard-pack.md
```md
# Breadboard Pack — 0001 Trust Substrate

## Context

- Appetite: TBD
- Problem: No baseline surface exists for viewing evidence, attaching citations, verifying claims, or showing failures. Trust must be established before any AI-driven work can be credible.
- Success: Matter + viewer works end-to-end; citations are real; verification is fail-closed; failures and provenance are explicit.
- Constraints: No auth/RBAC, no external web research, no full Quick Start generation (this is the trust substrate it depends on).
  - Highlight overlay spike (RH2) is anchors-first to validate mapping math quickly.
  - OCR/layout extraction remains the default ingest posture for PDFs (ADR-0003).
- Canonical references:
  - State invariants: `docs/03-architecture/20_state_model.md`
  - API contracts: `docs/03-architecture/50_api_surface.md`
  - Trust ADRs: `docs/03-architecture/DECISIONS.md`

## Current state

### What exists today

- Seed packs in `docs/08-example-data`.
- Anchor scaffolding in `docs/08-example-data/*/layout/*.anchors.json`.
- Web app scaffolding exists, but there is no confirmed Matter/Document/Viewer UI or API yet.

### Current flow (breadboard)

- _N/A_ (baseline surface does not exist yet).

## Proposed solution

### Proposed flow (breadboard)

- _Matter list (entry UI; API/DB calls it Folder)_
  - Create matter (folder)
  - -> Matter detail
- _Matter detail_
  - Upload documents
  - Document list + statuses
  - Report rows (seeded)
  - Citation chips
  - -> Document viewer
- _Document viewer_
  - Page navigation + zoom
  - Highlight overlay
  - Snippet + hash display
  - -> Back to Matter detail
- _Verification + failure UX_
  - Status badges per row
  - Export gate (blocked when citation_failed)
  - Missing docs checklist
  - Doc quality warnings
  - Flag citation wrong
- _Trace export (admin)_
  - Export run trace JSON

### Elements

- Matter list + detail views (folder CRUD)
- Upload pipeline + document list with ingest statuses
- PDF viewer (pdf.js) with page nav + zoom
- Citation chips + highlight overlay
- Verification status + export gate
- Failure taxonomy + warnings
- Provenance capture + trace export

## UI affordances

| # | Component / place | Affordance | Control | Wires out | Reads |
|---|---|---|---|---|---|
| U1 | Matter list | Create matter button | click | N1 create matter |  |
| U2 | Matter create modal | Name/description form + submit | type/click | N1 create matter |  |
| U3 | Matter detail | Upload dropzone + progress | drop/click | N2 upload pipeline | N3 doc status |
| U4 | Matter detail | Document list + status pills | click | N4 open viewer | N3 doc status |
| U5 | Matter detail | Report rows table | render |  | N9 row status |
| U6 | Matter detail | Citation chips per row | click | N5 fetch citation + N4 jump to page |  |
| U7 | Viewer | Page nav + zoom | click/scroll | N4 page render | N4 page state |
| U8 | Viewer | Highlight overlay + snippet | render | N7 map bbox to viewport | N5 citation payload |
| U9 | Matter detail | Export button + block state | click | N9 status gate | N9 row status |
| U10 | Matter detail | Missing docs checklist | render |  | N10 failure taxonomy |
| U11 | Matter detail | Doc quality warning | render |  | N3 doc metadata |
| U12 | Matter detail | Flag citation wrong action | click | N10 log feedback | N5 citation payload |
| U13 | Admin/trace | Export trace JSON | click | N11 trace export | N11 provenance store |

## Code affordances

| # | Component / service | Affordance | Control | Wires out / returns |
|---|---|---|---|---|
| N1 | Folders API (Matter CRUD) | `POST /folders` | call | creates `folder_id` |
| N2 | Upload service | init upload + put to storage + complete | call | `POST /folders/:id/documents` → upload target; `POST /documents/:id/complete` enqueues ingest |
| N3 | Documents store | ingest status + quality metadata | read/write | drives list state (`parse_status`, `ocr_status`, `extraction_quality`) |
| N4 | Viewer render contract | render URL + viewer state | call | `GET /documents/:id/render?page=N` returns `{ document_id, page, render_url }`; viewer handles page nav + zoom |
| N5 | Citations API | `GET /citations/:id` | call | locked citation payload `{ "citation": { id, document_id, page_number, polygons, snippet, snippet_hash } }` |
| N6 | Anchor fixture loader | map fixture anchor IDs to polygons | call | returns polygons for highlight scaffold |
| N7 | Highlight renderer | anchor polygons → viewport CSS pixels | call | Maps normalised anchors (`[0..1]`, origin top-left of page viewBox) → PDF points using `viewBox` (invert Y), then uses `viewport.convertToViewportPoint()` to get CSS px. Returns overlay geometry for rendering. |
| N8 | Verification pipeline | code checks (integrity-only in 0001; entailment is future) | call | returns verdict + failure reason code |
| N9 | Row status machine | status invariants + export gate | write | sets row status + blocks export by default on `citation_failed` |
| N10 | Failure logger | taxonomy + structured logs | write | emits safe failure events |
| N11 | Provenance store | minimal trace schema + export | write/call | returns run trace JSON |

## Viewer architecture (Next.js App Router)

This is a minimal, clean server/client boundary that keeps pdf.js imperative work on the client while fetching data server-first.

- `app/(app)/matters/[folderId]/page.tsx` (Server): fetch folder + docs + seeded report rows; render citation chips as `<Link>` to the viewer.
- `app/(app)/viewer/[documentId]/page.tsx` (Server): read `searchParams` (`page`, optional `citation`, optional `zoom`), server-fetch `render_url` and (if present) citation payload via `GET /citations/:id` (response `{ citation: { ... } }`); pass minimal props to client viewer.
- `PdfViewerClient` (Client): owns pdf.js load/render and page/zoom/rotation state; renders canvas + overlay; surfaces explicit failure states.
- `HighlightOverlaySvg` (Client): maps polygons to viewport CSS pixels (pure util) and renders an `<svg>` overlay sized to `viewport.width/height`.

### Fail-closed behaviour (viewer)
- If a citation is present but any invariants fail (doc mismatch, page out of range, polygons invalid/out of range, `render_url` unavailable), do not render an overlay. Show an explicit `citation_failed` UI state and emit a safe failure log.

Fixture seeding rule (PoC): each trust-substrate folder has exactly one fixture run created by the seeder with `runs.state = completed`; seeded report rows are `run_id` scoped and must obey the report row invariants.

## Wiring diagram

- Legend:
  - **Solid** = calls / triggers / writes
  - **Dashed** = returns / store reads

```mermaid
graph LR
  A["Matter list"] -->|create| N1
  N1 -.-> A
  A --> B["Matter detail"]
  B -->|upload| N2
  N2 --> N3
  N3 -.-> B
  B -->|open doc| V["Document viewer"]
  B -->|click citation| N5
  N5 --> V
  V --> N4
  N4 --> N7
  N5 -.-> N7
  B -->|verify row| N8
  N8 --> N9
  N9 -.-> B
  B -->|export| N9
  B --> N10
  B --> N11
```

## Parts list (BOM)

| Part | Name | Mechanism |
|---|---|---|
| F1 | Matter + upload baseline | Create matter, upload docs, show status list |
| F2 | PDF viewer | pdf.js viewer with page nav + zoom |
| F3 | Citation UI | Chips + jump-to-page + highlight overlay |
| F4 | Citation model + API | Canonical citation schema + `GET /citations/:id` |
| F5 | Verification gate | Status machine + verifier + export block |
| F6 | Failure UX | Missing docs + quality warnings + flag action |
| F7 | Provenance trace | Capture model/prompt/inputs + trace export |

## Fit check: requirements × concept

| Req | Requirement | Status | Fit |
|---|---|---|---|
| R1 | Matter creation + upload + view | core goal | ✅ |
| R2 | Citation chips + click-to-highlight | core goal | ⚠️ (depends on transform spike) |
| R3 | Canonical citation API | must-have | ✅ |
| R4 | Fail-closed verification | must-have | ⚠️ (depends on verifier spike) |
| R5 | Failure UX (missing docs, quality) | must-have | ⚠️ (depends on heuristics spike) |
| R6 | Provenance + trace export | must-have | ✅ |

### Unsolved

- R2: Can we reliably map anchor geometry across zoom levels?
- R4: Can we achieve high-precision verification without false passes?
- R5: Can missing-doc detection be accurate on noisy packs?

## Rabbit holes, cuts, and no-gos

### Rabbit holes

- PDF highlight coordinate transforms across zoom.
- Snippet canonicalisation + hash stability.
- Verification precision/latency trade-offs.

### Cuts / scope trims

- Do not require perfect OCR-derived highlight geometry before we can prove the trust UX. Use anchor fixtures first, then swap to OCR-derived geometry behind the same contracts.
- No advanced trace UI (endpoint/export only).

### Out of bounds / no-gos

- Auth/RBAC, integrations, external research.

## Optional: Extract vs duplicate analysis

Not applicable (no comparable existing feature).

## PRD slicing (record only; slice PRDs after spikes are closed)
Per `docs/00-strategy/initiatives/prd-slicing-rules.md`, slices should map to parts (F#) and affordances (U#/N#):
- Slice A (F1, U1–U4, N1–N3): Matter (folder) CRUD + upload pipeline + doc list statuses
- Slice B (F2, U7, N4): PDF viewer + render URL contract
- Slice C (F3, U6–U8, N5–N7): Citation chips + jump-to-highlight (anchors-first)
- Slice D (F4, N5): Citation locking + hashing util + citations API
- Slice E (F5–F6, U9–U12, N8–N10): Status machine + export gate + failure journeys
- Slice F (F7, U13, N11): Provenance capture + trace export

Notes:
- A draft `prd-overall.md`/`prd-overall.json` overall (spine) PRD may exist in this dossier for handoff, but implementation should happen via thin slice PRDs once spikes are closed and the perimeter is re-locked.
- Slice PRDs for 0001 live under `prds/` (see `prds/README.md`).

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/02-features/0002_quick-start-engine/brief.md
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

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/02-features/0002_quick-start-engine/specs/question_set_v1.json
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

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/03-architecture/20_state_model.md
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

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/layout.tsx
```tsx
import type { ReactNode } from "react";

import { isDemoModeEnabled } from "../lib/demoMode.server";

import "./globals.css";

import { DemoToolbar } from "./DemoToolbar";
import { ThemeProvider, themeInitScript } from "./ui/ThemeProvider";
import { ThemeToggle } from "./ui/ThemeToggle";

export const metadata = {
  title: "Orbital PoC",
  description: "Orbital Copilot PoC",
};

export default function RootLayout(props: { children: ReactNode }) {
  const demoEnabled = isDemoModeEnabled();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          {demoEnabled ? (
            <DemoToolbar />
          ) : (
            <div className="flex justify-end p-3">
              <ThemeToggle />
            </div>
          )}
          {props.children}
        </ThemeProvider>
      </body>
    </html>
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/03-architecture/00_overview.md
```md
# Orbital Copilot PoC Architecture
US CRE Title + Survey Quick Start (evidence-first, artefact-first)

> Note: This folder documents the **target** architecture. For what is implemented today, see
> `docs/03-architecture/07_current_poc_runtime.md`.

This is the top-level architecture summary. For deeper detail, see:
- System map + trust boundaries: `docs/03-architecture/10_system_architecture.md`
- State machines + invariants: `docs/03-architecture/20_state_model.md`
- Data + hashing + provenance: `docs/03-architecture/30_data_model.md`
- RAG + workflows + agents posture: `docs/03-architecture/40_rag_and_agents.md`
- Canonical HTTP contract: `docs/03-architecture/50_api_surface.md`
- Observability + evals: `docs/03-architecture/60_observability_and_evals.md`

## Purpose
Define a production-minded (but PoC-sized) architecture for a law-firm workflow that ingests a US CRE diligence pack and produces defensible artefacts with clause-level evidence.

Optimised for:
- Title commitment (Schedule A / B-I / B-II)
- Exception instruments (easements, REAs, CC&Rs, mortgages, plats)
- ALTA/NSPS survey (draft or final)
- Trust UX: click citation → see highlighted evidence in the PDF

## Product scope (what we will build)
A matter workspace that supports:
1) Upload + ingest a doc pack (PDF-first)
2) Run “Quick Start: Title + Survey”
3) Generate 3 artefacts (as report tables first, export later):
   - Schedule B-I Requirements tracker
   - Schedule B-II Exceptions table (linked to underlying instruments)
   - Survey reconciliation issues list (title ↔ survey)

Every material claim must have citations or “Not found in provided documents.”

## Non-goals (explicit)
- No legal advice / materiality decisions / negotiation posture
- No external web research inside the PoC run
- No integrations (iManage/NetDocs/SharePoint)
- No multi-tenant admin, SSO/RBAC, billing
- No property visualiser / boundary plotting (stretch only)

## Key architectural decisions (PoC defaults)
- Evidence-first with citation locking: citations are IDs, not free text (ADR-0001)
- Fail-closed verification: citation mismatch → row is `citation_failed` (ADR-0002)
- Artefacts-first UX: report table is the centre of gravity
- OCR/layout for all PDFs (PoC default): consistent geometry for highlights (ADR-0003)
- Deterministic page-bounded chunking + `index_version` bump rules (ADR-0015)
- File-backed, immutable question sets with run pinning (ADR-0016)
- Hybrid retrieval (RAG): lexical + vector search (optional rerank), then draft from evidence (ADR-0004)
- Deterministic-ish orchestration: explicit step machine, not free-running agents (ADR-0005)
- Fixture-driven reliability: synthetic packs + truth files used in CI-style evals (ADR-0006)
- Verification v1 is integrity-only (no entailment model) (ADR-0017)
- Trace export is admin-token gated (even in “no auth” PoC envs) (ADR-0018)
- Unsafe export override is API-only and demo-flag + admin-token gated (ADR-0019)
- Highlight overlay posture is “verified at 100% zoom only” in PoC v1 (ADR-0020)

Canonical ADRs for these defaults live in `docs/03-architecture/DECISIONS.md` (append-only).

## Where RAG fits
RAG is the engine inside Quick Start:
- Ingestion creates canonical page text + geometry, then chunks + indexes
- Retrieval returns chunk IDs (hybrid lexical + vector; optional rerank)
- Drafting uses only retrieved evidence
- Verification locks citations and fails closed on integrity/invariant failures. Semantic correctness is a reviewer responsibility in v1 (ADR-0017).

## Where evals fit
Evals are first-class because trust is the product:
- Compare outputs against `/truth` in the synthetic packs
- Validate citation integrity (hash + page + geometry)
- Spot retrieval misses and false passes before demos

## Tech stack and framework choices
See:
- `docs/03-architecture/05_tech_stack_and_dev_workflow.md` for stack, dev workflow, and fixtures
- `docs/03-architecture/06_frameworks_agents_rag_evals.md` for framework options and why we chose Workflow DevKit

## Security and data handling (PoC, explicit)
- Storage boundaries:
  - Raw PDFs and exports live in object storage.
  - Extracted text + geometry (OCR/layout), chunks, and citation snippets live in Postgres and must be treated as sensitive.
- Provider boundaries:
  - OCR/LLM/embeddings calls may transmit document content to third-party providers.
  - Default posture: send the minimum required text for the current step; do not persist provider request/response payloads by default.
- Client/API safety:
  - Client responses never include provider payloads or stack traces (safe error envelope; ADR-0008).
  - Admin-only endpoints (eg run trace export) must be gated by `X-Orbital-Admin-Token` matching `ORBITAL_ADMIN_TOKEN` (ADR-0018).
- Logging + telemetry redaction:
  - Never log raw PDFs, full extracted text, provider payload dumps, admin tokens, or signed URLs.
  - Prefer opaque IDs + hashes + counts + timings, with `trace_id` for correlation.
- Signed URL posture (shared/demo envs):
  - Generate short-TTL signed URLs on demand; never persist signed URLs; never log them.

Note: the detailed data-handling posture is currently captured as ADR-0021 (proposed). Until accepted, treat it as the default and evolve it explicitly.

## Open decisions to pin (before implementation)
These should become explicit (ideally as ADRs) before we build the relevant slices:
- Embeddings: model + dimension (and index parameters) to treat as the default for fixtures/evals.
- Auth posture for the PoC: what is (and is not) protected in demo environments.
- Data handling posture details: retention windows, provider data policies, and telemetry redaction defaults (ADR-0021 is proposed).

```

File: /Users/marc/Code/personal-projects/legaltech-poc/packages/core/src/verify/verifier.ts
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
    return {
      verdict: "fail",
      reason_code: "VALIDATION_ERROR",
      reason: "Input did not match VerifyInput schema.",
      timings_ms: { total: performance.now() - t0, deterministic: performance.now() - t0 },
    };
  }

  const tDetStart = performance.now();

  if (parsed.data.answer === "Not found in provided documents." && parsed.data.citations.length !== 0) {
    return {
      verdict: "fail",
      reason_code: "MISSING_INPUT_INVARIANT",
      reason: "missing_input answers must have zero citations.",
      timings_ms: { total: performance.now() - t0, deterministic: performance.now() - t0 },
    };
  }

  if (parsed.data.answer !== "Not found in provided documents." && parsed.data.citations.length === 0) {
    return {
      verdict: "fail",
      reason_code: "NO_CITATIONS",
      reason: "Non-missing_input answers must include at least one citation.",
      timings_ms: { total: performance.now() - t0, deterministic: performance.now() - t0 },
    };
  }

  for (const cit of parsed.data.citations) {
    const computed = hashSnippet(cit.snippet);
    if (computed !== cit.snippet_hash) {
      return {
        verdict: "fail",
        reason_code: "CITATION_MISMATCH",
        reason: "snippet_hash did not match the canonical hash of snippet.",
        timings_ms: { total: performance.now() - t0, deterministic: performance.now() - t0 },
      };
    }
  }

  const tDetEnd = performance.now();

  if (opts.mode === "deterministic-only") {
    return {
      verdict: "pass",
      reason_code: "DETERMINISTIC_ONLY",
      timings_ms: { total: performance.now() - t0, deterministic: tDetEnd - tDetStart },
    };
  }

  if (!opts.entailment) {
    return {
      verdict: "fail",
      reason_code: "ENTAILMENT_NOT_CONFIGURED",
      reason: "Entailment verifier is required in entailment mode.",
      timings_ms: { total: performance.now() - t0, deterministic: tDetEnd - tDetStart },
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
        total: performance.now() - t0,
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
      total: performance.now() - t0,
      deterministic: tDetEnd - tDetStart,
      entailment: tEntEnd - tEntStart,
    },
  };
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/ui/Badge.tsx
```tsx
import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type BadgeVariant = "muted" | "primary" | "success" | "warning" | "destructive" | "info";
export type BadgeSize = "sm" | "md";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
};

const variantClasses: Record<BadgeVariant, string> = {
  muted: "bg-muted text-muted-foreground ring-border/60",
  primary: "bg-primary/10 text-primary ring-primary/20",
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-warning ring-warning/20",
  destructive: "bg-destructive/10 text-destructive ring-destructive/20",
  info: "bg-info/10 text-info ring-info/20",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-2xs px-1.5 py-px",
  md: "text-xs px-2 py-0.5",
};

export function badgeClassName(args?: { variant?: BadgeVariant; size?: BadgeSize; className?: string }) {
  const variant = args?.variant ?? "muted";
  const size = args?.size ?? "md";
  return cn(
    "inline-flex items-center rounded-full font-medium ring-1 ring-inset",
    sizeClasses[size],
    variantClasses[variant],
    args?.className,
  );
}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={badgeClassName({ variant, size, className })} {...props} />;
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/02-features/0001_trust-substrate/brief.md
```md
# Brief: 0001 Trust Substrate (Initiative 1)

## Context (why this, why now)
Trust UX is the product. Before any “Quick Start” generation is credible, we need an evidence layer that:
- stores citations as locked, immutable objects
- lets a reviewer click a citation chip and see the highlighted clause in a PDF viewer
- fails closed when evidence can’t be verified
- makes failure states explicit and actionable

This work is the foundation for Initiatives 002 (Quick Start engine) and 003 (demo-grade outputs). If trust fails, everything else is noise.

## Goals
- A user can create a **Matter** (API/DB: `folder`), upload PDFs, and view them reliably.
- Citations are first-class, immutable objects (`citation_id` references only).
- Clicking a citation opens the right document + page and overlays a highlight polygon with snippet + snippet hash.
- Row-level statuses are terminal for the workflow (`needs_review|reviewed|missing_input|citation_failed`) and export is blocked by default when any row is `citation_failed`.
- Failures are explicit and actionable: missing docs checklist, doc quality warnings, citation mismatch details.
- Minimum viable provenance exists so we can answer: “why did this row exist?”

## Non-goals
- Auth/RBAC, integrations, sharing, multi-tenant admin.
- External web research inside runs.
- A full retrieval/generation “Quick Start” (this dossier establishes the trust primitives it will use).
- Legal/materiality judgement.
- Fancy monitoring dashboards (structured logs + trace IDs only).

## Perimeter lock (in scope)
- **Matter (folder) baseline:** create folder, upload documents, list docs, view PDFs in a viewer with page navigation + zoom.
- **Citation UX scaffold:** seeded report rows + citation chips that jump to viewer and highlight evidence using fixture anchors (`docs/08-example-data/*/layout/*.anchors.json`).
- **Citation contract:** canonical, locked citation object + `GET /citations/:id` (snippet + `snippet_hash` + polygons + page).
- **Row status + gate:** status machine and “export blocked” behaviour when any row is `citation_failed` (code checks first; entailment verifier as a follow-on slice).
- **Failure journeys:** `missing_input` behaviour + missing-doc checklist, extraction quality warnings, citation mismatch UX, “flag citation wrong”.
- **Provenance + trace export:** minimal run trace export (developer-facing; no UI beyond a download button).
- **Fail-closed highlight behaviour:** highlights must only render when citation invariants hold (doc/page/polygons/snippet_hash); otherwise show explicit `citation_failed` and render no “best effort” overlay.

## Explicit out of scope
- Requiring perfect OCR-derived highlight geometry before we can prove the "trust moment".
  - We still treat OCR/layout extraction as the default ingest posture (ADR-0003).
  - For the highlight overlay spike (RH2), we use fixture anchors first to validate the mapping math, then swap to OCR-derived geometry later behind the same contracts.
- Any agent loops or free-form chat.
- Anything that requires per-firm templates or customization.

## Acceptance signals (fixture-driven)
- `pack_01_clean`
  - viewer renders; page nav is responsive
  - seeded row shows citation chips; click chip highlights correct region and shows snippet + `snippet_hash`
  - highlight is verified at 100% zoom only (cut); viewer enforces 100% zoom while a highlight is active
- `pack_02_missing_rea`
  - rows that depend on missing docs are `missing_input` and include a missing-doc checklist
  - `missing_input` rows use the exact answer string: `Not found in provided documents.` and have zero citations (state model invariant)
- `pack_07_scans_rotated_low_quality`
  - viewer remains usable on scanned/rotated PDFs
  - doc quality warnings are visible (even if quality is initially stubbed)
  - highlight remains aligned on a rotated/scanned page (or we explicitly cut/patch with an honest evidence fallback)
- One deliberate bad citation (mismatching `snippet_hash`) yields `citation_failed` and export is blocked by default.

## Constraints / guardrails (must align with `docs/03-architecture`)
- Terminology: **Folder** is API/DB; UI calls it **Matter**. (`docs/03-architecture/20_state_model.md`)
- Evidence-first + citation locking (ADR-0001) and fail-closed verification (ADR-0002). (`docs/03-architecture/DECISIONS.md`)
- No external web research (ADR-0007).
- API error envelope; do not leak internals. (`docs/03-architecture/50_api_surface.md`, `docs/03-architecture/AGENTS.md`)
- State invariants are non-negotiable:
  - `missing_input` rows must have answer exactly `Not found in provided documents.` and zero citations.
  - exports are blocked by default when any row is `citation_failed` (and may also require `runs.state = completed`, per API surface).
- Validate inputs at boundaries with Zod; client/server module boundaries must remain clean. (`apps/web/AGENTS.md`)

## Risks / unknowns (treatments)
See `risk-register.md`. Biggest rabbit holes:
- pdf.js performance on scanned packs (`pack_07_scans_rotated_low_quality`)
- highlight overlay coordinate transforms across zoom
- snippet normalisation + stable hashing rules in practice
- verification precision (false passes) vs latency/cost
- missing-doc detection heuristics

## Open questions
- Appetite/timebox: are we shaping the full trust substrate perimeter above, or do we want to cut to “trust moment only” (viewer + click-to-highlight) first?
- Storage access pattern for pdf.js: signed URLs vs proxy endpoint?
- DECIDED: Verification v1 is integrity-only (ADR-0017). (Future: entailment verifier gated + fixture-eval’d.)
- Minimum trace schema: what is required vs nice-to-have?

## PRD slices (drafted; implement after spikes)
Per `docs/00-strategy/initiatives/prd-slicing-rules.md`, slice PRDs are drafted under `prds/`, but implementation should start only once spikes are executed and the perimeter is re-locked:
1) Folder (matter) CRUD + upload + document list (baseline UI)
2) PDF viewer (page nav + zoom) + render URL endpoint
3) Citation chip UI + jump-to-page + highlight overlay (anchors-first)
4) Citation contract: lock + `GET /citations/:id` + snippet hashing util
5) Status machine + export gate + failure journeys UX
6) Provenance + run trace export (developer-facing)

Note:
- Slice PRDs for 0001 live under `prds/` (see `prds/README.md`).

## Shaping decision (GO/NO-GO)
NO-GO until spike items in `spike-investigation.md` are executed and outcomes are recorded, and the perimeter above is re-confirmed based on spike outcomes.

Oracle pass status:
- RH2 (highlight overlay): oracle review captured in `tmp-oracle/oracle_response_0001.md` (2026-02-06). Spike execution still pending.

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/03-architecture/40_rag_and_agents.md
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

Implementation notes:
- OCR/layout is abstracted behind one adapter interface (ADR-0012; accepted).
- Chunking must be deterministic for a given `(document_id, index_version)`; if you change chunking logic, bump the folder `index_version`.

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

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/_templates/README.md
```md
# Legacy Templates (Deprecated)

These files are legacy scaffolds and may not match current dossier practice.

Prefer using the repo skills/workflows to generate up-to-date scaffolding, and use
the existing dossiers under `docs/04-projects/02-features/` as real examples.

If/when the skills fully own scaffolding, this folder can be deleted.

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(app)/matters/viewer/page.tsx
```tsx
import { z } from "zod";

import { hashSnippet } from "@legaltech-poc/core/citations/snippet";
import { fixtureDocumentId } from "@legaltech-poc/core/fixtures/fixtureIds";

import { headers } from "next/headers";

import { assertDevOnly } from "../../../../lib/devOnly";
import { loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";

import { CitationViewerClient } from "./CitationViewerClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SearchSchema = z.object({
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i),
  citation: z.string().min(1),
  document_id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_.-]+$/i, "Invalid document id")
    .optional(),
  page: z.coerce.number().int().positive().optional(),
});

const CitationResponseSchema = z.object({
  citation: z.object({
    id: z.string().min(1),
    document_id: z.string().min(1),
    page_number: z.number().int().positive(),
    polygons: z
      .array(z.array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)])).min(3))
      .min(1),
    snippet: z.string(),
    snippet_hash: z.string().min(1),
  }),
});

const RenderResponseSchema = z.object({
  document_id: z.string().min(1),
  page: z.number().int().positive(),
  render_url: z.string().min(1),
});

async function originFromRequestHeaders(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  // Best-effort fallback for local dev.
  return "http://localhost:3000";
}

type SafeErr = { code: string; message: string };

function safeErrFromJson(json: unknown, fallback: SafeErr): SafeErr {
  if (!json || typeof json !== "object" || Array.isArray(json)) return fallback;
  const env = (json as { error?: unknown }).error;
  if (!env || typeof env !== "object" || Array.isArray(env)) return fallback;
  const code = (env as { code?: unknown }).code;
  const message = (env as { message?: unknown }).message;
  return {
    code: typeof code === "string" && code.trim() ? code.trim() : fallback.code,
    message: typeof message === "string" && message.trim() ? message.trim() : fallback.message,
  };
}

export default async function MatterViewerPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  assertDevOnly();

  const searchParams = (await props.searchParams) ?? {};
  const parsed = SearchSchema.safeParse(searchParams);
  if (!parsed.success) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invalid query params.</p>
      </main>
    );
  }

  const packId = parsed.data.pack;
  const citationId = parsed.data.citation;
  const requestedDocId = parsed.data.document_id ?? null;
  const requestedPage = parsed.data.page ?? null;

  const snapshot = loadSeedSnapshot(packId);
  if (!snapshot) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No seeded snapshot for <span className="font-mono">{packId}</span>. Run{" "}
          <code className="font-mono">pnpm fixture:seed {packId}</code>.
        </p>
      </main>
    );
  }

  const origin = await originFromRequestHeaders();

  let citationJson: unknown;
  try {
    const res = await fetch(`${origin}/citations/${encodeURIComponent(citationId)}?${new URLSearchParams({ pack: packId }).toString()}`, {
      cache: "no-store",
    });
    citationJson = await res.json().catch(() => null);
    if (!res.ok) {
      const e = safeErrFromJson(citationJson, { code: "CITATION_FETCH_FAILED", message: `Request failed (${res.status}).` });
      return (
        <main className="mx-auto max-w-3xl p-6">
          <h1 className="text-xl font-semibold">Viewer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Failed to load citation: <span className="font-mono">{citationId}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {e.code}: {e.message}
          </p>
          <div className="mt-4">
            <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
              Back to matters
            </a>
          </div>
        </main>
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Failed to load citation: <span className="font-mono">{citationId}</span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{message}</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const parsedCitation = CitationResponseSchema.safeParse(citationJson);
  if (!parsedCitation.success) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invalid citation payload.</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const cit = parsedCitation.data.citation;

  if (!cit) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Citation not found: <span className="font-mono">{citationId}</span>
        </p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const computed = hashSnippet(cit.snippet);
  let resolvedDocId = requestedDocId ?? cit.document_id;
  if (requestedDocId && /\.pdf$/i.test(requestedDocId) && !requestedDocId.startsWith("fx_")) {
    try {
      resolvedDocId = fixtureDocumentId({ packId, filename: requestedDocId });
    } catch {
      // Preserve the original string if it doesn't match the fixture id contract.
    }
  }
  const resolvedPage = requestedPage ?? cit.page_number;
  let errorCode: string | null = null;
  if (computed !== cit.snippet_hash) errorCode = "SNIPPET_HASH_MISMATCH";
  else if (resolvedDocId !== cit.document_id) errorCode = "DOC_MISMATCH";
  else if (resolvedPage !== cit.page_number) errorCode = "WRONG_PAGE";

  let renderJson: unknown;
  try {
    const res = await fetch(`${origin}/documents/${encodeURIComponent(resolvedDocId)}/render?page=${resolvedPage}`, {
      cache: "no-store",
    });
    renderJson = await res.json().catch(() => null);
    if (!res.ok) {
      const e = safeErrFromJson(renderJson, { code: "RENDER_URL_FAILED", message: `Request failed (${res.status}).` });
      return (
        <main className="mx-auto max-w-3xl p-6">
          <h1 className="text-xl font-semibold">Viewer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Failed to fetch render_url for <span className="font-mono">{resolvedDocId}</span> (page {resolvedPage}).
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {e.code}: {e.message}
          </p>
          <div className="mt-4">
            <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
              Back to matters
            </a>
          </div>
        </main>
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Failed to fetch render_url for <span className="font-mono">{resolvedDocId}</span> (page {resolvedPage}).
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{message}</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const parsedRender = RenderResponseSchema.safeParse(renderJson);
  if (!parsedRender.success) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invalid render_url payload.</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const pdfUrl = parsedRender.data.render_url;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center gap-3">
        <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
          Back to matters
        </a>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">citation:</span> <span className="font-mono">{citationId}</span>
        </div>
      </div>

      <div className="mt-6">
        <CitationViewerClient
          packId={packId}
          citationId={citationId}
          pdfUrl={pdfUrl}
          documentId={resolvedDocId}
          pageNumber={resolvedPage}
          polygons={cit.polygons}
          snippet={cit.snippet}
          snippetHash={cit.snippet_hash}
          computedSnippetHash={computed}
          errorCode={errorCode}
        />
      </div>
    </main>
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/ui/ThemeToggle.tsx
```tsx
"use client";

import { useTheme, type Theme } from "./ThemeProvider";
import { cn } from "./cn";

const options: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-pill border border-border bg-card p-0.5",
        className,
      )}
      role="radiogroup"
      aria-label="Theme"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={theme === opt.value}
          onClick={() => setTheme(opt.value)}
          className={cn(
            "rounded-pill px-2.5 py-1 text-xs font-medium transition-colors duration-micro ease-brand-standard",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
            theme === opt.value
              ? "bg-muted text-foreground shadow-ui-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/page.tsx
```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Orbital PoC</h1>
      <p className="mt-2 text-muted-foreground">
        Dev-only spike harness routes live under <code>/spikes</code>.
      </p>

      <ul className="mt-6 list-disc pl-5 text-foreground">
        <li>
          <Link className="underline hover:text-primary" href="/matters">
            Matters: demo UI (citation chips → viewer → overlay)
          </Link>
        </li>
        <li>
          <Link className="underline hover:text-primary" href="/spikes/rh1-pdf-perf">
            RH1: pdf.js perf harness
          </Link>
        </li>
        <li>
          <Link className="underline hover:text-primary" href="/spikes/rh2-overlay">
            RH2: highlight overlay harness
          </Link>
        </li>
      </ul>
    </main>
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/ui/Button.tsx
```tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "./cn";

export type ButtonVariant = "primary" | "neutral" | "secondary" | "ghost" | "destructive" | "success" | "outline" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  neutral: "bg-foreground text-background hover:bg-foreground/90",
  secondary: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  success: "bg-success text-success-foreground hover:bg-success/90",
  outline: "border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
  link: "bg-transparent text-foreground underline underline-offset-4 hover:text-primary p-0 h-auto shadow-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-3 py-2 text-sm",
  lg: "h-11 px-5 text-base",
};

export function buttonClassName(args?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const variant = args?.variant ?? "primary";
  const size = args?.size ?? "md";

  return cn(
    "inline-flex items-center justify-center gap-2 rounded-ui-md font-medium transition-colors duration-micro ease-brand-standard",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-60",
    variant !== "link" && sizeClasses[size],
    variantClasses[variant],
    args?.className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, type, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
});

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(api)/documents/[id]/pdf/route.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";
import { parseFixtureDocumentId } from "@legaltech-poc/core/fixtures/fixtureIds";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { parseSingleRangeHeader } from "../../../../../lib/httpRange.server";
import { createObjectReadStream, statObject, validateStorageKey, verifySignature } from "../../../../../lib/objectStore.server";
import { safePdfFilename } from "../../../../../lib/safePdfFilename.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

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

  const documentId = parsedParams.data.id;

  const url = new URL(req.url);
  const expiresRaw =
    url.searchParams.get("expires") ??
    url.searchParams.get("x_orbital_render_expires") ??
    req.headers.get("x-orbital-render-expires");
  const sigRaw =
    url.searchParams.get("sig") ??
    url.searchParams.get("x_orbital_render_signature") ??
    req.headers.get("x-orbital-render-signature");

  if (!expiresRaw || !sigRaw) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Missing render signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  const expiresAtMs = Number(expiresRaw);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid render expires.", traceId }), {
      status: 400,
      headers,
    });
  }

  if (Date.now() > expiresAtMs) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Render URL expired.", traceId }), {
      status: 403,
      headers,
    });
  }

  const fixture = parseFixtureDocumentId(documentId);
  if (fixture.ok) {
    // Fixture documents are only available in dev.
    if (process.env.NODE_ENV !== "development") {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const sigOk = verifySignature({ purpose: "get", storageKey: `fixture:${documentId}`, expiresAtMs, sig: sigRaw });
    if (!sigOk) {
      return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid render signature.", traceId }), {
        status: 403,
        headers,
      });
    }

    const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data");
    const candidate = path.resolve(packRoot, fixture.packId, "docs", fixture.filename);
    if (!candidate.startsWith(packRoot + path.sep)) {
      return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid path.", traceId }), {
        status: 400,
        headers,
      });
    }

    let stat: fs.Stats;
    try {
      stat = fs.statSync(candidate);
    } catch {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
        status: 404,
        headers,
      });
    }
    if (!stat.isFile()) {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const size = stat.size;
    const rangeHeader = req.headers.get("range");
    const range = rangeHeader ? parseSingleRangeHeader(rangeHeader, size) : null;

    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `inline; filename="${safePdfFilename(fixture.filename)}"`);

    if (!rangeHeader) {
      headers.set("Content-Length", String(size));
      const nodeStream = fs.createReadStream(candidate);
      return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 200, headers });
    }

    if (!range) {
      headers.set("Content-Range", `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }

    const { start, end } = range;
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));

    const nodeStream = fs.createReadStream(candidate, { start, end });
    return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 206, headers });
  }

  await ensureSchema();

  const docs = await sql<Array<{ id: string; storage_key: string | null; filename: string }>>`
    SELECT id, storage_key, filename
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (!doc.storage_key) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has no storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has an invalid storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const sigOk = verifySignature({ purpose: "get", storageKey: doc.storage_key, expiresAtMs, sig: sigRaw });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid render signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  let stat;
  try {
    stat = await statObject(doc.storage_key);
  } catch {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), { status: 404, headers });
  }
  if (!stat.isFile()) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), { status: 404, headers });
  }

  const size = stat.size;
  const rangeHeader = req.headers.get("range");
  const range = rangeHeader ? parseSingleRangeHeader(rangeHeader, size) : null;

  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `inline; filename="${safePdfFilename(doc.filename)}"`);

  if (!rangeHeader) {
    headers.set("Content-Length", String(size));
    const nodeStream = createObjectReadStream(doc.storage_key);
    return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 200, headers });
  }

  if (!range) {
    headers.set("Content-Range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }

  const { start, end } = range;
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));

  const nodeStream = createObjectReadStream(doc.storage_key, { start, end });
  return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 206, headers });
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/validateNormPolygons.ts
```ts
import type { NormPolygons } from "@legaltech-poc/core";

export function validateNormPolygons(polygons: NormPolygons): string | null {
  if (!polygons.length) return "NO_POLYGONS";
  for (const poly of polygons) {
    if (poly.length < 3) return "POLYGON_TOO_SMALL";
    for (const [x, y] of poly) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return "NON_FINITE";
      if (x < 0 || x > 1 || y < 0 || y > 1) return "OUT_OF_RANGE";
    }
  }
  return null;
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/ui/Chip.tsx
```tsx
import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type ChipVariant = "filter" | "citation";
export type ChipDot = "success" | "warning" | "destructive" | "muted";

export type ChipProps = HTMLAttributes<HTMLElement> & {
  variant?: ChipVariant;
  active?: boolean;
  dot?: ChipDot;
  as?: "span" | "button" | "a";
  href?: string;
};

const dotColors: Record<ChipDot, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground",
};

export function chipClassName(args?: {
  variant?: ChipVariant;
  active?: boolean;
  className?: string;
}) {
  const variant = args?.variant ?? "filter";
  return cn(
    "inline-flex items-center gap-2 rounded-pill border border-border bg-card font-medium transition-colors duration-micro ease-brand-standard hover:border-foreground/20",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variant === "citation" ? "font-mono text-2xs px-2.5 py-0.5" : "text-sm px-3 py-1",
    args?.active && "bg-primary/10 border-primary text-primary font-semibold",
    args?.className,
  );
}

export function Chip({ className, variant, active, dot, as = "span", href, children, ...props }: ChipProps) {
  const Tag = as as "span";
  return (
    <Tag
      className={chipClassName({ variant, active, className })}
      {...(as === "a" && href ? { href } : {})}
      {...props}
    >
      {dot ? <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotColors[dot])} aria-hidden="true" /> : null}
      {children}
    </Tag>
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-script.md
```md
# Demo Script: Orbital Copilot PoC (Trust Substrate)

- PoC: **Orbital Copilot PoC**
- Tagline: Evidence-first CRE diligence. Click a citation and see the clause highlighted, or fail closed.
- Audience: Mixed (product + engineering)
- Scope: **US only**
- Segment:
  - Organisation: US CRE law firm (title + survey diligence)
  - Buyer: Partner / practice lead / ops lead (cares about turnaround time and liability)
  - End user: Associate / paralegal doing first-pass diligence under time pressure
- Business success outcome: Target: reduce first-pass diligence time from hours to <30 minutes per matter while keeping **zero uncited material claims** in outputs (measured on fixture packs first, then pilot matters).

## Pre-demo setup (not spoken, 5 minutes before)

0. Ensure Postgres is running (local Docker):

```bash
docker compose up -d db
```

1. Seed fixture packs (this populates `tmp/fixture-seed/*/snapshot.json`):

```bash
pnpm fixture:seed pack_01_clean pack_02_missing_rea pack_07_scans_rotated_low_quality pack_09_bad_citation --overwrite
```

2. Start the app in dev mode (required; `/matters` is dev-only):

```bash
pnpm dev
```

3. Open:
- `http://localhost:3000/matters?pack=pack_01_clean`
- Keep this runbook open: `docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-runbook.html`

Optional:
- If you plan to click “Export CSV”: set `SPIKES_ENABLED=1` and restart `pnpm dev` (the `/spikes/*` endpoints are gated).
- Enable trace export (dev-only UI): set `FEATURE_TRACE_EXPORT=1` and `ALLOW_ADMIN_BYPASS=1`, then restart `pnpm dev`.

## 0) Caveats upfront (say within 10 seconds, while already on the Matters page)

- "Caveats upfront: synthetic customer data including made up packs, segmentation and positioning were not a focus, and this is not production ready."
- "Goal was a mini Orbital Copilot PoC with a special feature: **fail-closed, locked citations with click-to-highlight evidence**."
- "Evidence is preliminary in the sense that the wider workflow is not implemented yet. What is implemented is the trust substrate and failure posture."
- "Scope is US only."

## 1) User story and emotional context (20 to 30 seconds)

Say:
- "This is for a US CRE law firm team. The buyer is the practice lead who is accountable for turnaround and risk."
- "The end user is an associate or paralegal who is triaging a pack: title commitment, exception instruments, survey."
- "They're trying to turn a messy pack into a defensible first pass. They feel rushed and uncertain because they're stitching across PDFs and cannot afford to be wrong."
- "What better feels like is confidence and speed: fewer guesses, fewer tabs, and an audit trail when you are challenged."

## 2) Demo run (happy path first) (2 to 3 minutes)

### Step 1: Start at the real entry point (Matters list)
- What to show: `http://localhost:3000/matters?pack=pack_01_clean`
- What to say: "This is the entry point. No slides."

### Step 2: Pick a row and click a citation chip (the trust moment)
- What to click: any `cit_*` chip on a `needs_review` row.
- What to show:
  - The PDF renders.
  - Highlight overlay appears at 100% zoom (zoom is locked while highlighting).
  - The snippet and `snippet_hash` are visible.
- What to say:
  - "The trust UX is the product. A citation is an ID that resolves to an immutable evidence object."
  - "You can see the snippet and its hash. If any invariant breaks, we fail closed and render no overlay."

### Step 3: Show that review state is explicit (no silent 'looks good')
- What to click: "Mark reviewed" on one `needs_review` row.
- What to say:
  - "Statuses are terminal. We don't hide uncertainty."
  - "This is intentionally small, but it's the spine the later initiatives build on."

## 3) Edge cases and safety behaviour (1 to 2 minutes)

### Edge case A: Missing inputs is a first-class outcome (pack_02)
- Navigate: switch "Seeded pack" to `pack_02_missing_rea`.
- What to show:
  - A row with status `missing_input`.
  - Answer string is exactly: `Not found in provided documents.`
  - Missing document checklist with evidence signals.
- What to say:
  - "If we cannot ground it in provided documents, we say so. That is deliberate."
  - "The invariant is strict: missing_input means zero citations. No bluffing."

### Edge case B: Corrupted citation fails closed (no overlay)
- On any pack: click the bad-citation fixture row (`TB-BAD-CITATION`) if present, then click `cit_TB_BAD_1`.
- What to show:
  - The viewer shows `citation_failed` with a reason code (for example `SNIPPET_HASH_MISMATCH`).
  - No overlay renders; export posture stays blocked.
- What to say:
  - "This is the failure posture we want in a high-stakes workflow."

### Optional edge case C: Scanned / rotated pack (pack_07)
- Switch pack to `pack_07_scans_rotated_low_quality`.
- What to show:
  - The viewer is usable.
  - Rotation control works.
  - Highlight stays aligned at 100% zoom, or fails closed with an explicit reason code.

## 4) Transition to why, what, how (15 seconds)

Say:
- "Now that you've seen the end-to-end trust moment, here's why we built it, what we scoped, and how it works."

## 5) Why (30 to 60 seconds)

- Trust UX is the wedge. If trust fails, everything downstream is noise.
- The problem is not 'answers'; it's reviewable, defensible artefacts where the user can jump to the clause.
- This shifts the user from uncertainty to clarity, and it gives the business a path to measurable reliability.

## 6) What (scope and non-goals) (45 to 60 seconds)

In scope today (implemented, Initiative 0001):
- Fixture-seeded Matters UI
- Citation chips that resolve to a locked evidence object
- PDF viewer with highlight overlay (verified at 100% zoom only; deliberate cut)
- Fail-closed behaviour (hash mismatch, wrong page/doc, invalid geometry)
- Missing-input checklist and strict invariants
- Export gate posture (blocked on failures by default)

In scope next (placeholder scaffolding, Initiatives 0002 and 0003):
- Quick Start engine: title + survey -> 3 artefacts (requirements, exceptions, survey issues)
- Demo-grade outputs: exports + repeatability + eval harness + demo controls

Out of scope (explicit cuts):
- External web research inside runs
- Legal advice / materiality judgement
- Production hardening, auth, multi-tenant admin

## 7) Competitive landscape (1 to 2 minutes, respectful)

Frame:
- "There are a few sensible approaches, depending on what you optimise for."

Neutral patterns:
- Speed and breadth: great for adoption; more variance in provenance.
- Workflow automation: deterministic; less flexible in messy edge cases.
- Deep provenance (our bias): more trust; more engineering and sometimes more latency.

Our posture:
- "We're optimising for trust and reviewer confidence because the user is risk-averse and cannot afford incorrect claims."
- Trade-offs accepted: narrower scope, more upfront plumbing, slower to expand coverage.

Close:
- "It's not better, it's designed for different constraints."

## 8) Technical architecture (2 to 3 minutes)

Stack (current PoC slice):
- Next.js (App Router) + React + Tailwind
- `pdfjs-dist` for PDF rendering + overlay layer
- Zod validation and safe error envelope
- Fixture packs (`docs/08-example-data/*`) + seed snapshots (`tmp/fixture-seed/*`)

Planned for 0002/0003:
- Workflow step machine (retrieve -> draft -> lock citations -> verify -> write)
- Hybrid retrieval (lexical + vector) returning chunk IDs
- Fixture-driven evals comparing outputs to `/truth`
- Observability: traces + versioning + latency/cost metrics

Key policies:
- Citations are IDs only (locked immutable objects).
- Verification is fail-closed (integrity/invariants first; no "best effort" overlays).
- Missing input is valid and strict: exact string + zero citations.

## 9) Close (30 to 45 seconds)

Recap:
- "You saw the trust moment: click-to-highlight evidence with snippet hashing and fail-closed behaviour."
- "You saw the missing-input posture: explicit, actionable, and uncited by design."
- "The next two initiatives build on this spine: Quick Start generation and demo-grade exports/evals."

Repeat caveats briefly:
- synthetic packs, segmentation/positioning not focus, not production ready, US only.

## Q&A prompts (optional)

- "How do we stop hallucinations?"
  - "We don't let claims exist without locked evidence. If not grounded: `missing_input`."
- "What's the eval plan?"
  - "Fixture packs with `/truth` + hard gates on citation integrity and expected failure journeys."
- "What would productionisation require?"
  - "Auth, secure storage, provider data posture, durable workflow runner, and hardening performance on scanned packs."

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/fixtureSeed.server.ts
```ts
import "server-only";

import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

import { fixtureDocumentId } from "@legaltech-poc/core/fixtures/fixtureIds";

const SeedStatusSchema = z.enum(["needs_review", "reviewed", "missing_input", "citation_failed"]);

export const SeedCitationSchema = z.object({
  // Back-compat: older snapshots may not include document_id yet.
  document_id: z.string().min(1).optional(),
  document_filename: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+\.pdf$/i, "Invalid document filename"),
  page_number: z.number().int().positive(),
  polygons: z
    .array(
      z
        .array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).readonly())
        .min(3),
    )
    .min(1),
  snippet: z.string(),
  snippet_hash: z.string().min(1),
});

export type SeedCitation = z.infer<typeof SeedCitationSchema>;

export type ResolvedSeedCitation = Omit<SeedCitation, "document_id"> & { document_id: string };

export const SeedSnapshotSchema = z.object({
  meta: z
    .object({
      pack_id: z.string().min(1),
    })
    .passthrough(),
  rows: z.array(
    z
      .object({
        question_id: z.string().min(1),
        question: z.string().min(1),
        answer: z.string(),
        status: SeedStatusSchema,
        citation_ids: z.array(z.string().min(1)),
        notes: z.string().nullable().optional(),
      })
      .passthrough(),
  ),
  citations: z.record(z.string().min(1), SeedCitationSchema),
});

export type SeedSnapshot = z.infer<typeof SeedSnapshotSchema>;
export type ResolvedSeedSnapshot = Omit<SeedSnapshot, "citations"> & { citations: Record<string, ResolvedSeedCitation> };

function seedRoot(): string {
  // In Next dev, `process.cwd()` resolves to `apps/web`.
  return path.resolve(process.cwd(), "../../tmp/fixture-seed");
}

export function listSeededPackIds(): string[] {
  const root = seedRoot();
  if (!fs.existsSync(root)) return [];

  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && /^pack_\d{2}_[a-z0-9_]+$/i.test(e.name))
    .map((e) => e.name)
    .sort();
}

export function seedSnapshotPath(packId: string): string {
  return path.join(seedRoot(), packId, "snapshot.json");
}

export function loadSeedSnapshot(packId: string): ResolvedSeedSnapshot | null {
  const filePath = seedSnapshotPath(packId);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = SeedSnapshotSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    // Keep errors explicit in dev; this is a dev-only tracer bullet.
    throw new Error(`Invalid seed snapshot (${filePath}): ${parsed.error.message}`);
  }

  const citations: Record<string, ResolvedSeedCitation> = {};
  for (const [citationId, cit] of Object.entries(parsed.data.citations ?? {})) {
    citations[citationId] = {
      ...cit,
      document_id: cit.document_id ?? fixtureDocumentId({ packId, filename: cit.document_filename }),
    };
  }

  return { ...parsed.data, citations };
}

export function saveSeedSnapshot(packId: string, snapshot: SeedSnapshot): void {
  // Keep this dev-only tracer bullet strict: refuse to persist invalid snapshots.
  const parsed = SeedSnapshotSchema.safeParse(snapshot);
  if (!parsed.success) {
    throw new Error(`Refusing to save invalid seed snapshot (${packId}): ${parsed.error.message}`);
  }

  const filePath = seedSnapshotPath(packId);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  // Best-effort atomic write on POSIX: write temp file then rename.
  const tmpPath = path.join(dir, `.snapshot.tmp.${process.pid}.${Date.now()}`);
  fs.writeFileSync(tmpPath, JSON.stringify(parsed.data, null, 2) + "\n", "utf8");
  fs.renameSync(tmpPath, filePath);
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(api)/documents/[id]/upload/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { refreshFolderState } from "../../../../../lib/folderState.server";
import { putObjectWriteOnce, validateStorageKey, verifySignature } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const ParamsSchema = z.object({
  id: z.string().min(1),
});

function parseExpectedBytes(val: unknown): number | null {
  if (typeof val === "number" && Number.isSafeInteger(val) && val > 0) return val;
  if (typeof val === "bigint") {
    if (val <= 0n) return null;
    if (val > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    return Number(val);
  }
  if (typeof val === "string" && /^[0-9]+$/.test(val)) {
    const n = Number(val);
    if (!Number.isSafeInteger(n) || n <= 0) return null;
    return n;
  }
  return null;
}

function hasPdfMagic(bytes: Uint8Array): boolean {
  // "%PDF-" (25 50 44 46 2d)
  return (
    bytes.byteLength >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

export async function PUT(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
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

  const expiresHeader = req.headers.get("x-orbital-upload-expires");
  const sigHeader = req.headers.get("x-orbital-upload-signature");
  if (!expiresHeader || !sigHeader) {
    return Response.json(
      safeErrorEnvelope({ code: "UNAUTHORISED", message: "Missing upload signature headers.", traceId }),
      { status: 403, headers },
    );
  }

  const expiresAtMs = Number(expiresHeader);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid upload expires header.", traceId }),
      { status: 400, headers },
    );
  }

  if (Date.now() > expiresAtMs) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Upload URL expired.", traceId }), {
      status: 403,
      headers,
    });
  }

  const documentId = parsedParams.data.id;
  const docs = await sql<
    Array<{
      id: string;
      folder_id: string;
      storage_key: string | null;
      upload_completed_at: Date | null;
      mime: string;
      bytes: unknown;
    }>
  >`
    SELECT id, folder_id, storage_key, upload_completed_at, mime, bytes
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (doc.upload_completed_at) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload already completed.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (!doc.storage_key) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has no storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (doc.mime !== "application/pdf") {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document mime is not application/pdf.", traceId }), {
      status: 409,
      headers,
    });
  }

  const expectedBytes = parseExpectedBytes(doc.bytes);
  if (expectedBytes === null) {
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Document bytes is invalid.", traceId }), {
      status: 500,
      headers,
    });
  }

  if (expectedBytes > MAX_UPLOAD_BYTES) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Upload too large.",
        details: { bytes: expectedBytes, max_bytes: MAX_UPLOAD_BYTES },
        traceId,
      }),
      { status: 413, headers },
    );
  }

  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has an invalid storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const sigOk = verifySignature({ purpose: "put", storageKey: doc.storage_key, expiresAtMs, sig: sigHeader });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid upload signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await req.arrayBuffer());
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid request body.", traceId }), {
      status: 400,
      headers,
    });
  }

  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Upload too large.", traceId }),
      { status: 413, headers },
    );
  }

  if (bytes.byteLength !== expectedBytes) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Upload size did not match document bytes.",
        details: { expected_bytes: expectedBytes, actual_bytes: bytes.byteLength },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  if (!hasPdfMagic(bytes)) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Upload must be a PDF.", traceId }),
      { status: 400, headers },
    );
  }

  let result: { bytesWritten: number; sha256: string };
  try {
    result = await putObjectWriteOnce({ storageKey: doc.storage_key, bytes });
  } catch (err) {
    const code = typeof err === "object" && err ? (err as { code?: unknown }).code : null;
    if (code === "EEXIST") {
      return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload already completed.", traceId }), {
        status: 409,
        headers,
      });
    }
    throw err;
  }

  const updated = await sql<{ id: string }[]>`
    UPDATE documents
    SET upload_completed_at = now(),
        sha256 = ${result.sha256},
        updated_at = now()
    WHERE id = ${doc.id}
      AND upload_completed_at IS NULL
    RETURNING id
  `;
  if (!updated[0]) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload already completed.", traceId }), {
      status: 409,
      headers,
    });
  }

  await refreshFolderState(doc.folder_id);

  return new Response(null, { status: 200, headers });
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/packages/core/src/geometry/anchors.ts
```ts
import { z } from "zod";

export const AnchorBoxSchema = z.object({
  page: z.number().int().positive(),
  bbox: z.tuple([
    z.number().min(0).max(1),
    z.number().min(0).max(1),
    z.number().min(0).max(1),
    z.number().min(0).max(1),
  ]),
}).superRefine((val, ctx) => {
  const [xMin, yMin, xMax, yMax] = val.bbox;
  if (xMin > xMax) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "bbox xMin > xMax", path: ["bbox"] });
  if (yMin > yMax) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "bbox yMin > yMax", path: ["bbox"] });
});

export type AnchorBox = z.infer<typeof AnchorBoxSchema>;

export const AnchorFileSchema = z.record(z.string().min(1), AnchorBoxSchema);
export type AnchorFile = z.infer<typeof AnchorFileSchema>;

export type NormPoint = readonly [xNorm: number, yNorm: number];
export type NormPolygon = readonly NormPoint[];
export type NormPolygons = readonly NormPolygon[];

export function anchorBoxToPolygons(anchor: AnchorBox): NormPolygons {
  const [xMin, yMin, xMax, yMax] = anchor.bbox;

  // Canonical spec: normalised [0..1], origin top-left.
  const polygon: NormPolygon = [
    [xMin, yMin],
    [xMax, yMin],
    [xMax, yMax],
    [xMin, yMax],
  ];

  return [polygon];
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/packages/core/src/missing-docs/schemas.ts
```ts
import { z } from "zod";

export const MissingDocSignalSchema = z.object({
  type: z.enum(["file_ref", "acronym", "phrase"]),
  value: z.string().min(1),
  source: z.string().min(1),
  page: z.number().int().positive().optional(),
});

export type MissingDocSignal = z.infer<typeof MissingDocSignalSchema>;

export const MissingDocCandidateSchema = z.object({
  label: z.string().min(1),
  confidence: z.number().min(0).max(1),
  signals: z.array(MissingDocSignalSchema),
});

export type MissingDocCandidate = z.infer<typeof MissingDocCandidateSchema>;

export const DetectMissingDocsResultSchema = z.object({
  pack_id: z.string().min(1),
  missing_docs: z.array(MissingDocCandidateSchema),
  candidates_low_confidence: z.array(MissingDocCandidateSchema).optional(),
});

export type DetectMissingDocsResult = z.infer<typeof DetectMissingDocsResultSchema>;


```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/03-architecture/60_observability_and_evals.md
```md
# Observability and evals

> Note: This document describes the **target** observability/evals posture. For what is implemented today, see
> `docs/03-architecture/07_current_poc_runtime.md`.

This PoC lives or dies on debuggability and demo reliability. "Trust UX" requires that we can:
- explain what happened (runs + steps + rows)
- prove evidence integrity (citations + hashing)
- detect regressions quickly (fixture-driven evals)

See also:
- Failure-first state rules: `docs/03-architecture/20_state_model.md`
- Data + provenance shape: `docs/03-architecture/30_data_model.md`
- API error envelope + trace_id: `docs/03-architecture/50_api_surface.md`

## Correlation model (what IDs tie the system together)
Use these identifiers consistently across logs, DB provenance, and (where safe) UI debug panels:
- `trace_id`: per inbound request (API) and per workflow start. Include in error envelopes.
- `folder_id`: the Matter.
- `run_id`: one Quick Start attempt.
- `step_key`: deterministic idempotency key for a step execution.
- `question_id`: the row being processed.
- `citation_id`: locked evidence object (user-visible).

Rule of thumb:
- A log line without `{trace_id, run_id, step_key}` is usually not actionable.

## What we log
Run-level:
- run_id, folder_id, state, started/completed timestamps
- index_version, agent_bundle_version, question_set_version
- step timings and retry counts
- failure taxonomy counts (see below)

Row-level:
- question_id
- retrieved chunk IDs (and scores if available)
- verification verdict and reason codes
- final status and citation IDs

LLM calls:
- model, prompt version hash
- tokens, latency, cost
- retrieved chunk IDs used

### Logging safety (non-negotiable)
- Do not log raw PDF bytes.
- Avoid logging full extracted document text.
- For debugging, prefer stable identifiers (`chunk_id`, `citation_id`, `snippet_hash`) over raw content.
- `error_json` must be safe to show to a user when needed (no stack traces, no provider payload dumps).

### Telemetry redaction defaults
Default to redacting or hashing all user content and model I/O in logs, traces, and exports.
- Always redact: raw document text, extracted OCR text, model prompts, model responses, embeddings, provider headers, auth tokens, file paths, and any user PII.
- Prefer: stable identifiers, snippet hashes, page numbers, and aggregate metrics.
- If a snippet is required for debugging, include the minimum excerpt and attach a `snippet_hash` so it can be verified offline.

### Trace export redaction rules
Trace exports are shareable artifacts and must be safe-by-default.
- Redaction profile: `default` (no raw content, no prompts, no model outputs).
- Allowed fields: ids (`trace_id`, `run_id`, `step_key`, `question_id`), timings, counts, code enums (`failure_code`, `reason_code`), and hashes.
- Optional “debug” profile (explicitly gated): allow short snippets only if a reviewer opts in and the export is stored in a restricted location.

### Structured log shape (suggested)
Use JSON logs with consistent keys:
```json
{
  "level": "info",
  "event": "run.step.completed",
  "trace_id": "trc_...",
  "folder_id": "fld_...",
  "run_id": "run_...",
  "step_key": "quick_start:BII-01:verify",
  "question_id": "BII-01",
  "duration_ms": 1234,
  "failure_code": null
}
```

## Failure taxonomy (tiers + code sources)
We track two tiers to avoid mixing step failures with row verification outcomes.

Tier 1: step-level `failure_code`
- Scope: `run_steps.error_json` + run-level counters.
- Meaning: a step execution failed or produced unusable output.
- Examples (current): `OCR_FAIL`, `LAYOUT_FAIL`, `CHUNKING_FAIL`, `RETRIEVAL_MISS`, `RERANK_BAD`, `EXPORT_FAIL`.

Tier 2: row-level `reason_code`
- Scope: `report_rows.provenance_json.reason_code` when `row_status=citation_failed`.
- Meaning: deterministic verification failed for that row (safe for UI + exports).
- Current verifier/fixture codes (v1):
  - `VALIDATION_ERROR` (bad input or malformed row payloads)
  - `MISSING_INPUT_INVARIANT` (missing_input answers must have zero citations)
  - `NO_CITATIONS` (row has no evidence)
  - `CITATION_MISMATCH` (snippet/hash mismatch or wrong snippet)
  - `NO_ANCHORS_FILE` (fixture anchor list missing)
  - `ANCHOR_NOT_FOUND` (fixture anchor missing)

Mapping rules (to prevent drift):
- `failure_code` is for step execution failures (Tier 1). It must never be stored in row provenance.
- `reason_code` is for row-level verification outcomes (Tier 2). It must never be used as a step failure counter.
- If a CSV export schema uses a header named `failure_code`, that column must still carry the Tier 2 row `reason_code` (not Tier 1 step failure codes).

Reserved (not baseline; future use only):
- Entailment codes (`ENTAILMENT_*`) are explicitly reserved for a future semantic verifier and should not be used as baseline fixtures or dashboards.
- `VERIFICATION_FALSE_PASS` is eval-only and should never appear in row provenance.

Notes:
- Prefer adding new codes over reusing an existing code with broader meaning; taxonomy drift makes dashboards useless.

## Baseline metrics + thresholds (PoC defaults)
Start with a small set that directly supports “trust UX”.

Hard gates (must be 100% for a demo pack to pass):
- **Schema validity:** every produced report row validates against the Zod schema.
- **Citation integrity:** for every citation_id used by a `needs_review|reviewed` row:
  - cited page exists
  - polygons exist
  - `snippet_hash` matches canonical snippet hashing rule
- **Failure journeys:** fixture packs designed to fail must fail in the expected way:
  - missing docs → `missing_input`
  - bad citation → `citation_failed`
- **Export truth match (Initiative 0003 only):** when export features are in scope, generated CSV outputs must match `/truth` exactly (deterministic headers + row ordering).

Report-only (track, don’t gate yet):
- **Retrieval Recall@K** on golden questions (start at K=10). Suggested initial target: `>= 0.85` per pack.
- **Extraction quality distribution:** min/mean/p95 of `documents.extraction_quality` (watch for regressions when changing OCR/layout).
- **End-to-end duration:** ingest time and run time (p50/p95), for demo predictability.
- **Cost per run:** tokens and estimated $ (track before optimising).

## How metrics are used
- Phase 0 (default): `fixture:eval` always produces a JSON report + summary table. CI posts the summary (report-only).
- Phase 1: CI gates on the “hard gates” above (schema + citation integrity + failure journeys).
- Phase 1 (Initiative 0003): include export truth match in hard gating when export features are in scope.
- Phase 2: CI additionally gates on retrieval Recall@K thresholds once packs and chunking stabilise.

The goal is to move as little as possible into gating until the fixture suite is stable, but never compromise on citation integrity.

## Evals (fixture-driven)
Inputs:
- fixture pack manifest at `docs/08-example-data/<pack_id>/manifest.json` (required; eval runners must read manifests, not infer)
- synthetic packs with `/docs`, `/truth`, `/layout`
- golden questions JSON per pack
Callout:
- Any demo pack loader must also be manifest-driven (read manifest, fail if missing, no inference).

Minimum checks:
1) extraction correctness vs `/truth`
2) citation validity: page exists, polygons exist, snippet hash matches
3) retrieval recall@K on golden questions
4) failure journeys:
   - missing docs → `missing_input`
   - bad citation → `citation_failed`
5) export truth match (Initiative 0003 only): generated CSV outputs match `/truth` exactly (deterministic headers + row ordering)

Outputs:
- per-pack eval report JSON
- summary table across packs
- optional CI gate when stable

### Eval report JSON (suggested)
Example shape (not a strict schema yet):
```json
{
  "pack_id": "pack_01_clean",
  "versions": {
    "index_version": "v1",
    "agent_bundle_version": "git:abc123",
    "question_set_version": "qs:quick_start_title_survey:v1"
  },
  "hard_gates": {
    "schema_validity": { "pass": true, "failures": 0 },
    "citation_integrity": { "pass": true, "failures": 0 },
    "failure_journeys": { "pass": true, "failures": 0 },
    "export_truth_match": { "pass": true, "failures": 0 }
  },
  "metrics": {
    "retrieval_recall_at_k": { "k": 10, "value": 0.9 },
    "run_duration_ms": { "p50": 120000, "p95": 180000 },
    "tokens_total": 123456
  },
  "taxonomy_counts": {
    "RETRIEVAL_MISS": 2,
    "CITATION_MISMATCH": 0
  }
}
```

## Alignment checklist (docs + scripts)
These references should match the tiered taxonomy and v1 reason codes above:
- `packages/core/src/verify/verifier.ts`
- `packages/core/src/verify/verifier.schemas.ts`
- `scripts/fixtures/assert_row_invariants.ts`
- `scripts/fixtures/seed.ts`
- `docs/03-architecture/20_state_model.md`
- `docs/03-architecture/30_data_model.md`
- `docs/03-architecture/40_rag_and_agents.md`
- `docs/03-architecture/50_api_surface.md`
- `docs/04-projects/02-features/0002_quick-start-engine/specs/failure_ux_copy_v0.md`
- `docs/04-projects/02-features/0002_quick-start-engine/specs/list_verification_policy_v1.md`
- `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md`
- `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- `docs/04-projects/02-features/0003_demo-grade-outputs/prd.md`
- `docs/04-projects/02-features/0004_csv-export/prd.md`
- `docs/08-example-data/pack_09_bad_citation/truth/expected_failure_journeys.json`

## Debug playbook (fast path)
When a run fails or export is blocked, prefer a deterministic investigation:
1) Identify the failure taxonomy code and the step_key where it occurred.
2) Inspect the persisted provenance and citations for that row.
3) Use fixtures to reproduce the failure deterministically, then fix the smallest broken link.

Suggested SQL pivots (examples; adapt to actual schema/migrations):
```sql
-- Recent failed steps for a run
select step_key, step_type, state, attempt, error_json
from run_steps
where run_id = 'run_123' and state = 'failed'
order by created_at desc;
```

```

File: /Users/marc/Code/personal-projects/legaltech-poc/packages/core/src/index.ts
```ts
export * from "./geometry/anchors";
export * from "./geometry/mapToViewport";
export * from "./exception-matching/matchExceptionsToInstrumentDocs";
export * from "./missing-docs/detectMissingDocs";
export * from "./missing-docs/schemas";
export * from "./schemas/list_payload_v0";
export * from "./safe-error";
export * from "./spikes/rh1.schemas";
export * from "./verify/verifier.schemas";

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/ui/cn.ts
```ts
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/packages/core/src/safe-error.ts
```ts
export type SafeErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    trace_id?: string;
  };
};

export function safeErrorEnvelope(opts: {
  code: string;
  message: string;
  details?: unknown;
  traceId?: string;
}): SafeErrorEnvelope {
  return {
    error: {
      code: opts.code,
      message: opts.message,
      details: opts.details,
      trace_id: opts.traceId,
    },
  };
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/httpRange.server.ts
```ts
import "server-only";

export function parseSingleRangeHeader(
  rangeHeader: string,
  size: number,
): { start: number; end: number } | null {
  if (!Number.isSafeInteger(size) || size <= 0) return null;
  if (!rangeHeader.startsWith("bytes=")) return null;
  const range = rangeHeader.slice("bytes=".length).trim();

  // pdf.js typically uses single-range requests. Reject multi-range.
  if (range.includes(",")) return null;

  const firstDash = range.indexOf("-");
  if (firstDash === -1) return null;
  if (range.indexOf("-", firstDash + 1) !== -1) return null;

  const startStr = range.slice(0, firstDash).trim();
  const endStr = range.slice(firstDash + 1).trim();
  const hasStart = startStr !== "";
  const hasEnd = endStr !== "";

  if (!hasStart && !hasEnd) return null;

  function parseNonNegativeInt(val: string): number | null {
    if (!/^[0-9]+$/.test(val)) return null;
    const n = Number(val);
    if (!Number.isSafeInteger(n) || n < 0) return null;
    return n;
  }

  let start: number;
  let end: number;

  if (!hasStart && hasEnd) {
    // suffix bytes: "-500"
    const suffixLen = parseNonNegativeInt(endStr);
    if (suffixLen === null || suffixLen <= 0) return null;
    start = Math.max(0, size - suffixLen);
    end = size - 1;
  } else {
    const parsedStart = parseNonNegativeInt(startStr);
    if (parsedStart === null) return null;
    start = parsedStart;

    if (!hasEnd) {
      end = size - 1;
    } else {
      const parsedEnd = parseNonNegativeInt(endStr);
      if (parsedEnd === null) return null;
      end = parsedEnd;
    }

    if (start > end) return null;
    if (start >= size) return null;
    end = Math.min(end, size - 1);
  }

  return { start, end };
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/03-architecture/DECISIONS.md
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
  - Sprite mode: use Sprite as a **local dev sandbox** to run the same dev setup in a more isolated/reproducible environment.
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

```

File: /Users/marc/Code/personal-projects/legaltech-poc/packages/core/src/citations/snippet.ts
```ts
import { createHash } from "node:crypto";

export function normaliseSnippet(input: string): string {
  return input.replace(/\r\n/g, "\n").trim().replace(/\s+/g, " ");
}

export function hashSnippet(snippet: string): string {
  const normalised = normaliseSnippet(snippet);
  const bytes = new TextEncoder().encode(normalised);
  const hashHex = createHash("sha256").update(bytes).digest("hex");
  return `sha256:${hashHex}`;
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/lib/devOnlyApi.server.ts
```ts
import "server-only";

import { safeErrorEnvelope } from "@legaltech-poc/core";

export function assertDevOnlyApi(traceId: string, headers: Headers): Response | null {
  if (process.env.NODE_ENV === "development") return null;
  return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Not found.", traceId }), {
    status: 404,
    headers,
  });
}


```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/03-architecture/30_data_model.md
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

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/08-example-data/packs_summary.md
```md
# Synthetic PoC Test Packs Summary

| Pack | State | Scenario | Edge cases | Missing docs | Docs |
|---|---|---|---|---|---:|
| `pack_01_clean` | NY | Complete happy-path pack (title + full exception docs + survey) with both text-layer and scanned copies. | baseline;scanned_copies | - | 10 |
| `pack_02_missing_rea` | TX | Commitment references an REA in Schedule B-II but the REA PDF is intentionally missing (tests missing-input handling). | missing_exception_doc | REA.pdf | 6 |
| `pack_03_mismatch_and_cert_gap` | FL | Survey area note conflicts with record description and survey certification omits lender (tests escalation + QC). | survey_legal_desc_mismatch;survey_cert_missing_lender | - | 5 |
| `pack_04_multi_parcel` | IL | Two-parcel site (multi-parcel legal description + survey shows two parcels); one easement burdens only Parcel 2. | multi_parcel;parcel_scoping | - | 6 |
| `pack_05_partial_release` | CA | Deed of Trust exception with a provided Partial Release (release applies to a portion only); tests lien + release logic and 'needs review' flags. | partial_release;lien_clearance_complexity | - | 6 |
| `pack_06_overlapping_easements` | GA | Multiple utility easements with similar naming and different instrument numbers; one instrument references a missing Exhibit B attachment; tests disambiguation and missing-attachment handling. | overlapping_similar_exceptions;missing_attachment | Utility_Easement_10ft_ExhibitB.pdf | 5 |
| `pack_07_scans_rotated_low_quality` | NJ | OCR torture pack: scanned-only commitment + survey with rotated pages and blur; tests extraction-quality metering and rerun OCR flows. | scanned_rotated;low_quality_ocr | - | 7 |
| `pack_08_defined_terms_and_cross_refs` | WA | CC&Rs/REA with defined terms and exhibit chase (e.g., 'Easement Area' defined elsewhere; REA references Exhibit C site plan); tests multi-hop retrieval and definition resolver. | defined_terms;exhibit_chase | - | 6 |
| `pack_09_bad_citation` | NY | Deliberately includes a `citation_failed` journey (tests failure taxonomy + export gating posture). | bad_citation | - | 1 |

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/ui/Input.tsx
```tsx
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

import { cn } from "./cn";

export type FieldSize = "sm" | "md";

export function fieldClassName(args?: { uiSize?: FieldSize; className?: string }) {
  const uiSize = args?.uiSize ?? "md";
  return cn(
    "rounded-ui-md border border-input bg-background text-foreground shadow-ui-sm",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-60",
    uiSize === "sm" ? "h-8 px-2 text-xs" : "h-9 px-3 text-sm",
    args?.className,
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  uiSize?: FieldSize;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, uiSize, ...props },
  ref,
) {
  return <input ref={ref} className={fieldClassName({ uiSize, className })} {...props} />;
});

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  uiSize?: FieldSize;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, uiSize, ...props },
  ref,
) {
  return <select ref={ref} className={fieldClassName({ uiSize, className })} {...props} />;
});

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(api)/documents/[id]/render/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";
import { parseFixtureDocumentId } from "@legaltech-poc/core/fixtures/fixtureIds";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { createSignedGetHeaders, objectExists, validateStorageKey } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const QuerySchema = z.object({
  page: z.coerce.number().int().positive(),
});

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

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

  const url = new URL(req.url);
  const parsedQuery = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsedQuery.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsedQuery.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const documentId = parsedParams.data.id;
  const page = parsedQuery.data.page;

  const fixture = parseFixtureDocumentId(documentId);
  if (fixture.ok) {
    if (process.env.NODE_ENV !== "development") {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    // Verify the fixture PDF exists so we can fail closed on drift.
    const fs = await import("node:fs");
    const path = await import("node:path");
    const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data");
    const candidate = path.resolve(packRoot, fixture.packId, "docs", fixture.filename);
    if (!candidate.startsWith(packRoot + path.sep)) {
      return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid path.", traceId }), {
        status: 400,
        headers,
      });
    }
    try {
      const stat = fs.statSync(candidate);
      if (!stat.isFile()) throw new Error("NOT_A_FILE");
    } catch {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const origin = new URL(req.url).origin;
    const signed = createSignedGetHeaders({ storageKey: `fixture:${documentId}` });
    const renderUrl = `${origin}/documents/${documentId}/pdf?${new URLSearchParams({
      expires: String(signed.expires_at_ms),
      sig: signed.signature,
    }).toString()}`;

    return Response.json(
      {
        document_id: documentId,
        page,
        render_url: renderUrl,
      },
      { status: 200, headers },
    );
  }

  await ensureSchema();

  const docs = await sql<
    Array<{ id: string; storage_key: string | null; upload_completed_at: Date | null; page_count: number | null }>
  >`
    SELECT id, storage_key, upload_completed_at, page_count
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (!doc.storage_key) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has no storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (!doc.upload_completed_at) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload not completed yet.", traceId }), {
      status: 409,
      headers,
    });
  }

  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has an invalid storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (!objectExists(doc.storage_key)) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Raw PDF not found for storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const pageCount = typeof doc.page_count === "number" && Number.isFinite(doc.page_count) ? doc.page_count : null;
  if (pageCount && page > pageCount) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "page is out of range.",
        details: { page: "out_of_range", page_count: pageCount },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const origin = new URL(req.url).origin;
  const signed = createSignedGetHeaders({ storageKey: doc.storage_key });
  const renderUrl = `${origin}/documents/${documentId}/pdf?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
  }).toString()}`;

  return Response.json(
    {
      document_id: documentId,
      page,
      render_url: renderUrl,
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/packages/core/src/verify/verifier.schemas.ts
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

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/08-example-data/README.md
```md
# Fixture packs (schema v1)

Each fixture pack lives at:
`docs/08-example-data/<pack_id>/`

Required files:
- `manifest.json` (required; loaders/evals must read this and must not infer file paths)
- `docs/` (one or more source documents, typically PDFs)
- `truth/` (expected outputs for evals)
- `layout/` (optional early; anchor/layout JSON used for highlight overlay spikes and seeded chunking)

## `manifest.json` (schema v1)

Example:

```json
{
  "pack_id": "pack_01_clean",
  "schema_version": "fixture_pack_v1",
  "default_run_type": "quick_start_title_survey",
  "expected_question_set_version": "qs:quick_start_title_survey:v1",
  "documents": [
    {
      "filename": "TitleCommitment.pdf",
      "role": "title_commitment",
      "layout_file": "layout/TitleCommitment.layout.json",
      "anchors_file": "layout/TitleCommitment.anchors.json"
    }
  ],
  "layout": {
    "polygon_space": "page_viewbox_norm_v1"
  },
  "truth": {
    "requirements_tracker_csv": "truth/expected_requirements_tracker.csv",
    "exceptions_table_csv": "truth/expected_exceptions_table.csv",
    "survey_issues_csv": "truth/expected_survey_issues.csv",
    "golden_questions_json": "truth/golden_questions.json"
  }
}
```

## Anchors + layout JSON

Coordinate system:
- Anchor/layout `bbox` values are normalised floats in `[0..1]`.
- Origin is top-left of the PDF page viewBox.
- Mapping and validation rules are defined in `docs/03-architecture/30_data_model.md` (citation polygon coordinate system).


```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/AGENTS.md
```md
# Web app (apps/web)
Next.js App Router web application.

## Stack
- Next.js App Router + TypeScript
- Tailwind + v5 design tokens (`app/tokens.css` + `tailwind.preset.ts`)
- Validation: Zod
- PDF rendering: `pdfjs-dist`
- DB client: `postgres`
- Tests: Vitest

## Guardrails (high leverage)
- Server-first: fetch on the server (RSC / route handlers / server actions). Avoid client-side data fetching effects.
- Treat `useEffect` as an escape hatch (imperative interop only) — not for data fetching, derived state, prop→state, or URL sync.
- Never import server-only into client components (use `server-only` / `client-only` boundaries).
- Validate external inputs with Zod and map errors to safe user-facing messages.
- AI SDK flows: use Workflow DevKit (`workflow`) and add `"use workflow"` in async TS fns for durability, reliability, observability.
  - Conventions for `"use workflow"` / steps are defined in `docs/03-architecture/06_frameworks_agents_rag_evals.md`.

## Frontend skills
- `generating-tailwind-brand-config` for brand tokens/config
- `baseline-ui`, `interface-design`, `frontend-design`, and `web-design-guidelines` for UI
- `interaction-design`, `12-principles-of-animation`, and `fixing-motion-performance` for motion
- `fixing-accessibility` and `wcag-audit-patterns` for a11y/UX
- `tailwind-css-patterns`, `composition-patterns`, and `react-best-practices` for styling/structure/perf/critique; `rams` as backup critique

```

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/(api)/folders/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../lib/db.server";
import { assertDevOnlyApi } from "../../../lib/devOnlyApi.server";
import { newId } from "../../../lib/ids";
import { createTraceContext } from "../../../lib/trace.server";

export const runtime = "nodejs";

const CreateFolderSchema = z.object({
  name: z.string().trim().min(1),
});

export async function GET(): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  const folders = await sql<
    Array<{
      id: string;
      name: string;
      state: string;
      latest_index_version: string;
      created_at: Date;
    }>
  >`
    SELECT id, name, state, latest_index_version, created_at
    FROM folders
    ORDER BY created_at DESC
  `;

  return Response.json(
    {
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        state: f.state,
        latest_index_version: f.latest_index_version,
        created_at: f.created_at.toISOString(),
      })),
    },
    { status: 200, headers },
  );
}

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsed = CreateFolderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = newId("fld");
  await sql`
    INSERT INTO folders (id, name, state, latest_index_version, created_at, updated_at)
    VALUES (${folderId}, ${parsed.data.name}, 'empty', 'v1', now(), now())
  `;

  return Response.json(
    {
      folder: {
        id: folderId,
        name: parsed.data.name,
        state: "empty",
        latest_index_version: "v1",
      },
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md
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

File: /Users/marc/Code/personal-projects/legaltech-poc/apps/web/app/DemoToolbar.tsx
```tsx
"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "./ui/Button";
import { Select } from "./ui/Input";
import { ThemeToggle } from "./ui/ThemeToggle";

const PACK_OPTIONS = [
  { id: "pack_01_clean", label: "pack_01_clean" },
  { id: "pack_02_missing_rea", label: "pack_02_missing_rea" },
] as const;

type PackId = (typeof PACK_OPTIONS)[number]["id"];

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export function DemoToolbar() {
  const router = useRouter();
  const [packId, setPackId] = useState<PackId>("pack_01_clean");
  const [state, setState] = useState<LoadState>({ kind: "idle" });

  async function loadPack() {
    setState({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch("/demo/load-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: packId }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    if (!res.ok) {
      const json: unknown = await res.json().catch(() => null);
      const env = isRecord(json) && isRecord(json.error) ? json.error : null;
      const code = env && typeof env.code === "string" ? env.code : "UNKNOWN_ERROR";
      const message = env && typeof env.message === "string" ? env.message : `Request failed (${res.status})`;
      setState({ kind: "error", message: `${code}: ${message}` });
      return;
    }

    const json: unknown = await res.json().catch(() => null);
    const folder = isRecord(json) && isRecord(json.folder) ? json.folder : null;
    const folderId = folder && typeof folder.id === "string" ? folder.id : null;
    if (!folderId) {
      setState({ kind: "error", message: "Missing folder.id in response." });
      return;
    }

    // Re-enable the toolbar for subsequent loads (e.g. switching packs).
    setState({ kind: "idle" });
    router.push(`/matters/${encodeURIComponent(folderId)}`);
  }

  return (
    <section className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-end gap-3 p-3">
        <div className="text-xs font-semibold tracking-wide text-muted-foreground">DEMO MODE</div>

        <label className="grid gap-1 text-xs">
          <span className="text-muted-foreground">Pack</span>
          <Select
            className="min-w-56"
            uiSize="sm"
            value={packId}
            onChange={(e) => setPackId(e.currentTarget.value as PackId)}
            disabled={state.kind === "loading"}
          >
            {PACK_OPTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </label>

        <Button
          size="sm"
          onClick={loadPack}
          disabled={state.kind === "loading"}
        >
          {state.kind === "loading" ? "Loading…" : "Load demo pack"}
        </Button>

        {state.kind === "error" ? <div className="text-xs font-medium text-destructive">{state.message}</div> : null}

        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </section>
  );
}

```

File: /Users/marc/Code/personal-projects/legaltech-poc/docker-compose.yml
```yml
services:
  db:
    # pgvector baked in so we can `CREATE EXTENSION vector;` without custom builds.
    image: pgvector/pgvector:pg16
    container_name: legaltech-poc-db
    environment:
      POSTGRES_DB: orbital
      POSTGRES_USER: orbital
      POSTGRES_PASSWORD: orbital
    ports:
      - "5432:5432"
    volumes:
      - orbital-pgdata:/var/lib/postgresql/data
      - ./scripts/db/init.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orbital -d orbital"]
      interval: 2s
      timeout: 5s
      retries: 20

volumes:
  orbital-pgdata:

```

File: /Users/marc/Code/personal-projects/legaltech-poc/package.json
```json
{
  "name": "legaltech-poc",
  "private": true,
  "packageManager": "pnpm@10.28.0",
  "scripts": {
    "dev": "pnpm --filter @legaltech-poc/web dev",
    "start": "pnpm --filter @legaltech-poc/web start",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "verify": "bash scripts/verify.sh",
    "fixture:seed": "node --experimental-strip-types scripts/fixtures/seed.ts",
    "fixture:eval": "node --experimental-strip-types scripts/fixtures/eval.ts",
    "fixture:eval:all": "node --experimental-strip-types scripts/fixtures/eval.ts --all",
    "fixtures:verify-pack-names": "node --experimental-strip-types scripts/fixtures/verify_pack_names.ts",
    "fixtures:assert-row-invariants": "node --experimental-strip-types scripts/fixtures/assert_row_invariants.ts",
    "fixtures:compare-truth": "node --experimental-strip-types scripts/fixtures/compare_truth.ts"
  },
  "devDependencies": {
    "beautiful-mermaid": "^0.1.3"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "esbuild",
      "sharp",
      "unrs-resolver"
    ]
  }
}

```
</file_contents>
<user_instructions>
<taskname=Matter chat slice/>

<task>
Shape a 2–3 dev-day expansion of `legaltech-poc` to add per-matter “chat with documents” (retrieval + citations) using Vercel AI SDK with an Anthropic provider, plus a UI that supports multiple Matters under a single Organization (no org switching in the UI for the PoC). Output a shaped packet (brief/PRD/breadboard/risks, in the repo’s wf-shape style) and a coherent implementation approach that fits the existing codebase and architecture docs.
</task>

<architecture>
- Current domain naming:
  - DB/API uses `folders` as the workspace container; UI calls it a “Matter”. See `docs/03-architecture/10_system_architecture.md` + `docs/03-architecture/20_state_model.md`.
- Current implemented PoC (not the target):
  - Next.js App Router (`apps/web`) + Postgres runtime schema (`apps/web/lib/db.server.ts`) + local FS object store (`apps/web/lib/objectStore.server.ts`).
  - Ingest: pdf.js text extraction (not OCR/geometry) writing `document_pages` + `chunks` (currently one chunk per page). `apps/web/lib/ingest/ingestQueue.server.ts`.
  - Evidence-first viewer UX is fixture/seed backed (snapshots under `tmp/fixture-seed`) for the `/matters?pack=...` demo UI and `/citations/:id` API. `apps/web/lib/fixtureSeed.server.ts`, `apps/web/app/(api)/citations/[id]/route.ts`, `apps/web/app/(app)/matters/viewer/*`.
- Target architecture docs (aspirational): RAG retrieve→draft→lock→verify pipeline, hybrid retrieval (tsvector+pgvector), AI SDK as the single model interface, durable orchestration via WDK. See `docs/03-architecture/*`.
</architecture>

<selected_context>
- Matter UI (fixture-seeded demo):
  - `apps/web/app/(app)/matters/page.tsx`: seeded pack selector, report rows with citation chips linking to viewer.
  - `apps/web/app/(app)/matters/viewer/page.tsx`, `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`: citation fetch + signed render URL fetch + pdf.js rendering + fail-closed overlay/highlight behavior.
  - `apps/web/app/(app)/matters/actions.ts`, `apps/web/lib/fixtureSeed.server.ts`: seed snapshot loading and “mark reviewed” behavior (dev-only).
- Matter detail (DB-backed):
  - `apps/web/app/(app)/matters/[id]/page.tsx`: reads `folders` and `documents` directly from Postgres and constructs signed PDF links.
- HTTP APIs (existing patterns):
  - `apps/web/app/(api)/folders/route.ts`, `apps/web/app/(api)/folders/[id]/route.ts`, `apps/web/app/(api)/folders/[id]/documents/route.ts`: folder (matter) + docs APIs with Zod validation + `safeErrorEnvelope`.
  - `apps/web/app/(api)/documents/[id]/*`: upload completion + signed render URL + signed PDF serving with Range support.
  - `apps/web/app/(api)/demo/load-pack/route.ts`: seeds a DB folder from fixture PDFs under `docs/08-example-data` (dev-only + demo-mode gated).
- Persistence + trust primitives:
  - `apps/web/lib/db.server.ts`: current runtime DDL for `folders`, `documents`, `document_pages`, `chunks`, and trust-spine tables.
  - `packages/core/src/citations/snippet.ts`, `packages/core/src/verify/*`: canonical snippet hashing + integrity verifier semantics.
- Repo shaping templates + prior shaped initiatives:
  - `docs/04-projects/_templates/*`
  - `docs/04-projects/02-features/0001_trust-substrate/*`, `docs/04-projects/02-features/0002_quick-start-engine/*`
- Fixture pack structure:
  - `docs/08-example-data/README.md`, `docs/08-example-data/packs_summary.md`, `docs/08-example-data/pack_01_clean/manifest.json`
- Demo/copy that currently de-emphasizes chat:
  - `docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/walkthrough.md`
  - `docs/98-tmp/handoffs/handoff_2026-02-09_10-07-28_demo-setup-runbook-app.md` (“chat with documents is not implemented…”)
</selected_context>

<relationships>
- `/matters?pack=...` (fixture-seeded) -> citation chips -> `/matters/viewer?pack=...&citation=...` -> `GET /citations/:id` (fixture snapshot) -> `GET /documents/:id/render?page=N` -> `GET /documents/:id/pdf?...`.
- `/matters/[id]` (DB-backed) reads `folders`+`documents` tables directly and uses object-store signing helpers to build `/documents/:id/pdf?...`.
- Ingest (`apps/web/lib/ingest/ingestQueue.server.ts`) populates `document_pages` and `chunks` for uploaded/seeded PDFs; there is not yet an implemented retrieval+draft+lock system over `chunks`.
</relationships>

<ambiguities>
- There are effectively two “Matter” experiences today:
  - fixture-seeded report/citation demo at `/matters?pack=...`
  - DB-backed folder/document detail at `/matters/[id]`
  The new multi-matter + chat UI likely needs to decide whether to build on the DB-backed `/folders` APIs (and/or unify these surfaces) vs keep chat as another dev-only demo slice.
- No Organization concept exists in current DB schema (`apps/web/lib/db.server.ts`) or HTTP APIs; adding Org→Matters will require deciding minimal fields and whether to keep `folders` as “matter” table or introduce `organizations` + FK.
- “Chat with documents” must supply citations; current implemented citations with polygons/snippets are fixture-backed, while DB ingested docs have no geometry (no OCR/layout), so citation UX may need a temporary strategy (page-level citations only, no polygons) or a narrow geometry approach.
</ambiguities>

</user_instructions>
