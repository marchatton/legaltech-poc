"use client";

import Markdown from "react-markdown";
import { cn } from "./cn";

/**
 * Renders markdown content with design-system–aligned prose styles.
 * Used in chat bubbles and anywhere AI-generated markdown needs rendering.
 */
export function Prose({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("prose-chat", className)}>
      <Markdown>{content}</Markdown>
    </div>
  );
}
