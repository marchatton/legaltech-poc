# Sales Pitch (April Dunford-style, positioning-first)

Goal: a pitch that wins because it makes the positioning obvious (who it is for, what it is, why it is different) before we talk features.

Inputs used:
- `docs/01-insights/competitors/competitor_overview_claude.md`
- `docs/01-insights/competitors/competitor_overview_chatGPT.md`

---

## 1) Positioning Inputs (the pitch must make these obvious)

### Best-fit customers (ICP)
- US CRE law firm real estate practice groups doing repeatable acquisition/financing diligence.
- Primary user: junior associate/paralegal doing first-pass extraction and issue spotting.
- Primary validator/buyer: senior associate/partner responsible for signing off on risk and insurability.

### Market category (what it is)
**CRE diligence work-product automation**: software that turns a title/survey/transaction doc pack into checkable diligence artefacts (not "chat with PDFs" and not "legal research").

### Competitive alternatives (what they do instead)
- Status quo: junior associate review + checklists + copy/paste into Word templates.
- Horizontal copilots: ChatGPT Enterprise / Claude for Work / Microsoft 365 Copilot.
- General legal AI platforms: Harvey / Legora (workflow builders).
- Contract review / diligence platforms: Kira (Litera) / Luminance (contract-centric extraction).
- Title production platforms (adjacent): Qualia (title company workflow).
- Legal research suites (adjacent): Thomson Reuters / LexisNexis.

### How competitors actually do the work (mechanics, not marketing)
Use this section to sound credible when a buyer says "we already have X" and to avoid straw-manning.

- Status quo (manual)
  - How it works: juniors read PDFs, track requirements/exceptions in Excel, draft memos/letters in Word, seniors review by hunting for cited passages in the PDFs.
  - What it is good at: judgment, nuance, and accountability. Easy to adjust per deal.
  - Where it breaks: slow first pass, inconsistent outputs, and review time balloons because evidence is not structured or linked.

- Horizontal copilots (ChatGPT Enterprise / Claude for Work / Microsoft 365 Copilot)
  - How it works: users upload PDFs (or copy/paste excerpts), prompt for summaries/extractions, then manually copy results into Word/Excel trackers. Evidence is often "best effort" unless the team enforces a citation discipline.
  - What it is good at: fast drafting, summarization, and ad hoc Q&A across many topics. Strong distribution (especially M365).
  - Where it breaks: brittle repeatability, weak auditability, and a lot of "glue work" to turn answers into diligence deliverables with evidence you can sign off on.

- General legal AI platforms (Harvey / Legora)
  - How it works: start as an enterprise assistant + document workspace, then move up-stack into workflow builders (multi-step agents, playbooks, tabular review at scale, Word/DMS integration, sometimes client-facing portals).
  - What it is good at: firm-wide standardization, encoding playbooks, big-deal-room scale, integrations, and procurement readiness.
  - Where it breaks (for CRE diligence): out-of-the-box depth for title/survey quirks is not guaranteed; getting to CRE-native outputs can become a configuration project.

- Contract review / diligence platforms (Kira / Luminance)
  - How it works: upload a doc set, run extraction models / "fields" / concepts, then export structured results (often Excel/Word) for review. Teams iterate by tuning fields and workflows over time.
  - What it is good at: clause-level extraction and high-volume contract-centric diligence with mature governance.
  - Where it breaks (for CRE diligence): contract-first posture; title commitments, exception instruments, surveys, and "review -> action" transaction deliverables are not the native center of gravity.

- Legal research suites (TR / Lexis)
  - How it works: legal research, drafting, and Q&A grounded in proprietary content; strong procurement and embeddedness.
  - What it is good at: authoritative research workflows and citations to legal sources.
  - Where it breaks (for CRE diligence): the core inputs are deal documents (commitment, exceptions, survey, leases, reports), and the goal is transaction work product, not research.

