<file_map>
/Users/marc/Code/personal-projects/orbital-poc
├── apps
│   └── web
│       ├── app
│       │   ├── (api)
│       │   │   ├── artefacts
│       │   │   │   └── [id]
│       │   │   │       └── download
│       │   │   │           └── route.ts * +
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
│       │   │   ├── export
│       │   │   │   └── csv
│       │   │   │       ├── download
│       │   │   │       │   └── route.ts * +
│       │   │   │       └── route.ts * +
│       │   │   ├── folders
│       │   │   │   ├── [id]
│       │   │   │   │   ├── artefacts
│       │   │   │   │   │   └── route.ts * +
│       │   │   │   │   ├── documents
│       │   │   │   │   │   └── route.ts * +
│       │   │   │   │   ├── report
│       │   │   │   │   │   └── route.ts * +
│       │   │   │   │   ├── runs
│       │   │   │   │   │   └── route.ts * +
│       │   │   │   │   └── route.ts * +
│       │   │   │   └── route.ts * +
│       │   │   ├── runs
│       │   │   │   └── [id]
│       │   │   │       ├── trace
│       │   │   │       │   └── route.ts * +
│       │   │   │       └── route.ts * +
│       │   │   └── spikes
│       │   │       ├── export
│       │   │       │   └── csv
│       │   │       │       └── route.ts * +
│       │   │       ├── local-pdf
│       │   │       │   └── route.ts * +
│       │   │       └── rh4-verify
│       │   │           └── route.ts * +
│       │   ├── (app)
│       │   │   ├── matters
│       │   │   │   ├── [id]
│       │   │   │   │   └── QuickStartPanel.tsx * +
│       │   │   │   ├── ArtefactsList.tsx * +
│       │   │   │   ├── ExportCsvButton.tsx * +
│       │   │   │   ├── ExportTraceButton.tsx * +
│       │   │   │   ├── MattersToolbar.tsx * +
│       │   │   │   └── actions.ts * +
│       │   │   ├── ...
│       │   ├── DemoToolbar.tsx * +
│       │   ├── layout.tsx * +
│       │   ├── page.tsx * +
│       │   ├── globals.css
│       │   └── tokens.css
│       ├── lib
│       │   ├── ingest
│       │   │   └── ingestQueue.server.ts * +
│       │   ├── artefacts.routes.test.ts * +
│       │   ├── db.server.ts * +
│       │   ├── demoMode.server.ts * +
│       │   ├── devOnly.ts * +
│       │   ├── devOnlyApi.server.ts * +
│       │   ├── fixtureSeed.server.ts * +
│       │   ├── folderState.server.ts * +
│       │   ├── httpRange.server.test.ts * +
│       │   ├── httpRange.server.ts * +
│       │   ├── ids.ts * +
│       │   ├── objectStore.server.ts * +
│       │   ├── questionSet.server.ts * +
│       │   ├── quickStartRunQueue.server.ts * +
│       │   ├── safePdfFilename.server.ts * +
│       │   ├── spikes.server.ts * +
│       │   └── trace.server.ts * +
│       ├── test
│       │   ├── stubs
│       │   │   └── ...
│       │   └── demoChecklist.sync.test.ts +
│       ├── types
│       │   └── pdfjs-dist.d.ts
│       ├── AGENTS.md *
│       ├── next.config.js * +
│       ├── package.json *
│       ├── .eslintrc.json
│       ├── next-env.d.ts
│       ├── postcss.config.js +
│       ├── tailwind.config.ts +
│       ├── tailwind.preset.ts +
│       ├── tsconfig.json
│       ├── tsconfig.tsbuildinfo
│       └── vitest.config.ts +
├── docs
│   ├── 03-architecture
│   │   ├── .gitkeep *
│   │   ├── 00_overview.md *
│   │   ├── 01_onboarding_checklist.md *
│   │   ├── 05_tech_stack_and_dev_workflow.md *
│   │   ├── 06_frameworks_agents_rag_evals.md *
│   │   ├── 10_system_architecture.md *
│   │   ├── 20_state_model.md *
│   │   ├── 30_data_model.md *
│   │   ├── 40_rag_and_agents.md *
│   │   ├── 50_api_surface.md *
│   │   ├── 60_observability_and_evals.md *
│   │   ├── AGENTS.md *
│   │   ├── DECISIONS.md *
│   │   └── INVESTIGATION.md *
│   ├── 04-projects
│   │   ├── 03-fixes
│   │   │   ├── 0001_drift
│   │   │   │   └── arch_prd_impl_drift.md *
│   │   │   └── .gitkeep
│   │   ├── 01-experiments-prototypes
│   │   │   └── .gitkeep
│   │   ├── 02-features
│   │   │   ├── 0001_trust-substrate
│   │   │   │   └── ...
│   │   │   ├── 0002_quick-start-engine
│   │   │   │   └── ...
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
│   │   ├── 04-refactors
│   │   │   ├── 0001_v5-ui-alignment
│   │   │   │   └── ...
│   │   │   └── .gitkeep
│   │   ├── 05-migrations
│   │   │   └── .gitkeep
│   │   ├── _templates
│   │   │   ├── .gitkeep
│   │   │   ├── README.md
│   │   │   ├── breadboard.md
│   │   │   ├── json-prd.schema.json
│   │   │   ├── pack.md
│   │   │   ├── prd.md
│   │   │   ├── release-checklist.md
│   │   │   └── spike-plan.md
│   │   ├── .gitkeep
│   │   ├── AGENTS.md
│   │   └── README.md
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
│   │   ├── .gitkeep
│   │   └── governance.md
│   ├── 06-release
│   │   ├── demo-runbook
│   │   │   └── 2026-02-09_orbital-poc-demo
│   │   │       └── ...
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
│   │   │   └── manifest.json
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
│   │   ├── README.md
│   │   ├── packs_summary.csv
│   │   └── packs_summary.md
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
│   ├── 98-tmp
│   │   ├── 2026-02-06_infra-investigation
│   │   │   ├── README.md
│   │   │   ├── deployment.md
│   │   │   ├── llm-gateways.md
│   │   │   ├── ocr.md
│   │   │   ├── oracle_bundles.md
│   │   │   ├── recommended-stack.md
│   │   │   └── storage.md
│   │   ├── handoffs
│   │   │   └── handoff_2026-02-06_17-35-25_shape-split-commits.md
│   │   ├── oracle
│   │   │   ├── oracle-bundles
│   │   │   │   └── ...
│   │   │   └── oracle-prompt_demo-architecture-alignment_2026-02-07.md
│   │   ├── .gitkeep
│   │   ├── README.md
│   │   ├── oracle-03-architecture-review-manual.md
│   │   ├── oracle-prompt_0002-response.md
│   │   ├── oracle-prompt_trust-substrate_2026-02-07.md
│   │   └── oracle-prompt_trust-substrate_2026-02-07_v2.md
│   ├── 99-archive
│   │   └── .gitkeep
│   ├── AGENTS.md
│   └── LEARNINGS.md
├── packages
│   ├── core
│   │   ├── src
│   │   │   ├── citations
│   │   │   │   ├── snippet.single-source.test.ts * +
│   │   │   │   ├── snippet.test.ts * +
│   │   │   │   └── snippet.ts * +
│   │   │   ├── exception-matching
│   │   │   │   ├── matchExceptionsToInstrumentDocs.test.ts * +
│   │   │   │   └── matchExceptionsToInstrumentDocs.ts * +
│   │   │   ├── fixtures
│   │   │   │   ├── fixtureIds.test.ts * +
│   │   │   │   └── fixtureIds.ts * +
│   │   │   ├── geometry
│   │   │   │   ├── anchors.ts * +
│   │   │   │   ├── mapToViewport.test.ts * +
│   │   │   │   └── mapToViewport.ts * +
│   │   │   ├── missing-docs
│   │   │   │   ├── detectMissingDocs.fixtures.test.ts * +
│   │   │   │   ├── detectMissingDocs.ts * +
│   │   │   │   └── schemas.ts * +
│   │   │   ├── schemas
│   │   │   │   ├── list_payload_v0.test.ts * +
│   │   │   │   └── list_payload_v0.ts * +
│   │   │   ├── verify
│   │   │   │   ├── verifier.schemas.ts * +
│   │   │   │   └── verifier.ts * +
│   │   │   ├── spikes
│   │   │   │   └── ...
│   │   │   ├── index.ts * +
│   │   │   ├── safe-error.ts * +
│   │   │   └── server.ts * +
│   │   ├── package.json
│   │   ├── tsconfig.build.json
│   │   └── tsconfig.json
│   └── .gitkeep
├── scripts
│   ├── db
│   │   └── init.sql *
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
│   │   ├── verify_pack_names.ts * +
│   │   ├── compare_truth.ts +
│   │   ├── eval.ts +
│   │   ├── export_truth_match.ts +
│   │   └── seed.ts +
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
├── tmp
│   └── .gitkeep
├── AGENTS.md *
├── README.md *
├── docker-compose.yml *
├── package.json *
├── .gitignore
├── .sprite
├── LICENSE
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── ralph


(* denotes selected files)
(+ denotes code-map available)
Config: depth cap 3.

File: /Users/marc/Code/personal-projects/orbital-poc/scripts/fixtures/export_truth_match.ts
Imports:
  - import { readFile, writeFile, mkdir } from "node:fs/promises";
  - import fs from "node:fs";
  - import path from "node:path";
  - import { parseArgs, getStringArg, requireStringArg } from "./lib/args.ts";
  - import { bboxCenter, bboxContainsPoint, polygonsToBBox } from "./lib/geometry.ts";
  - import { assertIsSnapshot, isRecord } from "./lib/snapshot.ts";
---

Type-aliases:
  - AnchorBox
  - AnchorFile
  - ManifestDoc
  - Manifest
  - ExportMismatch
  - DatasetResult
  - DatasetExporter

Functions:
  - L44: function repoRoot(): string
  - L48: function packRoot(packId: string): string
  - L52: async function readJsonFile<T>(filePath: string): Promise<T>
  - L56: function normaliseLf(text: string): string
  - L64: function escapeCsvField(val: string): string
  - L70: function writeCsv(headers: string[], rows: Array<Record<string, string>>): string
  - L96: function formatMonthDayYear(iso: string): string | null
  - L110: function loadManifest(packId: string): Manifest
  - L129: function anchorsPathFor(manifest: Manifest, packRootDir: string, docFilename: string): string | null
  - L135: function inferAnchorsPath(packRootDir: string, docFilename: string): string
  - L140: async function anchorIdForCitation(args: { packId: string; manifest: Manifest; docFilename: string; pageNumber: number; polygons: unknown; }): Promise<string | null>
  - L175: function findPayloadRow(snapshot: any, kind: string)
  - L185: function pickPrimaryCitationId(citationIds: unknown): string | null
  - L192: async function exportRequirements(args: { packId: string; manifest: Manifest; snapshot: any; }): Promise<{ headers: string[]; rows: Array<Record<string, string>> }>
  - L235: async function exportExceptions(args: { packId: string; manifest: Manifest; snapshot: any; }): Promise<{ headers: string[]; rows: Array<Record<string, string>> }>
  - L303: async function exportSurveyIssues(args: { packId: string; manifest: Manifest; snapshot: any; }): Promise<{ headers: string[]; rows: Array<Record<string, string>> }>
  - L347: async function exportSurveyCertParties(args: { packId: string; manifest: Manifest; snapshot: any; }): Promise<{ headers: string[]; rows: Array<Record<string, string>> }>
  - L423: async function main()

