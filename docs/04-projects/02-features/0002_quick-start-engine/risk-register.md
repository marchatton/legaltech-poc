# Risk register (rabbit holes)

Use this during shaping to capture tail risks and choose mitigations.

| ID | Rabbit hole | Type | Why it’s risky | Mitigation | Status |
|---|---|---|---|---|---|
| RH1 | Do 20-25 questions match how practitioners read commitments? | design | Wrong questions = wrong output despite correct parsing | spike | open |
| RH2 | Can B-I/B-II parsing handle noisy scans reliably? | technical | OCR noise could collapse extraction quality | spike | open |
| RH3 | What matching rules minimize false matches for exception -> instrument? | technical | Silent mismatches undermine trust | spike | open |
| RH4 | Can survey extraction recover certification + callouts from scans? | technical | Surveys are visual and OCR is messy | spike | open |
| RH5 | Can reconciliation emit "unknown" instead of wrong "not shown"? | design | Incorrect "not shown" is worse than "unknown" | spike | open |
| RH6 | Run idempotency across restarts | technical | Duplicate rows or drifting answers | spike | open |
| RH7 | Missing exhibits inside a provided PDF | data | Gaps could cascade into wrong summaries | patch | open |
| RH8 | Schema stability vs future PRD seams | dependency | Early schema choices could block later PRDs | patch | open |
| RH9 | Parser uncertainty communication in UI | design | Users may misread confidence | patch | open |
| RH10 | Performance of incremental updates on large packs | technical | UI may lag or time out | cut | open |

## Notes

- Prefer writing rabbit holes as questions.
- If a rabbit hole is really a product decision, treat it as a shaping question (don’t hide it as “tech risk”).
