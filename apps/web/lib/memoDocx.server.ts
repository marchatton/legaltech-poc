import "server-only";

import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
} from "docx";

import { type ListPayloadV0 } from "@legaltech-poc/core";

type RunMeta = {
  id: string;
  index_version: string;
  agent_bundle_version: string;
  question_set_version: string;
};

type FolderMeta = {
  id: string;
  name: string;
};

export type MemoCitation = {
  id: string;
  document_filename: string;
  page_number: number;
};

type MissingInput = {
  question_id: string;
  question: string;
  checklist: string[];
};

function sortCitations(citations: MemoCitation[]): MemoCitation[] {
  return citations
    .slice()
    .sort(
      (a, b) =>
        a.document_filename.localeCompare(b.document_filename) ||
        a.page_number - b.page_number ||
        a.id.localeCompare(b.id),
    );
}

function sourcesLine(citations: MemoCitation[]): string {
  const ordered = sortCitations(citations);
  const parts = ordered.map((c) => `${c.document_filename}:${c.page_number} (${c.id})`);
  return `Sources: ${parts.join("; ")}`;
}

function bullet(text: string, level = 0): Paragraph {
  return new Paragraph({ text, bullet: { level } });
}

function resolveCitations(citationIds: string[], byId: Map<string, MemoCitation>): MemoCitation[] {
  const out: MemoCitation[] = [];
  for (const cid of citationIds) {
    const cit = byId.get(cid);
    if (!cit) {
      throw new Error(`CITATION_NOT_FOUND:${cid}`);
    }
    out.push(cit);
  }
  return out;
}

