## A Executive summary

* **Category:** Orbital’s US “Copilot” is best framed as **vertical AI for commercial real estate (CRE) diligence work product**—an “agent” that turns messy diligence doc packs into **checkable outputs and draft deliverables** (not just chat). ([Orbital][1])
* **What it is NOT:** not a general legal research copilot (Westlaw/Lexis category), not CLM, not a generic VDR/deal room, and not a generic “LLM chat + uploads” wrapper. ([Orbital][1])
* **Orbital’s US wedge is unusually specific:** **Title & Survey review + legal-description visualization** (metes-and-bounds / PLSS) plus downstream drafts (issue lists / objection letters / memos). ([Orbital][1])
* **Differentiation lever #1: Land + language moat.** “Visualize legal descriptions in seconds” and overlay on surveys/maps is rare among legal AI platforms—this is *real estate–native*, not merely “contract-native.” ([Orbital][1])
* **Differentiation lever #2: “Review → Action” deliverables.** Orbital explicitly positions Copilot to convert findings into structured drafts like **issue lists, objection letters, memos**, customized to firm tone. ([Orbital][1])
* **Differentiation lever #3: Document reality (messy inputs).** “Restore” positioning (“handwritten notes, blurry scans, complex layouts”) is a practical advantage in survey/title ecosystems where OCR often fails. ([Orbital][1])
* **Trust posture is central to the story.** Orbital leans on “full transparency” (“showing exactly how conclusions are reached”) and “best-in-class security.” ([Orbital][1])
* **Orbital is actively scaling the US:** announced a **$60M Series B (Jan 26, 2026)** and references opening a **New York office in 2025** for US expansion. ([Orbital][2])
* **Top threat #1: Legal suites with distribution + proprietary content.** Thomson Reuters CoCounsel and Lexis+ AI can win via **procurement gravity, embeddedness, and content authority**, then creep into transaction/diligence. ([LexisNexis][3])
* **Top threat #2: “Workflow-builder” platforms that let firms encode playbooks.** Harvey and Legora are moving from assistant → **custom workflows**, turning law-firm knowledge into reusable systems (and client-facing collaboration via Legora Portal). ([Harvey][4])
* **Top threat #3: Horizontal copilots becoming “good enough” at document Q&A.** Microsoft 365 Copilot + enterprise LLM workspaces (ChatGPT Enterprise, Claude for Work) can soak up budget and usage—especially for first-pass summaries. ([Microsoft Learn][5])
* **Best wedge → expansion story for Orbital US:**

  1. **Win Title & Survey review** (highest pain, most domain specificity, easiest ROI proof) →
  2. Expand to **full CRE diligence pack** (leases, PSAs, JV, loan docs) →
  3. Expand into **end-to-end transaction work product** (objections, negotiation support, closing checklists) + adjacent buyers (in-house RE legal, lenders, title insurers). ([Orbital][1])
* **Strategic implication:** Orbital’s “Copilot” should be sold and built as **a work-product system** (reporting + evidence + exports) rather than “a chat product.” Your own PoC blueprint already emphasizes “report view + citations + Word export” as the wedge. 

---

## B Market map

A practical “market landscape” for US CRE diligence (and why each category matters to Orbital):

