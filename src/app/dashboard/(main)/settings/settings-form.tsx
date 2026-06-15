"use client";

import { useState } from "react";
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

export function SettingsForm({ organization }: { organization: Organization }) {
  const [dirty, setDirty] = useState<Partial<Organization>>({});
  const [loading, setLoading] = useState(false);

  const orgName = dirty.name !== undefined ? dirty.name : organization.name;
  const alertEmail = dirty.alert_email !== undefined ? dirty.alert_email : organization.alert_email;
  const primaryLanguage = dirty.primary_language !== undefined ? dirty.primary_language : organization.primary_language;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/organization", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: orgName,
        primary_language: primaryLanguage,
        alert_email: alertEmail,
      }),
    });

    if (res.ok) {
      toast.success("Settings saved");
      setDirty({});
    } else {
      toast.error("Failed to save settings");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
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
                value={orgName}
                onChange={(e) => setDirty((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="alertEmail">Alert email</Label>
              <Input
                id="alertEmail"
                type="email"
                value={alertEmail ?? ""}
                onChange={(e) =>
                  setDirty((prev) => ({ ...prev, alert_email: e.target.value || null }))
                }
                placeholder="manager@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Primary language</Label>
              <Select
                value={primaryLanguage}
                onValueChange={(v) =>
                  v && setDirty((prev) => ({ ...prev, primary_language: v }))
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
