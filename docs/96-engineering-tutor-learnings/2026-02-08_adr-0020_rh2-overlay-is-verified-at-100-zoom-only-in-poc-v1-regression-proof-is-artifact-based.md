# ADR-0020: RH2 overlay is verified at 100% zoom only in PoC v1; regression proof is artifact-based

Status: accepted  
Date: 2026-02-07  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
We draw a highlight overlay on top of a PDF page to show exactly what text a citation refers to. If that overlay is even slightly misaligned, it looks precise while being wrong, which is a trust leak.

PoC v1 takes an honest, fail-closed stance: we only treat the overlay as verified at `zoom=100%`. If the user is not at 100%, we hide the overlay and explicitly explain the constraint.

To keep regressions from sneaking in without building brittle pixel-diff tests, we capture proof artifacts for fixture packs: screenshots plus bbox/HUD logs that record what geometry we tried to draw.

Assumption: RH2 is the citation highlight overlay in the viewer, driven by stored geometry (bboxes/polygons).

Inputs/outputs:
- Inputs: rendered page, highlight geometry (bbox/polygon), current zoom level, fixture pack identifier.
- Outputs: overlay rendered (only at 100%) or an explicit "not verified at this zoom" message; regression artifacts (screenshots + bbox/HUD logs).

## Metaphor/analogy (with mapping + where it breaks)
Metaphor: a transparent acetate sheet with a highlighted rectangle, placed over a printed page.

| Metaphor piece | RH2 piece |
| --- | --- |
| Printed page at a fixed size | PDF page rendered at a canonical zoom (100%) |
| Acetate sheet with a rectangle drawn on it | Overlay layer with bboxes/polygons |
| Lining up the sheet perfectly | Correct coordinate mapping and transforms |
| Photocopying the page bigger or smaller | Zooming in or out in the viewer |
| Rectangle no longer matches the words | Overlay misalignment and trust leakage |

Where the metaphor breaks:
- Software zoom includes devicePixelRatio, rounding, rotation, and multiple coordinate spaces (PDF points vs CSS pixels).
- At 100% zoom we are choosing one canonical state where we are willing to claim verification and hold ourselves accountable with artifacts.

## Visual explanation (small ASCII diagram)
```text
                 runtime behavior (PoC v1)

 inputs: page + geometry + zoom
             |
             v
       +-------------+
       | zoom == 100 |---- yes ---> render overlay + HUD
       +-------------+               |
             |                       v
             no                 visible highlight
             |
             v
      hide overlay + show message
    ("Verified at 100% only")

        regression proof (artifact-based)

 [fixture pack] -> [zoom=100 view] -> [screenshot]
                           |
                           +-> [bbox/HUD logs]
```

## Step-by-step breakdown
1. Treat the highlight overlay as a trust feature, not just UI polish.
2. Overlay alignment across zoom/transforms is hard. PoC v1 chooses a single canonical posture to verify: `zoom=100%`.
3. At runtime, check the zoom level. If zoom is exactly 100%, render the overlay. If not, render no overlay and show an explicit message.
4. For regression proof, capture artifacts on fixture packs: screenshots plus bbox/HUD logs.
5. Automation may generate artifacts, but PoC v1 does not require pixel-diff assertions. A human can review the artifacts.

Trade-off:
- Reviewer friction (must go to 100% to inspect overlays) is accepted to avoid the worse failure mode: showing a convincing but wrong highlight.

Failure modes we are preventing:
- Misaligned overlay shown at non-100% zoom that points at the wrong text.
- Quiet regressions in mapping that break overlay alignment without anyone noticing until a demo.

Why this design vs alternatives:
- Render overlay at all zoom levels with a warning: users ignore warnings and still see a precise overlay.
- Full invariance + pixel-diff CI now: expands scope and adds brittle tests before rendering/geometry contracts are stable.
- No live overlay: rejected because the product needs an in-app trust moment, not just internal evidence.

## Common misunderstandings
- "If the overlay is hidden at 125% zoom, the highlight must be wrong." Not necessarily. We are saying we have not proven it, so we fail closed.
- "100% zoom means 1:1 physical pixels." It means the viewer's canonical zoom setting, not a guarantee about monitor DPI.
- "Artifact-based regression proof is the same as automated testing." It is evidence for review, not a CI gate.
- "We can loosen this later by just turning overlays back on." If we do, we must raise the proof bar, or we reintroduce trust leakage.

## Check understanding (teach-back question)
Explain why PoC v1 hides RH2 overlays at any zoom other than 100%, and describe what artifacts we capture to prove we did not regress the 100% overlay behavior over time.