- Title production platforms (Qualia)
  - How it works: operational title/escrow workflows for title companies (production, pre-close checks, fraud checks). AI is increasingly used to accelerate preliminary exams and operational tasks.
  - What it is good at: title company scale, operations, and process control.
  - Where it breaks (for Orbital's ICP): different buyer and "job" than law firm diligence work product.

### Named competitor cheat sheet (what they'd demo)
This is a fast way to explain "how they do it" for the specific names that show up in deals. Keep it factual and avoid guessing; verify in a demo if it matters.

- Harvey
  - Mechanics: enterprise legal AI platform with a secure document workspace (eg bulk analysis) plus a workflow builder for multi-step automation.
  - Typical path: firm standardizes on it broadly, then builds practice-specific workflows.

- Legora
  - Mechanics: collaborative AI workspace with large-scale review (tabular/grid review), Word-native usage, playbooks/workflows, and a client collaboration surface (Portal).
  - Typical path: roll out to many teams as a standard workspace; use integrations (DMS/SharePoint/iManage, Word) to reduce workflow change.

- Litera Kira
  - Mechanics: upload doc sets, run extraction via pre-trained and custom "fields", then export structured outputs to Excel/Word/PDF for diligence review.
  - Typical path: used as the extraction layer; lawyers review exports and produce final memos/letters.

- Luminance
  - Mechanics: contract analysis + review workflows driven by pre-built concept models; positions itself for large-scale review and knowledge capture.
  - Typical path: adopt for contract-heavy review/diligence, often as a broad contract intelligence layer.

- ChatGPT Enterprise
  - Mechanics: general LLM workspace; users ask questions over uploads, generate summaries/first-pass extractions, then paste results into trackers and Word deliverables.
  - Typical path: enterprise buys for broad productivity; legal uses it for drafts and first-pass reads, but the diligence "system" is DIY.

- Claude for Work
  - Mechanics: general assistant optimized for long-document reasoning; similar usage pattern to ChatGPT for diligence (upload, prompt, then manual assembly of work product).
  - Typical path: teams that value long-context analysis use it for internal drafting and synthesis.

- Microsoft 365 Copilot
  - Mechanics: in-app copilot inside Word/Outlook/Teams grounded in Microsoft 365 tenant data; strongest when the workflow lives in Word/email/spreadsheets.
  - Typical path: IT standardizes; legal inherits it; great for drafting and summarizing inside existing tools, not purpose-built diligence outputs.

- Thomson Reuters CoCounsel (and TR suite)
  - Mechanics: assistant inside a broader research/product ecosystem; wins via content authority and procurement gravity.
  - Typical path: standardized research vendor expands into adjacent workflows.

- Lexis+ AI / Protege
  - Mechanics: assistant inside Lexis content and research workflows; strongest for research-grounded drafting and Q&A.
  - Typical path: Lexis customers adopt it as an add-on; legal uses it for research-adjacent work more than deal-pack diligence.

- Qualia (and "agentic AI" title workflows)
  - Mechanics: title company production platform; focuses on operational title exam and closing workflows.
  - Typical path: title/escrow org buys it; law firms interact indirectly via the title company process.

### Unique attributes (why it's different)
- **CRE-native work product**: outputs look like how CRE lawyers actually deliver diligence (issues lists, objections/cure asks, trackers), not generic summaries.
- **Evidence-first UX**: every material claim is backed by citations so reviewers can verify quickly.
- **Document reality**: designed for messy diligence inputs (scans, exhibits, inconsistent formatting), where generic tools break down.
- **Land + language (if in scope)**: optional/extended differentiation is plotting legal descriptions and reconciling title <-> survey visually.

### Value (so what?)
- Faster first-pass diligence without sacrificing defensibility.
- Lower "review friction" for seniors: less time hunting for evidence; easier spot-checking.
- Reduced miss risk by making exceptions/requirements/survey deltas explicit and auditable.
- More consistency across a practice group (repeatable outputs, templates, and workflows).

### Proof (what makes it believable)
Pick the proof that's true for your context:
- Deal/team proof: "Here's one real pack; we produced X artefacts; citations are checkable in Y minutes."
- Reference proof (Orbital): named firms using it; ISO 27001; announced funding; public product claims.
- Method proof: "Fail-closed on missing evidence; we never export an un-cited material claim by default."

### Proof library (candidate snippets, verify before using)
Pulled from the competitor overviews; treat these as "likely true but verify" before you put them in a customer-facing deck.
- Claimed impact: ~70% diligence time reduction on property diligence.
- Public momentum: $60M Series B announced Jan 2026 (total raised ~$75M).
- Adoption: serves 200,000+ transactions annually across 5,000+ property professionals.
- US customers mentioned: Vinson & Elkins, Seyfarth Shaw, BCLP, Goodwin, Greenberg Traurig; title companies Land Services USA and Essex Title.
- Security: ISO 27001 certification mentioned; built on Microsoft Azure / Azure OpenAI.
- Differentiation add-on: "legal description visualization" / property visualizer (metes & bounds / PLSS) is repeatedly framed as a wedge.

---

## 2) Pitch Flow (Dunford checklist, interactive, ~5-7 minutes)

### 0) Opener (10 seconds)
"Orbital isn't a general legal AI. It's **CRE diligence work-product automation**: we turn messy title, survey, and deal docs into **checkable outputs with locked evidence**, so you get a defensible first pass faster."

### 1) Market insight (your POV)
"CRE diligence has a weird constraint: it's time-sensitive, but a single miss can blow up insurability, lender comfort, or value. The real enemy is often 'no decision': teams keep the manual workflow because the risk of changing tools feels higher than the pain of the status quo."

### 2) Alternatives (include status quo) + discovery (make this interactive)
"Before I show anything, can I sanity-check how you do this today?"
- What are the must-have deliverables per deal (exceptions table, requirements tracker, survey memo, objections/cure asks)?
- Who does first pass, and who signs off?
- What's the slowest part: first pass, senior review, or chasing missing docs/exhibits?
- What have you tried (manual only, ChatGPT/Claude/M365, Harvey/Legora, Kira/Luminance)?

### 3) "Perfect world" (align on what good looks like)
"In a perfect world, a junior can produce the core diligence artefacts quickly, and a senior can verify the top risks without hunting."
- Outputs match your deliverables (structure and tone), not generic summaries.
- Every material claim is backed by evidence you can click and verify.
- Missing evidence is explicit (fail closed), not hand-waved.
- Exports drop into Word/Excel without copy/paste glue.

"If we could only improve one thing in the next 30 days, what would it be?"

### 4) Your differentiated value (and where the demo fits)
"Orbital is built around that perfect world:
1) **Work product, not chat**: exceptions/requirements/survey reconciliation issues and draft artefacts in your structure.
2) **Evidence-first**: claims are tied to citations so review is fast and auditable.
3) **Real-world packs**: designed for messy diligence inputs, not ideal PDFs.
Optional: **land + language** for title/survey workflows (legal descriptions and title <-> survey reconciliation)."

