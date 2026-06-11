"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  primary_language: string;
  alert_email: string | null;
}

export default function SettingsPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/organization")
      .then((r) => r.json())
      .then((data) => setOrg(data.organization ?? null));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setLoading(true);

    const res = await fetch("/api/organization", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: org.name,
        primary_language: org.primary_language,
        alert_email: org.alert_email,
      }),
    });

    if (res.ok) {
      toast.success("Settings saved");
    } else {
      toast.error("Failed to save settings");
    }
    setLoading(false);
  };

  if (!org) {
    return <p className="text-muted-foreground">Loading settings…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex max-w-md flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="orgName">Organization name</Label>
              <Input
                id="orgName"
                value={org.name}
                onChange={(e) => setOrg({ ...org, name: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="alertEmail">Alert email</Label>
              <Input
                id="alertEmail"
                type="email"
                value={org.alert_email ?? ""}
                onChange={(e) =>
                  setOrg({ ...org, alert_email: e.target.value || null })
                }
                placeholder="manager@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Primary language</Label>
              <Select
                value={org.primary_language}
                onValueChange={(v) =>
                  v && setOrg({ ...org, primary_language: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading}>
              Save settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
