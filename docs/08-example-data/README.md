# Orbital Copilot PoC — Synthetic Test Data (US CRE Diligence)

This bundle contains eight synthetic diligence packs designed for building/testing a Title + Survey PoC.

Packs:
- pack_01_clean: complete pack (commitment, exceptions, survey, legal description)
- pack_02_missing_rea: REA referenced in the commitment but the instrument PDF is missing (tests missing_input handling)
- pack_03_mismatch_and_cert_gap: legal description mismatch + survey certification missing lender (tests escalation flags)
- pack_04_multi_parcel_complex: multi-parcel Exhibit A + extra access easement + partial release instrument
- pack_05_duplicate_instrument_exhibit_missing: duplicate instrument number across two PDFs + missing Exhibit B inside an easement instrument
- pack_06_noisy_scans_rotated_page: noisy/blurry scans + rotated scanned survey page + “handwritten” note
- pack_07_proforma_only_missing_requirements: pro forma policy only (no formal commitment) + missing Requirements section + leasehold estate
- pack_08_bringdown_update_new_lien: original + bring-down commitment; bring-down adds new judgment lien

Each pack includes:
- docs/   → PDFs + a docx
- layout/ → text bounding boxes + anchor bboxes for highlight testing (for non-scanned PDFs)
- truth/  → expected tables + a small golden question set

Also included at the root:
- packs_summary.csv / packs_summary.md
