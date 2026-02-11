import { Card } from "../../../ui/Card";
import { Page, PageHeader, PageSection } from "../../../ui/Page";
import { Skeleton, SkeletonLine } from "../../../ui/Skeleton";

export default function MatterDetailLoading() {
  return (
    <Page>
      <div role="status" className="sr-only">Loading matter details...</div>
      <PageHeader
        title={<Skeleton className="h-8 w-32" />}
        subtitle={
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <SkeletonLine width="1rem" />
            <SkeletonLine width="40%" />
            <SkeletonLine width="1rem" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        }
      />

      {/* Fixture banner */}
      <PageSection>
        <Card className="p-5">
          <div className="flex gap-3">
            <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
            <div className="flex-1">
              <SkeletonLine width="8rem" />
              <div className="mt-2 grid gap-2">
                <SkeletonLine width="70%" />
                <SkeletonLine width="50%" />
                <SkeletonLine width="60%" />
                <SkeletonLine width="45%" />
              </div>
            </div>
          </div>
        </Card>
      </PageSection>

      {/* Setup documents */}
      <PageSection>
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SkeletonLine width="10rem" />
              <SkeletonLine width="70%" className="mt-1" />
            </div>
            <Skeleton className="h-12 w-36" />
          </div>
          <Skeleton className="mt-4 h-20 w-full" />
          <div className="mt-4 grid gap-2">
            {Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </Card>
      </PageSection>

      {/* Operator checklist */}
      <PageSection>
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SkeletonLine width="10rem" />
              <SkeletonLine width="60%" className="mt-1" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <Skeleton className="h-7 w-7 rounded-full" />
                <SkeletonLine width="5rem" />
              </div>
            ))}
          </div>
        </Card>
      </PageSection>

      {/* Quick Start */}
      <PageSection>
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SkeletonLine width="7rem" />
              <SkeletonLine width="80%" className="mt-1" />
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="h-9 w-36" />
          </div>
        </Card>
      </PageSection>

      {/* Report Triage */}
      <PageSection>
        <Card className="p-5">
          <SkeletonLine width="8rem" />
          <SkeletonLine width="60%" className="mt-1" />
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </Card>
      </PageSection>

      {/* Exports */}
      <PageSection>
        <Card className="p-5">
          <SkeletonLine width="5rem" />
          <SkeletonLine width="70%" className="mt-1" />
          <Skeleton className="mt-4 h-9 w-48" />
        </Card>
      </PageSection>
    </Page>
  );
}
