## RH2: pdf.js coordinate spaces and the mapping you actually want

You’ve already got the right instinct in the packet: anchors-first, fixture-driven, and **fail closed** if we can’t prove alignment. RH2 is mainly about making sure we never “almost highlight” and accidentally create false trust.

### The 4 coordinate spaces that get people

1. **PDF user space (a.k.a. PDF points)**

* Units are “points” (1/72 inch).
* Origin is **bottom-left**.
* Y axis goes **up**.
* Page size / crop is represented as a `viewBox` like `[xMin, yMin, xMax, yMax]`.

2. **PageViewport space (pdf.js viewport)**

* Created via `page.getViewport({ scale, rotation })`.
* Has:

  * `viewport.width`, `viewport.height` in **CSS pixels** at the chosen scale.
  * `viewport.transform` a 2D transform matrix mapping **PDF points → viewport CSS pixels**.
  * helper fns like `viewport.convertToViewportPoint(xPdf, yPdf)` and `convertToViewportRectangle`. ([DeepWiki][1])
* Crucially, the viewport accounts for scale + rotation and also flips the coordinate system so top-left behaves like canvas/CSS. ([mozilla.github.io][2])

3. **Canvas backing store pixels (device pixels)**

* For sharp rendering, pdf.js commonly does:

  * `canvas.width = viewport.width * devicePixelRatio`
  * `canvas.style.width = viewport.width`
* So the drawing buffer is bigger than its CSS box. That is correct. ([mozilla.github.io][2])

4. **DOM/CSS overlay space**

* Your overlay `<div>`/`<svg>` is positioned in **CSS pixels**.
* If your overlay is aligned to the canvas *CSS size*, you must use `viewport.width/height` (not `canvas.width/height`).

### Rotation, the “gotcha”

`page.getViewport`’s `rotation` parameter defaults to the page’s built-in rotation if omitted. But **if you pass rotation explicitly**, you’re overriding it, so you must include the built-in page rotation in your “total rotation” if you want “what the user sees”. ([comme4000.blob.core.windows.net][3])

Practical rule:

* If you **never** pass `rotation`, pdf.js uses the page’s intrinsic rotation automatically.
* If you **do** pass `rotation`, do `rotation: (page.rotate + userRotation) % 360` (or equivalent).

### The correct mapping: anchor polygons → CSS pixels (zoom + rotation safe)

Your API example polygons look normalised (`0.1`, `0.2`, etc). That’s good for fixture anchors too. The cleanest “anchors-first” spec that stays stable across page sizes is:

* **Store anchor/citation polygons as normalised page coordinates in [0..1], origin top-left, relative to the unrotated page viewBox.**

  * `xNorm = 0` is left edge, `xNorm = 1` is right edge.
  * `yNorm = 0` is top edge, `yNorm = 1` is bottom edge.

Then at render time:

1. Build the viewport for the current zoom/rotation:

* `const viewport = page.getViewport({ scale, rotation: totalRotation })`

2. Convert each normalised point `(xNorm, yNorm)` into **PDF points** `(xPdf, yPdf)` using the page `viewBox`:

* `xPdf = xMin + xNorm * (xMax - xMin)`
* Because your normalised Y is top-left but PDF Y is bottom-left:

  * `yPdf = yMax - yNorm * (yMax - yMin)`

3. Convert PDF points to viewport CSS pixels:

* `[xCss, yCss] = viewport.convertToViewportPoint(xPdf, yPdf)`

4. Render the polygon in an overlay that is exactly `viewport.width × viewport.height` CSS pixels, positioned at `top:0, left:0` over the canvas.

Under the hood, `convertToViewportPoint` is basically applying the viewport transform matrix:

* `xCss = a*xPdf + c*yPdf + e`
* `yCss = b*xPdf + d*yPdf + f`
  where `[a,b,c,d,e,f] = viewport.transform` (rotation + scale + flip + offset). ([mozilla.github.io][2])

#### Minimal TS-ish mapping util (anchors-first)

(Keep this as a pure function so it can live in `packages/core` and be unit tested.)

