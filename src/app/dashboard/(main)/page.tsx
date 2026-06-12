import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardInbox } from "@/components/dashboard/dashboard-inbox";

export default function DashboardInboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      }
    >
      <DashboardInbox />
    </Suspense>
  );
}
