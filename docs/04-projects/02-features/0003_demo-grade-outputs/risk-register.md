# Risk register (rabbit holes)

| ID | Rabbit hole | Type | Why it is risky | Mitigation | Status |
|---|---|---|---|---|---|
| RH1 | CSV columns do not match practitioner expectations | product | Exports rejected on first use | spike | open |
| RH2 | Column ordering drifts as schema evolves | data | CSV becomes hard to diff or import | patch (stable schema + tests) | open |
| RH3 | Memo template feels weak for demo narrative | product | Demo story fails | patch (tighten structure + framing copy) | open |
| RH4 | Docx formatting inconsistencies across viewers | technical | Output looks unprofessional | patch (simple template) | open |
| RH5 | Eval metrics too shallow or too noisy | product | False confidence or wasted time | spike | open |
| RH6 | Citation validity check is expensive or flaky | technical | Eval harness is brittle | patch (simple checks + caching) | open |
| RH7 | CI eval runtime is too slow | technical | Blocks iteration | patch (report-only, limit packs) | open |
| RH8 | Demo reset deletes non-demo data | safety | Data loss risk | patch (demo-only guardrails) | open |
| RH9 | Demo mode pollutes product UX | design | Confuses real users | patch (feature flag, dev-only UI) | open |

## Notes

- Spikes are required before GO; oracle review recommended per spike.
