import { Card } from "../../ui/Card";
import { Page, PageHeader, PageSection } from "../../ui/Page";
import { Skeleton, SkeletonLine } from "../../ui/Skeleton";

export default function MattersLoading() {
  return (
    <Page width="lg">
      <div role="status" className="sr-only">Loading matters...</div>
      <PageHeader
        title={<Skeleton className="h-8 w-40" />}
        subtitle={<SkeletonLine width="60%" />}
        right={<Skeleton className="h-9 w-48" />}
      />

      <PageSection>
        <Card className="p-4">
          <div className="grid gap-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="grid min-w-64 flex-1 gap-1">
                <SkeletonLine width="4rem" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="grid min-w-48 gap-1">
                <SkeletonLine width="3rem" />
                <Skeleton className="h-9 w-full" />
              </div>
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-14" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonLine width="5rem" />
              <Skeleton className="h-7 w-16 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          </div>
        </Card>
      </PageSection>

      <PageSection>
        <Card className="overflow-hidden">
          <div className="bg-muted/50 px-4 py-3">
            <div className="flex gap-8">
              {["6rem", "4rem", "3rem", "5rem", "4rem"].map((w, i) => (
                <SkeletonLine key={i} width={w} />
              ))}
            </div>
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1">
                  <SkeletonLine width="50%" />
                  <SkeletonLine width="30%" className="mt-1" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
                <SkeletonLine width="8rem" />
                <Skeleton className="h-7 w-14" />
              </div>
            ))}
          </div>
        </Card>
      </PageSection>
    </Page>
  );
}