```ts
type Vec2 = [number, number]; // [x, y]
type Polygon = Vec2[];        // closed or not, doesn't matter for drawing

type ViewBox = [number, number, number, number]; // [xMin, yMin, xMax, yMax]

function normToPdfPoint([xN, yN]: Vec2, viewBox: ViewBox): Vec2 {
  const [xMin, yMin, xMax, yMax] = viewBox;
  const w = xMax - xMin;
  const h = yMax - yMin;

  const xPdf = xMin + xN * w;
  const yPdf = yMax - yN * h; // top-left normalised → bottom-left PDF

  return [xPdf, yPdf];
}

function polygonNormToViewportCss(
  polygon: Polygon,
  viewport: {
    viewBox: ViewBox;
    convertToViewportPoint(x: number, y: number): Vec2;
  }
): Polygon {
  return polygon.map((pN) => {
    const [xPdf, yPdf] = normToPdfPoint(pN, viewport.viewBox);
    return viewport.convertToViewportPoint(xPdf, yPdf);
  });
}
```

If later you decide to store polygons directly in PDF points (totally valid), you drop the `normToPdfPoint` step and just call `convertToViewportPoint`.

### What “correct” looks like at zoom

If the overlay is in viewport CSS pixels, then:

* At 50% (scale 0.5), your mapped CSS points should be ~half of the 100% values.
* At 150% (scale 1.5), they should be ~1.5×.
  Any systematic drift that scales with `devicePixelRatio` means you’re accidentally mixing CSS pixels with backing-store pixels. ([mozilla.github.io][2])

---

## Minimal Next.js App Router architecture (clean boundaries, server-first)

This stays aligned with:

* “viewer is client” (pdf.js is imperative interop)
* “server-first fetching”
* “Zod at boundaries”
* “citation locking + fail closed”
  from your `apps/web/AGENTS.md` and the Trust ADRs.

### Routes (UI)

**Matter detail (report table + citation chips)**

* `app/(app)/matters/[folderId]/page.tsx` (Server Component)

  * fetch folder + docs + seeded report rows (server)
  * render citation chips as `<Link>` to the viewer (no client data fetch needed)

**Viewer**

* `app/(app)/viewer/[documentId]/page.tsx` (Server Component)

  * reads `searchParams`:

    * `page=12`
    * `citation=cit_123` (optional)
    * `zoom=1` (optional for debugging)
  * server-fetch:

    * `render_url` (signed PDF URL) using your render contract (`GET /documents/:id/render?page=N`)
    * if `citation` present: `GET /citations/:id` for locked polygons/snippet/hash
  * passes the minimal props into a client viewer

### Components

**Client**

* `PdfViewerClient` (`"use client"`)

  * owns:

    * pdf.js document load
    * current page, zoom, rotation state
    * imperative rendering to canvas
  * emits:

    * `viewport` object for current page render
    * a stable `pageContainerRef` to attach overlays

* `PdfPageCanvas` (internal to `PdfViewerClient`)

  * renders the page to `<canvas>`
  * sets `canvas.style.width/height = viewport.width/height` (CSS px)
  * sets `canvas.width/height = viewport.width/height * devicePixelRatio` (backing store) ([mozilla.github.io][2])

* `HighlightOverlaySvg`

  * receives:

    * `viewport` (or just `viewport.width/height` + `convertToViewportPoint` + `viewBox`)
    * `citation.polygons`
  * computes CSS points using the pure mapping util
  * renders `<svg width={viewport.width} height={viewport.height}>` absolutely positioned at (0,0) over the canvas

**Server**

* Data access helpers (db, storage signing) are `server-only`
* Route handlers validate inputs with Zod and return the safe error envelope (`docs/03-architecture/50_api_surface.md`)

### Route handlers (API contract preserved)

Use route groups so the API paths can match your spec without polluting the UI tree:

* `app/(api)/citations/[id]/route.ts` → `/citations/:id`
* `app/(api)/documents/[id]/render/route.ts` → `/documents/:id/render`
* etc.

### Fail-closed behaviour in the viewer (important)

If a citation is present in the URL but:

* doc id mismatch
* page out of range
* polygons invalid (NaNs, empty, outside [0..1] if that’s your spec)
* render_url unavailable

Then:

* **do not draw a “best effort” overlay**
* show an explicit “citation_failed” panel (or at spike stage, a clear error block) and log a safe failure event.

That matches ADR-0002 and avoids accidental trust leakage.

---

## RH2 spike plan (anchors-first) with pass/fail checks + evidence capture

You want this to look like a fixture-backed mini-eval, not a vibes-based demo.

### Setup: pick fixtures

Minimum set (matches your success criteria and risk register):

* `pack_01_clean`: one commitment PDF page anchor + one survey PDF page anchor
* `pack_07_scans_rotated_low_quality`: at least one rotated/scanned anchor (even if the anchor is coarser)

### Build a dedicated spike harness page

