"use client";

import { ReportTriageProvider, type ReportTriageTab, type ReportRowForDrawer } from "./ReportTriageContext";
import { ReportTriageTable } from "./ReportTriageTable";
import { RowDetailDrawer } from "./RowDetailDrawer";

type Props = {
  folderId: string;
  rowTab: ReportTriageTab;
  rows: ReportRowForDrawer[];
  modelVersion: string | null;
};

export function ReportTriagePanel(props: Props) {
  return (
    <ReportTriageProvider
      folderId={props.folderId}
      rowTab={props.rowTab}
      rows={props.rows}
      modelVersion={props.modelVersion}
    >
      <ReportTriageTable />
      <RowDetailDrawer />
    </ReportTriageProvider>
  );
}
