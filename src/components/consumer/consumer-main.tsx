import { cn } from "@/lib/utils";

export function ConsumerMain({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-6xl px-5 pb-8 lg:px-8 lg:pb-12",
        className,
      )}
    >
      {children}
    </main>
  );
}
