import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LinkSubmissionPage } from "@/components/consumer/link-submission-page";
import { DINER_SIGN_IN_PATH } from "@/lib/auth-routes";

export const metadata: Metadata = {
  title: "Link review — Kaisa Laga",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ submissionId?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;

  if (!userId) {
    const link = params.submissionId
      ? `?link=${encodeURIComponent(params.submissionId)}`
      : "";
    redirect(`${DINER_SIGN_IN_PATH}${link}`);
  }

  return (
    <Suspense fallback={<p className="p-6 text-center text-marketing-muted">Loading…</p>}>
      <LinkSubmissionPage />
    </Suspense>
  );
}
