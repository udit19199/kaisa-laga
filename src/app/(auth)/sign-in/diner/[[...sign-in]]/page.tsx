import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { KaisaLagaMark } from "@/components/consumer/consumer-chrome";
import {
  CONSUMER_PROFILE_PATH,
  DASHBOARD_PATH,
  DINER_SIGN_IN_PATH,
  SIGN_UP_PATH,
} from "@/lib/auth-routes";
import { userHasOrgMembership } from "@/server/auth/diner-context";

type PageProps = {
  searchParams: Promise<{ link?: string; redirect_url?: string }>;
};

export default async function DinerSignInPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  const params = await searchParams;

  if (userId) {
    const hasOrg = await userHasOrgMembership(userId);
    if (hasOrg && !params.link) {
      redirect(DASHBOARD_PATH);
    }

    if (params.link) {
      redirect(`/taste/link?submissionId=${encodeURIComponent(params.link)}`);
    }

    redirect(params.redirect_url ?? CONSUMER_PROFILE_PATH);
  }

  const redirectUrl = params.link
    ? `${DINER_SIGN_IN_PATH}?link=${encodeURIComponent(params.link)}`
    : (params.redirect_url ?? CONSUMER_PROFILE_PATH);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 py-10 font-marketing-ui text-marketing-ink">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <KaisaLagaMark className="scale-90 text-marketing-ink" />
        <div>
          <p className="m-0 font-marketing-display text-[28px] font-normal">Kaisa Laga</p>
          <p className="m-0 mt-1 text-sm text-marketing-muted">
            Sign in to save your taste profile
          </p>
        </div>
      </div>
      <div className="w-full max-w-md">
        <SignInForm redirectUrl={redirectUrl} signUpUrl={SIGN_UP_PATH} />
      </div>
    </div>
  );
}
