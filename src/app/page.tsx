import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight">Pulse Drop</h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Frictionless voice feedback for physical businesses. Scan, speak, done.
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/dashboard/signup" className={cn(buttonVariants())}>
          Get started
        </Link>
        <Link
          href="/dashboard/login"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
