## 1. Executive summary

US CRE due diligence (on both purchases and loans) is basically a set of parallel workstreams that all collapse into a small number of hard “go/no-go” questions before closing:

* **Can we insure marketable title (and lien priority if it’s a loan)?** This drives the early **title commitment / pro forma** review, **Schedule B-II exception triage**, objection and cure, and the endorsements ask list. The commitment itself is structured around **Schedule A** (core deal info) and **Schedule B Part I (Requirements)** vs **Schedule B Part II (Exceptions)**, which maps cleanly into a workflow engine.
* **Does the survey corroborate title and surface off-record risk?** ALTA/NSPS standards make the survey a joint “title + field” artefact: the standards require the surveyor to be given the **record description** and the **title commitment / title evidence**, plus copies of recorded documents shown as easements. That creates a natural handoff and dependency: title drives survey content, then survey feeds back into title objections and endorsements.
* **Are leases and tenant rights consistent with the business deal and lender/insurer underwriting?** In day-to-day practice that means **lease abstracts**, a **rent roll tie-out**, and then closing deliverables like **tenant estoppels** and (often in financings) **SNDAs**. These are explicitly called out in financing closing checklists and in practice guidance on estoppel letters.
* **Are zoning and environmental acceptable enough to close and insure?** Zoning diligence commonly shows up as a **zoning compliance report/letter**, and it’s also tied to title endorsements (zoning endorsements typically require a zoning report or verification letter). Environmental diligence is usually a **Phase I ESA** done to meet EPA’s “all appropriate inquiries” framework (often via ASTM), and lenders are sensitive to stale reports and third-party reliance.
* **Can the deal actually close cleanly (conditions satisfied, signatures/authority right, recordation handled, and post-close clean-up done)?** Real workflows run on a **closing checklist** that is circulated, updated, and used to supervise who is doing what (including non-lawyers like clients chasing estoppels). And post-close follow up is explicit: confirm recordation order, collect originals, issue title policies, build the closing binder/transcript.

What’s broadly consistent nationally:

* Title commitment + exception documents + survey + leases + zoning/environmental reports are the **core file artefacts** across most US CRE deals.
* The workflow is **parallel**, with title/survey, leases, zoning, environmental, and entity authority moving at once, then converging into cure + negotiation + closing checklist.

Where practice diverges (and why):

* **Closing mechanics and intermediaries** (escrow vs “table closing” customs) materially affect who collects what, how instructions work, and who disburses/records. California is explicitly “escrow-driven” with escrow instructions functioning as the step-by-step roadmap and conditions precedent to releasing funds/docs.
* **State recording and transfer tax forms / execution formalities** change signature packages and pre-close QC (for example, Florida’s two-witness deed execution requirement, NY’s RP‑5217 filing with deeds, Illinois PTAX-203 filing with deeds).
* **Title insurance regulation and endorsement availability** varies by state and underwriter, which changes what “standard endorsements” means and what evidence underwriting will require.

High-leverage diligence work (the stuff that moves negotiation and risk decisions):

* Title exception triage + survey-driven curatives (access, encroachments, restrictions, liens).
* Lease rights that can blow up value or collateral (termination options, ROFR/option to purchase, exclusives/co-tenancy in retail, self-subordination issues, rent/renewal economics).
* Environmental RECs and reliance/“staleness” management.

---

## 2. Canonical process map

### 2A. Acquisition baseline (asset purchase)

> Notes
>
> * This is the “how it really runs” operating model: triage early, parallel workstreams, then cure + negotiation + closing checklist, then post-close clean-up.
> * Core artefacts for acquisitions (title commitment, ALTA survey, zoning, environmental, leases) are listed in multiple practice checklists.

