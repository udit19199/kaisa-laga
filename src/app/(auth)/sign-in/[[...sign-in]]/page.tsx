import { SignIn } from "@clerk/nextjs";
import {
  SIGN_IN_PATH,
  SIGN_UP_PATH,
  clerkSignInRedirectUrl,
} from "@/lib/auth-routes";
import { clerkLightAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <SignIn
      routing="path"
      path={SIGN_IN_PATH}
      signUpUrl={SIGN_UP_PATH}
      forceRedirectUrl={clerkSignInRedirectUrl()}
      appearance={clerkLightAppearance}
    />
  );
}
