import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import MattersLoading from "../(app)/matters/loading";
import { PageHeader } from "./Page";
import { SkeletonLine } from "./Skeleton";

(globalThis as { React?: typeof React }).React = React;

describe("PageHeader", () => {
  it("does not wrap block subtitle content in a paragraph", () => {
    const html = renderToStaticMarkup(
      <PageHeader title="Matters" subtitle={<SkeletonLine width="60%" />} />,
    );

    expect(html).not.toContain("<p");
    expect(html).toContain("text-muted-foreground");
  });

  it("keeps matters loading markup free of paragraph-wrapped div blocks", () => {
    const html = renderToStaticMarkup(<MattersLoading />);
    expect(html).not.toContain("<p class=\"mt-2 text-sm text-muted-foreground\"><div");
  });
});
