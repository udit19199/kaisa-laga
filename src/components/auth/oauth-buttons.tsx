"use client";

import type { OAuthStrategy } from "@clerk/shared/types";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SSO_CALLBACK_PATH } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type OAuthButtonsProps = {
  mode: "sign-in" | "sign-up";
  redirectUrl: string;
  disabled?: boolean;
  variant?: "marketing" | "default";
};

const providers: { strategy: OAuthStrategy; label: string }[] = [
  { strategy: "oauth_google", label: "Continue with Google" },
];

export function OAuthButtons({
  mode,
  redirectUrl,
  disabled,
  variant = "marketing",
}: OAuthButtonsProps) {
  const { signIn, fetchStatus: signInStatus } = useSignIn();
  const { signUp, fetchStatus: signUpStatus } = useSignUp();
  const isLoading = signInStatus === "fetching" || signUpStatus === "fetching";

  async function handleOAuth(strategy: OAuthStrategy) {
    const params = {
      strategy,
      redirectUrl,
      redirectCallbackUrl: SSO_CALLBACK_PATH,
    };

    if (mode === "sign-in") {
      await signIn.sso(params);
      return;
    }

    await signUp.sso(params);
  }

  return (
    <div className="flex flex-col gap-3">
      {providers.map((provider) => (
        <Button
          key={provider.strategy}
          type="button"
          variant="outline"
          disabled={disabled || isLoading}
          onClick={() => void handleOAuth(provider.strategy)}
          className={cn(
            variant === "marketing" &&
              "h-12 rounded-2xl border-marketing-line bg-white text-marketing-ink hover:bg-marketing-card",
          )}
        >
          {provider.label}
        </Button>
      ))}
    </div>
  );
}