Global vars:
  - MONTHS
  - DATASETS: Array<{ dataset: string; truth_filename: string; hasPayload: (snapshot: any) => boolean; export: DatasetExporter
---


File: /Users/marc/Code/personal-projects/orbital-poc/scripts/fixtures/seed.ts
Imports:
  - import fs from "node:fs";
  - import path from "node:path";
  - import { AnchorFileSchema, anchorBoxToPolygons, type AnchorBox } from "../../packages/core/src/geometry/anchors.ts";
  - import { hashSnippet } from "../../packages/core/src/citations/snippet.ts";
  - import { fixtureDocumentId } from "../../packages/core/src/fixtures/fixtureIds.ts";
  - import { detectMissingDocs } from "../../packages/core/src/missing-docs/detectMissingDocs.ts";
  - import { matchExceptionToInstrumentDocs } from "../../packages/core/src/exception-matching/matchExceptionsToInstrumentDocs.ts";
  - import { LIST_PAYLOAD_V0_SCHEMA_VERSION, ListPayloadV0Schema } from "../../packages/core/src/schemas/list_payload_v0.ts";
  - import { parseArgs, getBoolArg, getStringArg } from "./lib/args.ts";
  - import { parseCsv } from "./lib/csv.ts";
---

Type-aliases:
  - FixtureManifest
  - GoldenQuestion
  - SeedSnapshot
  - LayoutFile

Functions:
  - L65: function isRecord(val: unknown): val is Record<string, unknown>
  - L69: function asNonEmptyString(val: unknown): string | null
  - L75: function readJsonFile(filePath: string): unknown
  - L80: function writeJsonFile(filePath: string, value: unknown)
  - L85: function loadManifest(packRoot: string): FixtureManifest
  - L112: function loadGoldenQuestions(packRoot: string): GoldenQuestion[]
  - L145: function anchorsPathFor(manifest: FixtureManifest, packRoot: string, docFilename: string): string | null
  - L158: function pickTitleCommitmentDoc(manifest: FixtureManifest): FixtureManifest["documents"][number] | null
  - L166: function layoutPathFor(manifest: FixtureManifest, packRoot: string, docFilename: string): string | null
  - L172: function findLayoutLineByAnchor(layout: LayoutFile, anchorId: string): { page: number; text: string }
  - L181: function extractInstrumentNoFromRecordingInfoLine(text: string): string | null
  - L186: function loadScheduleBiiReference(args: { manifest: FixtureManifest; packRoot: string; }): { ok: true; referenceText: string; referenceSource: { source: string; page: number } }
  - L235: function loadAnchorBbox(args: { manifest: FixtureManifest; packRoot: string; docFilename: string; anchorId: string; }): { ok: true; anchor: AnchorBox }
  - L250: function snippetFor(q: GoldenQuestion, c: { doc: string; anchor: string }): string
  - L255: function norm_ws(input: string): string
  - L259: function norm_instrument_no(input: string): string
  - L263: function issueCodeForType(issueType: string): string
  - L277: function missingInstrumentDocChecklist(args: { expectedFilename: string | null; instrumentNo: string | null; }): string
  - L308: function pad2(n: number): string
  - L312: function norm_date(input: string): string | null
  - L343: function norm_tags(input: string): string[]
  - L352: function extractSurveyCertificationPartiesFromText(text: string): string[]
  - L392: function seedPack(packId: string, opts: { outRoot: string; overwrite: boolean; includeBadCitationRow: boolean })
  - L869: function main()

Global vars:
  - MONTHS: Record<string, number>
---

</file_map>
<file_contents>
File: /Users/marc/Code/personal-projects/orbital-poc/docs/04-projects/03-fixes/0001_drift/arch_prd_impl_drift.md
```md
# Drift Report: `0001_trust-substrate` (Docs ↔ PRDs ↔ Code)

## Scope + constraints
Compared sources:
- Architecture docs: `docs/03-architecture/*`
- PRDs (JSON): `docs/04-projects/02-features/0001_trust-substrate/prds/*/prd.json` + `docs/04-projects/02-features/0001_trust-substrate/prd-overall.json`
- Implementation: `apps/web/app`, `apps/web/lib`, `packages/core/src`
- Smoke scripts: `scripts/us00*_smoke.ts`

Notes:
- Some docs may be slightly stale (per your note); this report treats docs/PRDs as the target contract and code as “what’s true today.”
- Sequencing note: 0002a first → 0002b–f → 0002g (gaps). This reduces drift confidence for any 0001 behavior that will later be re-grounded in the 0002 canonical run model.

---

## Requirements Checklist (Implemented / Partial / Missing / Extra)

### Safe error envelope + `trace_id` correlation
- **Status:** Implemented (across route handlers)
- **Spec:** non-2xx uses envelope; server includes `trace_id` in body and `X-Trace-Id` header. `docs/03-architecture/50_api_surface.md:38`, `docs/03-architecture/50_api_surface.md:42`
- **Core support:** envelope supports `trace_id`. `packages/core/src/safe-error.ts:10`
- **Web helper:** `createTraceContext()` mints `traceId` and sets `X-Trace-Id`. `apps/web/lib/trace.server.ts:3`
- **Evidence (examples):**
  - `GET /citations/:id`: `apps/web/app/(api)/citations/[id]/route.ts:89`
  - `POST /folders`: `apps/web/app/(api)/folders/route.ts:47`
  - `GET /folders/:id`: `apps/web/app/(api)/folders/[id]/route.ts:15`

### Admin token (`X-Orbital-Admin-Token`)
- **Status:** Implemented (strict by default) + **Extra:** explicit dev-only bypass when token is unset
- **Spec:** require header matching env `ORBITAL_ADMIN_TOKEN`, else `403 UNAUTHORISED`. `docs/03-architecture/50_api_surface.md:33`, `docs/03-architecture/50_api_surface.md:36`
- **Implementation:** `GET /runs/:id/trace` checks token. `apps/web/app/(api)/runs/[id]/trace/route.ts:38`, `apps/web/app/(api)/runs/[id]/trace/route.ts:50`
- **Extra (dev only):** allow bypass only when `NODE_ENV=development` and `ALLOW_ADMIN_BYPASS=1`. `apps/web/app/(api)/runs/[id]/trace/route.ts:44`

### Spike endpoint gating (`/spikes/*` requires `SPIKES_ENABLED=1`)
- **Status:** Implemented (works in any env where `SPIKES_ENABLED=1`, including a separate dev env)
- **Spec:** `/spikes/*` gated behind `SPIKES_ENABLED=1`, else `404`. `docs/03-architecture/50_api_surface.md:5`, `docs/03-architecture/50_api_surface.md:83`
- **Shared gate:** `assertSpikesEnabled()` returns `404` with a safe envelope. `apps/web/lib/spikes.server.ts:3`
- **Applied to spikes routes:**
  - `GET /spikes/local-pdf`: `apps/web/app/(api)/spikes/local-pdf/route.ts:13`
  - `POST /spikes/rh4-verify`: `apps/web/app/(api)/spikes/rh4-verify/route.ts:9`
  - `POST /spikes/export/csv`: `apps/web/app/(api)/spikes/export/csv/route.ts:134`

### Render URL contract (`GET /documents/:id/render?page=N`)
- **Status:** Implemented
- **Spec:** returns `{document_id,page,render_url}`; `page` 1-indexed; `render_url` is signed URL to whole PDF. `docs/03-architecture/50_api_surface.md:226`, `docs/03-architecture/50_api_surface.md:231`, `docs/03-architecture/50_api_surface.md:235`
- **Implementation:**
  - Fixture-doc branch: `apps/web/app/(api)/documents/[id]/render/route.ts:92`
  - DB-doc branch: `apps/web/app/(api)/documents/[id]/render/route.ts:169`
  - Out-of-range page validation when `page_count` known: `apps/web/app/(api)/documents/[id]/render/route.ts:149`

### Range support for PDFs (pdf.js requirement)
- **Status:** Implemented
- **Implementation (signed PDF endpoint supports Range):** `apps/web/app/(api)/documents/[id]/pdf/route.ts:205`, `apps/web/app/(api)/documents/[id]/pdf/route.ts:225`
- **Implementation (local spike PDF endpoint supports Range):** `apps/web/app/(api)/spikes/local-pdf/route.ts:61`, `apps/web/app/(api)/spikes/local-pdf/route.ts:83`
- **Smoke proof exists:** range precheck asserts `206`, `Accept-Ranges`, and `Content-Range`. `scripts/us001_render_smoke.ts:100`, `scripts/us001_render_smoke.ts:116`

### Trace export (`GET /runs/:id/trace`)
- **Status:** Partial (fixture-backed; not yet the canonical persisted run model)
- **PRD:** feature-flagged, admin-only, off by default (`FEATURE_TRACE_EXPORT`). `docs/04-projects/02-features/0001_trust-substrate/prds/0001f_provenance-trace-export/prd.json:30`, `docs/04-projects/02-features/0001_trust-substrate/prds/0001f_provenance-trace-export/prd.json:41`
- **Spec:** safe-by-default trace export. `docs/03-architecture/50_api_surface.md:335`, `docs/03-architecture/50_api_surface.md:341`
- **Implementation:** `apps/web/app/(api)/runs/[id]/trace/route.ts:132`
- **Drift:** trace is fixture-backed and “steps” are synthesized; not persisted (no DB `runs/run_steps/...`). `apps/web/lib/db.server.ts:45`, `docs/03-architecture/30_data_model.md:18`

### CSV export (`POST /export/csv`)
- **Status:** Missing (target contract reserved) + **Extra:** fixture-backed spike implementation
- **Spec:** default `EXPORT_BLOCKED` when any row is `citation_failed`. `docs/03-architecture/50_api_surface.md:403`, `docs/03-architecture/50_api_surface.md:409`
- **Current behavior:** canonical endpoint returns `NOT_FOUND` and points to spike route. `apps/web/app/(api)/export/csv/route.ts:7`
- **Spike implementation:** `POST /spikes/export/csv` implements fail-closed verification + artefact creation. `apps/web/app/(api)/spikes/export/csv/route.ts:134`, `apps/web/app/(api)/spikes/export/csv/route.ts:187`
- **Download endpoint (signed):** `GET /export/csv/download?expires&sig=...` is implemented. `apps/web/app/(api)/export/csv/download/route.ts:37`

### Canonical snippet hashing (single source of truth)
- **Status:** Implemented
- **Spec (hashing rule):** `docs/03-architecture/30_data_model.md:210`, `docs/03-architecture/30_data_model.md:214`
- **Core implementation:** `packages/core/src/citations/snippet.ts:3`, `packages/core/src/citations/snippet.ts:7`
- **Tests:**
  - Single-source guardrail: `packages/core/src/citations/snippet.single-source.test.ts:43`
  - Whitespace invariance: `packages/core/src/citations/snippet.test.ts:5`

### Deterministic verification v1 (integrity-only)
- **Status:** Implemented
- **Core invariants:** `packages/core/src/verify/verifier.ts:35`, `packages/core/src/verify/verifier.ts:53`, `packages/core/src/verify/verifier.ts:67`

### Canonical persistence (trust spine tables)
- **Status:** Missing (major structural drift)
- **Spec:** ERD expects `runs`, `run_steps`, `report_rows`, `citations`, `artefacts`. `docs/03-architecture/30_data_model.md:18`, `docs/03-architecture/30_data_model.md:23`
- **Current DB schema:** only `folders`, `documents`, `document_pages`, `chunks`. `apps/web/lib/db.server.ts:48`, `apps/web/lib/db.server.ts:96`

### Extra (present in code, not in target contract)
- Fixture-driven scaffold IDs (e.g. `pack_*` used as `folder_id` in spikes and `pack` query escape hatches).
  - Spike export expects `folder_id` to be `pack_*`: `apps/web/app/(api)/spikes/export/csv/route.ts:21`
  - Citations API uses seeded packs to resolve IDs: `apps/web/app/(api)/citations/[id]/route.ts:92`

---

## Architecture Alignment and Mismatches

### Folder state machine (aligned)
- Folder derived state matches the documented invariants:
  - `empty` is zero documents: `docs/03-architecture/20_state_model.md:37`, `apps/web/lib/folderState.server.ts:34`
  - `failed` when any doc failed: `docs/03-architecture/20_state_model.md:49`, `apps/web/lib/folderState.server.ts:36`
  - `ready` health checks align with extraction_quality + page rows: `docs/03-architecture/20_state_model.md:52`, `docs/03-architecture/20_state_model.md:55`, `apps/web/lib/folderState.server.ts:54`, `apps/web/lib/folderState.server.ts:60`

### Report-row invariants (aligned in core, not persisted)
- Doc invariants for `missing_input` and locked citations exist. `docs/03-architecture/20_state_model.md:145`, `docs/03-architecture/20_state_model.md:148`
- Core verifier enforces key integrity constraints, but it runs against fixture snapshots or request-time computed structures (no persisted `report_rows`/`citations` tables yet). `packages/core/src/verify/verifier.ts:35`, `apps/web/lib/db.server.ts:45`

### API surface mismatches
- Target export contract is defined at `POST /export/csv`, but current working export implementation is under `/spikes/export/csv`. `docs/03-architecture/50_api_surface.md:403`, `apps/web/app/(api)/export/csv/route.ts:7`

### Data model mismatch (major)
- Docs/PRDs assume append-only execution persistence for auditability and replay (`runs/run_steps/report_rows/citations/artefacts`). `docs/03-architecture/30_data_model.md:18`, `docs/04-projects/02-features/0001_trust-substrate/prds/0001f_provenance-trace-export/prd.json:43`
- Code today is primarily “fixture mode” for citations/trace/export, with DB schema stopping at chunks. `apps/web/lib/db.server.ts:94`

---

## Generated-Code Notes
- No OpenAPI/GraphQL/proto/codegen inputs were found in the reviewed areas.

---

## Risks (Security / Data / Perf / Compat)

### Security
- Spike endpoints are now gated by `SPIKES_ENABLED=1` (reduces accidental exposure risk), but this is still a footgun if enabled in the wrong environment. `apps/web/lib/spikes.server.ts:4`
- Trace export is admin-only by default; the only bypass is explicit and dev-only (`ALLOW_ADMIN_BYPASS=1`). `apps/web/app/(api)/runs/[id]/trace/route.ts:44`

### Data integrity
- Fixture-mode can diverge from canonical DB-backed behavior once 0002 lands; without persisted trust spine tables, “what happened” is not auditable beyond a snapshot file.

### Compatibility
- Signed `render_url` + Range semantics are validated by smoke script. `scripts/us001_render_smoke.ts:93`, `scripts/us001_render_smoke.ts:106`

### Operational ergonomics
- Object-store signing secret defaults to a per-process dev value if `OBJECT_STORE_SIGNING_SECRET` is unset; signed URLs will break across restarts. `apps/web/lib/objectStore.server.ts:42`, `apps/web/lib/objectStore.server.ts:46`
- Sprite dev environments may require `localhost`→`127.0.0.1` normalization for Postgres. `apps/web/lib/db.server.ts:14`

---

## Test Gaps

- `trace_id` standardization: add tests asserting all non-2xx responses include `error.trace_id` + `X-Trace-Id` for key endpoints.
- Spike gating: add tests asserting `/spikes/*` returns `404` unless `SPIKES_ENABLED=1`.
- Admin token posture: add tests asserting `GET /runs/:id/trace` is admin-only unless the explicit dev bypass is enabled.

Existing smoke proof:
- Render_url + Range proof: `scripts/us001_render_smoke.ts:93`.

---

## Next Steps (Smallest-First)

1. Decide how to handle export surface drift
- Either implement `POST /export/csv` per `docs/03-architecture/50_api_surface.md:403`, or explicitly move the contract under `/spikes/*` and update docs.

2. Make fixture mode explicit
- Add a short “fixture mode vs canonical mode” section to `docs/03-architecture/50_api_surface.md:5` and/or move remaining fixture-backed endpoints under `/spikes/*`.

3. Close the largest structural drift: persist trust spine tables
- Extend `apps/web/lib/db.server.ts:45` to add `runs`, `run_steps`, `report_rows`, `citations`, `artefacts` per `docs/03-architecture/30_data_model.md:18`.
- Migrate `GET /runs/:id/trace` and `POST /export/csv` to read from persisted run state.

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

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/safe-error.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/folders/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/documents/[id]/complete/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

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

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/fixtures/fixtureIds.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/db.server.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/README.md
```md
# orbital-poc
This is a personal project created for educational purposes as part of a job application to Orbital. It is not affiliated with, endorsed by, or connected to Orbital in any way. This is purely a demonstration of technical skills and understanding of the problem domain.

## Start here
- Onboarding checklist: `docs/03-architecture/01_onboarding_checklist.md`
- Architecture overview: `docs/03-architecture/00_overview.md`
- Tech stack + dev workflow: `docs/03-architecture/05_tech_stack_and_dev_workflow.md`

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/geometry/mapToViewport.test.ts
```ts
import { describe, expect, it } from "vitest";

import { bboxFromCssPolygons, mapNormPointToPdfPoint, mapNormPolygonsToViewportCss } from "./mapToViewport";

describe("mapNormPointToPdfPoint", () => {
  it("maps top-left normalised points to PDF points with Y inversion", () => {
    const viewBox: [number, number, number, number] = [0, 0, 100, 100];

    expect(mapNormPointToPdfPoint([0, 0], viewBox)).toEqual([0, 100]);
    expect(mapNormPointToPdfPoint([0, 1], viewBox)).toEqual([0, 0]);
    expect(mapNormPointToPdfPoint([1, 0], viewBox)).toEqual([100, 100]);
    expect(mapNormPointToPdfPoint([1, 1], viewBox)).toEqual([100, 0]);
  });
});

describe("mapNormPolygonsToViewportCss", () => {
  it("maps via viewport.convertToViewportPoint()", () => {
    const viewBox: [number, number, number, number] = [0, 0, 100, 100];
    const viewport = {
      width: 100,
      height: 100,
      convertToViewportPoint: (x: number, y: number) => [x, y] as [number, number],
    };

    const mapped = mapNormPolygonsToViewportCss({
      polygons: [
        [
          [0.1, 0.2],
          [0.2, 0.2],
          [0.2, 0.3],
          [0.1, 0.3],
        ],
      ],
      viewBox,
      viewport,
    });

    // yPdf = 100 - yNorm*100
    expect(mapped[0][0]).toEqual([10, 80]);
    expect(mapped[0][1]).toEqual([20, 80]);
    expect(mapped[0][2]).toEqual([20, 70]);
    expect(mapped[0][3]).toEqual([10, 70]);

    const bbox = bboxFromCssPolygons(mapped);
    expect(bbox).toEqual({ minX: 10, minY: 70, maxX: 20, maxY: 80, width: 10, height: 10 });
  });
});


```

File: /Users/marc/Code/personal-projects/orbital-poc/scripts/fixtures/verify_pack_names.ts
```ts
import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { parseArgs, getStringArg } from "./lib/args.ts";
import { walkFiles } from "./lib/fs.ts";

function extractCanonicalPackIds(packsSummaryMd: string): string[] {
  const ids = new Set<string>();
  for (const m of packsSummaryMd.matchAll(/`(pack_\d{2}_[a-z0-9_]+)`/gi)) {
    ids.add(m[1]);
  }
  return Array.from(ids).sort();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const docsRoot = resolve(getStringArg(args, "docs-root") ?? "docs");
  const packsSummaryPath = resolve(getStringArg(args, "packs-summary") ?? "docs/08-example-data/packs_summary.md");

  const summaryText = await readFile(packsSummaryPath, "utf8");
  const canonical = extractCanonicalPackIds(summaryText);
  const canonicalSet = new Set(canonical);

  if (!canonical.length) {
    throw new Error(`No canonical pack IDs found in ${basename(packsSummaryPath)}`);
  }

  const errors: string[] = [];

  // 1) Directory check: every pack in packs_summary has a folder.
  for (const id of canonical) {
    const dir = resolve(`docs/08-example-data/${id}`);
    try {
      // eslint-disable-next-line no-await-in-loop
      await readFile(resolve(dir, "manifest.json"), "utf8");
    } catch {
      errors.push(`Missing pack folder or manifest.json for ${id} (expected docs/08-example-data/${id}/manifest.json)`);
    }
  }

  // 2) Reference check: scan docs/*.md (excluding tmp-oracle) for pack_* mentions.
  const mdFiles = await walkFiles(docsRoot, {
    includeExtensions: [".md"],
    excludeDirNames: ["tmp-oracle", "tmp-handoffs"],
  });

  const mentionRe = /\bpack_\d{2}_[a-z0-9_]+\b/gi;
  for (const file of mdFiles) {
    // Exclude the packs_summary itself (it is the source of truth).
    if (resolve(file) === packsSummaryPath) continue;

    // eslint-disable-next-line no-await-in-loop
    const text = await readFile(file, "utf8");
    const matches = text.match(mentionRe) ?? [];
    for (const m of matches) {
      const id = m;
      if (!canonicalSet.has(id)) {
        errors.push(`Non-canonical pack reference: ${id} in ${file}`);
      }
    }
  }

  if (!errors.length) {
    process.stdout.write(`PASS verify_pack_names (packs=${canonical.length})\n`);
    process.exit(0);
  }

  process.stdout.write(`FAIL verify_pack_names - ${errors.length} error(s)\n`);
  for (const e of errors.slice(0, 50)) process.stdout.write(`- ${e}\n`);
  if (errors.length > 50) process.stdout.write("(showing first 50)\n");
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(String(err?.stack ?? err) + "\n");
  process.exit(2);
});

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/folders/[id]/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/demoMode.server.ts
```ts
import "server-only";

import { safeErrorEnvelope } from "@orbital-poc/core";

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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/documents/[id]/render/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";
import { parseFixtureDocumentId } from "@orbital-poc/core/fixtures/fixtureIds";

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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/spikes/local-pdf/route.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import { LocalPdfQuerySchema, safeErrorEnvelope } from "@orbital-poc/core";

import { parseSingleRangeHeader } from "../../../../lib/httpRange.server";
import { safePdfFilename } from "../../../../lib/safePdfFilename.server";
import { assertSpikesEnabled } from "../../../../lib/spikes.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  const { traceId, headers: traceHeaders } = createTraceContext();
  const spikesGate = assertSpikesEnabled(traceId, traceHeaders);
  if (spikesGate) return spikesGate;

  const url = new URL(req.url);
  const parsed = LocalPdfQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers: traceHeaders },
    );
  }

  const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data");
  const candidate = path.resolve(packRoot, parsed.data.pack, "docs", parsed.data.filename);
  if (!candidate.startsWith(packRoot + path.sep)) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid path.", traceId }),
      { status: 400, headers: traceHeaders },
    );
  }

  let stat: fs.Stats;
  try {
    stat = fs.statSync(candidate);
  } catch {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
      status: 404,
      headers: traceHeaders,
    });
  }
  if (!stat.isFile()) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
      status: 404,
      headers: traceHeaders,
    });
  }

  const size = stat.size;
  const rangeHeader = req.headers.get("range");
  const range = rangeHeader ? parseSingleRangeHeader(rangeHeader, size) : null;

  const headers = new Headers(traceHeaders);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `inline; filename="${safePdfFilename(parsed.data.filename)}"`);
  headers.set("Cache-Control", "no-store");

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

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/folders/[id]/artefacts/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { createSignedGetHeaders } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

type ArtefactRow = {
  id: string;
  folder_id: string;
  type: string;
  kind: string;
  filename: string;
  storage_key: string;
  source_run_id: string | null;
  created_at: Date;
};

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  headers.set("Cache-Control", "no-store, no-cache");

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

  const artefacts = await sql<ArtefactRow[]>`
    SELECT id, folder_id, type, kind, filename, storage_key, source_run_id, created_at
    FROM artefacts
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;

  const origin = new URL(req.url).origin;

  return Response.json(
    {
      artefacts: artefacts.map((a) => {
        const signed = createSignedGetHeaders({ storageKey: a.storage_key });
        const downloadUrl = `${origin}/artefacts/${a.id}/download?${new URLSearchParams({
          expires: String(signed.expires_at_ms),
          sig: signed.signature,
          issued: traceId,
        }).toString()}`;

        return {
          id: a.id,
          type: a.type,
          kind: a.kind,
          filename: a.filename,
          storage_key: a.storage_key,
          source_run_id: a.source_run_id,
          created_at: a.created_at.toISOString(),
          download_url: downloadUrl,
        };
      }),
    },
    { status: 200, headers },
  );
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/06_frameworks_agents_rag_evals.md
```md
# Frameworks, agents, RAG, and evals

This doc answers:
- why we picked Workflow DevKit for orchestration
- what we do (and do not) use agent frameworks for
- where RAG fits in the system
- how evals are wired in for demo reliability

## Framework selection

### Chosen for PoC: Workflow DevKit (WDK)
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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/spikes/rh4-verify/route.ts
```ts
import { safeErrorEnvelope, VerifyInputSchema } from "@orbital-poc/core";
import { verifyRow } from "@orbital-poc/core/server";

import { assertSpikesEnabled } from "../../../../lib/spikes.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const spikesGate = assertSpikesEnabled(traceId, headers);
  if (spikesGate) return spikesGate;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }),
      { status: 400, headers },
    );
  }

  const parsed = VerifyInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match VerifyInput schema.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const result = await verifyRow(parsed.data, { mode: "deterministic-only" });
  return Response.json(result, { status: 200, headers });
}

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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/citations/[id]/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/documents/[id]/upload/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

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

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/citations/snippet.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/devOnlyApi.server.ts
```ts
import "server-only";

import { safeErrorEnvelope } from "@orbital-poc/core";

export function assertDevOnlyApi(traceId: string, headers: Headers): Response | null {
  if (process.env.NODE_ENV === "development") return null;
  return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Not found.", traceId }), {
    status: 404,
    headers,
  });
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

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/60_observability_and_evals.md
```md
# Observability and evals

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

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/geometry/anchors.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/runs/[id]/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../lib/devOnlyApi.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1).max(200),
});

function asFailureCounts(val: unknown): Record<string, number> {
  if (!val || typeof val !== "object" || Array.isArray(val)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    if (typeof k !== "string" || !k) continue;
    if (typeof v === "number" && Number.isFinite(v) && v > 0) out[k] = Math.floor(v);
  }
  return out;
}

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

  const runId = parsedParams.data.id;
  const runs = await sql<
    Array<{
      id: string;
      state: string;
      index_version: string;
      agent_bundle_version: string;
      question_set_version: string;
      questions_total: number;
      questions_done: number;
      failure_counts_json: unknown;
    }>
  >`
    SELECT id, state, index_version, agent_bundle_version, question_set_version, questions_total, questions_done, failure_counts_json
    FROM runs
    WHERE id = ${runId}
    LIMIT 1
  `;
  const run = runs[0];
  if (!run) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Run not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  return Response.json(
    {
      run: {
        id: run.id,
        state: run.state,
        index_version: run.index_version,
        agent_bundle_version: run.agent_bundle_version,
        question_set_version: run.question_set_version,
        progress: {
          questions_total: run.questions_total ?? 0,
          questions_done: run.questions_done ?? 0,
        },
        failure_counts: asFailureCounts(run.failure_counts_json),
      },
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/folderState.server.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/50_api_surface.md
```md
# API surface (PoC)

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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/runs/[id]/trace/route.ts
```ts
import { timingSafeEqual } from "node:crypto";

import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";
import { verifyRow } from "@orbital-poc/core/server";

import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { listSeededPackIds, loadSeedSnapshot } from "../../../../../lib/fixtureSeed.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_.-]+$/i, "Invalid run id"),
});

const QuerySchema = z.object({
  // Optional escape hatch for fixture seed data where multiple packs may share run ids.
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i)
    .optional(),
});

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function assertAdminAllowed(req: Request):
  | { ok: true }
  | { ok: false; code: "UNAUTHORISED" | "INTERNAL"; message: string } {
  const expected = process.env.ORBITAL_ADMIN_TOKEN?.trim() ?? "";
  if (!expected) {
    // Keep production posture strict; allow explicit bypass in dev only.
    const bypassAllowed = process.env.NODE_ENV === "development" && process.env.ALLOW_ADMIN_BYPASS === "1";
    if (bypassAllowed) return { ok: true };
    return { ok: false, code: "INTERNAL", message: "Trace export is misconfigured." };
  }

  const provided = req.headers.get("x-orbital-admin-token")?.trim() ?? "";
  if (!provided || !safeEqual(provided, expected)) {
    return { ok: false, code: "UNAUTHORISED", message: "Admin token required." };
  }

  return { ok: true };
}

type SeedSnapshot = NonNullable<ReturnType<typeof loadSeedSnapshot>>;

function findRunInSeedSnapshots(args: {
  runId: string;
  packId?: string;
}):
  | { ok: true; packId: string; snapshot: SeedSnapshot }
  | { ok: false; code: "NOT_FOUND" | "CONFLICT" | "INTERNAL"; message: string; details?: unknown } {
  const packIds = args.packId ? [args.packId] : listSeededPackIds();
  const hits: Array<{ packId: string; snapshot: SeedSnapshot }> = [];

  for (const packId of packIds) {
    let snapshot: SeedSnapshot | null;
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
    if (typeof snapshot.meta.run_id !== "string") continue;
    if (snapshot.meta.run_id !== args.runId) continue;
    hits.push({ packId, snapshot });
  }

  if (hits.length === 0) return { ok: false, code: "NOT_FOUND", message: "Run not found." };
  if (hits.length > 1) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "run_id is ambiguous across seeded packs.",
      details: { packs: hits.map((h) => h.packId) },
    };
  }

  return { ok: true, packId: hits[0]!.packId, snapshot: hits[0]!.snapshot };
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

type RetrievedChunk = { chunk_id: string; score: number | null };

function extractRetrievedChunks(provenance: unknown): RetrievedChunk[] {
  if (!isRecord(provenance)) return [];

  const candidates = Array.isArray(provenance.retrieved)
    ? provenance.retrieved
    : Array.isArray(provenance.retrieved_chunks)
      ? provenance.retrieved_chunks
      : null;
  if (!candidates) return [];

  const out: RetrievedChunk[] = [];
  for (const c of candidates) {
    if (!isRecord(c)) continue;
    const chunkId = typeof c.chunk_id === "string" ? c.chunk_id.trim() : "";
    if (!chunkId) continue;
    const score = typeof c.score === "number" && Number.isFinite(c.score) ? c.score : null;
    out.push({ chunk_id: chunkId, score });
  }
  return out;
}

function safeDurationMs(ms: unknown): number {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms < 0) return 0;
  return Math.round(ms);
}

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

  if (process.env.FEATURE_TRACE_EXPORT !== "1") {
    return Response.json(
      safeErrorEnvelope({ code: "NOT_FOUND", message: "Trace export not enabled.", traceId }),
      { status: 404, headers },
    );
  }

  const admin = assertAdminAllowed(req);
  if (!admin.ok) {
    return Response.json(safeErrorEnvelope({ code: admin.code, message: admin.message, traceId }), {
      status: admin.code === "UNAUTHORISED" ? 403 : 500,
      headers,
    });
  }

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

  const runId = parsedParams.data.id;
  const packId = parsedQuery.data.pack;

  const found = findRunInSeedSnapshots({ runId, packId });
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

  const snapshot = found.snapshot;

  const results = await Promise.all(
    snapshot.rows.map(async (row) => {
      const citationIds = row.citation_ids ?? [];
      const citations = citationIds
        .map((cid) => {
          const cit = snapshot.citations?.[cid];
          if (!cit) return null;
          return {
            document_id: cit.document_id,
            page_number: cit.page_number,
            snippet: cit.snippet,
            snippet_hash: cit.snippet_hash,
            polygons: cit.polygons,
          };
        })
        .filter((c): c is NonNullable<typeof c> => Boolean(c));

      const missingCount = citationIds.length - citations.length;
      const verify =
        missingCount > 0
          ? {
              verdict: "fail" as const,
              reason_code: "VALIDATION_ERROR",
              reason: `Missing ${missingCount} citation(s) referenced by id.`,
              timings_ms: { total: 0, deterministic: 0 },
            }
          : await verifyRow(
              {
                case_id: snapshot.meta.pack_id,
                question_id: row.question_id,
                question: row.question,
                answer: row.answer,
                citations,
              },
              { mode: "deterministic-only" },
            );

      const retrieved = extractRetrievedChunks((row as { provenance_json?: unknown }).provenance_json);

      return {
        row,
        citationIds,
        verify,
        retrieved,
      };
    }),
  );

  const trace = {
    run: {
      run_id: runId,
      folder_id: snapshot.meta.pack_id,
      state: "completed",
      index_version: typeof snapshot.meta.index_version === "string" ? snapshot.meta.index_version : null,
      agent_bundle_version: typeof snapshot.meta.agent_bundle_version === "string" ? snapshot.meta.agent_bundle_version : null,
      question_set_version: typeof snapshot.meta.question_set_version === "string" ? snapshot.meta.question_set_version : null,
    },
    steps: results.map(({ row, verify }) => ({
      step_key: `verify:${row.question_id}`,
      step_type: "verify_row",
      state: verify.verdict === "pass" ? "succeeded" : "failed",
      attempt: 1,
      duration_ms: safeDurationMs(verify.timings_ms?.total),
      metrics_json: {
        timings_ms: verify.timings_ms,
      },
      error_json:
        verify.verdict === "pass"
          ? null
          : {
              code: verify.reason_code,
              message: `Verification failed (${verify.reason_code}).`,
            },
    })),
    rows: results.map(({ row, citationIds, verify, retrieved }) => ({
      question_id: row.question_id,
      status: row.status,
      citation_ids: citationIds,
      provenance_json: {
        retrieved,
        verification: {
          verdict: verify.verdict,
          reason_code: verify.reason_code,
        },
      },
    })),
  };

  headers.set("Content-Disposition", `attachment; filename=\"trace_${runId}.json\"`);
  return Response.json({ trace }, { status: 200, headers });
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/httpRange.server.test.ts
```ts
import { describe, expect, it } from "vitest";

import { parseSingleRangeHeader } from "./httpRange.server";

describe("parseSingleRangeHeader", () => {
  it("returns null when size <= 0", () => {
    expect(parseSingleRangeHeader("bytes=0-10", 0)).toBeNull();
    expect(parseSingleRangeHeader("bytes=0-10", -1)).toBeNull();
  });

  it("rejects non-bytes ranges", () => {
    expect(parseSingleRangeHeader("items=0-10", 100)).toBeNull();
  });

  it("rejects multi-range", () => {
    expect(parseSingleRangeHeader("bytes=0-10,20-30", 100)).toBeNull();
  });

  it("rejects multiple dashes", () => {
    expect(parseSingleRangeHeader("bytes=0-10-20", 100)).toBeNull();
  });

  it("rejects non-integer ranges", () => {
    expect(parseSingleRangeHeader("bytes=0.5-10", 100)).toBeNull();
    expect(parseSingleRangeHeader("bytes=0-10.5", 100)).toBeNull();
    expect(parseSingleRangeHeader("bytes=-10.5", 100)).toBeNull();
  });

  it("parses an explicit start/end", () => {
    expect(parseSingleRangeHeader("bytes=0-10", 100)).toEqual({ start: 0, end: 10 });
  });

  it("parses an open-ended range (start-)", () => {
    expect(parseSingleRangeHeader("bytes=5-", 10)).toEqual({ start: 5, end: 9 });
  });

  it("parses a suffix range (-N)", () => {
    expect(parseSingleRangeHeader("bytes=-5", 10)).toEqual({ start: 5, end: 9 });
    expect(parseSingleRangeHeader("bytes=-50", 10)).toEqual({ start: 0, end: 9 });
  });

  it("clamps end to size-1", () => {
    expect(parseSingleRangeHeader("bytes=0-999", 10)).toEqual({ start: 0, end: 9 });
  });

  it("rejects start >= size", () => {
    expect(parseSingleRangeHeader("bytes=10-", 10)).toBeNull();
  });

  it("rejects start > end", () => {
    expect(parseSingleRangeHeader("bytes=5-4", 10)).toBeNull();
  });

  it("rejects bytes=-", () => {
    expect(parseSingleRangeHeader("bytes=-", 10)).toBeNull();
  });
});


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/demo/load-pack/route.ts
```ts
import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

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

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/.gitkeep
```

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

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/missing-docs/schemas.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/exception-matching/matchExceptionsToInstrumentDocs.test.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { matchExceptionToInstrumentDocs } from "./matchExceptionsToInstrumentDocs";

type LayoutFile = {
  pages: Array<{
    page: number;
    lines: Array<{ text: string; anchor?: string }>;
  }>;
};

function repoRoot(): string {
  // Vitest runs with cwd at the package root when invoked via `pnpm -r`.
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
}

function readJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function extractInstrumentNoFromRecInfo(layout: LayoutFile): string | null {
  for (const p of layout.pages ?? []) {
    for (const l of p.lines ?? []) {
      if (l?.anchor !== "REC_INFO") continue;
      const t = String(l?.text ?? "");
      const m = t.match(/\bInstrument\s+No\.\s*:?\s*([A-Za-z0-9-]+)\b/i);
      if (m?.[1]) return m[1];
    }
  }
  return null;
}

describe("matchExceptionToInstrumentDocs", () => {
  it("marks ambiguous when more than one candidate matches", () => {
    const res = matchExceptionToInstrumentDocs({
      instrument_no: "2018-195028",
      instrument_docs: [
        { doc: "A.pdf", instrument_no: "2018-195028" },
        { doc: "B.pdf", instrument_no: "2018-195028" },
      ],
    });
    expect(res.match_status).toBe("ambiguous");
    expect(res.doc).toBe(null);
    expect(res.candidates?.map((c) => c.doc)).toEqual(["A.pdf", "B.pdf"]);
  });

  it("matches pack_01_clean instrument numbers to unique docs", () => {
    const packRoot = path.resolve(repoRoot(), "docs/08-example-data/pack_01_clean");
    const manifest = readJson(path.join(packRoot, "manifest.json")) as any;
    const docs: Array<{ filename: string; layout_file?: string }> = Array.isArray(manifest?.documents) ? manifest.documents : [];

    const instrument_docs = docs
      .filter((d) => typeof d?.filename === "string" && /\.pdf$/i.test(d.filename) && typeof d?.layout_file === "string")
      .map((d) => {
        const layout = readJson(path.join(packRoot, String(d.layout_file))) as LayoutFile;
        // Treat only PDFs with a REC_INFO anchor as instrument candidates. This excludes
        // TitleCommitment.pdf, which can contain instrument numbers but is not an instrument.
        return { doc: String(d.filename), instrument_no: extractInstrumentNoFromRecInfo(layout) };
      })
      // Only instrument PDFs have a REC_INFO anchor in the synthetic pack.
      .filter((d) => d.instrument_no);

    const expectations: Array<{ instrument_no: string; doc: string }> = [
      { instrument_no: "2018-195028", doc: "Utility_Easement.pdf" },
      { instrument_no: "2019-202947", doc: "Ingress_Egress_Easement.pdf" },
      { instrument_no: "2020-210866", doc: "CCRs.pdf" },
      { instrument_no: "2021-218785", doc: "REA.pdf" },
      { instrument_no: "2022-226704", doc: "Memorandum_of_Lease.pdf" },
    ];

    for (const ex of expectations) {
      const res = matchExceptionToInstrumentDocs({ instrument_no: ex.instrument_no, instrument_docs });
      expect(res.match_status).toBe("matched");
      expect(res.doc).toBe(ex.doc);
    }
  });

  it("marks missing_doc for missing REA in pack_02_missing_rea", () => {
    const packRoot = path.resolve(repoRoot(), "docs/08-example-data/pack_02_missing_rea");
    const manifest = readJson(path.join(packRoot, "manifest.json")) as any;
    const docs: Array<{ filename: string; layout_file?: string }> = Array.isArray(manifest?.documents) ? manifest.documents : [];

    const instrument_docs = docs
      .filter((d) => typeof d?.filename === "string" && /\.pdf$/i.test(d.filename) && typeof d?.layout_file === "string")
      .map((d) => {
        const layout = readJson(path.join(packRoot, String(d.layout_file))) as LayoutFile;
        return { doc: String(d.filename), instrument_no: extractInstrumentNoFromRecInfo(layout) };
      })
      .filter((d) => d.instrument_no);

    const res = matchExceptionToInstrumentDocs({ instrument_no: "2018-986928", instrument_docs });
    expect(res.match_status).toBe("missing_doc");
    expect(res.doc).toBe(null);
  });
});

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/server.ts
```ts
export * from "./citations/snippet";
export * from "./verify/verifier";


```

File: /Users/marc/Code/personal-projects/orbital-poc/package.json
```json
{
  "name": "orbital-poc",
  "private": true,
  "packageManager": "pnpm@10.28.0",
  "scripts": {
    "dev": "pnpm --filter @orbital-poc/web dev",
    "start": "pnpm --filter @orbital-poc/web start",
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

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/index.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/artefacts/[id]/download/route.ts
```ts
import { Readable } from "node:stream";

import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import {
  createObjectReadStream,
  objectExists,
  statObject,
  validateArtefactStorageKey,
  verifySignature,
} from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^art_[0-9a-f-]+$/i, "Invalid artefact id"),
});

function contentTypeForArtefact(type: string): string {
  if (type === "csv") return "text/csv; charset=utf-8";
  if (type === "docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "application/octet-stream";
}

function safeDownloadFilename(args: { id: string; type: string; filename: unknown }): string {
  const ext = args.type === "csv" ? ".csv" : args.type === "docx" ? ".docx" : "";
  const fallback = `${args.id}${ext}`;

  if (typeof args.filename !== "string") return fallback;
  const s = args.filename.trim();
  if (!s) return fallback;
  if (s.length > 200) return fallback;
  if (!/^[A-Za-z0-9 _.-]+$/.test(s)) return fallback;
  if (ext && !s.toLowerCase().endsWith(ext)) return fallback;
  return s;
}

type ArtefactRow = {
  id: string;
  type: string;
  filename: string;
  storage_key: string;
};

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  headers.set("Cache-Control", "no-store, no-cache");

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
  const expiresRaw = url.searchParams.get("expires");
  const sigRaw = url.searchParams.get("sig");
  if (!expiresRaw || !sigRaw) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Missing download signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  const expiresAtMs = Number(expiresRaw);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid download expires.", traceId }), {
      status: 400,
      headers,
    });
  }

  if (Date.now() > expiresAtMs) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Download URL expired.", traceId }), {
      status: 403,
      headers,
    });
  }

  await ensureSchema();

  const artefactId = parsedParams.data.id;
  const rows = await sql<ArtefactRow[]>`
    SELECT id, type, filename, storage_key
    FROM artefacts
    WHERE id = ${artefactId}
    LIMIT 1
  `;
  const artefact = rows[0];
  if (!artefact) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const keyOk = validateArtefactStorageKey(artefact.storage_key);
  if (!keyOk.ok) {
    return Response.json(
      safeErrorEnvelope({ code: "CONFLICT", message: "Artefact has an invalid storage_key.", traceId }),
      { status: 409, headers },
    );
  }

  const sigOk = verifySignature({ purpose: "get", storageKey: artefact.storage_key, expiresAtMs, sig: sigRaw });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid download signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  if (!objectExists(artefact.storage_key)) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  let stat;
  try {
    stat = await statObject(artefact.storage_key);
  } catch {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }
  if (!stat.isFile()) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const outHeaders = new Headers(headers);
  outHeaders.set("Content-Type", contentTypeForArtefact(artefact.type));
  outHeaders.set("Content-Disposition", `attachment; filename="${safeDownloadFilename(artefact)}"`);
  outHeaders.set("Content-Length", String(stat.size));

  const nodeStream = createObjectReadStream(artefact.storage_key);
  return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 200, headers: outHeaders });
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/10_system_architecture.md
```md
# System architecture

This doc is the canonical high-level map of the Orbital Copilot PoC runtime. It should stay stable while code is added.

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
- Step: a single side-effect boundary executed durably by Workflow DevKit (WDK).
- Index version: identifies the retrieval substrate built for a folder (chunks + indices).
- Agent bundle version: pins prompts + schemas + logic used by a run (git SHA is fine for PoC).
- Question set version: pins the question set used by a run (see `docs/03-architecture/20_state_model.md` and `docs/03-architecture/30_data_model.md`).
- Citation locking: resolving candidate chunk IDs into immutable citation records with snippet/hash/geometry (ADR-0001).

## High-level component map

Conventions:
- The meaning of `(use workflow)` / `(use step)` is defined in `docs/03-architecture/06_frameworks_agents_rag_evals.md`.

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
- WDK owns durability, retries, resumability, and step-level progress events (ADR-0005).
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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/folders/[id]/runs/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { refreshFolderState } from "../../../../../lib/folderState.server";
import { newId } from "../../../../../lib/ids";
import { enqueueQuickStartRun } from "../../../../../lib/quickStartRunQueue.server";
import { loadQuestionSetV1 } from "../../../../../lib/questionSet.server";
import { createTraceContext } from "../../../../../lib/trace.server";

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

  // Fire-and-forget in-process runner (PoC). Row writes are durable + idempotent.
  enqueueQuickStartRun(runId);

  return Response.json(runResponse(created), { status: 200, headers });
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/missing-docs/detectMissingDocs.fixtures.test.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { detectMissingDocs } from "./detectMissingDocs";

type Manifest = {
  pack_id: string;
  documents: Array<{
    filename: string;
    role?: string;
    layout_file?: string;
  }>;
};

type LayoutFile = {
  pages: Array<{
    page: number;
    lines: Array<{ text: string; anchor?: string }>;
  }>;
};

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
}

function loadJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

function pickTitleCommitment(manifest: Manifest) {
  const doc =
    manifest.documents.find((d) => d.role === "title_commitment") ??
    manifest.documents.find((d) => /TitleCommitment\.pdf$/i.test(d.filename));
  if (!doc) throw new Error(`Could not find TitleCommitment.pdf in manifest for ${manifest.pack_id}`);
  if (!doc.layout_file) throw new Error(`TitleCommitment is missing layout_file in manifest for ${manifest.pack_id}`);
  return doc;
}

function scheduleBiiPageNumber(layout: LayoutFile): number {
  for (const p of layout.pages) {
    for (const l of p.lines) {
      if (l.anchor === "SCHEDULE_BII_HEADER") return p.page;
    }
  }
  // RH5 harness default
  return 3;
}

function scheduleBiiPageText(packRoot: string, layoutFileRel: string): { page: number; text: string } {
  const layout = loadJson<LayoutFile>(path.join(packRoot, layoutFileRel));
  const pageNumber = scheduleBiiPageNumber(layout);
  const page = layout.pages.find((p) => p.page === pageNumber);
  if (!page) throw new Error(`Could not find schedule B-II page ${pageNumber} in layout: ${layoutFileRel}`);
  const text = page.lines.map((l) => l.text).filter(Boolean).join(" ");
  return { page: pageNumber, text };
}

describe("detectMissingDocs (fixture packs)", () => {
  it("flags REA.pdf in pack_02_missing_rea and has FP=0 on pack_01_clean", () => {
    const root = repoRoot();

    const run = (packId: "pack_01_clean" | "pack_02_missing_rea") => {
      const packRoot = path.join(root, "docs/08-example-data", packId);
      const manifest = loadJson<Manifest>(path.join(packRoot, "manifest.json"));
      const title = pickTitleCommitment(manifest);
      const providedFilenames = manifest.documents.map((d) => d.filename).filter((f) => /\.pdf$/i.test(f));

      const { page, text } = scheduleBiiPageText(packRoot, title.layout_file!);

      return detectMissingDocs({
        packId,
        providedFilenames,
        referenceText: text,
        referenceSource: { source: title.filename, page },
      });
    };

    const pack01 = run("pack_01_clean");
    expect(pack01.missing_docs).toHaveLength(0);

    const pack02 = run("pack_02_missing_rea");
    const rea = pack02.missing_docs.find((d) => d.label.toLowerCase() === "rea.pdf");
    expect(rea).toBeTruthy();
    expect(rea?.confidence).toBeGreaterThanOrEqual(0.8);
    expect(rea?.signals.length).toBeGreaterThan(0);
    expect(rea?.signals.some((s) => s.source === "TitleCommitment.pdf")).toBe(true);
  });

  it("does not flag a direct file_ref when the PDF is already provided", () => {
    const res = detectMissingDocs({
      packId: "pack_01_clean",
      providedFilenames: ["REA.pdf"],
      referenceText: "See REA.pdf for details.",
      referenceSource: { source: "TitleCommitment.pdf", page: 3 },
    });

    expect(res.missing_docs).toHaveLength(0);
  });
});

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/documents/[id]/pdf/route.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";
import { parseFixtureDocumentId } from "@orbital-poc/core/fixtures/fixtureIds";

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

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/AGENTS.md
```md
# Architecture

## Purpose
- Boundary rules + security posture. Keep stable.

## Web app patterns (search; don’t assume exact paths)
- Public vs protected routes (often enforced via middleware)
- API split: auth-only routes, versioned routes, webhook routes
- Frontend-only vs backend-only separation (names vary)

## Boundaries (non-negotiable)
- Client-only must not import server-only (and vice versa).
- Validate at boundaries with Zod.
- Never leak internal errors/details to clients.
- Safe error envelope only. Never return provider payloads or stack traces.
- Never log secrets, admin tokens, signed URLs, or raw PDFs.
- Avoid logging full extracted text.
- Render/download URLs must be authenticated; in shared environments use short-TTL signed URLs.

## Middleware / API security shape (typical)
- Pipeline is usually: rateLimit → cors → sanitise → auth → logging (confirm actual order in code).
- Webhooks: verify signatures before parsing/acting.
- Public endpoints: rate limit + strict validation.

## Docs + decisions
- Artefacts live under `docs/03-architecture/`.
- ADRs: Append to `docs/03-architecture/DECISIONS.md` when you introduce a new cross-cutting pattern (dependency class, boundary rule, auth/security posture). Keep it short and link the PR.

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/devOnly.ts
```ts
import { notFound } from "next/navigation";

export function assertDevOnly(): void {
  if (process.env.NODE_ENV !== "development") notFound();
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/30_data_model.md
```md
# Data model (Postgres + pgvector)

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

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/schemas/list_payload_v0.test.ts
```ts
import { describe, expect, test } from "vitest";

import { LIST_PAYLOAD_V0_SCHEMA_VERSION, ListPayloadV0Schema, emptyListPayloadV0 } from "./list_payload_v0";

describe("list_payload_v0", () => {
  test("empty payload parses for each kind", () => {
    expect(ListPayloadV0Schema.parse(emptyListPayloadV0("requirements_tracker"))).toEqual({ kind: "requirements_tracker", items: [] });
    expect(ListPayloadV0Schema.parse(emptyListPayloadV0("exceptions_table"))).toEqual({ kind: "exceptions_table", items: [] });
    expect(ListPayloadV0Schema.parse(emptyListPayloadV0("survey_issues"))).toEqual({ kind: "survey_issues", items: [] });
    expect(ListPayloadV0Schema.parse(emptyListPayloadV0("survey_certification_parties"))).toEqual({
      kind: "survey_certification_parties",
      items: [],
    });
    expect(LIST_PAYLOAD_V0_SCHEMA_VERSION).toBe("list_payload_v0");
  });

  test("items require stable item_id and citation_ids[]", () => {
    const bad = {
      kind: "requirements_tracker",
      items: [
        {
          kind: "requirements_tracker_item",
          bi_item: 1,
          requirement: "Do the thing",
          owner: "Buyer",
          item_status: "open",
          // item_id missing
          citation_ids: [],
        },
      ],
    };
    expect(ListPayloadV0Schema.safeParse(bad).success).toBe(false);
  });

  test("unknown keys are rejected (strict contract)", () => {
    const bad = {
      kind: "exceptions_table",
      items: [
        {
          kind: "exceptions_table_item",
          item_id: "bii:1",
          citation_ids: ["cit_123"],
          bii_item: 1,
          type: "REA",
          item_status: "needs_review",
          match_status: "matched",
          // must not smuggle report-row statuses into the item contract
          status: "needs_review",
        },
      ],
    };
    expect(ListPayloadV0Schema.safeParse(bad).success).toBe(false);
  });

  test("exceptions items require item_status", () => {
    const bad = {
      kind: "exceptions_table",
      items: [
        {
          kind: "exceptions_table_item",
          item_id: "bii:1",
          citation_ids: ["cit_123"],
          bii_item: 1,
          type: "REA",
          match_status: "matched",
        },
      ],
    };
    expect(ListPayloadV0Schema.safeParse(bad).success).toBe(false);
  });
});

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/40_rag_and_agents.md
```md
# RAG + agents (Quick Start)

This doc describes the end-to-end "evidence-first" pipeline for Quick Start. It is intentionally implementation-oriented.

Canonical related docs:
- `docs/03-architecture/06_frameworks_agents_rag_evals.md` (WDK conventions and why)
- `docs/03-architecture/20_state_model.md` (statuses + invariants)
- `docs/03-architecture/30_data_model.md` (tables + hashing + immutability rules)
- `docs/03-architecture/60_observability_and_evals.md` (failure taxonomy + eval posture)

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
PoC default: OCR everything for consistent geometry
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

File: /Users/marc/Code/personal-projects/orbital-poc/scripts/db/init.sql
```sql
-- Local dev bootstrap.
-- This runs once on first container init (fresh volume).

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/safePdfFilename.server.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/ids.ts
```ts
import { randomUUID } from "node:crypto";

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/citations/snippet.single-source.test.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const SKIP_DIRS = new Set([
  ".git",
  ".next",
  ".ralph",
  "dist",
  "docs",
  "node_modules",
  "tmp",
]);

function* walkTsFiles(dirPath: string): IterableIterator<string> {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dirPath, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      yield* walkTsFiles(full);
      continue;
    }
    if (!e.isFile()) continue;
    if (full.endsWith(".ts") || full.endsWith(".tsx")) yield full;
  }
}

function findDefinitionFiles(repoRoot: string, fnName: string): string[] {
  const fnRe = new RegExp(String.raw`^\s*(?:export\s+)?function\s+${fnName}\s*\(`, "m");
  const varRe = new RegExp(String.raw`^\s*(?:export\s+)?(?:const|let|var)\s+${fnName}\s*=`, "m");

  const hits: string[] = [];
  for (const filePath of walkTsFiles(repoRoot)) {
    const contents = fs.readFileSync(filePath, "utf8");
    if (fnRe.test(contents) || varRe.test(contents)) hits.push(filePath);
  }
  return hits.sort();
}

describe("snippet hashing single source of truth", () => {
  it("keeps normaliseSnippet() + hashSnippet() implemented once (core)", () => {
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
    const coreSrcRoot = path.join(repoRoot, "packages/core/src") + path.sep;

    const normaliseDefs = findDefinitionFiles(repoRoot, "normaliseSnippet");
    const hashDefs = findDefinitionFiles(repoRoot, "hashSnippet");

    expect(normaliseDefs).toHaveLength(1);
    expect(hashDefs).toHaveLength(1);

    expect(normaliseDefs[0]?.startsWith(coreSrcRoot)).toBe(true);
    expect(hashDefs[0]?.startsWith(coreSrcRoot)).toBe(true);
  });
});


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/fixtureSeed.server.ts
```ts
import "server-only";

import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

import { fixtureDocumentId } from "@orbital-poc/core/fixtures/fixtureIds";

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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/trace.server.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/missing-docs/detectMissingDocs.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/INVESTIGATION.md
```md
# Investigation: docs/03-architecture Audit (2026-02-07)

## Summary
Audit of `docs/03-architecture/**` for internal consistency vs accepted ADRs and current repo behaviour.

## Findings
- Resolved: ADR status drift in canonical docs (previously "proposed" labels for accepted ADRs).
- Resolved: Verification v1 semantics aligned to ADR-0017 (integrity-only) across canonical docs (no runtime entailment).
- Resolved: `/export/csv` naming collision reduced by moving the dev-only fixture exporter under `/spikes/export/csv` and documenting spike endpoint rules.

## Notes
- Oracle bundles under `docs/98-tmp/**` and `docs/**/tmp-oracle/**` are treated as historical snapshots and are not kept in sync with canonical docs.


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/folders/[id]/report/route.ts
```ts
import { z } from "zod";

import { LIST_PAYLOAD_V0_SCHEMA_VERSION, ListPayloadV0Schema, safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const RunIdSchema = z.string().trim().min(1).max(200);

type RunRow = {
  id: string;
  state: string;
  index_version: string;
  agent_bundle_version: string;
  question_set_version: string;
};

type ReportRow = {
  id: string;
  question_id: string;
  question: string;
  answer: string;
  status: string;
  notes: string | null;
  provenance_json: unknown;
  payload_schema_version: string | null;
  payload_json: unknown;
  created_at: Date;
  updated_at: Date;
};

function zodIssueSummary(err: unknown): Array<{ code: string; message: string; path: Array<string | number> }> {
  if (!err || typeof err !== "object" || !("issues" in err)) return [];
  const anyErr = err as { issues?: Array<{ code: string; message: string; path: Array<string | number> }> };
  return Array.isArray(anyErr.issues) ? anyErr.issues.map((i) => ({ code: i.code, message: i.message, path: i.path })) : [];
}

function parseRunId(req: Request): string | null {
  const url = new URL(req.url);
  const raw = url.searchParams.get("run_id");
  if (raw === null) return null;
  const parsed = RunIdSchema.safeParse(raw);
  if (!parsed.success) return "__invalid__";
  return parsed.data;
}

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
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
  const folder = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!folder[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const runId = parseRunId(req);
  if (runId === "__invalid__") {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid run_id query param.", traceId }),
      { status: 400, headers },
    );
  }

  let run: RunRow | null = null;
  if (runId) {
    const runs = await sql<RunRow[]>`
      SELECT id, state, index_version, agent_bundle_version, question_set_version
      FROM runs
      WHERE id = ${runId}
        AND folder_id = ${folderId}
      LIMIT 1
    `;
    run = runs[0] ?? null;
  } else {
    const runs = await sql<RunRow[]>`
      SELECT id, state, index_version, agent_bundle_version, question_set_version
      FROM runs
      WHERE folder_id = ${folderId}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    run = runs[0] ?? null;
  }

  if (!run) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Run not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const rows = await sql<ReportRow[]>`
    SELECT id, question_id, question, answer, status, notes, provenance_json, payload_schema_version, payload_json, created_at, updated_at
    FROM report_rows
    WHERE run_id = ${run.id}
    ORDER BY created_at ASC, question_id ASC
  `;

  for (const r of rows) {
    const hasSchema = r.payload_schema_version !== null && String(r.payload_schema_version).trim() !== "";
    const hasPayload = r.payload_json !== null && r.payload_json !== undefined;
    if (hasSchema !== hasPayload) {
      return Response.json(
        safeErrorEnvelope({
          code: "INTERNAL",
          message: "Report row payload is in an inconsistent state.",
          details: { row_id: r.id, question_id: r.question_id },
          traceId,
        }),
        { status: 500, headers },
      );
    }

    if (!hasSchema) continue;

    if (r.payload_schema_version === LIST_PAYLOAD_V0_SCHEMA_VERSION) {
      const parsed = ListPayloadV0Schema.safeParse(r.payload_json);
      if (!parsed.success) {
        return Response.json(
          safeErrorEnvelope({
            code: "INTERNAL",
            message: "Report row payload failed schema validation.",
            details: { row_id: r.id, question_id: r.question_id, issues: zodIssueSummary(parsed.error) },
            traceId,
          }),
          { status: 500, headers },
        );
      }
    } else {
      return Response.json(
        safeErrorEnvelope({
          code: "INTERNAL",
          message: "Report row payload uses an unsupported schema version.",
          details: { row_id: r.id, question_id: r.question_id, payload_schema_version: r.payload_schema_version },
          traceId,
        }),
        { status: 500, headers },
      );
    }
  }

  const rowIds = rows.map((r) => r.id);
  const citations = rowIds.length
    ? await sql<Array<{ id: string; report_row_id: string }>>`
        SELECT id, report_row_id
        FROM citations
        WHERE report_row_id = ANY(${rowIds})
      `
    : [];

  const citationIdsByRow = new Map<string, string[]>();
  for (const c of citations) {
    const existing = citationIdsByRow.get(c.report_row_id);
    if (existing) existing.push(c.id);
    else citationIdsByRow.set(c.report_row_id, [c.id]);
  }

  return Response.json(
    {
      run: {
        id: run.id,
        state: run.state,
        index_version: run.index_version,
        agent_bundle_version: run.agent_bundle_version,
        question_set_version: run.question_set_version,
      },
      rows: rows.map((r) => {
        const cids = citationIdsByRow.get(r.id) ?? [];
        return {
          id: r.id,
          question_id: r.question_id,
          question: r.question,
          answer: r.answer,
          status: r.status,
          citation_ids: r.status === "missing_input" ? [] : cids,
          payload_schema_version: r.payload_schema_version ?? null,
          payload_json: r.payload_json ?? null,
          notes: r.notes ?? null,
          provenance_json: r.provenance_json ?? {},
          created_at: r.created_at.toISOString(),
          updated_at: r.updated_at.toISOString(),
        };
      }),
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/geometry/mapToViewport.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/quickStartRunQueue.server.ts
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

const queue: string[] = [];
const running = new Set<string>();
let draining = false;

export function enqueueQuickStartRun(runId: string): void {
  if (running.has(runId)) return;
  if (queue.includes(runId)) return;
  queue.push(runId);
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
        await executeOne(next);
      } finally {
        running.delete(next);
      }
    }
  } finally {
    draining = false;
  }
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
    throw new Error(`Unsupported payload_schema_version for list_payload: ${String(question.payload_schema_version ?? "null")}`);
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

async function executeOne(runId: string): Promise<void> {
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

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/01_onboarding_checklist.md
```md
# Onboarding checklist

Last updated: 2026-02-08

Use this when setting up a new machine, or when onboarding someone new to this repo.

## 1) Accounts and access
- [ ] GitHub access to the repo (SSH recommended).
- [ ] Confirm deployment posture (ADR-0009, accepted): Hetzner-first (single VM) until proven otherwise; Vercel optional for previews/later.
- [ ] Hetzner account + SSH access (if deploying to Hetzner; ADR-0009, accepted).
- [ ] Vercel account (optional; preview deploys and/or later; ADR-0009, accepted).
- [ ] Local Postgres available (Docker Compose mode or Sprite mode; ADR-0011, accepted; ADR-0022, accepted).
- [ ] Deployment Postgres plan confirmed (self-host on VM unless explicitly choosing managed; ADR-0011, accepted).
- [ ] Local object storage ready: MinIO (or local filesystem for ultra-simple early dev) (ADR-0010, accepted).
- [ ] Deployment object storage ready: managed S3-compatible storage unless explicitly "single VM only" (ADR-0010, accepted).
- [ ] OCR/layout provider credentials ready (OCR/layout is required for PDFs; ADR-0003 accepted; provider default Azure Document Intelligence Layout per ADR-0012, accepted).
- [ ] AI SDK gateway access/keys ready (ADR-0013, accepted). Default is Vercel AI Gateway; direct provider keys only with explicit reason.

## 2) Local tooling
- [ ] Node.js installed (LTS recommended). If `.nvmrc` / `.node-version` appears in the repo later, follow it.
- [ ] pnpm available (prefer Corepack: `corepack enable`).
- [ ] Docker installed (for Docker Compose mode; Sprite mode may also use it depending on implementation).
- [ ] `psql` installed (for DB debugging).
- [ ] Vercel CLI installed (optional; only if you’re using Vercel).
- [ ] Optional: `aws` CLI or `az` CLI (if testing OCR/storage against cloud locally).

## 3) Repo setup (one-time)
- [ ] Install git hooks: `bash scripts/install_git_hooks.sh`
- [ ] Optional (agent tooling): copy repo skills into your agent home: `bash scripts/install_codex_skills_copy.sh`
- [ ] Read `docs/03-architecture/DECISIONS.md` (ADRs). Start with accepted ADRs:
- [ ] ADR-0001 (evidence-first outputs with citation IDs + locking)
- [ ] ADR-0002 (verification is fail-closed)
- [ ] ADR-0003 (OCR/layout extraction default for PDFs)
- [ ] ADR-0004 (hybrid retrieval returns chunk IDs)
- [ ] ADR-0005 (workflow steps: retrieve → draft → lock → verify → write)
- [ ] ADR-0006 (fixture-driven evals)
- [ ] ADR-0007 (no external web research inside PoC runs)
- [ ] ADR-0008 (explicit API error envelope)
- [ ] Read the canonical PoC docs:
- [ ] `docs/03-architecture/00_overview.md`
- [ ] `docs/03-architecture/05_tech_stack_and_dev_workflow.md`
- [ ] `docs/03-architecture/10_system_architecture.md`
- [ ] `docs/03-architecture/20_state_model.md`
- [ ] `docs/03-architecture/30_data_model.md`
- [ ] `docs/03-architecture/40_rag_and_agents.md`
- [ ] `docs/03-architecture/50_api_surface.md`
- [ ] `docs/03-architecture/60_observability_and_evals.md`

## 4) Local services (when code is present)
- [ ] Postgres running locally.
- [ ] `pgvector` available (required for embeddings).
- [ ] Object storage available for PDFs + exports (local filesystem for dev, or MinIO for S3-parity).
- [ ] OCR provider wired (default Azure Document Intelligence Layout; AWS Textract if AWS-first).
- [ ] LLM + embeddings wired via AI SDK (gateway default; direct provider only when intentional).
- [ ] Workflow runner available (Workflow DevKit / worker process; ADR-0005).

## 5) Environment variables (when code is present)
- [ ] Create local env files (never commit secrets): `apps/web/.env.local` (and others as needed).
- [ ] Database connection configured.
- [ ] Object storage credentials + bucket configured.
- [ ] OCR credentials configured.
- [ ] AI Gateway + model selection configured:
  - `AI_GATEWAY_API_KEY` (required locally/Hetzner; Vercel OIDC can work without it)
  - `LLM_MODEL_CHAT`, `LLM_MODEL_SUMMARY`, `EMBED_MODEL`
- [ ] Confirm no secrets use the `NEXT_PUBLIC_` prefix.

## 6) Run locally (when code is present)
- [ ] Fast local smoke test (ADR-0020, ADR-0014):
- [ ] `pnpm install`
- [ ] Start local services (pick one):
  - [ ] Docker Compose mode: `docker compose up -d`
  - [ ] Sprite mode: start the Sprite sandbox for this repo (see ADR-0022)
- [ ] `pnpm fixture:seed pack_01_clean`
- [ ] `pnpm dev`
- [ ] Open `http://localhost:3000/matters`
- [ ] Open the seeded matter, click a citation chip, and confirm the highlight overlay renders at 100% zoom (ADR-0020).
- [ ] Smoke test the happy path:
- [ ] Upload a synthetic pack from `docs/08-example-data/`.
- [ ] Run “Quick Start: Title + Survey”.
- [ ] Click a citation chip and confirm the PDF highlight overlay works.
- [ ] Smoke test the failure path (ADR-0002, ADR-0007):
- [ ] Ask at least one question that is not answerable from the uploaded pack.
- [ ] Confirm the run resolves to `missing_input` / a blocked row (eg `citation_failed`), not an uncited answer.

## 6a) ADR-0014 tracer bullet (minimal runnable scaffold)
Once the ADR-0014 scaffold code is present, this is the fastest end-to-end slice to validate the “trust moment” (citation chip → viewer → highlight overlay) without wiring OCR, embeddings, or LLM credentials.

Prereqs:
- [ ] Postgres is running locally and `pgvector` is available (via Docker Compose mode or Sprite mode).
- [ ] Database env var is set (expected shape: `DATABASE_URL=postgresql://...`).
- [ ] PDF access is configured for the viewer (expected default for the tracer bullet: serve PDFs directly from fixture files on disk; no MinIO required).
- [ ] Fixture packs exist under `docs/08-example-data/` (at minimum: `pack_01_clean`, `pack_02_missing_rea`).

Run it:
- [ ] Start local services (pick one):
  - [ ] Docker Compose mode: `docker compose up -d`
  - [ ] Sprite mode: start the Sprite sandbox for this repo (see ADR-0022)
- [ ] Install deps: `pnpm install`
- [ ] Seed fixtures:
  - [ ] `pnpm fixture:seed pack_01_clean`
  - [ ] `pnpm fixture:seed pack_02_missing_rea`
- [ ] Start dev server: `pnpm dev`
- [ ] Open the UI: `http://localhost:3000/matters`

What it must prove:
- [ ] Clicking a citation chip opens the correct document + page and renders a highlight overlay from locked polygons.
- [ ] Snippet + `snippet_hash` are visible in the viewer (hashing per `docs/03-architecture/30_data_model.md`).
- [ ] Fail-closed viewer: deliberately bad/invalid citations show an explicit error state and render no overlay.
- [ ] Export is blocked when any row is `citation_failed` (API surface `EXPORT_BLOCKED`).

## 7) Deploy (Hetzner-first is accepted; Vercel optional)
- [ ] Confirm deployment target (ADR-0009, accepted).
- [ ] Hetzner: SSH access to the VM.
- [ ] Hetzner: Postgres backups + basic monitoring are in place (ADR-0011, accepted).
- [ ] Hetzner: S3-compatible storage is available (managed preferred; ADR-0010, accepted).
- [ ] Hetzner: runtime shape (web server + workflow worker) is running under process supervision (ADR-0005).
- [ ] Vercel (optional): Create a new Vercel project from this Git repo.
- [ ] Vercel (optional): Set Vercel “Root Directory” to `apps/web` (monorepo setup).
- [ ] Vercel (optional): Configure environment variables for Preview and Production (match local env).
- [ ] Vercel (optional): Connect Postgres (Vercel Postgres or external).
- [ ] Vercel (optional): Connect storage (S3-compatible baseline; ADR-0010, accepted).
- [ ] Vercel (optional): Deploy a Preview build and verify core flows work end-to-end.

## 8) Verification (when code is present)
- [ ] Run `bash scripts/verify.sh` (expects `pnpm lint`, `pnpm test`, `pnpm build` to be wired).
- [ ] Run fixture evals (when wired; ADR-0006). Expected command shape: `pnpm fixture:eval`
- [ ] If you add configs (eslint/vitest/next/tsconfig/etc), wire the corresponding runner:
- [ ] `scripts/lint.sh`
- [ ] `scripts/test.sh`
- [ ] `scripts/build.sh`
- [ ] `scripts/typecheck.sh`

## 9) Contributing hygiene
- [ ] Append non-trivial learnings to `docs/LEARNINGS.md`.
- [ ] ADRs are append-only in `docs/03-architecture/DECISIONS.md` (link the PR).
- [ ] Oracle bundles + handoff notes are committed under dossier `tmp/` (preferred) or `docs/98-tmp/` (when not tied to a dossier).
- [ ] Local-only scratch goes in root `throwaway/`.

```

File: /Users/marc/Code/personal-projects/orbital-poc/docker-compose.yml
```yml
services:
  db:
    # pgvector baked in so we can `CREATE EXTENSION vector;` without custom builds.
    image: pgvector/pgvector:pg16
    container_name: orbital-poc-db
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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/package.json
```json
{
  "name": "@orbital-poc/web",
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
    "@orbital-poc/core": "workspace:*",
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

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/fixtures/fixtureIds.test.ts
```ts
import { describe, expect, it } from "vitest";

import { fixtureDocumentId, parseFixtureDocumentId } from "./fixtureIds";

describe("fixtureIds", () => {
  it("roundtrips fixtureDocumentId -> parseFixtureDocumentId", () => {
    const id = fixtureDocumentId({ packId: "pack_07_scans_rotated_low_quality", filename: "TitleCommitment.pdf" });
    const parsed = parseFixtureDocumentId(id);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.packId).toBe("pack_07_scans_rotated_low_quality");
    expect(parsed.stem).toBe("TitleCommitment");
    expect(parsed.filename).toBe("TitleCommitment.pdf");
  });

  it("returns ok:false for non-fixture document ids", () => {
    expect(parseFixtureDocumentId("doc_123").ok).toBe(false);
    expect(parseFixtureDocumentId("").ok).toBe(false);
  });
});


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/spikes/export/csv/route.ts
```ts
import { timingSafeEqual } from "node:crypto";

import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";
import { verifyRow } from "@orbital-poc/core/server";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { loadSeedSnapshot } from "../../../../../lib/fixtureSeed.server";
import { newId } from "../../../../../lib/ids";
import {
  createSignedGetHeaders,
  putObject,
  validateArtefactCsvStorageKey,
  validateArtefactMetadataStorageKey,
} from "../../../../../lib/objectStore.server";
import { assertSpikesEnabled } from "../../../../../lib/spikes.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ExportKindSchema = z.enum(["requirements_tracker", "exceptions_table", "survey_issues"]);

const BodySchema = z.object({
  // PoC v1: the dev UI is fixture-backed, so `folder_id` maps to pack_id.
  // Keep it allowlisted to prevent arbitrary filesystem reads via fixtureSeed.
  folder_id: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i, "Invalid folder_id"),
  run_id: z.string().min(1).max(200),
  kind: ExportKindSchema,
  unsafe_override: z.boolean().optional().default(false),
});

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function unsafeOverrideAllowed(req: Request): boolean {
  if (process.env.DEMO_MODE !== "1") return false;
  if (process.env.ALLOW_UNSAFE_EXPORTS !== "1") return false;

  const expected = process.env.ORBITAL_ADMIN_TOKEN?.trim();
  if (!expected) return false;

  const provided = req.headers.get("x-orbital-admin-token")?.trim();
  if (!provided) return false;

  return safeEqual(provided, expected);
}

function csvEscape(val: unknown): string {
  const s = val === null || val === undefined ? "" : String(val);
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function snapshotToCsv(snapshot: ReturnType<typeof loadSeedSnapshot>): string {
  const header = ["question_id", "question", "answer", "status", "citation_ids"].join(",");
  const lines = (snapshot?.rows ?? []).map((r) =>
    [
      csvEscape(r.question_id),
      csvEscape(r.question),
      csvEscape(r.answer),
      csvEscape(r.status),
      csvEscape((r.citation_ids ?? []).join(" ")),
    ].join(","),
  );
  return [header, ...lines].join("\n") + "\n";
}

type RowFailure = { question_id: string; reason_code: string };

function extractReasonCode(provenance: unknown): string | null {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) return null;
  const direct = (provenance as { reason_code?: unknown }).reason_code;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  return null;
}

async function collectRowFailures(snapshot: NonNullable<ReturnType<typeof loadSeedSnapshot>>): Promise<RowFailure[]> {
  const failures = new Map<string, string>();

  for (const row of snapshot.rows) {
    // Fail-closed: any explicit citation_failed row blocks export.
    if (row.status === "citation_failed") {
      const reason = extractReasonCode((row as { provenance_json?: unknown }).provenance_json) ?? "VALIDATION_ERROR";
      failures.set(row.question_id, reason);
      continue;
    }

    // Deterministic-only integrity checks: no entailment in 0001.
    const citations = (row.citation_ids ?? [])
      .map((cid) => {
        const cit = snapshot.citations?.[cid];
        if (!cit) return null;
        return {
          document_id: cit.document_id,
          page_number: cit.page_number,
          snippet: cit.snippet,
          snippet_hash: cit.snippet_hash,
          polygons: cit.polygons,
        };
      })
      .filter((c): c is NonNullable<typeof c> => Boolean(c));

    // Missing citations referenced by id is an invariant failure; treat it as fail-closed.
    if (citations.length !== (row.citation_ids ?? []).length) {
      failures.set(row.question_id, "VALIDATION_ERROR");
      continue;
    }

    const res = await verifyRow(
      {
        case_id: snapshot.meta.pack_id,
        question_id: row.question_id,
        question: row.question,
        answer: row.answer,
        citations,
      },
      { mode: "deterministic-only" },
    );

    if (res.verdict === "fail") failures.set(row.question_id, res.reason_code);
  }

  return Array.from(failures.entries()).map(([question_id, reason_code]) => ({ question_id, reason_code }));
}

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const spikesGate = assertSpikesEnabled(traceId, headers);
  if (spikesGate) return spikesGate;

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

  const packId = parsed.data.folder_id;
  const runId = parsed.data.run_id;
  const kind = parsed.data.kind;
  const unsafeOverride = parsed.data.unsafe_override;

  const snapshot = loadSeedSnapshot(packId);
  if (!snapshot) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Seed snapshot not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (typeof snapshot.meta.run_id === "string" && snapshot.meta.run_id.trim() && snapshot.meta.run_id !== runId) {
    return Response.json(
      safeErrorEnvelope({
        code: "CONFLICT",
        message: "run_id did not match snapshot.",
        details: { expected: snapshot.meta.run_id },
        traceId,
      }),
      { status: 409, headers },
    );
  }

  const failures = await collectRowFailures(snapshot);
  if (failures.length > 0 && !unsafeOverride) {
    return Response.json(
      safeErrorEnvelope({
        code: "EXPORT_BLOCKED",
        message: `Export blocked: ${failures.length} row(s) failed verification.`,
        details: {
          citation_failed_count: failures.length,
          failed_question_ids: failures.map((f) => f.question_id),
          reason_codes: Array.from(new Set(failures.map((f) => f.reason_code))).sort(),
        },
        traceId,
      }),
      { status: 409, headers },
    );
  }

  if (unsafeOverride && !unsafeOverrideAllowed(req)) {
    return Response.json(
      safeErrorEnvelope({
        code: "UNAUTHORISED",
        message: "Unsafe override is demo-only.",
        traceId,
      }),
      { status: 403, headers },
    );
  }

  const artefactId = newId("art");
  const createdAt = new Date();
  const csv = snapshotToCsv(snapshot);

  const filename = unsafeOverride ? `${kind}.UNSAFE.csv` : `${kind}.csv`;

  const storageKey = `folders/${packId}/artefacts/${artefactId}.csv`;
  const keyOk = validateArtefactCsvStorageKey(storageKey);
  if (!keyOk.ok) {
    return Response.json(
      safeErrorEnvelope({ code: "INTERNAL", message: "Generated invalid storage key.", traceId }),
      { status: 500, headers },
    );
  }

  const metadataKey = `folders/${packId}/artefacts/${artefactId}.meta.json`;
  const metaOk = validateArtefactMetadataStorageKey(metadataKey);
  if (!metaOk.ok) {
    return Response.json(
      safeErrorEnvelope({ code: "INTERNAL", message: "Generated invalid metadata key.", traceId }),
      { status: 500, headers },
    );
  }

  await putObject({ storageKey, bytes: Buffer.from(csv, "utf8") });
  await putObject({
    storageKey: metadataKey,
    bytes: Buffer.from(
      JSON.stringify(
        {
          id: artefactId,
          type: "csv",
          kind,
          filename,
          storage_key: storageKey,
          source_run_id: runId,
          created_at: createdAt.toISOString(),
          unsafe_override: unsafeOverride,
          blocked: failures.length > 0,
          citation_failed_count: failures.length,
          failed_question_ids: failures.map((f) => f.question_id),
          reason_codes: Array.from(new Set(failures.map((f) => f.reason_code))).sort(),
        },
        null,
        2,
      ) + "\n",
      "utf8",
    ),
  });

  // Persist the artefact record so it can be listed after a refresh.
  // Pack IDs are treated as folder IDs in the fixture-backed dev UI.
  await sql`
    INSERT INTO folders (id, name, state, latest_index_version, created_at, updated_at)
    VALUES (${packId}, ${packId}, 'ready', 'v1', now(), now())
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO artefacts (
      id,
      folder_id,
      type,
      kind,
      filename,
      storage_key,
      source_run_id,
      metadata_json,
      created_at,
      updated_at
    )
    VALUES (
      ${artefactId},
      ${packId},
      'csv',
      ${kind},
      ${filename},
      ${storageKey},
      ${runId},
      ${sql.json({
        unsafe_override: unsafeOverride,
        blocked: failures.length > 0,
        citation_failed_count: failures.length,
        failed_question_ids: failures.map((f) => f.question_id),
        reason_codes: Array.from(new Set(failures.map((f) => f.reason_code))).sort(),
      })},
      ${createdAt},
      ${createdAt}
    )
  `;

  const signed = createSignedGetHeaders({ storageKey });
  const downloadUrl = `/export/csv/download?${new URLSearchParams({
    folder_id: packId,
    artefact_id: artefactId,
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
  }).toString()}`;

  return Response.json(
    {
      artefact: {
        id: artefactId,
        type: "csv",
        kind,
        filename,
        storage_key: storageKey,
        source_run_id: runId,
        created_at: createdAt.toISOString(),
        download_url: downloadUrl,
      },
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/folders/[id]/documents/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/artefacts.routes.test.ts
```ts
import fs from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { putObject } from "./objectStore.server";

const ensureSchemaMock = vi.fn();
const sqlMock = vi.fn();

vi.mock("./db.server", () => ({
  ensureSchema: ensureSchemaMock,
  sql: sqlMock,
}));

vi.mock("./devOnlyApi.server", () => ({
  assertDevOnlyApi: () => null,
}));

function queueSqlResults(results: unknown[]) {
  const queue = results.slice();
  sqlMock.mockImplementation(async () => queue.shift() ?? []);
}

function objectStorePath(storageKey: string): string {
  const root = path.resolve(process.cwd(), "../../tmp/object-store");
  return path.resolve(root, storageKey);
}

describe("artefacts list + download", () => {
  beforeEach(() => {
    process.env.OBJECT_STORE_SIGNING_SECRET = "test-secret";
    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
  });

  afterEach(() => {
    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
  });

  it("lists artefacts newest-first with fresh download_url and no-cache headers", async () => {
    const { GET } = await import("../app/(api)/folders/[id]/artefacts/route");

    const folderId = "fld_test";
    const newest = {
      id: "art_11111111-1111-1111-1111-111111111111",
      folder_id: folderId,
      type: "csv",
      kind: "requirements_tracker",
      filename: "requirements_tracker.csv",
      storage_key: `folders/${folderId}/artefacts/art_11111111-1111-1111-1111-111111111111.csv`,
      source_run_id: "run_123",
      created_at: new Date("2026-02-08T00:00:02.000Z"),
    };
    const older = {
      id: "art_22222222-2222-2222-2222-222222222222",
      folder_id: folderId,
      type: "csv",
      kind: "exceptions_table",
      filename: "exceptions_table.csv",
      storage_key: `folders/${folderId}/artefacts/art_22222222-2222-2222-2222-222222222222.csv`,
      source_run_id: null,
      created_at: new Date("2026-02-08T00:00:01.000Z"),
    };

    queueSqlResults([[{ id: folderId }], [newest, older]]);

    const res = await GET(new Request(`http://localhost:3000/folders/${folderId}/artefacts`), {
      params: Promise.resolve({ id: folderId }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store, no-cache");

    const json = (await res.json()) as unknown;
    expect(json).toEqual({
      artefacts: [
        expect.objectContaining({ id: newest.id }),
        expect.objectContaining({ id: older.id }),
      ],
    });

    const artefacts = (json as { artefacts: Array<{ download_url: string }> }).artefacts;
    expect(artefacts[0]?.download_url).toContain(`/artefacts/${newest.id}/download?`);
    expect(artefacts[1]?.download_url).toContain(`/artefacts/${older.id}/download?`);
  });

  it("returns new download_url values on repeat list calls", async () => {
    const { GET } = await import("../app/(api)/folders/[id]/artefacts/route");

    const folderId = "fld_test_repeat";
    const artefact = {
      id: "art_33333333-3333-3333-3333-333333333333",
      folder_id: folderId,
      type: "csv",
      kind: "requirements_tracker",
      filename: "requirements_tracker.csv",
      storage_key: `folders/${folderId}/artefacts/art_33333333-3333-3333-3333-333333333333.csv`,
      source_run_id: "run_123",
      created_at: new Date("2026-02-08T00:00:02.000Z"),
    };

    queueSqlResults([[{ id: folderId }], [artefact]]);
    const res1 = await GET(new Request(`http://localhost:3000/folders/${folderId}/artefacts`), {
      params: Promise.resolve({ id: folderId }),
    });
    const json1 = (await res1.json()) as { artefacts: Array<{ download_url: string }> };

    queueSqlResults([[{ id: folderId }], [artefact]]);
    const res2 = await GET(new Request(`http://localhost:3000/folders/${folderId}/artefacts`), {
      params: Promise.resolve({ id: folderId }),
    });
    const json2 = (await res2.json()) as { artefacts: Array<{ download_url: string }> };

    expect(json1.artefacts[0]?.download_url).not.toEqual(json2.artefacts[0]?.download_url);
  });

  it("serves artefact bytes for a valid signed download_url", async () => {
    const { GET: listGet } = await import("../app/(api)/folders/[id]/artefacts/route");
    const { GET: downloadGet } = await import("../app/(api)/artefacts/[id]/download/route");

    const folderId = "fld_test_download";
    const artefactId = "art_44444444-4444-4444-4444-444444444444";
    const storageKey = `folders/${folderId}/artefacts/${artefactId}.csv`;
    const filename = "requirements_tracker.csv";

    const artefact = {
      id: artefactId,
      folder_id: folderId,
      type: "csv",
      kind: "requirements_tracker",
      filename,
      storage_key: storageKey,
      source_run_id: null,
      created_at: new Date("2026-02-08T00:00:02.000Z"),
    };

    const bytes = Buffer.from("hello,world\n", "utf8");
    await putObject({ storageKey, bytes });

    try {
      queueSqlResults([[{ id: folderId }], [artefact], [artefact]]);

      const listRes = await listGet(new Request(`http://localhost:3000/folders/${folderId}/artefacts`), {
        params: Promise.resolve({ id: folderId }),
      });
      const listJson = (await listRes.json()) as { artefacts: Array<{ download_url: string }> };
      const downloadUrl = listJson.artefacts[0]?.download_url;
      expect(typeof downloadUrl).toBe("string");

      const downloadRes = await downloadGet(new Request(downloadUrl!), {
        params: Promise.resolve({ id: artefactId }),
      });

      expect(downloadRes.status).toBe(200);
      expect(downloadRes.headers.get("Cache-Control")).toBe("no-store, no-cache");
      expect(downloadRes.headers.get("Content-Disposition")).toBe(`attachment; filename="${filename}"`);
      expect(downloadRes.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");

      const out = Buffer.from(await downloadRes.arrayBuffer());
      expect(out).toEqual(bytes);
    } finally {
      fs.rmSync(objectStorePath(storageKey), { force: true });
    }
  });
});


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/ingest/ingestQueue.server.ts
```ts
import "server-only";

import { hashSnippet } from "@orbital-poc/core/citations/snippet";

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

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = Array.isArray(content.items) ? content.items : [];
    const text = items.map((i) => String(i?.str ?? "")).join(" ").replace(/\s+/g, " ").trim();
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
            metadata_json = jsonb_set(metadata_json, '{extraction_quality_method}', to_jsonb(${extractionQualityMethod}::text), true),
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

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/05_tech_stack_and_dev_workflow.md
```md
# Tech stack + dev workflow (PoC)

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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/AGENTS.md
```md
# Web app (apps/web)
Next.js App Router web application.

## Stack
- Next.js App Router + TypeScript
- Tailwind + shadcn/ui + Radix (icons: `lucide-react`)
- Forms: React Hook Form + Zod
- Tests: Vitest + Testing Library (MSW for mocks)

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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/export/csv/route.ts
```ts
import { safeErrorEnvelope } from "@orbital-poc/core";

import { assertDevOnlyApi } from "../../../../lib/devOnlyApi.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

// Reserved for the target export contract (see docs/03-architecture/50_api_surface.md).
// The current fixture-backed implementation lives under /spikes/export/csv.
export async function POST(): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  return Response.json(
    safeErrorEnvelope({
      code: "NOT_FOUND",
      message: "Export API not implemented. Use /spikes/export/csv in dev.",
      traceId,
    }),
    { status: 404, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/export/csv/download/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import {
  objectExists,
  readObject,
  validateArtefactCsvStorageKey,
  validateArtefactMetadataStorageKey,
  verifySignature,
} from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const QuerySchema = z.object({
  folder_id: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i, "Invalid folder_id"),
  artefact_id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^art_[0-9a-f-]+$/i, "Invalid artefact_id"),
});

function safeFilename(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const s = val.trim();
  if (!s) return null;
  if (s.length > 200) return null;
  if (!/^[A-Za-z0-9_.-]+\.csv$/.test(s)) return null;
  return s;
}

export async function GET(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsed.data.folder_id;
  const artefactId = parsed.data.artefact_id;

  const expiresRaw = url.searchParams.get("expires");
  const sigRaw = url.searchParams.get("sig");
  if (!expiresRaw || !sigRaw) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Missing download signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  const expiresAtMs = Number(expiresRaw);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid download expires.", traceId }), {
      status: 400,
      headers,
    });
  }

  if (Date.now() > expiresAtMs) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Download URL expired.", traceId }), {
      status: 403,
      headers,
    });
  }

  const storageKey = `folders/${folderId}/artefacts/${artefactId}.csv`;
  const keyOk = validateArtefactCsvStorageKey(storageKey);
  if (!keyOk.ok) {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid storage key.", traceId }), {
      status: 400,
      headers,
    });
  }

  const sigOk = verifySignature({ purpose: "get", storageKey, expiresAtMs, sig: sigRaw });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid download signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  if (!objectExists(storageKey)) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const metaKey = `folders/${folderId}/artefacts/${artefactId}.meta.json`;
  const metaOk = validateArtefactMetadataStorageKey(metaKey);

  let filename: string = `${artefactId}.csv`;
  if (metaOk.ok && objectExists(metaKey)) {
    try {
      const metaBytes = await readObject(metaKey);
      const meta = JSON.parse(Buffer.from(metaBytes).toString("utf8")) as unknown;
      if (meta && typeof meta === "object" && !Array.isArray(meta)) {
        filename = safeFilename((meta as { filename?: unknown }).filename) ?? filename;
      }
    } catch {
      // ignore metadata parse failures; downloads should still work.
    }
  }

  const bytes = await readObject(storageKey);
  const outHeaders = new Headers(headers);
  outHeaders.set("Content-Type", "text/csv; charset=utf-8");
  outHeaders.set("Content-Disposition", `attachment; filename="${filename}"`);
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: outHeaders,
  });
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/20_state_model.md
```md
# State model

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
`documents.extraction_quality` is a normalised 0..1 score derived from OCR/layout output.

PoC default (until pinned):
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

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/exception-matching/matchExceptionsToInstrumentDocs.ts
```ts
export type ExceptionMatchStatusV0 = "matched" | "ambiguous" | "missing_doc" | "missing_attachment";

export type ExceptionMatchCandidateV0 = {
  doc: string;
  instrument_no?: string | null;
};

export type InstrumentDocRef = {
  doc: string;
  instrument_no: string | null;
};

function normInstrumentNo(input: string): string {
  return input.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");
}

export function matchExceptionToInstrumentDocs(args: {
  instrument_no: string | null;
  instrument_docs: InstrumentDocRef[];
}): {
  match_status: ExceptionMatchStatusV0;
  doc: string | null;
  candidates?: ExceptionMatchCandidateV0[];
} {
  const instrumentNo = args.instrument_no ? normInstrumentNo(args.instrument_no) : "";
  if (!instrumentNo) return { match_status: "missing_doc", doc: null };

  const matches = args.instrument_docs.filter((d) => d.instrument_no && normInstrumentNo(d.instrument_no) === instrumentNo);

  if (matches.length === 1) return { match_status: "matched", doc: matches[0]!.doc };

  if (matches.length > 1) {
    // Safe default: no silent auto-pick when more than one candidate fits.
    const candidates = matches
      .map((m) => ({ doc: m.doc, instrument_no: m.instrument_no }))
      .sort((a, b) => a.doc.localeCompare(b.doc));

    return { match_status: "ambiguous", doc: null, candidates };
  }

  return { match_status: "missing_doc", doc: null };
}


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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/spikes.server.ts
```ts
import { safeErrorEnvelope } from "@orbital-poc/core";

export function assertSpikesEnabled(traceId: string, headers: Headers): Response | null {
  if (process.env.SPIKES_ENABLED === "1") return null;
  return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Not found.", traceId }), { status: 404, headers });
}


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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/objectStore.server.ts
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

  // Fail closed outside dev: signing must be explicitly configured.
  if (process.env.NODE_ENV !== "development") {
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

File: /Users/marc/Code/personal-projects/orbital-poc/AGENTS.md
```md
# AGENTS.md

## Tooling
- Package manager: pnpm (workspaces)
- Prefer TypeScript for new code unless the repo already uses something else

## Principles
We follow core ideas from *The Pragmatic Programmer* (Andy Hunt, Dave Thomas):

- **Take ownership.** If something’s broken/unclear/risky or “not your job”, act anyway: flag it, fix it, or shape a better path.
- **Keep learning.** Maintain a “knowledge portfolio”. Store learnings in `docs/LEARNINGS.md`.
- **Avoid duplication (DRY).** Duplicate knowledge is as bad as duplicate code. Keep one source of truth and reuse it.
- **Build orthogonally.** Reduce coupling, keep dependencies explicit, and interfaces small.
- **Use tight feedback loops.** Small steps, fast validation. Use tracer bullets (thin end-to-end slices). One concern per commit/PR. Prefer the simplest thing that meets the requirement.
- **Prototype to learn, then bin it (when needed).** Don’t let prototypes silently become production.
- **Make behaviour explicit.** Clear contracts, assert assumptions, fail loudly when they break.
- **Automate boring/error-prone work.** Builds, tests, formatting, releases, setup, checks. If you do it twice, consider scripting it.
- **Keep code easy to change.** Refactor continuously, rename aggressively, optimise for readability.
- **Debug systematically.** Reproduce, isolate, change one thing at a time. Use tools properly.
- **Fix broken windows.** Small messes spread — tidy early.
- **Communicate trade-offs.** Requirements/estimates are conversations. Explain options, risks, and costs plainly.

Vibe: be practical, stay curious, optimise for long-term leverage over short-term heroics.

## Error handling + safety (high level)
- Validate external inputs at boundaries (Zod) and return safe user-facing errors
- Don’t leak internal errors/details to clients
- Unexpected issues: fail loudly (log/throw). Only show user-facing errors when needed

## Compatibility
- Backwards compatibility usually not required

## Agent files
- `AGENTS.md`: Repo‑wide engineering standards, tooling, and verification rules.
- `apps/web/AGENTS.md`: Stack and guardrails for the Next.js web app.
- `docs/AGENTS.md`: Structure and rules for the docs/knowledge hub, uncluding where to save oracle bundles and handoff notes.
- `docs/02-guidelines/AGENTS.md`: Brand/tone/a11y guidance + Brand DNA outputs (including Tailwind-ready token/preset artefacts).
- `docs/03-architecture/AGENTS.md`: Architecture boundaries and security posture rules.
- `docs/04-projects/AGENTS.md`: Dossier conventions and delivery workflow for project work.
- `docs/06-release/AGENTS.md`: Release process and changelog/postmortem expectations

## Core skills to use
- `ask-questions-if-underspecified` skill when unclear
- `oracle` skill for deep research
- `verify` skill for checking code changes

When you invoke a skill, print echo: `:: the <skill name> skill must FLOW ::`

## Canonical instructions + local agent setup
- Canonical skills/commands/hooks live in `marchatton/agent-skills` — fix/add missing/wrong skills there NOT in this repo
- `.agents/` contains all skills etc in this repo (e.g. `codex`). For other tools, use `iannuttall/dotagents` to symlink `.agents` into tool-specific locations
- `AGENTS.md` is the source of truth; other agent files should be symlinks (don’t fork instructions per tool)

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/citations/snippet.test.ts
```ts
import { describe, expect, it } from "vitest";

import { hashSnippet, normaliseSnippet } from "./snippet";

describe("normaliseSnippet", () => {
  it("trims, normalises CRLF to LF, and collapses whitespace runs", () => {
    expect(normaliseSnippet("  A\r\nB   C\tD  ")).toBe("A B C D");
  });
});

describe("hashSnippet", () => {
  it("is invariant to whitespace variants (per canonical rule)", () => {
    const a = hashSnippet("A\r\nB");
    const b = hashSnippet("A\nB");
    const c = hashSnippet("A    B");
    const d = hashSnippet("A\tB");
    const e = hashSnippet("  A  B  ");

    expect(a).toBe(b);
    expect(b).toBe(c);
    expect(c).toBe(d);
    expect(d).toBe(e);
  });
});


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/next.config.js
```js
/** @type {import('next').NextConfig} */
const path = require("node:path");

const nextConfig = {
  reactStrictMode: true,
  // Ensure Next's output file tracing is rooted at the monorepo, not an inferred dir.
  // This avoids picking up unrelated lockfiles on the machine.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@orbital-poc/core"],
};

module.exports = nextConfig;

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/httpRange.server.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/00_overview.md
```md
# Orbital Copilot PoC Architecture
US CRE Title + Survey Quick Start (evidence-first, artefact-first)

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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/page.tsx
```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Orbital PoC</h1>
      <p className="mt-2 text-slate-700">
        Dev-only spike harness routes live under <code>/spikes</code>.
      </p>

      <ul className="mt-6 list-disc pl-5 text-slate-800">
        <li>
          <Link className="underline" href="/matters">
            Matters: tracer bullet (citation chips → viewer → overlay)
          </Link>
        </li>
        <li>
          <Link className="underline" href="/spikes/rh1-pdf-perf">
            RH1: pdf.js perf harness
          </Link>
        </li>
        <li>
          <Link className="underline" href="/spikes/rh2-overlay">
            RH2: highlight overlay harness
          </Link>
        </li>
      </ul>
    </main>
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(app)/matters/ArtefactsList.tsx
```tsx
import { z } from "zod";

type Props = {
  folderId: string;
};

const ArtefactSchema = z
  .object({
    id: z.string().min(1),
    kind: z.string().min(1),
    filename: z.string().min(1),
    created_at: z.string().min(1),
    download_url: z.string().min(1),
  })
  .passthrough();

const ArtefactsResponseSchema = z
  .object({
    artefacts: z.array(ArtefactSchema),
  })
  .passthrough();

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

function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").replace(".000Z", "Z");
}

function isUnsafeFilename(filename: string): boolean {
  return filename.toUpperCase().includes(".UNSAFE.");
}

function hrefFromDownloadUrl(downloadUrl: string): string {
  try {
    // List endpoints may return absolute URLs; keep the signature but drop origin so
    // links work regardless of the current host.
    const u = new URL(downloadUrl, "http://localhost:3000");
    return `${u.pathname}${u.search}`;
  } catch {
    return downloadUrl;
  }
}

export async function ArtefactsList(props: Props) {
  // Dev-only UI: fetch via localhost to avoid trusting Host headers (SSRF).
  const origin = "http://localhost:3000";
  let res: Response;
  try {
    res = await fetch(`${origin}/folders/${encodeURIComponent(props.folderId)}/artefacts`, { cache: "no-store" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <section className="rounded border border-red-200 bg-red-50 p-4">
        <div className="text-sm font-semibold text-red-900">Artefacts</div>
        <div className="mt-2 text-xs text-red-700">{message}</div>
      </section>
    );
  }

  if (res.status === 404) {
    return (
      <section className="rounded border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">Artefacts</div>
        <div className="mt-2 text-xs text-slate-600">No artefacts yet.</div>
      </section>
    );
  }

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const e = safeErrFromJson(json, {
      code: "ARTEFACTS_FETCH_FAILED",
      message: `Request failed (${res.status}).`,
    });
    return (
      <section className="rounded border border-red-200 bg-red-50 p-4">
        <div className="text-sm font-semibold text-red-900">Artefacts</div>
        <div className="mt-2 text-xs text-red-700">
          {e.code}: {e.message}
        </div>
      </section>
    );
  }

  const parsed = ArtefactsResponseSchema.safeParse(json);
  if (!parsed.success) {
    return (
      <section className="rounded border border-red-200 bg-red-50 p-4">
        <div className="text-sm font-semibold text-red-900">Artefacts</div>
        <div className="mt-2 text-xs text-red-700">Invalid artefacts payload.</div>
      </section>
    );
  }

  const artefacts = parsed.data.artefacts;
  if (!artefacts.length) {
    return (
      <section className="rounded border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">Artefacts</div>
        <div className="mt-2 text-xs text-slate-600">No artefacts yet.</div>
      </section>
    );
  }

  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">Artefacts</div>
        <div className="text-xs text-slate-600">{artefacts.length} item(s)</div>
      </div>

      <div className="mt-3 overflow-auto rounded border border-slate-200">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700">
            <tr className="border-b border-slate-200">
              <th className="px-3 py-2 font-medium">Filename</th>
              <th className="px-3 py-2 font-medium">Kind</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white text-slate-800">
            {artefacts.map((a) => {
              const unsafe = isUnsafeFilename(a.filename);
              const downloadHref = hrefFromDownloadUrl(a.download_url);
              return (
                <tr key={a.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {unsafe ? (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-inset ring-red-200">
                          UNSAFE
                        </span>
                      ) : null}
                      <span className="font-mono">{a.filename}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-800">
                      {a.kind}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono">{formatCreatedAt(a.created_at)}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <a
                      className="rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
                      href={downloadHref}
                    >
                      Download
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx
```tsx
"use client";

import { useState } from "react";

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
      <button
        className="rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={start}
        disabled={Boolean(props.disabledReason) || state.kind === "loading"}
      >
        {state.kind === "loading" ? "Starting…" : "Run Quick Start"}
      </button>

      {props.disabledReason ? <div className="text-xs text-slate-600">{props.disabledReason}</div> : null}

      {state.kind === "error" ? <div className="text-xs font-medium text-red-700">{state.message}</div> : null}

      {state.kind === "started" ? (
        <div className="grid gap-1 text-right text-xs text-slate-700">
          <div>
            run: <span className="font-mono">{state.runId}</span> ({state.runState})
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <a
              className="underline"
              href={`/runs/${encodeURIComponent(state.runId)}`}
              target="_blank"
              rel="noreferrer"
            >
              Run JSON
            </a>
            <a
              className="underline"
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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/layout.tsx
```tsx
import type { ReactNode } from "react";

import { isDemoModeEnabled } from "../lib/demoMode.server";

import "./globals.css";

import { DemoToolbar } from "./DemoToolbar";

export const metadata = {
  title: "Orbital PoC",
  description: "Orbital Copilot PoC",
};

export default function RootLayout(props: { children: ReactNode }) {
  const demoEnabled = isDemoModeEnabled();

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {demoEnabled ? <DemoToolbar /> : null}
        {props.children}
      </body>
    </html>
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(app)/matters/ExportCsvButton.tsx
```tsx
"use client";

import { useState } from "react";

type Props = {
  folderId: string;
  runId: string | null;
};

type ExportState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "blocked"; message: string }
  | { kind: "error"; message: string }
  | { kind: "downloaded"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export function ExportCsvButton(props: Props) {
  const [state, setState] = useState<ExportState>({ kind: "idle" });

  async function run() {
    if (!props.runId) {
      setState({ kind: "error", message: "Missing run_id." });
      return;
    }

    setState({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch("/spikes/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_id: props.folderId,
          run_id: props.runId,
          kind: "requirements_tracker",
          unsafe_override: false,
        }),
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
      setState({ kind: code === "EXPORT_BLOCKED" ? "blocked" : "error", message: `${code}: ${message}` });
      return;
    }

    const json: unknown = await res.json().catch(() => null);
    const artefact = isRecord(json) && isRecord(json.artefact) ? json.artefact : null;
    const downloadUrl = artefact && typeof artefact.download_url === "string" ? artefact.download_url : null;
    if (!downloadUrl) {
      setState({ kind: "error", message: "Missing artefact.download_url." });
      return;
    }

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.click();
    setState({ kind: "downloaded", message: "Export created. Download started." });
  }

  return (
    <div className="grid justify-items-end gap-2">
      <button
        className="rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={run}
        disabled={state.kind === "loading"}
      >
        {state.kind === "loading" ? "Exporting…" : "Export CSV"}
      </button>

      {state.kind === "blocked" ? (
        <div className="text-xs font-medium text-red-700">{state.message}</div>
      ) : state.kind === "error" ? (
        <div className="text-xs font-medium text-red-700">{state.message}</div>
      ) : state.kind === "downloaded" ? (
        <div className="text-xs font-medium text-emerald-700">{state.message}</div>
      ) : null}
    </div>
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(app)/matters/ExportTraceButton.tsx
```tsx
"use client";

import { useEffect, useState } from "react";

type Props = {
  folderId: string;
  runId: string | null;
};

type ExportState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "downloaded"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function parseErrorEnvelope(json: unknown): { code: string; message: string; traceId?: string } | null {
  const env = isRecord(json) && isRecord(json.error) ? json.error : null;
  if (!env) return null;
  const code = typeof env.code === "string" && env.code.trim() ? env.code.trim() : null;
  const message = typeof env.message === "string" && env.message.trim() ? env.message.trim() : null;
  const traceId = typeof env.trace_id === "string" && env.trace_id.trim() ? env.trace_id.trim() : undefined;
  if (!code || !message) return null;
  return { code, message, traceId };
}

export function ExportTraceButton(props: Props) {
  const [state, setState] = useState<ExportState>({ kind: "idle" });
  const [runIdInput, setRunIdInput] = useState<string>(props.runId ?? "");

  useEffect(() => {
    setRunIdInput(props.runId ?? "");
  }, [props.runId]);

  async function run() {
    const runId = runIdInput.trim();
    if (!runId) {
      setState({ kind: "error", message: "Missing run_id." });
      return;
    }

    setState({ kind: "loading" });

    const url = `/runs/${encodeURIComponent(runId)}/trace?${new URLSearchParams({ pack: props.folderId }).toString()}`;

    let res: Response;
    try {
      res = await fetch(url, { method: "GET" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    if (!res.ok) {
      const json: unknown = await res.json().catch(() => null);
      const env = parseErrorEnvelope(json);
      const code = env?.code ?? "UNKNOWN_ERROR";
      const message = env?.message ?? `Request failed (${res.status})`;
      const trace = env?.traceId ? ` (trace_id: ${env.traceId})` : "";
      setState({ kind: "error", message: `${code}: ${message}${trace}` });
      return;
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `trace_${runId}.json`;
    a.click();
    URL.revokeObjectURL(objectUrl);
    setState({ kind: "downloaded", message: "Trace download started." });
  }

  return (
    <div className="grid justify-items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <input
          className="h-9 w-44 rounded border border-slate-200 bg-white px-2 text-xs text-slate-900 placeholder:text-slate-400"
          type="text"
          value={runIdInput}
          placeholder="run_id"
          onChange={(e) => setRunIdInput(e.target.value)}
          aria-label="Run id"
        />
        <button
          className="rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={run}
          disabled={state.kind === "loading"}
        >
          {state.kind === "loading" ? "Downloading…" : "Export trace"}
        </button>
      </div>

      {state.kind === "error" ? (
        <div className="text-xs font-medium text-red-700">{state.message}</div>
      ) : state.kind === "downloaded" ? (
        <div className="text-xs font-medium text-emerald-700">{state.message}</div>
      ) : null}
    </div>
  );
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(app)/matters/actions.ts
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

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/DemoToolbar.tsx
```tsx
"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

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
    <section className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-end gap-3 p-3">
        <div className="text-xs font-semibold tracking-wide text-slate-700">DEMO MODE</div>

        <label className="grid gap-1 text-xs">
          <span className="text-slate-600">Pack</span>
          <select
            className="min-w-56 rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
            value={packId}
            onChange={(e) => setPackId(e.currentTarget.value as PackId)}
            disabled={state.kind === "loading"}
          >
            {PACK_OPTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <button
          className="rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={loadPack}
          disabled={state.kind === "loading"}
        >
          {state.kind === "loading" ? "Loading…" : "Load demo pack"}
        </button>

        {state.kind === "error" ? <div className="text-xs font-medium text-red-700">{state.message}</div> : null}
      </div>
    </section>
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(app)/matters/MattersToolbar.tsx
```tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

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
    <section className="rounded border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-600">Seeded pack</span>
          <select
            className="min-w-64 rounded border border-slate-300 bg-white p-2"
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
          </select>
        </label>

        {!hasSeeded ? (
          <div className="text-xs text-slate-600">
            No seeded packs found. Run <code className="font-mono">pnpm fixture:seed pack_01_clean</code>.
          </div>
        ) : null}
      </div>
    </section>
  );
}

```
</file_contents>
<user_instructions>
<taskname="Arch drift audit"/>

<task>
Produce the requested deliverables:
1) Architecture Drift Report comparing `docs/03-architecture/*` vs actual implementation.
2) Prioritized action plan (Docs updates, Code refactors, Security fixes, Simplifications).
3) Security audit report (threat-model-lite + OWASP-ish scan) with finding IDs, file+line, evidence snippet, impact, exploit sketch, minimal-diff fix.
4) YAGNI/minimalism review using the `## Simplification Analysis` format.

This repo is a PoC; docs describe a target WDK-based architecture. The current code is a smaller in-process queue based scaffold; call drift explicitly.
</task>

<architecture>
Documented target (canonical docs):
- WDK durable orchestration: workflow controller + step boundaries for OCR/embed/retrieve/draft/lock/verify/write/export.
- Postgres + object storage as data plane; citations locked+immutable with snippet hashing and geometry.
- Thin Next.js route handlers validating inputs (Zod) + safe error envelope.

Actual implementation (current code):
- Next.js App Router with Node runtime route handlers under `apps/web/app/(api)/**/route.ts`.
- Durable-ish behavior is implemented via in-memory queues (not WDK):
  - `apps/web/lib/ingest/ingestQueue.server.ts` for ingest.
  - `apps/web/lib/quickStartRunQueue.server.ts` for “Quick Start run” placeholder rows.
- Data plane is Postgres + local filesystem “object store”:
  - Schema is created at runtime in `apps/web/lib/db.server.ts` (tables: folders, documents, document_pages, chunks, runs, run_steps, report_rows, citations, artefacts).
  - Object storage is `../../tmp/object-store` with path traversal protections + HMAC signatures in `apps/web/lib/objectStore.server.ts`.
- Shared core package provides snippet hashing + verifier:
  - `packages/core/src/citations/snippet.ts` defines `normaliseSnippet()` + `hashSnippet()`.
  - `packages/core/src/verify/verifier.ts` exposes `verifyRow()` with modes `deterministic-only` or `entailment` (docs claim PoC v1 is integrity-only; call drift).
</architecture>

<selected_context>
Docs (architecture claims):
- `docs/03-architecture/10_system_architecture.md`: target component map + trust boundaries + key sequences.
- `docs/03-architecture/20_state_model.md`: state machines + invariants, export gating rules.
- `docs/03-architecture/30_data_model.md`: canonical ERD/tables + citation immutability + snippet_hash rule.
- `docs/03-architecture/40_rag_and_agents.md`: retrieval/draft/lock/verify contracts + ADR alignment.
- `docs/03-architecture/50_api_surface.md`: HTTP contract, error envelope, admin token, spikes gating.
- `docs/03-architecture/60_observability_and_evals.md`: taxonomy, trace export redaction expectations.
- `docs/03-architecture/DECISIONS.md`: ADRs that harden “evidence-first” invariants.
- `docs/04-projects/03-fixes/0001_drift/arch_prd_impl_drift.md`: prior drift notes.

Web/API implementation (trust boundary + input validation + auth-ish gates):
- `apps/web/app/(api)/folders/route.ts`, `apps/web/app/(api)/folders/[id]/route.ts`, `apps/web/app/(api)/folders/[id]/documents/route.ts`, `apps/web/app/(api)/folders/[id]/runs/route.ts`, `apps/web/app/(api)/folders/[id]/report/route.ts`, `apps/web/app/(api)/folders/[id]/artefacts/route.ts`.
- Upload/render: `apps/web/app/(api)/documents/[id]/upload/route.ts`, `apps/web/app/(api)/documents/[id]/complete/route.ts`, `apps/web/app/(api)/documents/[id]/render/route.ts`, `apps/web/app/(api)/documents/[id]/pdf/route.ts`.
- Evidence/trace: `apps/web/app/(api)/citations/[id]/route.ts`, `apps/web/app/(api)/runs/[id]/route.ts`, `apps/web/app/(api)/runs/[id]/trace/route.ts`.
- Exports: `apps/web/app/(api)/export/csv/route.ts`, `apps/web/app/(api)/export/csv/download/route.ts`, spike exporter `apps/web/app/(api)/spikes/export/csv/route.ts`.
- Demo/spikes: `apps/web/app/(api)/demo/load-pack/route.ts`, `apps/web/app/(api)/spikes/*`.

Server-side runtime modules (data plane, orchestration scaffold):
- `apps/web/lib/db.server.ts`: Postgres client + `ensureSchema()` DDL (note: citations table differs from docs; uses `polygons_json`, missing `index_version`, etc.).
- `apps/web/lib/objectStore.server.ts`: local fs object store; signed header generation + signature verification; strict storage_key regexes.
- `apps/web/lib/ingest/ingestQueue.server.ts`: pdf.js text extraction (not OCR provider), no geometry; chunks 1 per page; heuristic extraction_quality; writes document_pages + chunks.
- `apps/web/lib/quickStartRunQueue.server.ts`: in-memory run queue that currently writes `missing_input` or placeholder `citation_failed` rows (no retrieval/draft/lock pipeline yet).
- `apps/web/lib/folderState.server.ts`: derives folder states from DB facts.
- `apps/web/lib/questionSet.server.ts`: loads question set v1 from disk and hashes to a version string.
- `apps/web/lib/devOnlyApi.server.ts`, `apps/web/lib/demoMode.server.ts`, `apps/web/lib/spikes.server.ts`: gating helpers.
- `apps/web/lib/trace.server.ts`: creates `traceId` + response headers.

Core shared logic (hashing + verification + schemas):
- `packages/core/src/citations/snippet.ts`, `packages/core/src/verify/verifier.ts`, `packages/core/src/verify/verifier.schemas.ts`, `packages/core/src/safe-error.ts`, `packages/core/src/schemas/list_payload_v0.ts`.

Fixture utilities (used by docs/taxonomy alignment checks):
- `scripts/fixtures/assert_row_invariants.ts`, `scripts/fixtures/assert_citation_integrity.ts`, `scripts/fixtures/lib/*`, `scripts/fixtures/README.md`.

UI touchpoints (to understand end-to-end flows; not exhaustive):
- `apps/web/app/(app)/matters/actions.ts`, `apps/web/app/(app)/matters/QuickStartPanel.tsx`, `apps/web/app/(app)/matters/ExportCsvButton.tsx`, `apps/web/app/(app)/matters/ExportTraceButton.tsx`, `apps/web/app/(app)/matters/ArtefactsList.tsx`.
</selected_context>

<relationships>
- Schema/state backbone: `apps/web/lib/db.server.ts` tables are read/updated by route handlers + queues; folder state derived in `apps/web/lib/folderState.server.ts`.
- Upload flow:
  - init upload and metadata in folder/document routes (see `apps/web/app/(api)/folders/[id]/documents/route.ts`), then bytes PUT to `apps/web/app/(api)/documents/[id]/upload/route.ts` using HMAC signature headers from `apps/web/lib/objectStore.server.ts`.
  - completion triggers ingest queue via `apps/web/app/(api)/documents/[id]/complete/route.ts` -> `apps/web/lib/ingest/ingestQueue.server.ts`.
- Ingest writes `document_pages` + `chunks` (1 chunk per page, `hashSnippet(text)` for `text_hash`) and updates `documents.parse_status/ocr_status`.
- Quick Start run flow:
  - run creation endpoint(s) insert `runs` then enqueue `apps/web/lib/quickStartRunQueue.server.ts`.
  - queue writes `report_rows` + `run_steps` but does not implement retrieval/draft/lock/citations yet.
- Trace export:
  - `apps/web/app/(api)/runs/[id]/trace/route.ts` reads seeded snapshots (dev-only) and uses `packages/core/src/verify/verifier.ts:verifyRow()` in `deterministic-only` mode.
</relationships>

<ambiguities>
- WDK/workflow runtime described in docs does not appear in the selected code; current queues are process-memory only. Treat this as either (a) docs are aspirational/target state, or (b) a missing implementation slice.
- Docs specify OCR/layout providers and geometry-backed citations; current ingest uses pdf.js text extraction with `has_geometry: false` and cannot produce polygon highlights.
- Docs specify spikes gating with `SPIKES_ENABLED=1` and explicit admin token; current code often uses `assertDevOnlyApi()` (404 outside `NODE_ENV=development`) plus optional env flags per endpoint. Call drift and recommend a consistent policy.
</ambiguities>

<notes>
Omitted (not selected to stay under token budget): heavier fixture runner scripts like `scripts/fixtures/eval.ts`, `scripts/fixtures/compare_truth.ts`, `scripts/fixtures/seed.ts`, `scripts/fixtures/export_truth_match.ts` are present in repo but not fully included (some may appear as codemaps only).
</notes>

</user_instructions>