Create a dev-only route:

* `app/(app)/__spikes/rh2-overlay/page.tsx`

  * gated behind `process.env.NODE_ENV === "development"` so it doesn’t ship accidentally

UI controls:

* pack selector (01 vs 07)
* document selector (commitment vs survey)
* page number selector
* anchor selector (anchor id from `*.anchors.json`)
* zoom buttons: 50%, 100%, 150%
* rotation toggle: 0/90/180/270 (even if you don’t ship rotation controls later, this catches page.rotate edge cases)

And a debug HUD overlay that prints:

* pack/doc/page/anchor id
* `scale`, `totalRotation`
* `viewport.width/height`
* `canvas.width/height` and `canvas.style.width/height`
* `devicePixelRatio`

### Step-by-step execution

1. **Wire pdf.js render (no overlay yet)**

* Render a single page at `scale=1`.
* Confirm:

  * canvas CSS size equals `viewport.width/height`
  * canvas backing store equals `viewport.width/height * dpr`

Evidence:

* screenshot of the spike harness with the debug HUD visible

2. **Load anchors (fixtures) and draw overlay at 100%**

* Parse `*.anchors.json`
* Draw the selected polygon in an SVG overlay
* Confirm visual alignment (manual check) on the chosen clause

Pass/Fail (100%):

* Pass if the polygon cleanly covers the clause (no consistent offset)
* Fail if it is mirrored, flipped vertically, or offset by a fixed amount (usually origin mismatch)

Evidence:

* screenshot at 100% for each doc (commitment + survey)

3. **Zoom invariance test (50% and 150%)**
   For each anchor test case:

* Set zoom to 50%
* Capture screenshot
* Set zoom to 150%
* Capture screenshot
* Toggle back to 100% (this catches state drift bugs)

Pass/Fail (zoom):

* Pass if:

  1. overlay stays glued to the same clause across 50/100/150 (visual)
  2. and the measured geometry scales correctly:

     * `overlayBBoxAt50 ≈ overlayBBoxAt100 * 0.5` (within ~1–2 CSS px)
     * `overlayBBoxAt150 ≈ overlayBBoxAt100 * 1.5` (within ~1–2 CSS px)

How to measure `overlayBBox`:

* compute min/max x/y from mapped CSS points
* log the bbox to console and render it in the HUD as numbers

Evidence:

* 3 screenshots per case: 50/100/150
* plus a small JSON log file dump (or copy/paste) with bbox numbers

4. **Rotation test (especially pack_07)**

* Render the rotated/scanned doc page
* Apply rotation control (or just ensure you’re respecting `page.rotate`)
* Confirm overlay still lands in the right place

Pass/Fail (rotation):

* Pass if the highlight remains correct after rotation changes
* Fail if the highlight only works at rotation=0 or only when you omit rotation

Evidence:

* screenshot for rotation=0 and rotation=90 (or whatever reproduces the pack_07 behaviour)

5. **Fail-closed tests (deliberate break)**
   Inject one deliberate bad anchor:

* out-of-range points (like `[-0.2, 1.3]`)
* wrong page number

Pass/Fail (fail-closed):

* Pass if overlay does not render and you show an explicit failure state
* Fail if you render something anyway

Evidence:

* screenshot of failure UI + the logged error code

### Capturing evidence (recommended)

Two options, pick one:

**Option A: fast/manual (good enough for a spike)**

* Chrome DevTools → “Capture node screenshot” of the page container at each zoom
* Paste into `docs/97-throwaway/spike-evidence/rh2/`
* Add a tiny `rh2_results.md` with the screenshot filenames + the HUD values

**Option B: automated (preferred, fixture-driven)**

* Use Playwright to script:

  * open spike URL
  * select pack/doc/page/anchor
  * set zoom 50/100/150
  * take screenshots to `docs/97-throwaway/spike-evidence/rh2/*.png`
* Also write `metrics.json` containing the HUD values and bbox logs.

This turns RH2 from “we think it works” into something you can regression-check later when OCR geometry replaces fixtures.

---

## Common pitfalls (and what they look like when they bite)

### 1) devicePixelRatio confusion

Symptom:

* overlay is consistently offset or scaled wrong on Retina screens only

Cause:

* using `canvas.width/height` (device pixels) as if they were CSS pixels

Fix:

* overlay sizes/coordinates must be based on `viewport.width/height` and `convertToViewportPoint`, which operate in viewport/CSS units, not backing-store pixels. ([mozilla.github.io][2])

