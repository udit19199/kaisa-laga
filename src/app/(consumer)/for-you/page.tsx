"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForYouRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/#for-you");
  }, [router]);

  return null;
}
