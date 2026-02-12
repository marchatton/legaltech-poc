import Link from "next/link";
import type { ReactNode } from "react";

import { Card } from "./Card";
import { Page, PageHeader, type PageWidth } from "./Page";

type StatePageProps = {
  title: ReactNode;
  message: ReactNode;
  detail?: ReactNode;
  backHref?: string;
  backLabel?: string;
  width?: PageWidth;
};

export function StatePage({
  title,
  message,
  detail,
  backHref,
  backLabel = "Back",
  width = "sm",
}: StatePageProps) {
  return (
    <Page width={width}>
      <PageHeader title={title} subtitle={message} />
      <Card className="mt-6 p-4">
        {detail ? <div className="text-xs text-muted-foreground">{detail}</div> : null}
        {backHref ? (
          <div className={detail ? "mt-4" : ""}>
            <Link className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={backHref}>
              {backLabel}
            </Link>
          </div>
        ) : null}
      </Card>
    </Page>
  );
}
