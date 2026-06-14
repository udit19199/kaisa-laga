import { SignUp } from "@clerk/nextjs";
import {
  SIGN_IN_PATH,
  SIGN_UP_PATH,
  clerkSignUpRedirectUrl,
} from "@/lib/auth-routes";
import { clerkLightAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <SignUp
      routing="path"
      path={SIGN_UP_PATH}
      signInUrl={SIGN_IN_PATH}
      forceRedirectUrl={clerkSignUpRedirectUrl()}
      appearance={clerkLightAppearance}
    />
  );
}
