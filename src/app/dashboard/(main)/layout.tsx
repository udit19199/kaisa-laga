import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <Toaster />
    </div>
  );
}
