import { readFile, writeFile } from "node:fs/promises";
import { renderMermaid } from "beautiful-mermaid";

function stripXmlPrelude(svg: string) {
  return svg
    .replace(/^\s*<\?xml[^>]*>\s*/i, "")
    .replace(/^\s*<!doctype[^>]*>\s*/i, "")
    .trim();
}

function stripSvgFontImports(svg: string) {
  // The runbook already loads fonts; avoid repeated @import per diagram.
  return svg.replace(/@import\s+url\([^\)]*\);\s*/gi, "");
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function namespaceSvgIds(svg: string, namespace: string) {
  // Inline SVG IDs share a global namespace in the page; avoid collisions between diagrams.
  const ids = Array.from(svg.matchAll(/\bid="([^"]+)"/g)).map((m) => m[1]);
  if (!ids.length) return svg;

  let out = svg;
  for (const id of ids) {
    const next = `${namespace}-${id}`;
    const idRe = new RegExp(`\\bid="${escapeRegExp(id)}"`, "g");
    out = out.replace(idRe, `id="${next}"`);

    const urlRe = new RegExp(`url\\(#${escapeRegExp(id)}\\)`, "g");
    out = out.replace(urlRe, `url(#${next})`);

    const hrefRe = new RegExp(`([\"'])#${escapeRegExp(id)}\\1`, "g");
    out = out.replace(hrefRe, `$1#${next}$1`);
  }

  return out;
}

function dedent(s: string) {
  const lines = s.replace(/\r\n/g, "\n").split("\n");
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (!nonEmpty.length) return s.trim();
  const indents = nonEmpty.map((l) => (l.match(/^\s*/)?.[0].length ?? 0));
  const minIndent = Math.min(...indents);
  return lines.map((l) => l.slice(minIndent)).join("\n").trim();
}

function ensureMermaidSourceClass(openTag: string) {
  const m = openTag.match(/class="([^"]*)"/);
  if (!m) return openTag;
  const classes = new Set(m[1].split(/\s+/).filter(Boolean));
  classes.add("mermaid-source");
  return openTag.replace(/class="[^"]*"/, `class="${Array.from(classes).join(" ")}"`);
}

async function renderAllMermaidInHtml(html: string) {
  const blockRe =
    /(<pre class="mermaid[^"]*">)([\s\S]*?)(<\/pre>)(\s*<!--bm:svg:start-->[\s\S]*?<!--bm:svg:end-->)?/g;

  const matches = Array.from(html.matchAll(blockRe));
  if (!matches.length) return html;

  for (const [i, match] of matches.entries()) {
    const [full, openTag, codeRaw, closeTag] = match;
    const code = dedent(codeRaw);
    const svg = stripXmlPrelude(
      await renderMermaid(code, {
        backgroundColor: "transparent",
        mermaidConfig: {
          theme: "base",
          themeVariables: {
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "12px",
            primaryColor: "#FFFFFF",
            primaryTextColor: "#1A1A1A",
            primaryBorderColor: "rgba(26,26,26,0.12)",
            lineColor: "#B7B2AA",
            secondaryColor: "#F0EDE8",
            tertiaryColor: "#FFFBF5",
            noteBkgColor: "#FFFBF5",
            noteTextColor: "#1A1A1A",
          },
        },
        svgOptimize: false,
      }),
    );
    const svgClean = namespaceSvgIds(stripSvgFontImports(svg), `bm${i + 1}`);

    const nextOpen = ensureMermaidSourceClass(openTag);
    const replacement = [
      `${nextOpen}${codeRaw}${closeTag}`,
      `<!--bm:svg:start-->`,
      `<div class="mermaid-svg">`,
      svgClean,
      `</div>`,
      `<!--bm:svg:end-->`,
    ].join("\n");

    html = html.replace(full, replacement);
  }

  return html;
}

async function main() {
  const paths = process.argv.slice(2).filter(Boolean);
  if (!paths.length) {
    console.error(
      "Usage: node --experimental-strip-types render_mermaid_svgs.ts <html-file> [more html files...]",
    );
    process.exit(1);
  }

  for (const path of paths) {
    const before = await readFile(path, "utf8");
    const after = await renderAllMermaidInHtml(before);
    if (after !== before) await writeFile(path, after, "utf8");
    console.log(`Rendered Mermaid SVGs: ${path}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
