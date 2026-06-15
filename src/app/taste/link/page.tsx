import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { DINER_SIGN_IN_PATH } from "@/lib/auth-routes";
import { requireDinerContext } from "@/server/auth/diner-context";
import { linkSubmissionToDiner } from "@/server/taste";

export const metadata: Metadata = {
  title: "Link review — Kaisa Laga",
};

const idSchema = z.uuid();

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ submissionId?: string }>;
}) {
  const [{ userId }, params] = await Promise.all([auth(), searchParams]);

  if (!userId) {
    const link = params.submissionId
      ? `?link=${encodeURIComponent(params.submissionId)}`
      : "";
    redirect(`${DINER_SIGN_IN_PATH}${link}`);
  }

  const submissionId = params.submissionId;
  if (!submissionId) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 font-marketing-ui text-center">
        <p className="text-marketing-muted">Missing review to link.</p>
        <Link href="/profile" className="mt-4 text-marketing-accent font-medium hover:underline">
          Back to profile
        </Link>
      </div>
    );
  }

  const parsed = idSchema.safeParse(submissionId);
  if (!parsed.success) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 font-marketing-ui text-center">
        <p className="text-marketing-muted">Invalid submission id.</p>
        <Link href="/profile" className="mt-4 text-marketing-accent font-medium hover:underline">
          Back to profile
        </Link>
      </div>
    );
  }

  const authCtx = await requireDinerContext();
  if (!authCtx.ok) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 font-marketing-ui text-center">
        <p className="text-marketing-muted">{authCtx.error}</p>
        <Link href="/profile" className="mt-4 text-marketing-accent font-medium hover:underline">
          Back to profile
        </Link>
      </div>
    );
  }

  const result = await linkSubmissionToDiner(authCtx.diner.id, parsed.data);
  if (!result.ok) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 font-marketing-ui text-center">
        <p className="text-marketing-muted">{result.error ?? "Could not link this review."}</p>
        <Link href="/profile" className="mt-4 text-marketing-accent font-medium hover:underline">
          Back to profile
        </Link>
      </div>
    );
  }

  redirect("/#for-you");
}
