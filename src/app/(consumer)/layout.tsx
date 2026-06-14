import { ConsumerBottomNav } from "@/components/consumer/consumer-bottom-nav";
import { ConsumerSideNav } from "@/components/consumer/consumer-side-nav";

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-white lg:flex">
      <ConsumerSideNav />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </div>
      <ConsumerBottomNav />
    </div>
  );
}
