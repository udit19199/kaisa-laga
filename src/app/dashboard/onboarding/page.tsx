"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { GlassCard, LiquidGlassProvider } from "@/components/liquid-glass";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingExistingOrg, setCheckingExistingOrg] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isActive = true;

    const checkOrganization = async () => {
      try {
        const res = await fetch("/api/organization", { cache: "no-store" });
        if (!isActive) {
          return;
        }

        if (res.ok) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // Ignore preflight failures and let the form handle provisioning.
      }

      if (isActive) {
        setCheckingExistingOrg(false);
      }
    };

    void checkOrganization();

    return () => {
      isActive = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/organization/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Could not create organization");
        return;
      }

      router.replace("/dashboard");
    } catch {
      setError("Could not create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiquidGlassProvider className="brand-surface flex min-h-dvh items-center justify-center px-4">
      <GlassCard className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <BrandMark className="size-10" imageClassName="h-6 w-6" priority />
          <CardTitle>Welcome to Kaisa Laga</CardTitle>
          <CardDescription>What should we call your business?</CardDescription>
        </CardHeader>
        <CardContent>
          {checkingExistingOrg ? (
            <p className="text-sm text-muted-foreground">Checking your account…</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Business name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Harbor Café"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Setting up…" : "Continue to dashboard"}
              </Button>
            </form>
          )}
        </CardContent>
      </GlassCard>
    </LiquidGlassProvider>
  );
}
