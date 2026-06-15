import { SignInForm } from "@/components/auth/sign-in-form";
import {
  SIGN_UP_PATH,
  clerkSignInRedirectUrl,
} from "@/lib/auth-routes";

export default function SignInPage() {
  return (
    <SignInForm
      redirectUrl={clerkSignInRedirectUrl()}
      signUpUrl={SIGN_UP_PATH}
    />
  );
}