### 2) Top-left vs bottom-left origin mismatch

Symptom:

* overlay appears vertically flipped

Cause:

* treating normalised Y as bottom-left when it was authored as top-left (or vice versa)

Fix:

* pick one canonical spec (I’d pick “top-left normalised”) and do the explicit `yPdf = yMax - yNorm*h` conversion.

### 3) Ignoring non-zero viewBox origins

Symptom:

* overlay is offset by a constant amount on some PDFs but not others

Cause:

* assuming viewBox starts at (0,0)

Fix:

* always use `[xMin,yMin,xMax,yMax]` from the viewBox, not just width/height.

### 4) Page rotation being overridden accidentally

Symptom:

* highlight works on normal PDFs but fails on rotated scans
* or it works until you add a rotation control

Cause:

* passing `rotation` to `getViewport` without including the page’s built-in rotation

Fix:

* either omit rotation and let pdf.js default it, or compute `totalRotation` explicitly. ([comme4000.blob.core.windows.net][3])

### 5) CSS transforms applied to the page container

Symptom:

* overlay drifts as you zoom because the canvas is being CSS-scaled but overlay is recomputed (or vice versa)

Fix:

* pick one zoom strategy:

  * re-render at the new scale and recompute overlay from the new viewport (simplest)
  * or CSS-scale the whole page container and do not recompute overlay (harder to keep crisp)

### 6) Mixing pdf.js “viewer” layers vs custom rendering

Symptom:

* alignment works in a minimal demo but breaks when you integrate text layer / selection / scroll container

Cause:

* pdf.js viewer has its own scaling and transforms for canvas/text/annotation layers

Fix:

* for RH2 spike, keep it custom and single-page.
* if you later adopt pdf.js viewer classes, attach the overlay inside the page div that pdf.js transforms, so it inherits transforms.

### 7) Browser zoom and DPI scaling edge cases

There are open reports where coordinate conversions appear off under certain DPI scaling scenarios and versions. So treat browser zoom and OS scaling as part of your “known limitations” list for the PoC until you test it. ([GitHub][4])

---

## Two fallback cuts/patches if overlay alignment gets gnarly but you still need a trust moment

These both preserve the “don’t lie with highlights” principle.

### Fallback 1 (Cut): “Evidence mode” locks zoom to 100% for citations

Behaviour:

* normal viewer can zoom freely
* but when a citation is active (user clicked a chip), you snap to **100%** and disable zoom (or show “Highlight only verified at 100%” and require reset)

Why it works:

* you remove the zoom invariance requirement while still delivering click-to-highlight
* it’s honest and fail-closed (no pretending it works at other zoom levels)

How to message it:

* “Highlight alignment is only verified at 100% zoom in this PoC. Reset zoom to inspect evidence.”

### Fallback 2 (Patch): Evidence crop card (render-and-crop instead of overlay alignment)

Behaviour:

* when a citation is selected:

  * you render the page offscreen at a fixed scale (say 2.0)
  * map polygon → viewport CSS coords
  * compute bbox, crop the rendered canvas to that bbox
  * show a **cropped image** of the clause next to the PDF, plus snippet + snippet_hash

Why it works:

* the trust moment becomes “here is the exact clause image + hash”, which is very legible
* you’re no longer fighting perfect overlay synchronisation with scroll/zoom/rotation in the main viewer
* if cropping fails, you fail closed and show an explicit error

And it still respects citation locking:

* you’re using the locked polygon + snippet/hash, not re-deriving evidence from the PDF text layer.

---

If you implement the mapping exactly as above (normalised top-left → PDF points via viewBox → `convertToViewportPoint`) and keep overlay space in CSS pixels, RH2 usually becomes “boring maths” rather than a rabbit hole. The rest of the work is mostly about not letting any hidden CSS transforms or DPR scaling sneak in.

[1]: https://deepwiki.com/mozilla/pdf.js/3.7-display-utilities "https://deepwiki.com/mozilla/pdf.js/3.7-display-utilities"
[2]: https://mozilla.github.io/pdf.js/examples/ "https://mozilla.github.io/pdf.js/examples/"
[3]: https://comme4000.blob.core.windows.net/cnts/pdf.js-gh-pages/api/draft/PDFPageProxy.html "https://comme4000.blob.core.windows.net/cnts/pdf.js-gh-pages/api/draft/PDFPageProxy.html"
[4]: https://github.com/mozilla/pdf.js/issues/20604 "https://github.com/mozilla/pdf.js/issues/20604"
