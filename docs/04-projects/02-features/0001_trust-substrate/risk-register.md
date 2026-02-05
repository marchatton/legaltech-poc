# Risk register (rabbit holes)

| ID | Rabbit hole | Type | Why it’s risky | Mitigation | Status |
|---|---|---|---|---|---|
| RH1 | Can pdf.js render and page-jump large noisy scans without UI freezing? | technical | Baseline viewer may be unusable | spike | open |
| RH2 | Can we map anchor bbox/polygon to viewport across zoom levels reliably? | technical | Highlights misalign; trust breaks | spike | open |
| RH3 | What is the canonical snippet representation for stable hashes? | data | Hash mismatch breaks verification | spike | open |
| RH4 | Can verification avoid false passes at acceptable latency/cost? | technical | Trust failure + cost blowups | spike | open |
| RH5 | Can we detect “referenced but missing” docs reliably? | data | Noisy warnings or missed gaps | spike | open |
| RH6 | How do we keep provenance minimal while still useful? | design | Too much data or too little value | patch | open |
| RH7 | Storage access pattern (signed URLs vs proxy) | dependency | Affects viewer security + perf | patch | open |

## Notes

- Spikes are required before GO; oracle review is mandatory per spike.