| Phase          | Step # | Action (verb-first)                                                                                       | Primary owner                                               | Inputs                                                                                   | Tools/systems                                | Output artefact                                                    | Quality bar / escalation trigger                                                            | Typical failure modes                                                                 |
| -------------- | -----: | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Kickoff        |      1 | Stand up the diligence workspace and tracker (deal facts, deadlines, roles)                               | Senior associate + paralegal                                | LOI/PSA (draft or executed), deal email, data room link                                  | DMS, Excel tracker, shared closing checklist | Diligence tracker + request list v1                                | Escalate if PSA deadlines are tight or diligence scope unclear                              | Tracker not aligned to PSA dates; missing owner for a workstream                      |
| Kickoff        |      2 | Issue initial diligence request list to seller/closing agent                                              | Junior + paralegal                                          | Seller DD index, PSA exhibits                                                            | Word (DD request), email                     | DD request list (Word/PDF)                                         | Escalate if seller refuses key deliverables (leases, surveys, title docs)                   | Vague requests; missing “exception documents” list so title review stalls             |
| Kickoff        |      3 | Order title commitment / pro forma and request all exception documents                                    | Paralegal + title officer                                   | Order form; vesting deed; legal description                                              | Title portal, email                          | Title commitment (Schedule A, B-I, B-II) + exception doc set       | Escalate if commitment legal description/insured estate doesn’t match PSA                   | Underlying easements/CC&Rs not provided; bad/stale legal description                  |
| Kickoff        |      4 | Order ALTA/NSPS survey and transmit title evidence + Table A specs                                        | Senior associate (scope) + paralegal (logistics) + surveyor | Record legal description; **title commitment / title evidence**; Table A items requested | Email; surveyor portal                       | Survey contract + survey instructions + Table A list               | Escalate if property is irregular/portfolio/multi-parcel or boundary risk                   | Surveyor not given title docs so easements not plotted; wrong Table A items requested |
| Kickoff        |      5 | Order Phase I ESA (and plan reliance users: buyer, lender if any)                                         | Senior associate + environmental consultant                 | Site info; access; prior reports                                                         | Consultant portal                            | Phase I ESA engagement + scope                                     | Escalate if intended use is higher-risk (industrial) or prior spills                        | Wrong reliance parties; Phase I too old by closing (needs update)                     |
| Kickoff        |      6 | Order zoning report/letter (or zoning compliance report)                                                  | Senior associate + zoning vendor                            | Property address/parcel; intended use                                                    | Vendor portal                                | Zoning report + exhibits                                           | Escalate if nonconforming use/parking suspected                                             | Municipality delays; report doesn’t cover permits/COs                                 |
| Intake         |      7 | Ingest title commitment and capture key fields                                                            | Junior                                                      | Commitment **Schedule A** and **Schedule B-II**                                          | DMS; Excel                                   | Title summary sheet + exception table skeleton                     | Escalate if vesting, insured estate, or legal description conflicts                         | Missed Schedule B-I requirements; missed legal description mismatch                   |
| Intake         |      8 | Ingest exception documents and summarise each recorded instrument                                         | Junior + paralegal                                          | Recorded easements, CC&Rs, plats, REAs, mortgages, etc                                   | PDF tools; Excel                             | Exception abstract table (instrument, burden/benefit, key clauses) | Escalate if access/parking/utility easements restrict operations                            | Missing exhibits/attachments; illegible scans; unrecorded side agreements             |
| Intake         |      9 | Ingest survey draft v1 and reconcile to title                                                             | Senior associate                                            | Survey draft; title commitment; exception docs                                           | PDF markup; survey comment log               | Survey comment memo + delta list                                   | Escalate if encroachment, boundary overlap, gores/gaps                                      | Survey cert missing; easements not shown; monumentation missing                       |
| Intake         |     10 | Ingest leases + rent roll and build lease abstract matrix                                                 | Junior + paralegal                                          | Leases, amendments, rent roll                                                            | Excel abstract matrix                        | Lease abstract matrix v1 + missing-docs list                       | Escalate if major tenant docs missing or amendments absent                                  | Missing amendments/side letters; rent roll not supported by leases                    |
| Review         |     11 | Triage title exceptions into: cure vs insure/endorse vs accept                                            | Senior associate (partner for hard calls)                   | Exception table; commitment B-II                                                         | Excel tracker; Word memo                     | Title issues list + proposed cure/endorsement strategy             | Escalate for (a) access issues, (b) monetary liens, (c) use restrictions, (d) encroachments | Over-objecting (wastes time) or under-objecting (insurability gaps)                   |
| Review         |     12 | Identify Schedule B-I requirements and assign owners to satisfy them                                      | Paralegal + junior                                          | Commitment **Schedule B Part I (Requirements)**                                          | Closing checklist                            | Requirements checklist (payoffs, releases, affidavits)             | Escalate if any requirement is outside seller’s control                                     | Requirements tracked too late; payoffs not ordered early                              |
| Review         |     13 | Review survey against title: access, easements, encroachments, legal description fit                      | Senior associate                                            | Survey; title docs                                                                       | PDF markup                                   | Survey issues log (by Table A item / feature)                      | Escalate for encroachment over lines/easements or lack of access                            | Stale survey; survey not certified to buyer/lender/title company                      |
| Review         |     14 | Review leases for “value killers” and lender/title concerns                                               | Junior (first pass) + senior (final)                        | Leases; rent roll; PSA                                                                   | Excel + memo                                 | Lease issues list (options, ROFR, exclusives, defaults)            | Escalate if tenant has purchase rights, termination, or major landlord obligations          | Missing ROFR/option; misread operating covenant; missed self-subordination clauses    |
| Review         |     15 | Review zoning report for permitted use, compliance, nonconformity, violations                             | Senior associate                                            | Zoning report; COs/permits                                                               | Memo                                         | Zoning summary + risk flags                                        | Escalate if use not permitted or legal nonconforming risks exist                            | Report scope too thin; open permits/violations missed                                 |
| Review         |     16 | Review Phase I ESA for RECs and action plan (Phase II, indemnity, disclosure)                             | Senior associate + environmental consultant                 | Phase I ESA                                                                              | Memo                                         | Environmental issues list + proposed mitigations                   | Escalate on RECs/contamination, especially for industrial                                   | Reliance not in place; report stale; “REC” not translated into deal terms             |
| Issue spotting |     17 | Draft and send title objection / cure request (and endorsement ask list)                                  | Senior associate                                            | Title issues list; schedule B-II; survey issues                                          | Word; email                                  | Title objection letter + cure tracker                              | Escalate if cure is impossible or requires third-party consent                              | Objection letter too generic; doesn’t cite instrument and requested fix               |
| Cure planning  |     18 | Negotiate curatives with seller + title (releases, subordinations, access agreements)                     | Partner + senior associate                                  | Cure tracker; payoff letters; draft releases                                             | Redlines; closing checklist                  | Executable curative document set                                   | Escalate if cure changes business use (eg, access relocation)                               | Waiting on payoffs; release not recordable; wrong legal description                   |
| Cure planning  |     19 | Request endorsements and compile underwriting support (survey, zoning evidence, etc)                      | Senior associate + title officer                            | Endorsement list; survey; zoning letter/report                                           | Title portal                                 | Endorsement request package                                        | Escalate if endorsement not available in state/underwriter                                  | Missing evidence for endorsement; request mismatched to commitment exceptions         |
| Negotiation    |     20 | Feed diligence findings into PSA negotiations (deliverables, reps, special covenants, closing conditions) | Partner + senior associate                                  | Issue logs; cure plan                                                                    | Word redline                                 | PSA redlines + “diligence-driven asks” memo                        | Escalate if material risk can’t be cured (price/terms need shift)                           | Contract doesn’t match cure reality; estoppel conditions not enforceable              |
| Pre-close      |     21 | Obtain updated title (bring-down/update) and confirm Schedule B-I satisfaction path                       | Paralegal + title officer                                   | Updated commitment; marked requirements                                                  | Title portal                                 | Pre-close title status report                                      | Escalate if new liens/recordings appear late                                                | Last-minute liens; failure to get updated payoff                                      |
| Pre-close      |     22 | Finalise survey (final certs, revisions, Table A completion)                                              | Senior associate + surveyor                                 | Survey final; title updates                                                              | Survey portal                                | Final ALTA/NSPS survey                                             | Escalate if final still shows uncured encroachments                                         | “Final” delivered without requested certification or Table A items                    |
| Pre-close      |     23 | Chase and QC tenant estoppels (and SNDAs if financed)                                                     | Client (chase) + junior (QC) + senior (escalations)         | Estoppel form; leases                                                                    | Tracker                                      | Estoppel tracker + QC notes                                        | Escalate if major tenant refuses or discloses disputes/defaults                             | Wrong form used; estoppel conflicts with lease; signatures missing                    |
| Pre-close      |     24 | Build and circulate closing checklist and signature packs                                                 | Paralegal + senior associate                                | All closing deliverables                                                                 | Closing checklist                            | Closing checklist vN + signature packets                           | Escalate if any CP/condition precedent is unassigned                                        | Checklist not circulated; wrong execution blocks by state                             |
| Close          |     25 | Close: execute, fund, record, and confirm title policy issuance path                                      | Partner + title/escrow + paralegal                          | Deed, assignments, settlement statement, wiring, instructions                            | Closing checklist; escrow/title portal       | Closing statement + executed PDFs + recording submission           | Escalate if “good funds” not received or recording held                                     | Wire fraud risk; recording rejected (format/signatures)                               |
| Post-close     |     26 | Confirm recordation, collect recorded docs, issue policies/endorsements, build closing binder             | Paralegal + junior                                          | Recording receipts; final policies                                                       | DMS                                          | Closing binder/transcript + post-close tickler list                | Escalate if policy/endorsement differs from pro forma                                       | Missing recordings; policy doesn’t include negotiated endorsements                    |

---

### 2B. Financing baseline (commercial mortgage loan)

> Notes
>
> * A financing workflow looks like “title + survey + leases + zoning + environmental + organisational docs”, but with stronger focus on lien priority, lender deliverables, and closing conditions. The PLI “Legal Closing Checklist” is basically a real-world map of the financing diligence and closing file.

