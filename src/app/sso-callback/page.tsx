"use client";

import { HandleSSOCallback } from "@clerk/react";
import { useRouter } from "next/navigation";
import {
  CONSUMER_PROFILE_PATH,
  DASHBOARD_PATH,
  SIGN_IN_PATH,
  SIGN_UP_PATH,
} from "@/lib/auth-routes";
import { navigateAfterAuth } from "@/lib/auth-client";

export default function SSOCallbackPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Finishing sign-in…</p>
      <HandleSSOCallback
        navigateToApp={({ decorateUrl }) => {
          const fallback =
            typeof window !== "undefined" &&
            window.location.pathname.includes("diner")
              ? CONSUMER_PROFILE_PATH
              : DASHBOARD_PATH;
          navigateAfterAuth(router, fallback, decorateUrl);
        }}
        navigateToSignIn={() => {
          router.push(SIGN_IN_PATH);
        }}
        navigateToSignUp={() => {
          router.push(SIGN_UP_PATH);
        }}
      />
    </div>
  );
}
