"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard, LiquidGlassProvider } from "@/components/liquid-glass";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/organization/provision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not create organization");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <LiquidGlassProvider className="brand-surface flex min-h-dvh items-center justify-center px-4">
      <GlassCard className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome to Pulse Drop</CardTitle>
          <CardDescription>What should we call your business?</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </GlassCard>
    </LiquidGlassProvider>
  );
}