| Category                                            | What it includes                                                                                      | Examples                                                                                                                                                                                                    | Why it matters for Orbital Copilot US                                                                                                                                                                               |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Direct**: AI for diligence doc packs              | Systems that ingest a pack, answer questions, extract/compare clauses, and produce structured outputs | **Orbital Copilot** (US CRE) ([Orbital][1]); Harvey Vault/Workflows ([Harvey][6]); Legora Tabular Review/Workflows ([Legora][7]); Litera Kira ([Litera][8]); Luminance ([Luminance][9]); Ivo ([ivo.ai][10]) | This is the **closest budget line item**: “reduce associate hours in diligence.” Orbital must prove it’s *faster + safer + more CRE-specific* than general diligence AI.                                            |
| **Adjacent**: Contract review & CLM                 | Ongoing contract lifecycle + negotiation workflows                                                    | (Examples to mention in interviews: Ironclad, Icertis, Sirion, DocuSign CLM, Agiloft, LinkSquares, Evisort)                                                                                                 | These tools can expand upstream/downstream into diligence. They also shape buyer expectations: Word add-ins, clause libraries, playbooks, approvals, audit.                                                         |
| **Adjacent**: Transaction management / deal rooms   | VDRs, transaction checklisting, signature flows, “single source of truth”                             | Litera Transact (adjacent to Kira) ([Litera][8]); HighQ/Deal rooms (common in firms)                                                                                                                        | Orbital can win by integrating into deal rooms—or risk being “another tool” outside the deal hub.                                                                                                                   |
| **Adjacent**: Legal research copilots               | GenAI on top of authoritative legal content                                                           | Thomson Reuters CoCounsel ; Lexis+ AI / Protégé ([LexisNexis][3])                                                                                                                                           | They can outflank on **content authority + procurement**, but are weak on **CRE-specific work product** (title/survey/land visualization).                                                                          |
| **Incumbents**: Contract review / eDiscovery suites | Mature enterprise platforms for doc review + governance                                               | Litera/Kira ([Litera][8]); (others to mention: Relativity, Reveal, etc.)                                                                                                                                    | Incumbents win by: security, scale, integrations, legal ops familiarity. Orbital needs a **clear “why now / why better”** for CRE diligence.                                                                        |
| **Property/title data platforms**                   | Parcel, title, tax, comps, GIS layers                                                                 | (Examples: CoStar, CoreLogic, LightBox, First American data ecosystem)                                                                                                                                      | Orbital’s unique advantage is the **bridge between land data and legal docs**—Copilot can become the “interpretation layer” on top of data platforms. Orbital’s visualizer hints at this direction. ([Orbital][11]) |
| **Title insurance ecosystem tools**                 | Title commitments, endorsements, policies, survey standards, underwriting workflows                   | Title companies + counsel workflows (status quo)                                                                                                                                                            | If Orbital expands here, defensibility requirements are extreme. However, title insurers can become distribution partners or “co-sellers.”                                                                          |
| **Status quo substitutes**                          | Junior associates + paralegals + checklist templates + manual Word reports                            | Outlook threads, shared drives, PDFs, redlines, Excel checklists                                                                                                                                            | Orbital must beat *habits*, not just software. That means: evidence UX, speed, and exports that drop into existing deliverables. ([Orbital][1])                                                                     |

US vs UK note: Orbital explicitly runs **US Copilot** and **UK Copilot** as separate product lines, reflecting different title systems and workflows. ([Orbital][1])

---

## C Competitor deep dives

### 1 Harvey

1. **Positioning (one-liner)**
   Enterprise AI platform “designed for legal and professional services,” spanning research, drafting, due diligence, and custom workflows. ([Harvey][12])

2. **Primary ICP(s) and buyer**
   Large law firms and sophisticated in-house legal; buyer often Innovation/Knowledge/Practice leadership + IT/security.

3. **Core workflows supported**

* Assistant for Q&A/drafting, **Vault** for “securely store, organize, and bulk-analyze legal documents,” and **Workflows** for pre-built or custom multi-step agents. ([Harvey][6])
* Workflow Builder explicitly aims to encode proprietary knowledge into reusable systems. ([Harvey][4])

4. **Strengths vs Orbital**

* **Workflow-builder** posture: can replicate “structured question sets” quickly across domains. ([Harvey][4])
* Enterprise security posture and Trust Center messaging. ([Harvey][13])

5. **Weaknesses / gaps for US CRE diligence & “checkable outputs”**

* Broad legal focus → likely **less out-of-the-box CRE specificity** (title commitment quirks, ALTA survey conventions, legal description plotting). *Verify by demo.*
* No clear public signal of “land visualization” as a first-class capability (Orbital’s standout). ([Orbital][1])

6. **What they’d claim vs Orbital**
   “We’re the standardized enterprise legal AI layer; you can build your real estate workflows on top of us.”

7. **How Orbital wins vs Harvey**

* **Messaging:** “Harvey is broad; Orbital is built to think like a CRE attorney.” ([Orbital][1])
* **Product:** double down on *title & survey*, legal-description plotting, and “restore messy docs” as non-negotiable primitives. ([Orbital][1])
* **GTM:** land-and-expand within CRE practice groups: show measurable cycle-time reduction on a single diligence deliverable.

