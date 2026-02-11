#!/usr/bin/env python3
"""
validate_inputs.py

Normalise an inputs JSON payload for the demo-runbook skill.
Apply defaults and insert TODO placeholders instead of failing.

Usage:
  python scripts/validate_inputs.py < inputs.json > normalised.json

Or:
  python scripts/validate_inputs.py path/to/inputs.json > normalised.json
"""

from __future__ import annotations

import json
import sys
from copy import deepcopy
from typing import Any, Dict, List

TODO = "[TODO]"

DEFAULTS: Dict[str, Any] = {
    "poc_name": TODO,
    "tagline": TODO,
    "audience": TODO,
    "segment": {
        "organisation": TODO,
        "buyer": TODO,
        "end_user": TODO,
    },
    "job_to_be_done": TODO,
    "starting_feelings": "rushed, uncertain, too many tabs, risk-averse",
    "desired_feelings": "confidence, clarity, speed, fewer guesses",
    "scenario": TODO,
    "success_outcome": TODO,
    "business_success_outcome": "[TODO: $ impact or growth/adoption metric + timeframe]",
    "geography": "US",
    "special_feature": {
        "name": "X",
        "what_it_does": TODO,
        "why_it_matters": TODO,
        "citation": "",
        "evidence_note": "Evidence is preliminary.",
    },
    "caveats": [
        "Done with synthetic customer data, including made-up packs.",
        "Segmentation and positioning were not a focus.",
        "This is not production ready.",
        "Goal was to create a mini Orbital Copilot PoC with special feature X (citation optional, otherwise evidence is preliminary).",
        "Focus is only on the US.",
    ],
    "competitors": [],
    "competitor_patterns": [
        "Some approaches optimise for speed and breadth, accepting more variance in grounding.",
        "Some approaches optimise for deterministic workflows, accepting less flexibility.",
        "Some approaches optimise for deep provenance, accepting more complexity and sometimes more latency.",
    ],
    "our_approach_summary": TODO,
    "tradeoffs": [TODO],
    "tech_stack": {
        "frontend": TODO,
        "backend": TODO,
        "llm_provider_and_models": TODO,
        "orchestration": TODO,
        "vector_search_or_db": TODO,
        "storage": TODO,
        "auth_security": TODO,
        "observability": TODO,
        "evals_tooling": TODO,
        "hosting": TODO,
    },
    "architecture": {
        "chosen_option": "RAG + light tool use",
        "options_considered": [
            {
                "name": "Prompt-only",
                "pros": ["Fast to build", "Few moving parts"],
                "cons": ["Weaker grounding", "Harder to keep reliable at scale"],
            },
            {
                "name": "RAG + light tool use",
                "pros": ["Better grounding", "Provenance and safer outputs"],
                "cons": ["More moving parts", "Needs tuning and monitoring"],
            },
        ],
        "rag_details": {
            "what_is_retrieved": TODO,
            "chunking": TODO,
            "retrieval_strategy": TODO,
            "grounding_behaviour": "Cite sources when available, say unknown when not grounded, ask clarifying questions when ambiguous.",
        },
        "citations_policy": "Cite when the answer depends on retrieved context, never fabricate citations, say unknown when not grounded.",
        "evals": {
            "offline_set": TODO,
            "regression": "Run on every prompt, retrieval, or model change.",
            "what_good_means": "Correct when grounded, clarifies when needed, refuses when not grounded, citations match sources.",
        },
        "observability": {
            "tracing": "Capture per-request traces including prompt version, retrieval stats, latency, and cost.",
            "failure_modes": "Log refusals, low-confidence outputs, retrieval misses, user corrections, and escalation triggers.",
        },
        "security_privacy_notes": "Separate secrets from prompts, redact logs, least privilege access, clear data boundaries.",
        "tradeoffs": [TODO],
        "rationale": TODO,
    },
    "app_links": [
        {"label": "Home", "url": TODO, "note": "Entry point"},
        {"label": "Copilot", "url": TODO, "note": "Core query and answer"},
        {"label": "Feature X", "url": TODO, "note": "Wow moment"},
    ],
    "scenarios": [
        {"label": "Happy path", "desc": TODO, "url": TODO, "tag": "pass", "tagLabel": "Happy path"},
        {"label": "Missing input", "desc": TODO, "url": TODO, "tag": "warn", "tagLabel": "Missing input"},
        {"label": "Verification failure", "desc": TODO, "url": TODO, "tag": "fail", "tagLabel": "Fail-closed"},
    ],
    "runbook_visual": {
        # Home title is split to allow italic emphasis for the second token.
        "poc_name_prefix": TODO,
        "poc_name_emphasis": TODO,
    },
    "approach": {
        "problem": TODO,
        "alternatives": [
            {"title": "Manual", "desc": TODO},
            {"title": "Horizontal copilots", "desc": TODO},
            {"title": "Specialised tools", "desc": TODO},
        ],
        "category": {
            "headline": "A different category",
            "one_liner": TODO,
            "explainer": TODO,
        },
        "pillars": [
            {"title": TODO, "desc": TODO},
            {"title": TODO, "desc": TODO},
            {"title": TODO, "desc": TODO},
        ],
        "value": [
            {"strong": TODO, "rest": TODO},
            {"strong": TODO, "rest": TODO},
            {"strong": TODO, "rest": TODO},
            {"strong": TODO, "rest": TODO},
        ],
    },
    "runbook_architecture": {
        "ingestion_title": "Ingestion pipeline",
        "execution_title": "Run execution",
        "citations_title": "Citation verification",
        "deployment_title": "Deployment",
        "mermaid": {
            "ingestion_pipeline": "flowchart LR\n  A[Upload] --> B[OCR +\\nlayout]\n  B --> C[Chunk +\\nembed]\n  C --> D[Index]\n  D --> E[Ready]",
            "run_execution": "flowchart LR\n  A[Retrieve] --> B[Hydrate\\nevidence]\n  B --> C[Draft\\nanswer]\n  C --> D[Lock\\ncitations]\n  D --> E[Verify\\nintegrity]\n  E --> F[Write\\nrow]",
            "citation_verification": "sequenceDiagram\n  participant R as Reviewer\n  participant W as Workspace\n  participant A as API\n  participant V as Viewer\n\n  R->>W: Click citation\n  W->>A: Fetch citation + polygons\n  A-->>W: Locked citation object\n  W->>A: Document render (page N)\n  A-->>V: Signed PDF URL\n  V->>V: Verify hash\n  alt Verified\n    V-->>R: Highlighted passage\n  else Failed\n    V-->>R: Failure + reason\n  end",
            "deployment": "flowchart TB\n  subgraph Web[Web tier]\n    W[Next.js] --> H[Route handlers]\n  end\n  subgraph Worker[Worker tier]\n    O[Orchestration] --> Steps[Retryable steps]\n  end\n  subgraph Data[Data plane]\n    PG[Postgres + pgvector]\n    OBJ[Object storage]\n  end\n  Web --> Data\n  Worker --> Data",
            "state_machine_1": "stateDiagram-v2\n  [*] --> empty\n  empty --> ingesting\n  ingesting --> indexed\n  indexed --> ready\n  ingesting --> failed",
            "state_machine_2": "stateDiagram-v2\n  [*] --> needs_review\n  needs_review --> reviewed\n  [*] --> missing_input\n  [*] --> citation_failed",
        },
        "adrs": [
            {"id": "ADR-01", "text": TODO},
            {"id": "ADR-02", "text": TODO},
        ],
        "state_machines": [
            {"title": "Folder", "which": "state_machine_1"},
            {"title": "Report row", "which": "state_machine_2"},
        ],
    },
    "stack_tiles": [
        {"icon": "◇", "title": "Frontend", "libs": ["Next.js", "React", "Tailwind CSS"]},
        {"icon": "⚙", "title": "Orchestration", "libs": ["TODO"]},
        {"icon": "✨", "title": "AI", "libs": ["TODO"]},
        {"icon": "▢", "title": "Data", "libs": ["Postgres", "pgvector"]},
        {"icon": "□", "title": "OCR", "libs": ["TODO"]},
        {"icon": "○", "title": "Infra", "libs": ["TODO"]},
    ],
    "preflight": {
        "seed_command": "pnpm fixture:seed [TODO] --overwrite",
        "dev_command": "pnpm dev",
        "link_label": "Demo (happy path)",
        "link_desc": TODO,
        "link_url": "http://localhost:3000/[TODO]",
    },
    "runbook_links": [],
    "known_limitations": [
        "Coverage gaps due to synthetic data and limited corpus.",
        "Potential hallucinations if retrieval is weak or prompts are underspecified.",
        "Latency and cost not optimised in this PoC.",
    ],
    "next_steps": [
        "Replace synthetic data with real sources and access control.",
        "Expand eval set and add regression gates.",
        "Harden observability, redaction, and reliability.",
        "Decide what to productionise based on user value and risk.",
    ],
}

