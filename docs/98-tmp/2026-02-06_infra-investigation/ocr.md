# OCR/layout extraction options

Date: 2026-02-06

What we need
- Reliable OCR for scanned PDFs.
- Geometry (bounding boxes/polygons) suitable for highlight overlays in pdf.js.
- Consistent per-page text + geometry persisted to `document_pages` (per architecture docs).

## Candidates

### Azure Document Intelligence (Layout)
Pros
- Strong "layout" extraction posture (text + structure + geometry).
- Straightforward API.

Cons
- Azure dependency; pricing is per-page and can add up.

### AWS Textract
Pros
- Mature OCR + structured extraction; good geometry.
- Fits well if you already run on AWS.

Cons
- AWS dependency; pricing per-page.

## Recommendation

Recommended default
- Pick the provider you already have billing + IAM set up for.
- If starting from scratch: default to Azure Document Intelligence (Layout) and keep the interface thin so swapping to Textract is easy later.

Implementation rule (non-negotiable)
- Wrap OCR behind a single adapter interface and return one canonical internal schema (`page_text`, `polygons`, `confidence`, `provider_meta`).

## Sources
- Azure Document Intelligence pricing: https://azure.microsoft.com/en-us/pricing/details/ai-document-intelligence/
- AWS Textract pricing: https://aws.amazon.com/textract/pricing/
- Azure Document Intelligence Layout model: https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/prebuilt/layout?view=doc-intel-4.0.0
- AWS Textract docs: https://docs.aws.amazon.com/textract/latest/dg/what-is.html