Demo beats (keep it inside the value narrative):
- Start with the pack: title commitment, exception instruments, survey.
- Show the outputs: requirements tracker, exception table, survey reconciliation issues.
- Click-to-verify: pick one high-risk row and jump to the cited evidence in the PDF.
- Show failure modes: "missing input" / "citation failed" and how that blocks unsafe exports by default.
- Show export: Word/Excel deliverable format (if available).

### 5) Proof (case study/results, plus "prove it on your data")
Pick proof that reduces risk for the buyer:
- "Let's run this on one representative pack and measure time-to-first-pass and time-to-verify."
- Reference customers and security posture (only what you can substantiate).
- A before/after example output (manual vs Orbital) with the same pack.

### 6) Objections (optional, conversational)
Common objections to invite (and how to respond):
- "We already have ChatGPT/Claude/M365."
  - Question: "Is the gap drafting/summaries, or producing evidence-backed diligence deliverables you can sign off on?"
- "We already have Harvey/Legora/Kira/Luminance."
  - Question: "Are you getting CRE-native title/survey depth and reviewable outputs out of the box, or is it a build/tune project?"
- "Accuracy/hallucinations scare us."
  - Response: "Same. That's why the workflow is evidence-first and fail-closed. If it's not cited, it's not shippable."
- "We don't want disruption."
  - Response: "This should sit inside existing deliverables (Word/Excel) so you can adopt it as first pass without ripping out anything."

### 7) The ask (agree next step)
"If this sounds directionally right, I'd suggest a minimal pilot:"
- You provide 1 representative pack (sanitized is fine) and your preferred deliverable template.
- We produce 3 outputs (requirements, exceptions, survey reconciliation) with citations.
- We review with a senior for 30 minutes and decide if it's worth expanding.