| Phase         | Step # | Action (verb-first)                                                                                               | Primary owner                                    | Inputs                                                                                            | Tools/systems     | Output artefact                                                           | Quality bar / escalation trigger                                            | Typical failure modes                                                            |
| ------------- | -----: | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Kickoff       |      1 | Stand up lender/borrower closing checklist aligned to commitment conditions                                       | Lender’s counsel (LC) or borrower’s counsel (BC) | Term sheet/commitment; closing date                                                               | Closing checklist | Closing checklist v1 (loan docs + diligence + org docs)                   | Escalate if commitment CPs are unclear or impossible                        | Checklist not aligned to commitment; missed third-party deliverables             |
| Kickoff       |      2 | Order title commitment/pro forma for mortgagee policy + exception documents                                       | TC + LC/BC                                       | Vesting; legal description                                                                        | Title portal      | Title commitment/pro forma + exception docs + legal description in Word   | Escalate if legal description not in Word or inconsistent                   | Missing exception documents; legal description mismatch                          |
| Kickoff       |      3 | Order ALTA/NSPS survey (lender requirements and Table A items)                                                    | BC + surveyor                                    | Title commitment; record description                                                              | Survey portal     | Survey engagement + Table A list                                          | Escalate if multi-parcel or access easements are complex                    | Survey does not meet lender cert requirements                                    |
| Kickoff       |      4 | Order core lender diligence reports (Phase I, zoning, appraisal, engineering)                                     | Lender (L) / LC                                  | Property info                                                                                     | Vendor portals    | Due diligence orders placed                                               | Escalate on “construction” or special asset complexity                      | Reports arrive too late; scope mismatch                                          |
| Intake        |      5 | Collect leases, rent roll, and plan estoppels and SNDAs                                                           | BC (collection) + LC (forms)                     | Leases; rent roll                                                                                 | Tracker           | Tenant status tracker (lease received, estoppel, SNDA)                    | Escalate if anchor/major tenants won’t sign                                 | Underestimating time to obtain tenant signatures                                 |
| Review        |      6 | Review title exceptions for lender “must-haves” (priority, access, restrictions)                                  | LC + title officer                               | Commitment Schedule B-II; exception docs                                                          | Memo + tracker    | Title objection/cure + endorsement request list                           | Escalate if lien priority or access can’t be insured                        | Assuming endorsement solves a curative that underwriting won’t accept            |
| Review        |      7 | Review survey for encroachments, easement plotting, legal description fit                                         | LC/BC + surveyor                                 | Survey drafts                                                                                     | PDF markup        | Survey issues log + required revisions                                    | Escalate on encroachments and boundary risk                                 | Easements not plotted because title docs not delivered                           |
| Review        |      8 | Review Phase I for lender reliance, staleness, and REC response                                                   | LC + environmental consultant                    | Phase I ESA                                                                                       | Memo              | Environmental conditions memo + required conditions (Phase II, indemnity) | Escalate if stale ESA or RECs are material                                  | No reliance letter; lender relies on stale ESA and loses protections             |
| Review        |      9 | Review zoning compliance report and tie to endorsements/loan covenants                                            | LC                                               | Zoning report; permits/COs                                                                        | Memo              | Zoning risk memo + zoning endorsement support package                     | Escalate if use not permitted                                               | Missing municipal verification letter, endorsement can’t be issued               |
| Review        |     10 | Review leases for lender issues (self-subordination, renewal/termination, ROFR/option)                            | LC/BC                                            | Leases; abstracts                                                                                 | Abstract matrix   | Lease memo for lender + tenant deliverables list                          | Escalate if lease grants purchase rights or termination rights              | Lender only does “limited review” and misses title/marketability issue           |
| Review        |     11 | Gather organisational documentation and authority (good standing, foreign qualification, resolutions, incumbency) | BC                                               | Org chart; entity docs                                                                            | Closing checklist | Organisational docs package + borrower closing cert                       | Escalate if signatory authority is unclear or entity not qualified in state | Missing good standing/foreign qualification; wrong resolution format             |
| Cure planning |     12 | Drive cure work to satisfy title requirements and underwriting (payoffs, releases, subordinations)                | LC/BC + TC                                       | Payoff letters; releases                                                                          | Tracker           | Curative documents (recordable)                                           | Escalate if payoff isn’t updated immediately pre-close                      | Old payoff causes underpayment; release not recorded                             |
| Negotiation   |     13 | Negotiate and finalise loan documents and exhibits                                                                | LC + BC                                          | Note; mortgage/deed of trust; assignment of leases and rents; environmental indemnity; guaranties | Word redlines     | Final loan documents + exhibits                                           | Escalate if diligence findings require bespoke covenants                    | Loan docs not aligned to diligence risks (eg, environmental, lease notices)      |
| Pre-close     |     14 | Finalise closing logistics (escrow/closing instructions, wiring, CPL if applicable)                               | LC + TC                                          | Wiring instructions; escrow instruction letter                                                    | Email; portal     | Closing instructions + settlement statement draft                         | Escalate on “good funds” and wire fraud controls                            | Wiring instructions spoofed; no written instructions control                     |
| Pre-close     |     15 | Collect tenant estoppels and SNDAs and QC them against leases                                                     | BC + LC                                          | Executed estoppels; SNDAs                                                                         | Tracker           | Tenant deliverables package                                               | Escalate on tenant disclosures (defaults, offsets)                          | Estoppel contradicts lease; SNDA not fully executed                              |
| Close         |     16 | Close: execute, fund, record mortgage/UCC, and issue title policy (loan)                                          | LC/BC + TC/escrow                                | Executed docs; settlement statement                                                               | Closing checklist | Closing package + recording submissions                                   | Escalate if recording rejected or gap risk unmanaged                        | Recording rejected for formatting; missing state-specific execution requirements |
| Post-close    |     17 | Post-close: confirm recordation order, obtain final policy + endorsements, deliver closing binder                 | Paralegal + junior                               | Recording receipts; final policies                                                                | DMS               | Closing binder/transcript + post-close agreement list                     | Escalate if final policy differs from pro forma                             | Endorsements missing; policy issued with wrong insured/entity name               |

---

## 3. Diligence question bank and checklist

Format below is designed to be “Copilot checkable”: each question points to a document, and the “evidence” is something you can attach or cite in a memo.

### 3.1 Title + survey

> Core source anchors: ALTA commitment structure; ALTA/NSPS survey inputs; common commercial endorsements; practice checklists listing these artefacts.