8. **Integration / enterprise readiness notes**
   Harvey emphasizes SOC 2 Type II and ISO 27001 in public security content (enterprise-friendly). ([Harvey][14])

9. **Evidence**
   ([Harvey][12])

---

### 2 Legora

1. **Positioning**
   A “collaborative AI workspace” for lawyers: **review faster, draft in Word, research using DMS + partnerships**. ([Legora][7])

2. **ICP(s) and buyer**
   Large/mid law firms and in-house; buyer often innovation + practice leaders.

3. **Core workflows supported**

* “Analyze tens of thousands of documents simultaneously” and suggest markup; Word drafting with precedent; research with **iManage + SharePoint** integrations. ([Legora][7])
* **Portal** (Nov 7, 2025): collaboration layer between law firms and in-house, with custom workflows/playbooks and doc Q&A with source references. ([Legora][15])

4. **Strengths vs Orbital**

* **Cross-org collaboration** as product (Portal) → can become the “default client interface.” ([Legora][15])
* Word-centric workflow integration. ([Legora][7])
* Strong public compliance claims (ISO 27001, ISO 42001, SOC2). ([Legora][7])

5. **Weaknesses / gaps for US CRE diligence**

* Not obviously CRE-specific: Legora’s own positioning spans litigation/M&A/banking/tax. ([Legora][7])
* No public evidence of **survey/title-specific** features or legal-description plotting. (Orbital’s moat.) ([Orbital][1])

6. **What they’d claim vs Orbital**
   “We fit into every lawyer workflow and integrate into DMS/Word; we can support real estate too.”

7. **How Orbital wins vs Legora**

* **Messaging:** “Portal/workspace ≠ diligence work product. Orbital ships the *actual CRE deliverables* and the land visualization.” ([Orbital][1])
* **Product:** Make “report → export → client-ready” the hero, not chat. (Your internal PoC blueprint matches this.) 
* **GTM:** focus on CRE-specific proof: title/survey review time saved, objection letter quality, fewer misses.

8. **Integration / enterprise readiness notes**
   Legora claims ISO 27001 / ISO 42001 / SOC2 + DMS integrations (iManage/SharePoint). ([Legora][7])

9. **Evidence**
   ([Legora][7])

---

### 3 Thomson Reuters CoCounsel

1. **Positioning**
   CoCounsel is TR’s “AI assistant” inside its ecosystem, increasingly framed as **agentic AI** for complex legal/professional work.

2. **ICP(s) and buyer**
   Enterprise law firms + in-house legal ops; TR has entrenched procurement relationships.

3. **Core workflows supported**

* Research and drafting grounded in TR products; multi-doc analysis and structured outputs (tables/reports) are emphasized.
* TR publicly announced “agentic AI” direction for CoCounsel (Nov 5, 2025).

4. **Strengths vs Orbital**

* **Distribution + content authority**: Westlaw/Practical Law gravity is massive.
* Strong trust posture (transparent, citation-oriented approach is common in TR messaging).

5. **Weaknesses / gaps for US CRE diligence**

* Generic legal workflows: unlikely to ship **title & survey** depth or legal-description plotting as first-class. ([Orbital][1])
* CRE transaction document nuance (ALTA/NSPS survey conventions, exceptions scheduling, etc.) is “last-mile.”

6. **What they’d claim vs Orbital**
   “We’re the safest enterprise choice: trusted content + security + broad coverage.”

7. **How Orbital wins vs TR**

* **Messaging:** “CoCounsel is a great generalist; Orbital is the CRE specialist that knows the land.” ([Orbital][1])
* **Product:** deepen CRE “work product templates” (issue list/objection letter), plus spatial review (visualizer) and messy doc restoration. ([Orbital][1])
* **GTM:** win inside CRE practice groups even in TR shops; integrate/export into the tools they already use.

8. **Integration / enterprise readiness notes**
   Procurement readiness is a TR hallmark; CoCounsel sits in that enterprise ecosystem.

9. **Evidence**

---