---

## 3) Short Versions (for intros, email, and hallway conversations)

### 10-second version
"Orbital turns CRE diligence doc packs into checkable work product with citations, so you get a defensible first pass fast."

### 30-second version
"Orbital Copilot is **CRE diligence work-product automation**. It takes title/survey and deal document packs and produces **checkable outputs** (issues lists, trackers, draft letters) with locked citations. Unlike generic copilots or contract-extraction tools, it's built for the reality of CRE packs and for senior reviewer trust."

### 2-minute version
"In CRE diligence you're always trading off speed and risk. The team can't ship a first pass until someone has turned a messy title/survey/doc pack into structured outputs and a senior has verified the evidence. Horizontal copilots can summarize, but they don't give you repeatable deliverables or an evidence-first workflow; contract review tools are great at contracts but they don't naturally model title commitments, exception instruments, and survey reconciliation.

Orbital sits in a tighter category: **CRE diligence work-product automation**. It's built around the artefacts you already produce and the evidence you must defend. It generates structured outputs, locks citations so reviewers can verify quickly, and handles ugly real-world inputs. If you want, it can go one step further and connect land + language by visualizing legal descriptions and surfacing title <-> survey deltas.

The quickest proof is a pilot on one representative pack: measure time-to-output, time-to-verify, and the edit distance to something you'd send to a client."

---

## 4) Competitive One-Liners (when they say "we already have X")

Use these to acknowledge the alternative and then re-anchor on category + differentiation.

- **"We do this manually today."**
  "Totally normal. Orbital isn't trying to replace legal judgment; it standardizes first pass and makes evidence easier to verify so seniors spend less time hunting and more time deciding."

- **"We already have ChatGPT/Claude/Microsoft Copilot."**
  "Those are great for drafting and summarizing. Orbital is purpose-built to produce **defensible CRE diligence work product** with evidence and templates; without that, teams end up back in copy/paste and the 'trust gap' stays."

- **"We use Harvey / Legora."**
  "They're strong general legal AI platforms and workflow builders. Orbital wins when you want out-of-the-box **CRE-native title/survey depth** and deliverables designed for review, not a DIY workflow project."

- **"We use Kira / Luminance."**
  "They're strong at contract extraction and contract-centric diligence. Orbital is optimized for CRE title/survey workflows and end deliverables (issues lists, objections/cure asks) with evidence-first verification."

- **"We're standardized on TR / Lexis."**
  "That's a research and procurement gravity game, and those tools are excellent for that category. Orbital is about **your deal documents** and the transaction work product you need to produce from them."

- **"We're a title company; we use Qualia."**
  "Qualia is great for title production workflow. Orbital is built for legal diligence work product and title/survey interpretation in attorney workflows."

---

## 5) Discovery Questions (to qualify fast)

- What's the most painful part of diligence right now: time-to-first-pass, senior review time, or misses?
- What "must-have" deliverables do you produce every deal (issues list, objections, exception table, requirements tracker, survey memo)?
- How messy are your packs (scan-heavy, missing exhibits, inconsistent naming)?
- Where do things break: missing exception docs, survey not matching title, legal description mismatch, access/encroachments?
- What is your trust bar: what evidence does a reviewer need to see before they sign off?

---

## 6) Pilot Offer (CTA you can actually sell)

### Minimal pilot (fast, low risk)
- 1 representative deal pack (or a sanitized pack).
- 3 outputs: requirements tracker, exception table, survey reconciliation issues list.
- Success = reviewer can verify the top 10 risk items via citations quickly and the outputs resemble "what we'd send to a client" with minimal edits.

### Expanded pilot (if they want "real work product")
- Add drafts: objection/cure email/letter, issues memo, and (if applicable) endorsement ask list.
- Add export formats: Word (firm template) + CSV/Excel trackers.

---

## 7) Notes on Truthfulness (for PoC vs production)

If you're pitching the **PoC in this repo**, keep claims aligned to PoC scope:
- Lead with: evidence-first, artefact-first, title + survey quick start outputs.
- Do not claim: SSO/RBAC, multi-tenant, integrations, or property visualizer/boundary plotting (unless implemented).
