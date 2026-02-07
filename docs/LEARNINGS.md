# Learnings

## 2026-02-06: PoC infra defaults (early)
- Prefer a single deployment posture early (single VM) to reduce integration bugs across networks.
- Keep provider choices reversible with thin adapters: OCR provider, object storage, and LLM access should all be behind small interfaces.
- Introduce gateways/proxies only when they remove real friction; every extra layer makes debugging and determinism harder.

## 2026-02-07: pdf.js overlay alignment (anchor polygons -> viewport CSS pixels)
- Distinguish coordinate spaces: PDF user space (points, origin bottom-left), pdf.js viewport (CSS px, scale/rotation), canvas backing store (device px), DOM/CSS overlay (CSS px).
- Keep overlays in viewport CSS pixels: size overlay to `viewport.width/height` and map points with `viewport.convertToViewportPoint` (avoid mixing in `devicePixelRatio` via `canvas.width/height`).
- If storing polygons normalized `[0..1]` with origin top-left, convert to PDF points with viewBox and Y inversion: `yPdf = yMax - yNorm * (yMax - yMin)`.
- If passing explicit rotation to `getViewport`, include page intrinsic rotation (`page.rotate`) or omit rotation to let pdf.js handle it.