### 4 LexisNexis Lexis Plus AI and Protégé

1. **Positioning**
   GenAI for legal research and drafting **inside Lexis content** (Lexis+ AI) and a “personalized AI assistant” direction (Protégé). ([LexisNexis][3])

2. **ICP(s) and buyer**
   Firms and in-house teams already standardized on Lexis.

3. **Core workflows supported**
   Primarily research/drafting (summaries, drafting, Q&A) backed by Lexis content. ([LexisNexis][3])

4. **Strengths vs Orbital**

* Content authority + distribution. ([LexisNexis][3])
* Good “defensibility story” for research citations (in general).

5. **Weaknesses / gaps for US CRE diligence**

* Not focused on **document-pack diligence** for transaction materials like surveys/title commitments.
* No land visualization, no explicit “issue list/objection letter” CRE deliverable story in public messaging. ([Orbital][1])

6. **What they’d claim vs Orbital**
   “We’re the most authoritative place to ask legal questions.”

7. **How Orbital wins vs Lexis**

* **Messaging:** “Lexis answers legal research questions; Orbital produces CRE diligence work product from *your deal documents*.” ([Orbital][1])
* **Product:** invest in structured outputs and verification UX; keep the product anchored on transaction deliverables.

8. **Integration / enterprise readiness notes**
   Lexis has established enterprise readiness; it’s the default vendor for many.

9. **Evidence**
   ([LexisNexis][3])

---

### 5 Litera Kira

1. **Positioning**
   AI-powered document review/extraction tool widely used in diligence; now layering newer GenAI capabilities. ([Litera][8])

2. **ICP(s) and buyer**
   Law firms (transactional) and corporates doing high-volume contract review; buyers include KM/innovation + practice leads.

3. **Core workflows supported**

* Extract clauses/data points at scale; export to Word/Excel/PDF; controls/governance and integrations (Litera ecosystem). ([Litera][8])

4. **Strengths vs Orbital**

* Mature “structured extraction” and diligence posture (years of market presence). ([Litera][8])
* Strong integration story (especially if customers already use Litera). ([Litera][8])

5. **Weaknesses / gaps for US CRE diligence**

* Contract-centric; less obvious strength for **title commitments/surveys/legal descriptions** and “land understanding.” ([Orbital][1])
* May require configuration/training to fit CRE idiosyncrasies; Orbital’s pitch is “built for real estate lawyers.” ([Orbital][1])

6. **What they’d claim vs Orbital**
   “We’re the standard for diligence extraction; we scale across every deal type.”

7. **How Orbital wins vs Kira**

* **Messaging:** “Kira extracts; Orbital *concludes + drafts the actual CRE work product* and visualizes the property.” ([Orbital][1])
* **Product:** “Restore” + property visualizer + CRE deliverable templates. ([Orbital][1])
* **GTM:** win the CRE practice group first; then expand to other transactional docs.

8. **Integration / enterprise readiness notes**
   Litera is a known enterprise vendor; procurement story is strong.

9. **Evidence**
   ([Litera][8])

---

### 6 Luminance

1. **Positioning**
   Legal AI for contract analysis and workflows; recently pushing “institutional memory” and broader workflow intelligence. ([Luminance][9])

2. **ICP(s) and buyer**
   Law firms + enterprises with contract-heavy workflows.

3. **Core workflows supported**
   Contract review, due diligence, negotiation assistance; “institutional memory” messaging indicates learning from prior decisions. ([Luminance][9])

4. **Strengths vs Orbital**

* Good at large-scale contract review.
* Security posture appears enterprise-grade (ISO 27001 / SOC2 claims). ([Luminance][9])

5. **Weaknesses / gaps for US CRE diligence**

* Again: contract-first, not land-first; no visual legal description differentiation. ([Orbital][11])

6. **What they’d claim vs Orbital**
   “We handle every contract workflow and can remember institutional knowledge.”

7. **How Orbital wins vs Luminance**

* **Messaging:** “CRE diligence ≠ generic contract review. We connect title/survey/legal description to actionable work product.” ([Orbital][1])
* **Product:** invest in CRE-specific extraction schemas (exceptions, easements, encroachments), plus exports.

