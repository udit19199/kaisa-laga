"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthField } from "@/components/auth/auth-field";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  clerkErrorMessage,
  navigateAfterAuth,
} from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type SignUpFormProps = {
  redirectUrl: string;
  signInUrl: string;
  variant?: "marketing" | "default";
};

type Step = "credentials" | "email_code";

export function SignUpForm({
  redirectUrl,
  signInUrl,
  variant = "marketing",
}: SignUpFormProps) {
  const router = useRouter();
  const { signUp, fetchStatus } = useSignUp();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const isLoading = fetchStatus === "fetching";

  const inputClassName = cn(
    variant === "marketing" &&
      "h-12 rounded-2xl border-marketing-line bg-white px-4 text-base text-marketing-ink",
  );

  const primaryButtonClassName = cn(
    variant === "marketing" &&
      "h-12 w-full rounded-full bg-marketing-ink text-white hover:bg-marketing-ink/90",
  );

  async function completeSignUp() {
    if (signUp.status !== "complete") {
      const needsEmailVerification =
        signUp.unverifiedFields.includes("email_address") ||
        signUp.verifications.emailAddress.status === "unverified";

      if (needsEmailVerification) {
        const { error } = await signUp.verifications.sendEmailCode();
        if (error) {
          setFormError(clerkErrorMessage(error));
          return;
        }
        setStep("email_code");
        setFormError(null);
        return;
      }

      setFormError("Additional details are required before your account is ready.");
      return;
    }

    const { error } = await signUp.finalize({
      navigate: ({ decorateUrl }) => {
        navigateAfterAuth(router, redirectUrl, decorateUrl);
      },
    });

    if (error) {
      setFormError(clerkErrorMessage(error));
    }
  }

  async function handleCredentialsSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) {
      setFormError(clerkErrorMessage(error));
      return;
    }

    await completeSignUp();
  }

  async function handleEmailCodeSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setFormError(clerkErrorMessage(error));
      return;
    }

    await completeSignUp();
  }

  if (step === "email_code") {
    return (
      <form onSubmit={handleEmailCodeSubmit} className="flex flex-col gap-6">
        <p className="m-0 text-sm text-marketing-muted">
          We sent a verification code to {email}.
        </p>
        {formError ? <AuthAlert message={formError} /> : null}
        <AuthField id="sign-up-code" label="Verification code" variant={variant}>
          <Input
            id="sign-up-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className={inputClassName}
            required
          />
        </AuthField>
        <Button type="submit" disabled={isLoading} className={primaryButtonClassName}>
          {isLoading ? "Verifying…" : "Verify and continue"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isLoading}
          onClick={() => {
            void signUp.reset();
            setStep("credentials");
            setCode("");
          }}
        >
          Use a different email
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <OAuthButtons
        mode="sign-up"
        redirectUrl={redirectUrl}
        disabled={isLoading}
        variant={variant}
      />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-sm text-marketing-muted">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4">
        {formError ? <AuthAlert message={formError} /> : null}

        <AuthField id="sign-up-email" label="Email" variant={variant}>
          <Input
            id="sign-up-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            required
          />
        </AuthField>

        <AuthField id="sign-up-password" label="Password" variant={variant}>
          <Input
            id="sign-up-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
            required
          />
        </AuthField>

        <Button type="submit" disabled={isLoading} className={primaryButtonClassName}>
          {isLoading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="m-0 text-center text-sm text-marketing-muted">
        Already have an account?{" "}
        <Link
          href={signInUrl}
          className="font-medium text-marketing-ink underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
