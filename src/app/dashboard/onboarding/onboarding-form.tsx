"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Business name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/organization/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Could not create organization");
        return;
      }

      router.refresh();
      router.replace("/dashboard/locations");
    } catch {
      setError("Could not create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="items-center text-center">
        <CardTitle>Welcome to Kaisa Laga</CardTitle>
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
              placeholder="Harbor Cafe"
              autoComplete="organization"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Setting up..." : "Continue to dashboard"}
          </Button>
        </form>
      </CardContent>
    </>
  );
}