8. **Integration / enterprise readiness notes**
   Luminance markets enterprise deployments and security; verify current certs in procurement.

9. **Evidence**
   ([Luminance][9])

---

### 7 Ivo

1. **Positioning**
   Contract review copilot focused on **speed and Word-native workflows**; marketed around automated contract reading via many model calls. ([Reuters][16])

2. **ICP(s) and buyer**
   In-house legal + legal teams negotiating contracts; buyers often legal ops.

3. **Core workflows supported**

* Word add-in/contract review, “issues lists” and review outputs (per Ivo marketing). ([ivo.ai][10])
* Reuters notes heavy model-orchestration (“400” model calls to read a large contract). ([Reuters][16])

4. **Strengths vs Orbital**

* Tight “in Word” adoption story. ([ivo.ai][10])
* Clear value prop for contract review/negotiation.

5. **Weaknesses / gaps for US CRE diligence**

* Not built around **title & survey** or spatial diligence. ([Orbital][1])
* CRE diligence requires multi-document + property context, not just single contract negotiation.

6. **What they’d claim vs Orbital**
   “We’re fastest for contract review; minimal workflow change.”

7. **How Orbital wins vs Ivo**

* **Messaging:** “We aren’t a generic contract copilot; we solve the CRE diligence pack and its deliverables.” ([Orbital][1])
* **Product:** emphasize multi-doc pack ingestion + title/survey + objection letter generation + map visualization.

8. **Integration / enterprise readiness notes**
   Security posture not clearly evidenced in the sources above—verify.

9. **Evidence**
   ([Reuters][16])

---

### 8 OpenAI ChatGPT Enterprise

1. **Positioning**
   Horizontal enterprise LLM workspace used across functions, including legal.

2. **ICP(s) and buyer**
   Enterprise-wide buyers (IT/security/procurement); legal becomes one of many departments.

3. **Core workflows supported**
   Summarization, drafting, ad-hoc extraction, brainstorming; can be used for diligence *if users build the workflow themselves.*

4. **Strengths vs Orbital**

* Broad capability and user familiarity.
* Strong enterprise security claims: SOC 2 Type 2 coverage for ChatGPT Enterprise/Business and support for GDPR/CCPA + DPA. ([OpenAI][17])

5. **Weaknesses / gaps for US CRE diligence & “checkable outputs”**

* No CRE-native deliverables, no land visualization, no purpose-built report UX.
* “Evidence-first” is on the user to enforce; without a vertical UX, teams end up copy/pasting into Word (status quo).

6. **What they’d claim vs Orbital**
   “Why buy niche when we can deploy one enterprise AI tool?”

7. **How Orbital wins vs ChatGPT Enterprise**

* **Messaging:** “Generic copilots help you write; Orbital helps you *finish diligence work product safely*.” ([Orbital][1])
* **Product:** one-click exports (issue lists / objection letters) and visualizer are the moat. ([Orbital][1])
* **GTM:** show that “DIY prompting” is brittle, hard to audit, and not scalable across a CRE team.

8. **Integration / enterprise readiness notes**
   Strong on security/compliance evidence; weaker on legal workflow “fit.”

9. **Evidence**
   ([OpenAI][17])

---

### 9 Anthropic Claude for Work

1. **Positioning**
   Horizontal AI assistant for professional workflows (“Claude for Work” via Team/Enterprise plans). ([Anthropic][18])

2. **ICP(s) and buyer**
   Teams and enterprises looking for a general assistant; could be adopted by legal/real estate teams.

3. **Core workflows supported**
   Long-document analysis, drafting, internal knowledge Q&A; typically configured by the user/team.

4. **Strengths vs Orbital**

* Enterprise trust posture: Anthropic states commercial product inputs/outputs are **not used to train models by default**. ([privacy.claude.com][19])
* Certifications referenced in Anthropic materials (ISO 27001, ISO/IEC 42001, SOC 2). ([privacy.claude.com][20])

5. **Weaknesses / gaps for US CRE diligence**

* Not CRE-native; lacks land visualization and diligence deliverable templates.
* “Checkability” depends on how users prompt and structure outputs.

