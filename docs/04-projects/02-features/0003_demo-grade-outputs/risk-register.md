# Risk register (rabbit holes)

Use this during shaping to capture tail risks and choose mitigations.

| ID | Rabbit hole | Type | Why it’s risky | Mitigation | Status |
|---|---|---|---|---|---|
| RH1 | Is the CSV export format actually usable for a paralegal paste/import workflow? | product | If the first practitioner reaction is "this is unusable", exports fail as a demo story. | CLOSED (ASSUMPTION): lock CSV schemas v1 (headers + ordering) + deterministic row ordering + citations format. Falsifier: practitioner paste/import test cannot be done in <5 minutes or requests column/order changes. | closed (assumption) |
| RH2 | How do we prevent CSV column ordering drift as schemas evolve? | data | Drift makes exports hard to diff, import, and trust. | CLOSED (decision): lock headers in code; enforce deterministic row ordering; snapshot exports per fixture pack; record `schema_version` in artefact metadata. | closed |
| RH3 | Which Word artefact best supports the demo narrative (memo vs objection/cure letter)? | product | Wrong artefact can make the demo feel contrived or low value. | CLOSED (ASSUMPTION): ship single Word artefact = `memo` with fixed section list + deterministic ordering + inline citation rendering. Falsifier: stakeholder insists on letter format and provides must-have requirements. | closed (assumption) |
| RH4 | Docx formatting inconsistencies across viewers (Word, Google Docs, preview) | technical | "Looks broken" erodes trust immediately. | patch: constrain docx formatting (headings + bullets only), avoid complex tables/footnotes; add viewer sanity check (Word + Google Docs + Preview) as a release gate for memo v1 | open |
| RH5 | Export behaviour when any row is `citation_failed` (block vs partial export) | design | This is a trust posture decision. Getting it wrong undermines the product promise. | CLOSED: default block export (`EXPORT_BLOCKED`) when any row is `citation_failed`. Demo-only `unsafe_override` exists behind strict guardrails and produces clearly labelled UNSAFE artefacts. | closed |
| RH6 | Where do exports live (download-only vs stored artefacts + list)? | dependency | A wrong storage decision creates churn and demo unreliability. | patch: persist artefacts (`storage_key` + metadata); never persist signed URLs; generate fresh `download_url` on demand | open |
| RH7 | Minimal eval metrics: which 3-5 metrics predict demo readiness? | product | Too shallow = false confidence. Too deep = time sink. | CLOSED: hard gates = schema validity, citation integrity, failure journeys, export truth match. Report shape locked (per-pack JSON + MD + cross-pack summary). `pack_09_bad_citation` minimal contents locked. | closed |
| RH8 | Citation integrity checks are expensive/flaky | technical | If the eval harness is brittle, it will be ignored. | patch | open |
| RH9 | CI eval runtime is too slow for iteration | technical | Slow CI creates friction and encourages bypassing tests. | cut | open |
| RH10 | Demo reset tool can delete non-demo data | safety | Data loss is unacceptable even in a PoC. | CLOSED (perimeter): slice 1 has no destructive HTTP reset/delete endpoints. “Reset” = create a fresh demo matter from fixtures. | closed |
| RH11 | Demo mode pollutes the real UX or bypasses trust gates | design | Confuses users and creates hidden behaviour paths. | patch | open |
| RH12 | Fixture packs and `/truth` drift without ownership | dependency | Evals become meaningless if fixtures are not maintained. | patch | open |
| RH13 | Do we have structured row payloads (or are we forced to parse prose)? | dependency | Prose parsing is brittle and contaminates workflow logic; export quality will collapse under real inputs. | patch: require Initiative 002 to persist `payload_json` + `payload_schema_version`; fail closed until present (or cut “tracker-grade” CSVs) | open |

## Notes

- Prefer writing rabbit holes as questions.
- If a rabbit hole is really a product decision, treat it as a shaping question (don’t hide it as “tech risk”).
- Spikes must happen before PRDs are sliced (see `docs/00-strategy/initiatives/prd-slicing-rules.md`).
- Status reflects “decision closure”, not implementation status.
