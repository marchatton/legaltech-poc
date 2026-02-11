"use client";

import { Badge } from "../../ui/Badge";
import { Tooltip } from "../../ui/Tooltip";

const UNSAFE_ARTEFACT_EXPLANATION =
  "Generated with safety overrides. Verify citations before sharing.";

type Props = {
  label: string;
};

export function UnsafeArtefactBadge(props: Props) {
  return (
    <Tooltip content={UNSAFE_ARTEFACT_EXPLANATION} position="top">
      <span
        tabIndex={0}
        className="inline-flex cursor-help rounded-ui-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`${props.label}. ${UNSAFE_ARTEFACT_EXPLANATION}`}
      >
        <Badge variant="destructive" size="sm">
          {props.label}
        </Badge>
      </span>
    </Tooltip>
  );
}