6. **What they’d claim vs Orbital**
   “We’re the safest general assistant for long, complex documents.”

7. **How Orbital wins vs Claude**

* **Messaging:** “We aren’t trying to be your general AI. We’re your CRE diligence engine.” ([Orbital][1])
* **Product:** hardwire evidence UX + exports; deliver spatial context.

8. **Integration / enterprise readiness notes**
   Team plan announced May 1, 2024; consumer terms updates explicitly exclude services under Commercial Terms (including Claude for Work). ([Anthropic][21])

9. **Evidence**
   ([privacy.claude.com][19])

---

### 10 Microsoft 365 Copilot

1. **Positioning**
   Horizontal copilot embedded in Word/Excel/Outlook/Teams, grounded in tenant data via Microsoft Graph. ([Microsoft Learn][22])

2. **ICP(s) and buyer**
   Enterprise-wide IT/procurement decision; legal users inherit it.

3. **Core workflows supported**
   Writing, summarizing, meeting/email assistance, spreadsheet support—within M365 apps. ([Microsoft Learn][23])

4. **Strengths vs Orbital**

* **Distribution advantage** is extreme (already deployed in many enterprises).
* Microsoft documents emphasize privacy/security protections for M365 Copilot and enterprise data protection/data residency posture. ([Microsoft Learn][5])

5. **Weaknesses / gaps for US CRE diligence**

* Not built to understand title commitments/surveys/legal descriptions as a product.
* No specialized “diligence report view,” evidence UX, or property visualization.

6. **What they’d claim vs Orbital**
   “Our copilot is everywhere lawyers already work (Word/Outlook).”

7. **How Orbital wins vs M365 Copilot**

* **Messaging:** “M365 Copilot helps write; Orbital helps *review and produce CRE diligence work product* with land context.” ([Orbital][1])
* **Product strategy:** treat Microsoft as a “surface,” not an enemy: best-in-class Word export + future add-in integration can coexist.

8. **Integration / enterprise readiness notes**
   Microsoft Learn pages emphasize protections (including prompt injection defenses) and enterprise data protection posture; Reuters reported Microsoft denying training foundational models on Microsoft 365 application data. ([Microsoft Learn][5])

9. **Evidence**
   ([Microsoft Learn][5])

---

## D Feature and positioning comparison matrix

Scoring: **1 = weak/absent**, **3 = usable but not core**, **5 = best-in-class / core**. (These are judgment calls based on public info + typical deployments; verify in demos for procurement.)

