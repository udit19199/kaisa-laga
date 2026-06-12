import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="brand-surface flex min-h-dvh items-center justify-center px-4">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard/onboarding"
      />
    </div>
  );
}
