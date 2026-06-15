import { SignUpForm } from "@/components/auth/sign-up-form";
import {
  SIGN_IN_PATH,
  clerkSignUpRedirectUrl,
} from "@/lib/auth-routes";

export default function SignUpPage() {
  return (
    <SignUpForm
      redirectUrl={clerkSignUpRedirectUrl()}
      signInUrl={SIGN_IN_PATH}
    />
  );
}
