import type { ReactNode } from "react";

import { WorkspaceSidebar } from "../../ui/WorkspaceSidebar";
import { WorkspaceShellFrame } from "../../ui/WorkspaceShell";

export default function MattersLayout(props: { children: ReactNode }) {
  return <WorkspaceShellFrame sidebar={<WorkspaceSidebar active="matters" />}>{props.children}</WorkspaceShellFrame>;
}