| Product                |          Doc pack ingestion + messy PDFs |                  Clause-level citations / evidence UX |                     Structured reporting + Word export |                                  CRE diligence depth |                                       Autonomy / agentic |                            Trust & defensibility |                 Security & procurement |              Customization (templates/question sets) |                             Distribution advantage |
| ---------------------- | ---------------------------------------: | ----------------------------------------------------: | -----------------------------------------------------: | ---------------------------------------------------: | -------------------------------------------------------: | -----------------------------------------------: | -------------------------------------: | ---------------------------------------------------: | -------------------------------------------------: |
| **Orbital Copilot US** |    4 (restore messy docs) ([Orbital][1]) |      4 (positions “full transparency”) ([Orbital][1]) | 5 (issue lists/objection letters/memos) ([Orbital][1]) | 5 (title/survey + legal descriptions) ([Orbital][1]) | 3 (automation + drafts; “agent” language) ([Orbital][1]) | 4 (defensible posture + security) ([Orbital][1]) |     4 (ISO 27001; enterprise controls) | 3 (firm tone/custom drafts mentioned) ([Orbital][1]) | 3 (strong firms, but smaller suite) ([Orbital][1]) |
| Harvey                 |    4 (Vault bulk analysis) ([Harvey][6]) |                                                     3 |                 4 (artifacts/workflows) ([Harvey][24]) |                                                    2 |              5 (Workflow Builder + agents) ([Harvey][4]) |                                                4 |  5 (SOC2/ISO messaging) ([Harvey][14]) |                                                    5 |                                                  4 |
| Legora                 | 4 (tens of thousands docs) ([Legora][7]) | 3 (source references, validate/refine) ([Legora][15]) |                                                      3 |                                                  1–2 |          4 (Portal + workflows/playbooks) ([Legora][15]) |                                                4 | 5 (ISO 27001/42001/SOC2) ([Legora][7]) |                                                    4 |               4 (big firm rollouts) ([Legora][25]) |
| TR CoCounsel           |                                        4 |                                                     4 |                                                      4 |                                                    2 |                                    4 (agentic direction) |                                                5 |                                      5 |                                                    3 |                                                  5 |
| Lexis+ AI / Protégé    |                                        2 |                                                     4 |                                                      2 |                                                    1 |                                                        3 |                                                4 |                                      5 |                                                    2 |                                                  5 |
| Litera Kira            |                                        4 |                                                     3 |                                                      4 |                                                    2 |                                                        3 |                                                4 |                                      4 |                                                    4 |                                                  4 |
| Luminance              |                                        4 |                                                   2–3 |                                                      3 |                                                  1–2 |                                                        3 |                                                4 |                                      4 |                                                    3 |                                                  3 |
| Ivo                    |                                        3 |                                                     2 |                                                      4 |                                                    1 |                                                        3 |                                                3 |                             3 (verify) |                                                    3 |                                                  2 |
| ChatGPT Enterprise     |                                        3 |                                                     2 |                                                    2–3 |                                                    1 |                                                        3 |                                                3 |                       5 ([OpenAI][17]) |                                                    4 |                                                  5 |
| Claude for Work        |                                        3 |                                                     2 |                                                      2 |                                                    1 |                                                        3 |                                                3 |           4 ([privacy.claude.com][20]) |                                                    3 |                                                  4 |
| Microsoft 365 Copilot  |                                        3 |                                                   1–2 |                                        3 (Word-native) |                                                    1 |                                                        3 |                                                4 |               5 ([Microsoft Learn][5]) |                                                    3 |                                                  5 |

---

## E Orbital Copilot US positioning recommendations

### Recommended positioning statement

**Orbital Copilot is the CRE diligence work-product engine that turns title/survey and transaction doc packs into checkable, client-ready outputs—combining real-estate legal reasoning with land visualization—so attorneys move from review to action dramatically faster without sacrificing trust.** ([Orbital][1])

### Messaging pillars with proof points

1. **Built for real estate attorneys (not generic legal AI)**

* “Built by former real estate lawyers” + explicit US CRE framing. ([Orbital][1])
* Covers title & survey review, PSAs, leases, JV agreements, loan analysis. ([Orbital][1])

2. **Understand the land, not just the language**

* Converts legal descriptions into digital outlines and overlays on surveys/maps. ([Orbital][1])

3. **From review to action: deliverables, not summaries**

* Auto-generates **issue lists, objection letters, memos**; customized to firm structure/tone. ([Orbital][1])

4. **Document reality: handles ugly inputs**

* “Restore” to convert handwriting/blurry scans/complex layouts into usable text. ([Orbital][1])

5. **Enterprise-grade security posture**

* Orbital security page references controls like SSO/MFA and ISO 27001 certification plus GDPR/CCPA posture. ([Orbital][1])

### Disagree and commit trade-offs

What Orbital should **not** do (even if competitors do):

* **Do not become “generic legal AI.”** That’s a suite game (TR/Lexis/Harvey/Legora) where distribution wins. Orbital’s moat is **CRE-native workflow + land visualization + deliverables.** ([Orbital][1])
* **Do not lead with “chat” as the hero surface.** Lead with **reporting + drafts + exports** because that is where adoption and ROI live. (Matches your PoC blueprint.) 
* **Do not over-rotate into autonomy without a trust boundary.** In CRE diligence, the product must be “fast but checkable,” with failure modes visible. (This is consistent with your internal dossier’s trust/UX framing.) 
* **Do not become services-heavy customization.** If every firm needs bespoke setup, Orbital loses velocity and margins. Prefer configurable templates/question sets with guardrails.

### 30-second talk track

“Orbital Copilot in the US sits in a very specific category: **CRE diligence work product automation**. The differentiation isn’t ‘chat’—it’s turning messy title and survey packs into **checkable, client-ready outputs**, and uniquely, visualizing legal descriptions on a map. The competitive threats are suites like TR/Lexis on procurement, and workflow builders like Harvey/Legora that can encode playbooks. Orbital wins by doubling down on CRE-native depth, evidence-first UX, and deliverables that drop into real attorney workflows.”