| Question counsel answers                                                                           | Typical document(s) that answer it                        | Evidence cited/attached                                       | Typical handling path                                            | Escalation triggers                                                         |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Who is vested owner and what estate is being conveyed/insured?                                     | Title commitment Schedule A                               | Screenshot/quote of Schedule A; vesting deed ref              | PSA reps; deed drafting; title correction                        | Vesting mismatch vs PSA parties; entity name errors                         |
| What are the insurer’s closing conditions (payoffs, releases, affidavits)?                         | Commitment Schedule B Part I (Requirements)               | Requirements checklist with owners and due dates              | Cure work + closing checklist                                    | Any requirement depends on third party (eg, old lender release)             |
| What recorded exceptions will remain on title (easements, CC&Rs, REAs, mineral rights)?            | Commitment Schedule B Part II + exception documents       | Exception table with instrument refs + key terms              | (i) object/cure, (ii) endorse/insure, or (iii) accept/disclose   | Any exception that impairs access, parking, use, or expansion               |
| Are there monetary liens (mortgages, tax liens, mechanics liens)? Can they be released at closing? | Commitment B-II; payoff letters; UCC searches (if entity) | Payoff letter + release form; lien list                       | Cure: payoff + record release; escrow holdback                   | Payoff not updated immediately pre-close; lender unresponsive               |
| Does the legal description “fit” the parcel(s) and match survey?                                   | Commitment legal description + survey                     | Legal description comparison notes; survey match confirmation | Cure: corrected deed/commitment; survey revision                 | “Bad legal description” (doesn’t close / wrong parcel)                      |
| Do we have insured access to a public road (direct or via easement)?                               | Commitment B-II; access easements; survey                 | Map excerpt; easement clause excerpt                          | Cure: access easement; endorsement request                       | No legal access or access is conditional/terminable                         |
| Are easements shown on survey and consistent with record docs?                                     | Survey + title commitment + recorded easements            | “Easements not plotted” list                                  | Survey revision; title/survey reconciliation                     | Survey lacks title info; easements not located/monumented                   |
| Any encroachments (building, fences, parking, improvements) across boundaries or easements?        | Survey (Table A items)                                    | Survey callouts + annotated PDF                               | Cure: boundary agreement, easement, endorsement, risk acceptance | Material encroachment that affects use or lender underwriting               |
| What endorsements are needed and what underwriting evidence is required?                           | Endorsement list/guides; survey; zoning letter/report     | Endorsements request list + evidence checklist                | Request endorsements; provide zoning/survey evidence             | Endorsement unavailable in that state or requires evidence you can’t obtain |
| Do we need (or want) a closing protection letter and written closing instructions?                 | Closing checklist; title/escrow instructions              | CPL request; instruction letter                               | Negotiated closing process controls                              | Late instruction changes; no written instruction trail                      |

---

### 3.2 Recorded instruments bucket (easements, covenants, restrictions, access, encroachments)

> Core source anchors: title commitment exception docs + survey standards requiring use of record documents; common endorsement practice.

Checklist (practical questions):

* **Easements (benefit/burden):**

  * Does any easement **restrict building area**, parking, signage, access, or utilities?
  * Who maintains, who pays, and are there repair/relocation rights?
  * Is the easement **exclusive** or does it grant third parties broad rights?
    Evidence: exception table row, instrument excerpt, and survey depiction (or note “not plotted”).

* **CC&Rs / REAs:**

  * Are there use restrictions (tenant mix, prohibited uses) that conflict with the business plan?
  * Are there approval rights (architectural/operations) held by a third party?
  * Are there shared cost obligations (CAM-like) that should be modelled?
    Evidence: “key covenant” summary and cite the section.

Handling:

* Usually: object and seek cure if it blocks intended use, otherwise disclose and price.
* Sometimes: request endorsements to insure over certain risks where available, but underwriting will want specific evidence (often survey and sometimes zoning evidence).

---

### 3.3 Leases bucket (abstracts, rent roll, estoppels, SNDAs)

> Core source anchors: PLI closing checklist includes leases, rent roll, tenant estoppels and SNDAs; ABA practice guidance on tenant estoppel letters; ACREL SNDA form as market standard template.

| Question counsel answers                                                         | Typical document(s)                                            | Evidence cited/attached            | Typical handling path                                  | Escalation triggers                                    |   |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ | - |
| Do we have the full lease file (lease + all amendments/side letters)?            | Lease file; seller estoppel package list                       | Missing-docs log                   | PSA deliverable; closing condition                     | Missing amendments for major tenants                   |   |
| Does the rent roll match the leases (base rent, % rent, CAM, term)?              | Rent roll + lease economics clauses                            | Rent roll tie-out worksheet        | PSA adjustment; closing proration; lender underwriting | Rent roll can’t be reconciled; undisclosed concessions |   |
| Any tenant purchase rights or title-affecting rights (ROFR, option to purchase)? | Lease clauses; CT bar guidance for title underwriting concerns | Lease clause excerpt + issue flag  | Must be cleared/waived or accepted as exception        | ROFR/option exists, blocks marketability/insurability  |   |
| Are leases subordinated / self-subordinating?                                    | Lease subordination clause; SNDA                               | Lease clause excerpt               | SNDA / subordination agreement                         | Lease has non-disturbance without lender protections   |   |
| Any termination rights, co-tenancy, exclusives (retail), or early outs?          | Lease; amendments                                              | Lease abstract row + issues memo   | PSA risk allocation; price; estoppel confirmations     | Anchor tenant termination or co-tenancy triggers       |   |
| Are there known defaults, disputes, offsets, or landlord obligations?            | Seller disclosure; estoppel letters                            | Estoppel responses; correspondence | PSA reps; escrow holdback; specific indemnity          | Tenant alleges default/offset in estoppel              |   |
| Are estoppels required (purchase and/or loan)? What form?                        | PSA/loan docs; estoppel form; PLI checklist                    | Estoppel tracker + executed docs   | Condition to closing                                   | Tenant refuses or returns non-conforming estoppel      |   |
| Are SNDAs required (financing, sometimes purchase with assumed debt)?            | Loan closing checklist; SNDA form                              | Executed SNDA + tracker            | Loan condition; lender requirement                     | Key tenant won’t sign SNDA                             |   |

---

### 3.4 Zoning + land use

> Core source anchors: zoning compliance report appears in financing closing checklist; zoning endorsements typically require a zoning report/verification letter; acquisition checklists commonly include zoning certificate/approvals.

Checklist:

* What is the zoning designation and is current/intended use permitted?
* Are improvements compliant (setbacks, height, FAR, parking), or legal nonconforming?
* Any open zoning/building/fire violations (or permit/CO gaps)?
* Do we need a zoning endorsement, and do we have the underwriting evidence?

Handling:

* Often a mix of: covenant/representation in PSA/loan docs, plus endorsement where available, plus risk acceptance if nonconforming but stable.

Needs validation:

* How often your target practice group uses outside zoning vendors vs internal legal analysis varies a lot by firm and deal type.

---

### 3.5 Environmental

> Core source anchors: EPA recognises ASTM-style Phase I to satisfy “all appropriate inquiries” (AAI) for liability defences; lender-focused guidance stresses staleness and reliance letters; financing checklists list Phase I as a core diligence item.

Checklist:

* Do we have a **Phase I ESA** that meets AAI (and is current enough for closing)?
* Any **RECs**? If yes, what is the action plan (Phase II, remediation, indemnity, escrow)?
* Who can rely on the report (buyer, lender)? If the report was commissioned by someone else, do we have a **reliance letter**?
* Does the loan require a standalone **environmental indemnity**? (Common in finance checklists.)

Handling:

* PSA/loan docs: environmental reps, covenants, indemnities, and conditions.
* Operationally: order updates if the report will be stale by closing; track reliance parties explicitly.

---

### 3.6 Entity and signing authority

> Core source anchors: financing closing checklist lists organisational documentation, good standing, foreign qualification, resolutions/incumbency and borrower closing certificate; CLE guidance discusses need for authorising resolutions and incumbency.

