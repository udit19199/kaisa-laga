"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
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

type SignInFormProps = {
  redirectUrl: string;
  signUpUrl?: string;
  variant?: "marketing" | "default";
};

type Step =
  | "credentials"
  | "email_code"
  | "second_factor"
  | "reset_code"
  | "new_password";

export function SignInForm({
  redirectUrl,
  signUpUrl,
  variant = "marketing",
}: SignInFormProps) {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
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

  async function completeSignIn() {
    if (signIn.status !== "complete") {
      if (signIn.status === "needs_second_factor") {
        setStep("second_factor");
        setFormError(null);
        return;
      }

      if (signIn.status === "needs_first_factor") {
        const emailCode = signIn.supportedFirstFactors.find(
          (factor) => factor.strategy === "email_code",
        );
        if (emailCode) {
          const { error } = await signIn.emailCode.sendCode({
            emailAddress: email,
          });
          if (error) {
            setFormError(clerkErrorMessage(error));
            return;
          }
          setStep("email_code");
          setFormError(null);
          return;
        }
      }

      if (signIn.status === "needs_new_password") {
        setStep("new_password");
        setFormError(null);
        return;
      }

      setFormError("Additional verification is required. Try another method.");
      return;
    }

    const { error } = await signIn.finalize({
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

    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) {
      setFormError(clerkErrorMessage(error));
      return;
    }

    await completeSignIn();
  }

  async function handleEmailCodeSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const { error } = await signIn.emailCode.verifyCode({ code });
    if (error) {
      setFormError(clerkErrorMessage(error));
      return;
    }

    await completeSignIn();
  }

  async function handleForgotPassword() {
    setFormError(null);
    if (!email.trim()) {
      setFormError("Enter your email first, then try forgot password.");
      return;
    }

    const createResult = await signIn.create({ identifier: email });
    if (createResult.error) {
      setFormError(clerkErrorMessage(createResult.error));
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    if (error) {
      setFormError(clerkErrorMessage(error));
      return;
    }

    setStep("reset_code");
  }

  async function handleResetCodeSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (error) {
      setFormError(clerkErrorMessage(error));
      return;
    }

    setStep("new_password");
  }

  async function handleNewPasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
    });
    if (error) {
      setFormError(clerkErrorMessage(error));
      return;
    }

    await completeSignIn();
  }

  if (step === "email_code") {
    return (
      <form onSubmit={handleEmailCodeSubmit} className="flex flex-col gap-6">
        <p className="m-0 text-sm text-marketing-muted">
          We sent a verification code to {email}.
        </p>
        {formError ? <AuthAlert message={formError} /> : null}
        <AuthField id="sign-in-code" label="Verification code" variant={variant}>
          <Input
            id="sign-in-code"
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
            void signIn.reset();
            setStep("credentials");
            setCode("");
          }}
        >
          Use a different email
        </Button>
      </form>
    );
  }

  if (step === "reset_code") {
    return (
      <form onSubmit={handleResetCodeSubmit} className="flex flex-col gap-6">
        <p className="m-0 text-sm text-marketing-muted">
          Enter the reset code we sent to {email}.
        </p>
        {formError ? <AuthAlert message={formError} /> : null}
        <AuthField id="reset-code" label="Reset code" variant={variant}>
          <Input
            id="reset-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className={inputClassName}
            required
          />
        </AuthField>
        <Button type="submit" disabled={isLoading} className={primaryButtonClassName}>
          {isLoading ? "Verifying…" : "Continue"}
        </Button>
      </form>
    );
  }

  if (step === "new_password") {
    return (
      <form onSubmit={handleNewPasswordSubmit} className="flex flex-col gap-6">
        <p className="m-0 text-sm text-marketing-muted">Choose a new password.</p>
        {formError ? <AuthAlert message={formError} /> : null}
        <AuthField id="new-password" label="New password" variant={variant}>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className={inputClassName}
            required
          />
        </AuthField>
        <Button type="submit" disabled={isLoading} className={primaryButtonClassName}>
          {isLoading ? "Saving…" : "Set password and sign in"}
        </Button>
      </form>
    );
  }

  if (step === "second_factor") {
    return (
      <div className="flex flex-col gap-4">
        <AuthAlert message="Two-factor authentication is required for this account. Use the method configured in Clerk, or contact support." />
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            void signIn.reset();
            setStep("credentials");
          }}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <OAuthButtons
        mode="sign-in"
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

        <AuthField id="sign-in-email" label="Email" variant={variant}>
          <Input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            required
          />
        </AuthField>

        <AuthField id="sign-in-password" label="Password" variant={variant}>
          <Input
            id="sign-in-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
            required
          />
        </AuthField>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void handleForgotPassword()}
            className="border-0 bg-transparent p-0 text-sm text-marketing-muted underline-offset-4 hover:text-marketing-ink hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" disabled={isLoading} className={primaryButtonClassName}>
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {signUpUrl ? (
        <p className="m-0 text-center text-sm text-marketing-muted">
          No account?{" "}
          <Link
            href={signUpUrl}
            className="font-medium text-marketing-ink underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      ) : null}
    </div>
  );
}
