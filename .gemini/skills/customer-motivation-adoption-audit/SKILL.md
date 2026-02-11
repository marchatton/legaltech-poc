---
name: customer-motivation-adoption-audit
description: This skill should be used when a user needs to diagnose low adoption, activation, retention, or churn by mapping motivation, friction, nudges, and satisfaction into prioritised interventions and experiments.
---

# Customer Motivation and Adoption Audit

## When to use
Trigger this skill when asked to:
- Diagnose low adoption, activation, retention, or feature usage
- Create a friction log and prioritised fixes
- Design experiments that shift behaviour

## Inputs to collect
- Define the adoption event and segment.
- Provide baseline metrics and timeframe.
- Describe the current flow and entry points (nudges).
- Paste evidence (tickets, quotes, funnel, recordings notes).

## Workflow
1) Define adoption precisely
   - Write a crisp adoption event definition.
   - Choose the segment(s) to analyse first.

2) Build the adoption map
   - Use references/motivation-and-adoption.md to map:
     - Motivation snapshot
     - Friction list
     - Satisfaction risks
     - Intrinsic vs extrinsic nudges

3) Create a friction log
   - Walk the user path step-by-step.
   - Log each friction as: Step → Expectation → Reality → Why hard → Evidence → Fix idea.
   - Use assets/friction-log-template.csv.

4) Generate interventions
   - Propose fixes across levers:
     - Increase motivation
     - Reduce friction
     - Reduce anxiety / increase reassurance
     - Increase satisfaction
     - Add/align nudges
   - Include at least one non-UI fix (policy, packaging, comms, distribution).

5) Prioritise and plan experiments
   - Rank by adoption impact and speed to learn.
   - Write experiment briefs using assets/experiment-backlog-template.csv.

6) Define measurement
   - Specify leading indicators, lagging indicators, and guardrails.
   - Define a learn-fast cadence (weekly review).

## Output artefacts
- Adoption audit report (assets/adoption-audit-template.md)
- Friction log table
- Prioritised experiment backlog

## Bundled resources
- references/motivation-and-adoption.md
- references/biases-in-usage.md
- assets/friction-log-template.csv
- assets/adoption-audit-template.md
- assets/experiment-backlog-template.csv

## Example user prompts
- “Activation is down. Diagnose and propose experiments.”
- “Nobody uses this feature. Explain why and what to change.”
- “Create a friction log for signup → onboarding and prioritise fixes.”