Checklist:

* Is the buyer/borrower entity properly formed and in **good standing**?
* If it’s a foreign entity, is it **qualified to do business** in the property state (when required)? (Common checklist item.)
* Are signatories authorised (resolutions/consents, incumbency, secretary’s certificate)?
* Are legal opinions required (formation, authority, enforceability, nonconsolidation for some structures)?

---

### 3.7 Disputes and other risk items (litigation, taxes, utilities, insurance, ADA)

> Source anchors (partial): financing checklists include property tax info and evidence of property/liability insurance; practice materials often carve tax advice out of scope but still track property taxes as a closing item.

Practical checklist (document-grounded):

* **Taxes/assessments:** current tax bills, assessment data, delinquency checks (and proration mechanics).
* **Insurance:** evidence of property/liability insurance, endorsements/requirements per lender.
* **Utilities:** “will-serve” letters show up in construction contexts and some financings.
* **Litigation/claims:** public record searches (financing checklist includes public record searches as organisational documentation).
* **ADA/accessibility:** commonly handled via property condition/engineering consultants rather than pure legal diligence (needs validation by practising teams).

---

### 3.8 Closing outputs

> Core source anchors: closing checklist practice and post-closing follow up are explicit in CLE materials; financing checklist enumerates categories and party responsibilities.

Checklist outputs to track as “must be true at close”:

* All **title requirements** satisfied or waived, and policy/endorsement package matches negotiated pro forma.
* All **recordable instruments** are in recordable form (execution blocks, formatting, state-specific requirements).
* Closing statement/settlement statement finalised and funds disbursed per instructions.
* Post-close: recording confirmed, originals/policies collected, closing binder assembled.

---

## 4. Variations matrix

### 4.1 Deal structure variations (workflow impact)

| Dimension                         | What changes in the workflow                                                                                                                                                                                                                                      | What changes in diligence outputs                                                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Purchase vs Loan                  | Loan diligence adds a lender underwriting layer: mortgagee policy, lien priority focus, organisational documentation, opinions, and a formal lender-driven closing checklist.                                                                                     | More “conditions precedent” artefacts: borrower closing certificate, opinions, CPL (if used), and explicit tenant estoppel/SNDA tracking. |
| Asset purchase vs Entity purchase | Entity deals expand beyond real estate: you need corporate/entity diligence on the target entity (liabilities, UCC, contracts), and title/survey becomes necessary but not sufficient. **Needs validation** for scope by firm (some teams treat this as M&A-led). | Adds deliverables: entity diligence memo, UCC/litigation searches, consents, and sometimes reps/warranties insurance inputs.              |
| Single asset vs Portfolio         | Portfolio work becomes an operations problem: same checks repeated across assets with multi-state variation, and deadlines are driven by the slowest asset (survey, estoppels, municipal letters).                                                                | Output shifts toward standardised matrices: portfolio title exception matrix, lease abstract at scale, per-asset issues heatmap.          |

---

### 4.2 State examples (NY, CA, TX, FL, IL)

Only “workflow changing” differences listed, and each is tied to a concrete artefact or step.

| State      | What meaningfully changes (workflow)                                                                                                                                                               | Practical Copilot implications                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| New York   | **Deed recording package includes Form RP‑5217** when filing a deed with the county clerk.                                                                                                         | Pre-close task node: “Prepare NY RP‑5217” (data extraction from closing docs) and QC fields (tax map identifier formatting etc).                   |
| California | Closing commonly runs through **escrow instructions** that list conditions; escrow closes only when conditions are satisfied, and escrow officer releases funds/docs and records per instructions. | Model “escrow instruction conditions” as structured tasks (each condition has owner, evidence, and completion criteria).                           |
| Texas      | Title/closing practice is tightly linked to Texas-specific title insurance rules and customs around **closing instruction letters** and what escrow/title can commit to.                           | Add a node for “Draft closing instruction letter” and a rule that instructions must not try to create extra-policy coverage (needs lawyer review). |
| Florida    | **Deeds generally require two subscribing witnesses** (with a lease exception), which changes execution QC.                                                                                        | Add state-specific execution checklist: witness lines, remote witnessing rules if used.                                                            |
| Illinois   | When recording a deed/trust document, parties must file **PTAX‑203 with the deed** (or an exemption notation).                                                                                     | Pre-close node: “Prepare IL PTAX‑203 or exemption notation”; validate required attachments and signatures.                                         |

Needs validation (state-level):

* Which states are “attorney closing” vs “escrow/title closing” in CRE is real, but the boundary can be nuanced in commercial deals. For this PoC, I’d operationalise only the differences that show up as required artefacts (like escrow instructions and statutory forms) and validate broader customs with practitioners.

---

## 5. Timeline and parallel work

Below is a realistic sequencing model. Exact turnaround times vary a lot by market, asset type, and vendor capacity, so time ranges are labelled **typical** and should be validated with practising teams.

### 5.1 Acquisition (example: 45–60 day PSA)

Parallel tracks (with dependencies):

**Day 0–3 (Kickoff)**

* Order title commitment + exception docs (Track A).
* Order ALTA/NSPS survey and send title evidence + Table A requirements (Track B).
* Order Phase I ESA (Track C).
* Start lease intake + abstract matrix (Track D).
* Start zoning report/letter (Track E).

**Day 4–14 (First-review window)**

* Receive title commitment and exception docs, populate exception table, triage exceptions.
* Receive survey draft v1 (typical), reconcile to title, issue survey comments.
* Lease abstracts v1 and missing-docs chase.
* Phase I fieldwork + report drafting (typical).
* Zoning vendor work (typical).

**Day 10–25 (Objection + cure planning)**

* Issue title objection/cure letter + endorsement request list.
* Seller/title cure begins (payoffs, releases, subordinations).
* Lease issues fed into PSA and estoppel requirements (if applicable).

**Day 20–45 (Cure + negotiation + pre-close)**

* Updated title (bring-down), confirm cure progress, confirm pro forma policy/endorsements.
* Final survey revisions and certification.
* Chase estoppels (and SNDAs if financed).
* Close checklist runs weekly, then daily.

**Close + 0–30 days post-close**

* Record deed and related instruments; confirm recording order; obtain final title policy/endorsements; assemble closing binder; close out post-close deliverables.

Common bottlenecks (very common in practice):

* Survey revisions when title exception docs arrive late (because survey needs the title evidence).
* Tenant estoppels and SNDAs (signature chase).
* Payoffs/releases (especially if old lenders or recorded lien clean-up).

### 5.2 Financing (example: 60–90 day loan)

Same parallel structure, but lender diligence adds gating:

* Lender diligence reports (Phase I, zoning compliance, appraisal, engineering) are often explicit conditions.
* Organisational docs and opinions can be gating items (and tend to arrive late if not started early).
* Tenant estoppels/SNDAs often become hard CPs for key tenants.

---

## 6. Lawyer deliverables and templates

### 6.1 Title & survey review memo (or title objection letter)

Purpose: document-grounded title risk story + cure strategy.

Outline:

