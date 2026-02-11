---
name: product-sense-decision-memo
description: This skill should be used when a user needs to make or communicate a product decision under ambiguity and wants a structured decision memo grounded in motivation, adoption levers, empathy, and bias checks.
---

# Product Sense Decision Memo

## When to use
Trigger this skill when asked to:
- Decide between options or set priorities under ambiguity
- Turn messy notes into a clear recommendation
- Pressure-test a proposal against adoption and user reality

## Inputs to collect (minimum viable)
- State the decision and deadline.
- Name the target user and context.
- Define current behaviour and desired behaviour.
- List constraints (time, team, tech, compliance, brand).

If inputs are missing, list assumptions and proceed.

## Workflow
1) Define the decision
   - Write a one-sentence decision statement.
   - Separate outcomes from outputs.

2) Simulate the user
   - Answer the “two questions” from references/empathy-simulation.md.
   - Identify the struggling moment and the alternative(s).

3) Map motivation and adoption levers
   - Use references/motivation-and-adoption.md to draft:
     - Motivation snapshot
     - Friction list
     - Satisfaction risks
     - Existing nudges

4) Generate options
   - Produce 2–4 options, including “do nothing / wait”.
   - Include at least one sequencing or packaging option (not just UI).

5) Evaluate options
   - Compare options on:
     - Motivation lift
     - Friction removal
     - Anxiety reduction
     - Satisfaction likelihood
     - Feasibility and risk
   - Run a quick bias scan with references/bias-checks.md.

6) Recommend and plan validation
   - Pick a recommendation and justify “why now”.
   - Define success metrics (leading + lagging) and guardrails.
   - Write a 1–2 week validation plan using assets/validation-plan-template.md.

## Output artefacts
- Decision memo (assets/decision-memo-template.md)
- Options comparison table (assets/options-comparison-table.md)
- Validation plan

## Bundled resources
- references/motivation-and-adoption.md
- references/empathy-simulation.md
- references/bias-checks.md
- assets/decision-memo-template.md
- assets/options-comparison-table.md
- assets/validation-plan-template.md

## Example user prompts
- “Should we build self-serve onboarding or start with white-glove onboarding?”
- “Here are messy notes from calls. Turn them into a decision memo + next steps.”
- “We need to pick between A/B/C this week. Make the recommendation and the plan.”
