"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TASTE_ONBOARDING_PATH } from "@/lib/auth-routes";

export function LinkSubmissionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const submissionId = searchParams.get("submissionId");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!submissionId) {
      setError("Missing review to link.");
      return;
    }

    void (async () => {
      const response = await fetch("/api/diners/link-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not link this review.");
        return;
      }

      setDone(true);
      router.replace("/for-you");
    })();
  }, [submissionId, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 font-marketing-ui text-center">
      {error ? (
        <>
          <p className="text-marketing-muted">{error}</p>
          <Link href="/profile" className="mt-4 text-marketing-accent">
            Back to profile
          </Link>
        </>
      ) : done ? (
        <p className="text-marketing-muted">Linked — taking you to your matches…</p>
      ) : (
        <p className="text-marketing-muted">Saving this review to your taste profile…</p>
      )}
      {!done && !error ? (
        <Link href={TASTE_ONBOARDING_PATH} className="mt-6 text-sm text-marketing-muted">
          Set up taste preferences while you wait
        </Link>
      ) : null}
    </div>
  );
}
