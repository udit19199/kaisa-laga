"use client";

import { useState, useCallback } from "react";
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

function EmailCodeStepForm({
  email,
  code,
  formError,
  isLoading,
  variant,
  inputClassName,
  primaryButtonClassName,
  setCode,
  handleEmailCodeSubmit,
  onBackToSignIn,
}: {
  email: string;
  code: string;
  formError: string | null;
  isLoading: boolean;
  variant: "marketing" | "default";
  inputClassName?: string;
  primaryButtonClassName?: string;
  setCode: (c: string) => void;
  handleEmailCodeSubmit: (e: React.FormEvent) => void;
  onBackToSignIn: () => void;
}) {
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
        onClick={onBackToSignIn}
      >
        Use a different email
      </Button>
    </form>
  );
}

function ResetCodeStepForm({
  email,
  code,
  formError,
  isLoading,
  variant,
  inputClassName,
  primaryButtonClassName,
  setCode,
  handleResetCodeSubmit,
}: {
  email: string;
  code: string;
  formError: string | null;
  isLoading: boolean;
  variant: "marketing" | "default";
  inputClassName?: string;
  primaryButtonClassName?: string;
  setCode: (c: string) => void;
  handleResetCodeSubmit: (e: React.FormEvent) => void;
}) {
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

function NewPasswordStepForm({
  newPassword,
  formError,
  isLoading,
  variant,
  inputClassName,
  primaryButtonClassName,
  setNewPassword,
  handleNewPasswordSubmit,
}: {
  newPassword: string;
  formError: string | null;
  isLoading: boolean;
  variant: "marketing" | "default";
  inputClassName?: string;
  primaryButtonClassName?: string;
  setNewPassword: (p: string) => void;
  handleNewPasswordSubmit: (e: React.FormEvent) => void;
}) {
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

export function SignInForm({
  redirectUrl,
  signUpUrl,
  variant = "marketing",
}: SignInFormProps) {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();

  const [formState, setFormState] = useState({
    step: "credentials" as Step,
    email: "",
    password: "",
    code: "",
    newPassword: "",
    formError: null as string | null,
  });

  const { step, email, password, code, newPassword, formError } = formState;

  const setStep = useCallback((s: Step) => setFormState(prev => ({ ...prev, step: s })), []);
  const setEmail = useCallback((e: string) => setFormState(prev => ({ ...prev, email: e })), []);
  const setPassword = useCallback((p: string) => setFormState(prev => ({ ...prev, password: p })), []);
  const setCode = useCallback((c: string) => setFormState(prev => ({ ...prev, code: c })), []);
  const setNewPassword = useCallback((np: string) => setFormState(prev => ({ ...prev, newPassword: np })), []);
  const setFormError = useCallback((fe: string | null) => setFormState(prev => ({ ...prev, formError: fe })), []);

  const isLoading = fetchStatus === "fetching";

  const handleBackToSignIn = useCallback(() => {
    void signIn?.reset();
    setStep("credentials");
    setCode("");
  }, [signIn, setStep, setCode]);

  const handleBackToSignInFromSecondFactor = useCallback(() => {
    void signIn?.reset();
    setStep("credentials");
  }, [signIn, setStep]);

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
      <EmailCodeStepForm
        email={email}
        code={code}
        formError={formError}
        isLoading={isLoading}
        variant={variant}
        inputClassName={inputClassName}
        primaryButtonClassName={primaryButtonClassName}
        setCode={setCode}
        handleEmailCodeSubmit={handleEmailCodeSubmit}
        onBackToSignIn={handleBackToSignIn}
      />
    );
  }

  if (step === "reset_code") {
    return (
      <ResetCodeStepForm
        email={email}
        code={code}
        formError={formError}
        isLoading={isLoading}
        variant={variant}
        inputClassName={inputClassName}
        primaryButtonClassName={primaryButtonClassName}
        setCode={setCode}
        handleResetCodeSubmit={handleResetCodeSubmit}
      />
    );
  }

  if (step === "new_password") {
    return (
      <NewPasswordStepForm
        newPassword={newPassword}
        formError={formError}
        isLoading={isLoading}
        variant={variant}
        inputClassName={inputClassName}
        primaryButtonClassName={primaryButtonClassName}
        setNewPassword={setNewPassword}
        handleNewPasswordSubmit={handleNewPasswordSubmit}
      />
    );
  }

  if (step === "second_factor") {
    return (
      <div className="flex flex-col gap-4">
        <AuthAlert message="Two-factor authentication is required for this account. Use the method configured in Clerk, or contact support." />
        <Button
          type="button"
          variant="ghost"
          onClick={handleBackToSignInFromSecondFactor}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <SignInCredentialsStepForm
      email={email}
      password={password}
      formError={formError}
      isLoading={isLoading}
      variant={variant}
      inputClassName={inputClassName}
      primaryButtonClassName={primaryButtonClassName}
      redirectUrl={redirectUrl}
      signUpUrl={signUpUrl}
      setEmail={setEmail}
      setPassword={setPassword}
      handleForgotPassword={() => void handleForgotPassword()}
      handleCredentialsSubmit={handleCredentialsSubmit}
    />
  );
}

interface SignInCredentialsStepFormProps {
  email: string;
  password: string;
  formError: string | null;
  isLoading: boolean;
  variant: "marketing" | "default";
  inputClassName: string | undefined;
  primaryButtonClassName: string | undefined;
  redirectUrl: string;
  signUpUrl?: string;
  setEmail: (val: string) => void;
  setPassword: (val: string) => void;
  handleForgotPassword: () => void;
  handleCredentialsSubmit: (event: React.FormEvent) => void;
}

function SignInCredentialsStepForm({
  email,
  password,
  formError,
  isLoading,
  variant,
  inputClassName,
  primaryButtonClassName,
  redirectUrl,
  signUpUrl,
  setEmail,
  setPassword,
  handleForgotPassword,
  handleCredentialsSubmit,
}: SignInCredentialsStepFormProps) {
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
            onClick={handleForgotPassword}
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