export async function renderMemoDocx(args: {
  folder: FolderMeta;
  run: RunMeta;
  generatedAt: Date;
  requirements: ListPayloadV0;
  exceptions: ListPayloadV0;
  surveyIssues: ListPayloadV0;
  missingInputs: MissingInput[];
  citationsById: Map<string, MemoCitation>;
}): Promise<Uint8Array> {
  const requirementsItems = args.requirements.items
    .filter((it) => it.kind === "requirements_tracker_item")
    .slice()
    .sort((a, b) => a.bi_item - b.bi_item);

  const exceptionItems = args.exceptions.items
    .filter((it) => it.kind === "exceptions_table_item")
    .slice()
    .sort((a, b) => a.bii_item - b.bii_item);

  const surveyIssueItems = args.surveyIssues.items
    .filter((it) => it.kind === "survey_issue_item")
    .slice()
    .sort((a, b) => a.item_id.localeCompare(b.item_id));

  const paragraphs: Paragraph[] = [];

  paragraphs.push(new Paragraph({ text: "Memo: Title + Survey Summary", heading: HeadingLevel.HEADING_1 }));
  paragraphs.push(
    new Paragraph({
      text: `Generated for ${args.folder.name} (${args.folder.id}).`,
    }),
  );

  paragraphs.push(bullet(`Requirements: ${requirementsItems.length} item(s)`));
  paragraphs.push(bullet(`Exceptions: ${exceptionItems.length} item(s)`));
  paragraphs.push(bullet(`Survey issues: ${surveyIssueItems.length} item(s)`));
  paragraphs.push(bullet(`Missing inputs: ${args.missingInputs.length} item(s)`));

  paragraphs.push(new Paragraph({ text: "Matter metadata", heading: HeadingLevel.HEADING_2 }));
  paragraphs.push(bullet(`Folder: ${args.folder.name} (${args.folder.id})`));
  paragraphs.push(bullet(`Run: ${args.run.id}`));
  paragraphs.push(bullet(`Generated at: ${args.generatedAt.toISOString()}`));
  paragraphs.push(bullet(`Index version: ${args.run.index_version}`));
  paragraphs.push(bullet(`Agent bundle version: ${args.run.agent_bundle_version}`));
  paragraphs.push(bullet(`Question set version: ${args.run.question_set_version}`));

  paragraphs.push(new Paragraph({ text: "Requirements", heading: HeadingLevel.HEADING_2 }));
  if (!requirementsItems.length) {
    paragraphs.push(bullet("(none)"));
  } else {
    for (const it of requirementsItems) {
      paragraphs.push(bullet(`B-I ${it.bi_item}: ${it.requirement} (Owner: ${it.owner}; Status: ${it.item_status})`));
      if (it.notes && it.notes.trim()) paragraphs.push(bullet(`Notes: ${it.notes.trim()}`, 1));
      if (it.citation_ids.length) {
        const cits = resolveCitations(it.citation_ids, args.citationsById);
        paragraphs.push(bullet(sourcesLine(cits), 1));
      }
    }
  }

  paragraphs.push(new Paragraph({ text: "Exceptions", heading: HeadingLevel.HEADING_2 }));
  if (!exceptionItems.length) {
    paragraphs.push(bullet("(none)"));
  } else {
    for (const it of exceptionItems) {
      const recorded = it.recorded_date ? `; Recorded: ${it.recorded_date}` : "";
      const inst = it.instrument_no ? `; Instrument: ${it.instrument_no}` : "";
      paragraphs.push(
        bullet(
          `B-II ${it.bii_item}: ${it.type} (${it.item_status}; match: ${it.match_status}${recorded}${inst})`,
        ),
      );
      if (it.notes && it.notes.trim()) paragraphs.push(bullet(`Notes: ${it.notes.trim()}`, 1));
      if (it.citation_ids.length) {
        const cits = resolveCitations(it.citation_ids, args.citationsById);
        paragraphs.push(bullet(sourcesLine(cits), 1));
      }
    }
  }

  paragraphs.push(new Paragraph({ text: "Survey issues", heading: HeadingLevel.HEADING_2 }));
  if (!surveyIssueItems.length) {
    paragraphs.push(bullet("(none)"));
  } else {
    for (const it of surveyIssueItems) {
      const code = it.issue_code ? ` (${it.issue_code})` : "";
      paragraphs.push(bullet(`${it.issue_type}${code}: ${it.description}`));
      if (it.impact && it.impact.trim()) paragraphs.push(bullet(`Impact: ${it.impact.trim()}`, 1));
      if (it.suggested_fix && it.suggested_fix.trim()) paragraphs.push(bullet(`Suggested fix: ${it.suggested_fix.trim()}`, 1));
      if (it.citation_ids.length) {
        const cits = resolveCitations(it.citation_ids, args.citationsById);
        paragraphs.push(bullet(sourcesLine(cits), 1));
      }
    }
  }

  paragraphs.push(new Paragraph({ text: "Missing inputs", heading: HeadingLevel.HEADING_2 }));
  if (!args.missingInputs.length) {
    paragraphs.push(bullet("(none)"));
  } else {
    for (const row of args.missingInputs) {
      paragraphs.push(bullet(`${row.question_id}: ${row.question}`));
      for (const item of row.checklist) paragraphs.push(bullet(item, 1));
    }
  }

  // Optional: evidence index. Keep it deterministic and lightweight.
  const usedCitationIds = new Set<string>();
  for (const it of requirementsItems) for (const cid of it.citation_ids) usedCitationIds.add(cid);
  for (const it of exceptionItems) for (const cid of it.citation_ids) usedCitationIds.add(cid);
  for (const it of surveyIssueItems) for (const cid of it.citation_ids) usedCitationIds.add(cid);
  const usedCitations = Array.from(usedCitationIds)
    .map((cid) => args.citationsById.get(cid) ?? null)
    .filter((c): c is MemoCitation => Boolean(c));

  if (usedCitations.length) {
    paragraphs.push(new Paragraph({ text: "Evidence index", heading: HeadingLevel.HEADING_2 }));
    for (const cit of sortCitations(usedCitations)) {
      paragraphs.push(bullet(`${cit.document_filename}:${cit.page_number} (${cit.id})`));
    }
  }

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  return new Uint8Array(buf);
}