def deep_merge(dst: Dict[str, Any], src: Dict[str, Any]) -> Dict[str, Any]:
    for k, v in src.items():
        if k in dst and isinstance(dst[k], dict) and isinstance(v, dict):
            deep_merge(dst[k], v)
        else:
            dst[k] = v
    return dst

def normalise(payload: Dict[str, Any]) -> Dict[str, Any]:
    out = deepcopy(DEFAULTS)
    deep_merge(out, payload)

    seg = out.get("segment")
    if not isinstance(seg, dict):
        seg = deepcopy(DEFAULTS["segment"])
        out["segment"] = seg

    # Back-compat: older inputs used `persona` for the end user.
    persona = out.pop("persona", None)
    if isinstance(persona, str) and persona.strip():
        if seg.get("end_user") in (None, "", TODO):
            seg["end_user"] = persona.strip()

    bso = out.get("business_success_outcome")
    if not isinstance(bso, str) or not bso.strip():
        out["business_success_outcome"] = DEFAULTS["business_success_outcome"]

    sf = out.get("special_feature", {})
    if not isinstance(sf, dict):
        sf = deepcopy(DEFAULTS["special_feature"])
        out["special_feature"] = sf

    citation = (sf.get("citation") or "").strip()
    if citation:
        sf["evidence_note"] = "Citation provided."
    else:
        sf["evidence_note"] = "Evidence is preliminary."

    geo = (out.get("geography") or "").strip()
    out["geography"] = geo if geo else "US"

    caveats = out.get("caveats")
    if not isinstance(caveats, list):
        caveats = deepcopy(DEFAULTS["caveats"])
        out["caveats"] = caveats

    links = out.get("app_links")
    if not isinstance(links, list) or not links:
        out["app_links"] = deepcopy(DEFAULTS["app_links"])
    else:
        norm_links: List[Dict[str, Any]] = []
        for item in links:
            if isinstance(item, dict):
                norm_links.append({
                    "label": item.get("label") or "TODO link label",
                    "url": item.get("url") or TODO,
                    "note": item.get("note") or "",
                })
            else:
                norm_links.append({"label": "TODO link label", "url": TODO, "note": ""})
        out["app_links"] = norm_links

    scenarios = out.get("scenarios")
    if not isinstance(scenarios, list) or not scenarios:
        # If scenarios missing but app_links present, derive a simple scenario list.
        # Keep tags generic; callers can override.
        derived: List[Dict[str, Any]] = []
        for i, item in enumerate(out.get("app_links") or []):
            if not isinstance(item, dict):
                continue
            derived.append(
                {
                    "label": item.get("label") or f"Scenario {i+1}",
                    "desc": item.get("note") or "",
                    "url": item.get("url") or TODO,
                    "tag": "pass",
                    "tagLabel": "Scenario",
                }
            )
        out["scenarios"] = derived if derived else deepcopy(DEFAULTS["scenarios"])
    else:
        norm_scenarios: List[Dict[str, Any]] = []
        for s in scenarios:
            if isinstance(s, dict):
                norm_scenarios.append(
                    {
                        "label": s.get("label") or "TODO scenario",
                        "desc": s.get("desc") or "",
                        "url": s.get("url") or TODO,
                        "tag": s.get("tag") or "pass",
                        "tagLabel": s.get("tagLabel") or "Scenario",
                    }
                )
            else:
                norm_scenarios.append(
                    {"label": "TODO scenario", "desc": "", "url": TODO, "tag": "pass", "tagLabel": "Scenario"}
                )
        out["scenarios"] = norm_scenarios

    stack_tiles = out.get("stack_tiles")
    if not isinstance(stack_tiles, list) or not stack_tiles:
        out["stack_tiles"] = deepcopy(DEFAULTS["stack_tiles"])
    else:
        norm_tiles: List[Dict[str, Any]] = []
        for t in stack_tiles:
            if isinstance(t, dict):
                libs = t.get("libs")
                if not isinstance(libs, list) or not libs:
                    libs = [TODO]
                norm_tiles.append(
                    {
                        "icon": t.get("icon") or "",
                        "title": t.get("title") or TODO,
                        "libs": [str(x) if x is not None else TODO for x in libs],
                    }
                )
            else:
                norm_tiles.append({"icon": "", "title": TODO, "libs": [TODO]})
        out["stack_tiles"] = norm_tiles

    preflight = out.get("preflight")
    if not isinstance(preflight, dict):
        out["preflight"] = deepcopy(DEFAULTS["preflight"])

    rv = out.get("runbook_visual")
    if not isinstance(rv, dict):
        out["runbook_visual"] = deepcopy(DEFAULTS["runbook_visual"])

    ra = out.get("runbook_architecture")
    if not isinstance(ra, dict):
        out["runbook_architecture"] = deepcopy(DEFAULTS["runbook_architecture"])
    else:
        adrs = ra.get("adrs")
        if not isinstance(adrs, list) or not adrs:
            ra["adrs"] = deepcopy(DEFAULTS["runbook_architecture"]["adrs"])

    return out

def read_input() -> Dict[str, Any]:
    if len(sys.argv) > 1:
        path = sys.argv[1]
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    raw = sys.stdin.read().strip()
    if not raw:
        return {}
    return json.loads(raw)

def main() -> int:
    try:
        payload = read_input()
        if not isinstance(payload, dict):
            raise ValueError("Input JSON must be an object at the top level.")
        out = normalise(payload)
        sys.stdout.write(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
        return 0
    except Exception as e:
        sys.stderr.write(f"Error: {e}\n")
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