### 2-minute talk track

“In the US, CRE diligence is a workflow where speed matters, but a single miss can be catastrophic—so the product needs to be ‘fast **and** defensible.’ Orbital Copilot’s public positioning is unusually concrete: it streamlines title/survey review, PSAs and leases, and it goes beyond text by plotting legal descriptions onto surveys or maps. That land+language combo is a real moat.

Competitively, I see three fronts. First, the suites: Thomson Reuters and Lexis can win on distribution, but they’re unlikely to build best-in-class title/survey and spatial diligence. Second, workflow builders like Harvey and Legora: they’re enabling firms to productize their own expertise into reusable workflows and even client collaboration portals—so Orbital needs to ensure its deliverables are so ‘native’ that building them elsewhere is painful. Third, horizontal copilots like Microsoft 365 Copilot and enterprise LLMs: they’ll handle generic summaries, but they won’t deliver a true diligence report with the right structure, evidence UX, and exports.

So my POV is: Orbital should lead with a report-first product, with evidence and exports as the default, and deepen the spatial diligence layer. If Orbital nails those, it can own the US title/survey wedge and expand into the entire CRE transaction lifecycle.”

---

[1]: https://www.orbital.tech/copilot-us "https://www.orbital.tech/copilot-us"
[2]: https://www.orbital.tech/blog/orbital-raises-series-b "https://www.orbital.tech/blog/orbital-raises-series-b"
[3]: https://www.lexisnexis.com/en-us/products/lexis-plus-ai.page "https://www.lexisnexis.com/en-us/products/lexis-plus-ai.page"
[4]: https://www.harvey.ai/blog/introducing-workflow-builder "https://www.harvey.ai/blog/introducing-workflow-builder"
[5]: https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy"
[6]: https://www.harvey.ai/products/vault "https://www.harvey.ai/products/vault"
[7]: https://legora.com/ "https://legora.com/"
[8]: https://www.litera.com/products/kira "https://www.litera.com/products/kira"
[9]: https://www.luminance.com/security/ "https://www.luminance.com/security/"
[10]: https://www.ivo.ai/product/review "https://www.ivo.ai/product/review"
[11]: https://www.orbital.tech/blog/property-visualizer "https://www.orbital.tech/blog/property-visualizer"
[12]: https://www.harvey.ai/legal "https://www.harvey.ai/legal"
[13]: https://www.harvey.ai/security "https://www.harvey.ai/security"
[14]: https://www.harvey.ai/blog/security-by-design "https://www.harvey.ai/blog/security-by-design"
[15]: https://legora.com/newsroom/portal-announcement "https://legora.com/newsroom/portal-announcement"
[16]: https://www.reuters.com/technology/legal-ai-startup-ivo-raises-55-million-latest-funding-round-2026-01-20/ "https://www.reuters.com/technology/legal-ai-startup-ivo-raises-55-million-latest-funding-round-2026-01-20/"
[17]: https://openai.com/security-and-privacy/ "https://openai.com/security-and-privacy/"
[18]: https://www.anthropic.com/news/updates-to-our-consumer-terms "https://www.anthropic.com/news/updates-to-our-consumer-terms"
[19]: https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training "https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training"
[20]: https://privacy.claude.com/en/articles/10015870-what-certifications-has-anthropic-obtained "https://privacy.claude.com/en/articles/10015870-what-certifications-has-anthropic-obtained"
[21]: https://www.anthropic.com/news/team-plan-and-ios?ref=testingcatalog.com "https://www.anthropic.com/news/team-plan-and-ios?ref=testingcatalog.com"
[22]: https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-architecture "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-architecture"
[23]: https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview"
[24]: https://www.harvey.ai/products/workflows "https://www.harvey.ai/products/workflows"
[25]: https://legora.com/newsroom/white-case-announces-global-rollout-of-legora-across-43-offices "https://legora.com/newsroom/white-case-announces-global-rollout-of-legora-across-43-offices"