1. Deal snapshot (property, parties, closing date, policy type and amount).
2. Title commitment summary (Schedule A basics, commitment date, proposed insured).
3. Schedule B-I Requirements tracker (what must be satisfied, by whom, by when).
4. Schedule B-II Exceptions table (each exception: instrument ref, type, summary, risk, proposed handling).
5. Survey review (Table A items requested, encroachments, easements plotted vs record, access).
6. Endorsements request list + underwriting evidence checklist.
7. Open items and escalation calls (what needs partner/client decision).

### 6.2 Exception / cure / endorsements tracker (spreadsheet structure)

Suggested columns:

* Exception ID
* Commitment item (B-II item #)
* Instrument type (easement, CC&Rs, mortgage, lease memorandum)
* Recording data (book/page or instrument #, date)
* Affects (access / parking / use / utilities / boundary / monetary lien)
* Proposed disposition (cure / endorse / accept)
* Cure owner (seller, buyer, title)
* Target date
* Evidence received (PDF link)
* Status + comments

(Endorsements tab)

* Endorsement name/number
* Policy type (owner/loan)
* Underwriting evidence required (survey item, zoning letter, etc)
* Requested? Approved? Issued?

### 6.3 Lease abstract matrix + issues log

Lease abstract matrix columns:

* Tenant name; premises; term start/end; renewal options
* Base rent schedule; % rent; CAM/operating expense pass-through
* Use clause; exclusives; co-tenancy; signage
* Assignment/subletting controls; change of control
* Termination rights; go-dark rights (retail)
* Landlord obligations (TI, capex, repairs)
* Default remedies; notice and cure
* Subordination / attornment / SNDA provisions
* ROFR / option to purchase / expansion rights

Issues log columns:

* Issue category (economic, title/marketability, lender)
* Clause cite (section reference)
* What we need (waiver, estoppel disclosure, amendment)
* Who chases it (client vs counsel)

### 6.4 Client diligence memo (acquisition or loan)

Sections (typical):

1. Executive issues summary (top 5 risks and recommended actions)
2. Title and survey
3. Leases and rent roll
4. Zoning and permits
5. Environmental
6. Entity/authority (and opinions if loan)
7. Taxes/insurance and other diligence items
8. Closing conditions and “must-do” list
   Exhibits: exception table, survey issues, lease matrix, key documents.

### 6.5 Closing checklist (what categories sit on it)

A real checklist mirrors these buckets (very close to PLI’s structure):

* Loan documents (note, mortgage/deed of trust, assignment of leases and rents, environmental indemnity, guaranties, UCCs)
* Title insurance and survey (commitment + exception docs; survey; CPL if applicable; settlement statement)
* Other due diligence (Phase I, zoning compliance, appraisals/engineering)
* Tenant status tracker (lease received, estoppel received, SNDA received)
* Organisational documentation (good standing, foreign qualification, resolutions/incumbency)
* Opinion letters (if required)
  And in practice the checklist is actively used to supervise who is doing what, including client-side chases like tenant estoppels.

---

## 7. Copilot-ready “minimum viable” workflows

Goal: smallest workflows that still feel like real diligence, and that are document-grounded and checkable.

### 7.1 Quick start: “Title + Survey”

#### Required input documents (minimum set)

1. Title commitment (PDF), including **Schedule A** and **Schedule B Part I and II**.
2. All exception documents referenced in Schedule B-II (PDFs).
3. ALTA/NSPS survey (draft or final) (PDF).
4. Legal description in editable text (Word). (Often explicitly requested in closing checklists.)
   Optional but high value:

* Pro forma policy / marked commitment; endorsement list; zoning letter/report if seeking zoning endorsement.

#### Fixed question set (Copilot should drive)

* Extract deal facts from Schedule A: proposed insured, estate, property description, policy amount/date.
* From Schedule B-I: list all requirements, classify (payoff, release, affidavit, doc delivery), assign owner.
* From Schedule B-II: for each exception:

  * Identify type (mortgage/lien, easement, CC&Rs, lease memorandum, plat, taxes)
  * Extract recording refs (instrument #, date, book/page)
  * Summarise key burdens/benefits (using exception doc text)
  * Tag risk area (access, parking, use restriction, utility, monetary lien, boundary/encroachment)
* Survey reconciliation:

  * Does survey match legal description?
  * Are all recorded easements shown? (If not, flag “needs surveyor plotting”).
  * Any encroachments or boundary anomalies?
* Output cure/endorsement strategy prompts (not decisions):

  * If monetary lien: “needs payoff + recordable release”
  * If access risk: “needs access easement and/or access endorsement request”
  * If zoning endorsement sought: “needs zoning report/verification letter evidence”

#### Expected outputs (machine-prepared, lawyer-reviewed)

1. **Title exception table** (CSV/Excel)

   * Columns: B-II item #, instrument ref, type, summary, risk tags, proposed disposition, notes
2. **Requirements tracker** (CSV/Excel)

   * Columns: B-I item #, requirement, owner, due date, status
3. **Survey issues list** (table)

   * Columns: issue type, location, reference (sheet/callout), impact, suggested fix
4. **Draft title objection/cure letter** (Word), populated with exception citations and requested action items (lawyer to finalise).
5. **Endorsement request list** with underwriting evidence checklist.

#### What must be lawyer-reviewed vs machine-prepared

Machine-prepared:

* Extraction, classification, summarisation, and first-draft letters/trackers.

Lawyer-reviewed (non-delegable in practice):

* Materiality and negotiation posture (what is “unacceptable”)
* Strategy: cure vs endorse vs accept, and how to paper it in PSA/loan docs
* Final objection letter language and client advice

#### Dependency graph (task-level)

* Parse commitment → request exception docs
* Parse commitment + exception docs → exception table + objections draft
* Provide title evidence to surveyor → survey draft
* Survey draft + title exception docs → survey reconciliation and endorsement evidence pack
* Updated title (bring-down) → final clearance to close

#### Machine-readable workflow spec (JSON)

```json
{
  "workflow_id": "qs_title_survey_v1",
  "name": "Quick Start: Title + Survey",
  "tasks": [
    {
      "id": "t1_ingest_commitment",
      "name": "Ingest title commitment",
      "purpose": "Extract Schedule A/B-I/B-II and build trackers.",
      "inputs": ["title_commitment_pdf"],
      "outputs": ["commitment_structured.json", "requirements_tracker.csv", "exceptions_index.csv"],
      "dependencies": []
    },
    {
      "id": "t2_request_exception_docs",
      "name": "Generate exception-document request list",
      "purpose": "Produce a list of all documents needed to review Schedule B-II.",
      "inputs": ["exceptions_index.csv"],
      "outputs": ["exception_doc_request_list.docx"],
      "dependencies": ["t1_ingest_commitment"]
    },
    {
      "id": "t3_ingest_exception_docs",
      "name": "Ingest and summarise exception documents",
      "purpose": "Create per-exception summaries with clause-level citations.",
      "inputs": ["exception_documents_folder"],
      "outputs": ["exception_summaries.json", "exception_table.csv"],
      "dependencies": ["t2_request_exception_docs"]
    },
    {
      "id": "t4_ingest_survey",
      "name": "Ingest survey and extract survey facts",
      "purpose": "Extract legal description, certifications, and key features (access, easements, encroachments).",
      "inputs": ["alta_nsps_survey_pdf"],
      "outputs": ["survey_extract.json"],
      "dependencies": []
    },
    {
      "id": "t5_reconcile_title_survey",
      "name": "Reconcile title exceptions to survey depiction",
      "purpose": "Flag easements not shown, encroachments, and legal description mismatches.",
      "inputs": ["exception_table.csv", "survey_extract.json", "legal_description.docx"],
      "outputs": ["survey_reconciliation_issues.csv"],
      "dependencies": ["t3_ingest_exception_docs", "t4_ingest_survey"]
    },
    {
      "id": "t6_draft_objection_letter",
      "name": "Draft title objection / cure request letter",
      "purpose": "Create a lawyer-editable objection letter with exception citations and requested curatives.",
      "inputs": ["exception_table.csv", "survey_reconciliation_issues.csv"],
      "outputs": ["title_objection_draft.docx"],
      "dependencies": ["t5_reconcile_title_survey"]
    },
    {
      "id": "t7_build_endorsement_request_list",
      "name": "Build endorsement request list and evidence checklist",
      "purpose": "Suggest commonly requested endorsements and required evidence based on exception types and deal facts.",
      "inputs": ["exception_table.csv", "survey_extract.json"],
      "outputs": ["endorsement_request_list.csv"],
      "dependencies": ["t3_ingest_exception_docs", "t4_ingest_survey"]
    }
  ],
  "extracted_fields": {
    "title_commitment": [
      {"field": "schedule_a.proposed_insured", "example": "ABC Acquisitions LLC"},
      {"field": "schedule_a.insured_estate", "example": "Fee Simple"},
      {"field": "schedule_a.policy_amount", "example": "50000000"},
      {"field": "schedule_b1.requirements[]", "example": "Payoff and release of Mortgage recorded as Instrument 2021-12345"},
      {"field": "schedule_b2.exceptions[]", "example": "Easement recorded as Instrument 1999-98765"}
    ],
    "survey": [
      {"field": "certification.parties", "example": ["Buyer", "Lender", "Title Company"]},
      {"field": "table_a.items", "example": ["1", "2", "3", "4", "6a", "6b", "7a", "8", "9", "11a"]},
      {"field": "encroachments[]", "example": "North fence encroaches 0.7ft over boundary line at NW corner"}
    ]
  },
  "escalation_rules": [
    {"if": "exception_table.csv contains type == 'monetary_lien' AND payoff_letter_missing == true", "then": "flag 'closing_blocker' and notify senior associate"},
    {"if": "survey_reconciliation_issues.csv contains issue == 'no_legal_access'", "then": "flag 'partner_review_required'"},
    {"if": "legal_description_mismatch == true", "then": "flag 'stop_draft_deed' and request corrected legal description"}
  ]
}
```

---

### 7.2 Quick start: “Leases”

#### Required input documents (minimum set)

1. Rent roll (Excel/PDF).
2. All leases and amendments (PDF).
3. Estoppel form (if deal requires) and tracking list.
   Optional:

* SNDA form (if financing), for example an ACREL form baseline.

#### Fixed question set

Per lease:

* Parties, premises, term, renewal options
* Base rent and escalations; % rent (if any)
* CAM/operating expenses and caps
* Use clause + prohibited uses
* Exclusives/co-tenancy (retail heavy)
* Termination rights and landlord/tenant remedies
* Assignment/subletting and change of control
* Tenant purchase rights (ROFR/option)
* Subordination/SNDA language and lender notice requirements

Across portfolio/single asset:

* Rent roll tie-out: do lease economics match rent roll?
* Which tenants require estoppels and SNDAs (and by when)?
* Issues list: missing docs, unusual rights, defaults/disputes disclosed in estoppels.

#### Expected outputs

1. Lease abstract matrix (CSV/Excel)
2. Lease issues log (CSV/Excel) with clause citations
3. Estoppel tracker (tenant, form sent, received, conformity QC, issues)
4. Draft “estoppel request package” emails/letters (machine-prepared)
5. If financing: SNDA tracker + draft SNDA package checklist

#### What must be reviewed by a lawyer

* Any clause that affects value/collateral (termination, purchase rights, exclusives/co-tenancy)
* Any tenant dispute/default disclosure and its impact on reps/closing conditions
* Final positions on what must be amended vs accepted

#### Dependency graph

* Ingest leases + rent roll → lease matrix v1
* Lease matrix v1 → identify “key tenants” and required estoppels/SNDAs
* Estoppels returned → issues log + negotiation asks

#### Machine-readable workflow spec (JSON)

```json
{
  "workflow_id": "qs_leases_v1",
  "name": "Quick Start: Leases",
  "tasks": [
    {
      "id": "l1_ingest_rent_roll",
      "name": "Ingest rent roll",
      "purpose": "Extract tenant list and economics for tie-out.",
      "inputs": ["rent_roll_file"],
      "outputs": ["rent_roll_structured.csv"],
      "dependencies": []
    },
    {
      "id": "l2_ingest_leases",
      "name": "Ingest leases and amendments",
      "purpose": "Extract key lease terms and build abstract matrix.",
      "inputs": ["leases_folder"],
      "outputs": ["lease_abstract_matrix.csv", "lease_term_extractions.json"],
      "dependencies": []
    },
    {
      "id": "l3_tie_out_rent_roll",
      "name": "Tie out rent roll to lease terms",
      "purpose": "Flag mismatches between rent roll and lease economics/term data.",
      "inputs": ["rent_roll_structured.csv", "lease_abstract_matrix.csv"],
      "outputs": ["rent_roll_mismatches.csv"],
      "dependencies": ["l1_ingest_rent_roll", "l2_ingest_leases"]
    },
    {
      "id": "l4_build_issues_log",
      "name": "Build lease issues log",
      "purpose": "Identify high-risk rights and missing documents for lawyer review.",
      "inputs": ["lease_term_extractions.json", "rent_roll_mismatches.csv"],
      "outputs": ["lease_issues_log.csv"],
      "dependencies": ["l3_tie_out_rent_roll"]
    },
    {
      "id": "l5_estoppel_tracker",
      "name": "Create tenant estoppel tracker",
      "purpose": "Generate a tracker of estoppel requirements and status.",
      "inputs": ["rent_roll_structured.csv", "lease_abstract_matrix.csv"],
      "outputs": ["estoppel_tracker.csv", "estoppel_request_emails.docx"],
      "dependencies": ["l2_ingest_leases"]
    },
    {
      "id": "l6_snda_tracker_optional",
      "name": "Create SNDA tracker (if financing)",
      "purpose": "Track SNDA status and required tenants.",
      "inputs": ["lease_abstract_matrix.csv", "snda_form_optional"],
      "outputs": ["snda_tracker.csv"],
      "dependencies": ["l2_ingest_leases"]
    }
  ],
  "extracted_fields": {
    "lease": [
      {"field": "tenant_name", "example": "Anchor Grocery LLC"},
      {"field": "premises_description", "example": "Suite 100, 45,000 RSF"},
      {"field": "term_start", "example": "2021-06-01"},
      {"field": "term_end", "example": "2031-05-31"},
      {"field": "renewal_options", "example": "2 x 5-year options"},
      {"field": "base_rent_schedule", "example": "Year 1: $35/RSF; Year 2: $36/RSF"},
      {"field": "termination_rights", "example": "If co-tenancy not met for 180 days, tenant may terminate"},
      {"field": "rofr_option_purchase", "example": "ROFR on sale of shopping centre"},
      {"field": "subordination_clause", "example": "Lease is subordinate to any mortgage; lender may require SNDA"}
    ],
    "rent_roll": [
      {"field": "tenant_name", "example": "Anchor Grocery LLC"},
      {"field": "current_base_rent", "example": "131250.00"},
      {"field": "lease_expiration", "example": "2031-05-31"}
    ]
  },
  "escalation_rules": [
    {"if": "lease_issues_log.csv contains issue_type in ['ROFR', 'Option to Purchase']", "then": "flag 'title_marketability_risk' and notify partner"},
    {"if": "lease_issues_log.csv contains issue_type == 'Termination Right' AND tenant_is_major == true", "then": "flag 'deal_value_risk'"},
    {"if": "rent_roll_mismatches.csv count > 0", "then": "flag 'needs_client_confirmation'"}
  ]
}
```

---

## 8. Sources

Below are the sources used, with what they support.

### Title, survey, endorsements (core)

* American Land Title Association (ALTA), **ALTA Commitment for Title Insurance (2021 v. 01.00)** (shows Schedule A, Schedule B Part I Requirements, Schedule B Part II Exceptions structure). Supports Sections 1–3, 6–7.
* ALTA + National Society of Professional Surveyors (NSPS), **2021 ALTA/NSPS Land Title Survey Standards** (survey request requirements, Table A items, need to provide title commitment/title evidence and record description). Supports Sections 1–3, 5–7.
* ALTA, **Policy Forms and Related Documents (forms library page)** (policy forms governance and access notes). Supports Section 1 framing.
* ALTA, **Common Commercial Endorsements** (presentation on endorsements, evidence requirements like zoning report/verification letter, survey-related guidance). Supports Sections 1–3, 6–7.

### Practice checklists and CLE materials (workflow reality, closing checklists, roles)

* Thompson Coburn LLP, **Due Diligence Checklist for Commercial Real Estate Acquisitions** (lists typical acquisition diligence artefacts: title, survey, zoning, environmental, leases). Supports Sections 1–3, 5–6.
* Maslon LLP (ALI-ABA Practical Real Estate Lawyer), **A Narrative Real Estate Acquisition Due Diligence Checklist** (deal lawyer-oriented diligence steps and artefacts). Supports Sections 1–3, 5–6.
* Dalton & Tomich, PLC, **Land Use Commercial Real Estate Checklist** (practical sequencing for title, survey, environmental and closing). Supports Sections 1–2, 5.
* Practising Law Institute (PLI), **Commercial Real Estate Financing 2017: Legal Closing Checklist** (explicit financing closing checklist: title commitment/proforma, exception docs, survey, Phase I, zoning compliance report, tenant estoppels and SNDAs, organisational docs, opinions). Supports Sections 1–7.
* Jerry Murphy (CLE outline), **Closing Commercial Real Estate Transactions** (closing checklist practice, allocating responsibility like client chasing estoppels, execution/recording QC, post-closing follow up and closing binder). Supports Sections 1–2, 5–6.
* Connecticut Bar Association (materials PDF), **Commercial Real Estate Transactions (2019)** (lease review for lender and title underwriting concerns; post-closing recordation and issuance of owner/mortgagee policies). Supports Sections 2–6.

### Leases, estoppels, SNDAs

* ABA (Probate & Property magazine), **Tenant Estoppel Letters** (practical role of estoppels in transactions). Supports Sections 1, 3, 7.
* American College of Real Estate Lawyers (ACREL), **SNDA form** (market-standard template reference). Supports Sections 1, 3, 7.

### Environmental (Phase I / AAI / reliance)

* US Environmental Protection Agency / Federal Register, **Final rule recognising ASTM E1527-21 for All Appropriate Inquiries (AAI)** (authoritative AAI framework). Supports Sections 1, 3, 5.
* RumbergerKirk (RLF) PDF, **Commercial Real Estate Loans: Environmental Due Diligence for Lenders** (stale ESA and reliance letter issues). Supports Sections 1, 3, 5.

### State-specific workflow artefacts (execution/recording/escrow)

* Florida Legislature (Online Sunshine), **Florida Statutes § 689.01** (two-witness requirement for instruments conveying real property interests, with lease exception). Supports Section 4.
* New York State Department of Taxation and Finance, **RP‑5217 FAQ** (RP‑5217 required with deed at county clerk). Supports Section 4.
* California Department of Real Estate, **Surviving the Real Estate “Escrow” Process in California** (escrow instructions and escrow officer duties; north/south practice differences). Supports Section 4.
* Illinois Department of Revenue, **PTAX‑203 Instructions** (PTAX‑203 filed with deed or exemption notation). Supports Section 4.

---

## 9. Open validation questions for a practising US CRE lawyer

Use these to sanity-check what varies by firm, market, and deal.

1. For acquisitions, at your firm who “owns” title + survey day-to-day (junior, senior, paralegal), and what’s the partner review threshold?
2. What is your standard approach to Schedule B-II triage (categories you always object to vs usually accept)?
3. Which endorsements are “standard asks” in your market for (a) purchases and (b) loans, and which are underwriter-specific?
4. What evidence do your preferred underwriters routinely require for zoning endorsements in your state(s)?
5. Do you always require an ALTA/NSPS survey, or when do you accept existing surveys (and what certifications must be included)?
6. What is your practical rule on “stale” Phase I ESAs at closing (days/months), and do you require updates?
7. For leases: what tenant threshold triggers full abstracts vs “key terms only”? How do you define “major tenant”?
8. In your experience, what are the top 3 clauses that most often create renegotiations (termination rights, co-tenancy, ROFR, something else)?
9. Who actually chases tenant estoppels in your deals (client, broker, counsel), and what’s your escalation playbook when tenants stall?
10. In financings, how often are SNDAs true closing conditions vs “best efforts”, and for which tenants?
11. What is your standard process for title bring-down / last-minute recording risk (“gap”) management in your market?
12. For multi-state portfolios, what do you standardise vs localise (survey specs, endorsement packages, recording packages)?
13. State-specific: are there any recurring recording rejections in your main jurisdictions (formatting, margins, witness/notary blocks)?
14. How do you divide zoning diligence between lawyers and vendors, and what’s the “minimum acceptable” zoning deliverable?
15. What do clients most often misunderstand about title insurance coverage vs what must be cured in the land records?

If you want, I can turn the two JSON workflow specs into a single combined “workflow pack” schema (common task types, document types, and escalation taxonomy) so it plugs straight into your Copilot PoC design without rework.
