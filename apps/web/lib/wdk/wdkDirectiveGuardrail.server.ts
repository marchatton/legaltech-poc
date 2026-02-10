import "server-only";

export type WdkDirective = "use workflow" | "use step";

export type WdkDirectiveSubject = {
  kind: "workflow" | "step";
  id: string;
};

type DirectiveCheckResult = { ok: true } | { ok: false; error: string };

function isWs(ch: string): boolean {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\v" || ch === "\f";
}

function skipLineComment(src: string, start: number): number {
  let i = start;
  while (i < src.length && src[i] !== "\n") i += 1;
  return i;
}

function skipBlockComment(src: string, start: number): number {
  let i = start;
  while (i < src.length) {
    if (src[i] === "*" && src[i + 1] === "/") return i + 2;
    i += 1;
  }
  return i;
}

function skipWsAndComments(src: string, start: number): number {
  let i = start;
  while (i < src.length) {
    const ch = src[i];
    if (isWs(ch)) {
      i += 1;
      continue;
    }

    if (ch === "/" && src[i + 1] === "/") {
      i = skipLineComment(src, i + 2);
      continue;
    }

    if (ch === "/" && src[i + 1] === "*") {
      i = skipBlockComment(src, i + 2);
      continue;
    }

    break;
  }

  return i;
}

function skipStringLiteral(src: string, start: number, quote: "'" | '"'): number {
  let i = start;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }

    if (ch === quote) return i + 1;
    i += 1;
  }

  return i;
}

function findArrowTokenIndex(src: string): number | null {
  let i = 0;
  while (i < src.length - 1) {
    const ch = src[i];

    if (ch === "'" || ch === '"') {
      i = skipStringLiteral(src, i + 1, ch);
      continue;
    }

    if (ch === "/" && src[i + 1] === "/") {
      i = skipLineComment(src, i + 2);
      continue;
    }

    if (ch === "/" && src[i + 1] === "*") {
      i = skipBlockComment(src, i + 2);
      continue;
    }

    if (ch === "=" && src[i + 1] === ">") return i;
    i += 1;
  }

  return null;
}

function findFunctionKeywordIndex(src: string): number | null {
  let i = 0;
  while (i < src.length) {
    const ch = src[i];

    if (ch === "'" || ch === '"') {
      i = skipStringLiteral(src, i + 1, ch);
      continue;
    }

    if (ch === "/" && src[i + 1] === "/") {
      i = skipLineComment(src, i + 2);
      continue;
    }

    if (ch === "/" && src[i + 1] === "*") {
      i = skipBlockComment(src, i + 2);
      continue;
    }

    if (src.startsWith("function", i)) {
      const prev = src[i - 1];
      const next = src[i + "function".length];
      const prevOk = !prev || !/[A-Za-z0-9_$]/.test(prev);
      const nextOk = !next || !/[A-Za-z0-9_$]/.test(next);
      if (prevOk && nextOk) return i;
    }

    i += 1;
  }

  return null;
}

function findFunctionBodyOpenBrace(source: string): number | null {
  const arrow = findArrowTokenIndex(source);
  if (arrow !== null) {
    // Arrow function: `(...) => { ... }`
    const i = skipWsAndComments(source, arrow + 2);
    if (source[i] === "{") return i;
    return null;
  }

  const fnKw = findFunctionKeywordIndex(source);
  if (fnKw === null) return null;

  // Find parameter list `(...)` after `function` keyword.
  let i = fnKw + "function".length;
  i = skipWsAndComments(source, i);
  while (i < source.length && source[i] !== "(") i += 1;
  if (source[i] !== "(") return null;

  i += 1;
  let depth = 1;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === "'" || ch === '"') {
      i = skipStringLiteral(source, i + 1, ch);
      continue;
    }

    if (ch === "/" && source[i + 1] === "/") {
      i = skipLineComment(source, i + 2);
      continue;
    }

    if (ch === "/" && source[i + 1] === "*") {
      i = skipBlockComment(source, i + 2);
      continue;
    }

    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    i += 1;
  }

  if (depth !== 0) return null;

  i = skipWsAndComments(source, i);
  if (source[i] === "{") return i;
  return null;
}

function parseStringLiteralValue(source: string, start: number): { value: string; nextIndex: number } | null {
  const quote = source[start];
  if (quote !== "'" && quote !== '"') return null;

  let i = start + 1;
  let value = "";
  while (i < source.length) {
    const ch = source[i];
    if (ch === "\\") {
      const next = source[i + 1];
      if (next) value += next;
      i += 2;
      continue;
    }

    if (ch === quote) return { value, nextIndex: i + 1 };
    value += ch;
    i += 1;
  }

  return null;
}

function isDirectiveStatementBoundary(source: string, start: number): boolean {
  // Ensure the string literal is a standalone expression statement, not part of
  // something like `"use step" + x`.
  let i = start;
  while (i < source.length) {
    const ch = source[i];

    // Spaces/tabs/etc can be safely skipped. Newlines/r are statement boundaries via ASI.
    if (ch === " " || ch === "\t" || ch === "\v" || ch === "\f") {
      i += 1;
      continue;
    }
    if (ch === "\n" || ch === "\r") return true;

    if (ch === "/" && source[i + 1] === "/") return true; // line comment ends at newline

    if (ch === "/" && source[i + 1] === "*") {
      const next = skipBlockComment(source, i + 2);
      for (let j = i; j < next; j += 1) {
        if (source[j] === "\n" || source[j] === "\r") return true;
      }
      i = next;
      continue;
    }

    if (ch === ";") return true;
    if (ch === "}") return true;

    return false;
  }

  return true;
}

function checkWdkDirective(fn: unknown, expected: WdkDirective): DirectiveCheckResult {
  if (typeof fn !== "function") {
    return { ok: false, error: `Expected a function to check for "${expected}".` };
  }
  let source: string;
  try {
    source = Function.prototype.toString.call(fn);
  } catch {
    return { ok: false, error: `Unable to stringify function to check for "${expected}".` };
  }

  const bodyOpen = findFunctionBodyOpenBrace(source);
  if (bodyOpen === null) {
    return { ok: false, error: `Unable to locate a block body ("{ ... }") to assert "${expected}".` };
  }

  const first = skipWsAndComments(source, bodyOpen + 1);
  const lit = parseStringLiteralValue(source, first);
  if (!lit) {
    return { ok: false, error: `Missing "${expected}" as the first statement in the function body.` };
  }

  if (lit.value !== expected) {
    return { ok: false, error: `Expected "${expected}" as the first statement; found "${lit.value}".` };
  }

  if (!isDirectiveStatementBoundary(source, lit.nextIndex)) {
    return { ok: false, error: `Directive must be a standalone statement (e.g. "${expected}";).` };
  }

  return { ok: true };
}

export function assertWdkDirective(
  fn: unknown,
  expected: WdkDirective,
  subject: WdkDirectiveSubject,
): void {
  const result = checkWdkDirective(fn, expected);
  if (result.ok) return;

  const label = `${subject.kind} ${subject.id}`;
  throw new Error(`WDK directive guardrail failed for ${label}: ${result.error}`);
}
