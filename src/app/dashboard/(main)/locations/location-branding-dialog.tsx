"use client";

import { useState, useCallback, type FormEvent } from "react";
import { toast } from "sonner";
import { VenueMatchCard } from "@/components/consumer/venue-match-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Location } from "@/lib/types";
import type { VenueMatch } from "@/lib/taste/types";

type LocationBrandingDialogProps = {
  location: Location | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (location: Location) => void;
};

export function LocationBrandingDialog({
  location,
  open,
  onOpenChange,
  onSaved,
}: LocationBrandingDialogProps) {
  const [dialogState, setDialogState] = useState({
    name: location?.name ?? "",
    tagline: location?.tagline ?? "",
    coverImageUrl: location?.cover_image_url ?? "",
    tasteSummary: (location?.taste_summary ?? null) as string | null,
    tasteThemes: (location?.taste_themes ?? []) as string[],
    saving: false,
  });
  const { name, tagline, coverImageUrl, tasteSummary, tasteThemes, saving } = dialogState;

  const setName = useCallback((n: string) => setDialogState((prev) => ({ ...prev, name: n })), []);
  const setTagline = useCallback((t: string) => setDialogState((prev) => ({ ...prev, tagline: t })), []);
  const setCoverImageUrl = useCallback((c: string) => setDialogState((prev) => ({ ...prev, coverImageUrl: c })), []);
  const setSaving = useCallback((s: boolean) => setDialogState((prev) => ({ ...prev, saving: s })), []);

  const previewMatch: VenueMatch | null = location
    ? {
        locationId: location.id,
        name: name || location.name,
        tagline: tagline || null,
        coverImageUrl: coverImageUrl || null,
        tasteSummary,
        sampleQuote: tasteSummary,
        matchCopy: "Feels like your kind of place",
      }
    : null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!location) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/locations/${location.id}/branding`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          tagline: tagline.trim() || null,
          coverImageUrl: coverImageUrl.trim() || null,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error ?? "Failed to save branding");
        return;
      }

      toast.success("Branding saved");
      onSaved({
        ...location,
        name: data.name ?? name,
        tagline: data.tagline ?? null,
        cover_image_url: data.cover_image_url ?? null,
        taste_summary: data.taste_summary ?? tasteSummary,
        taste_themes: data.taste_themes ?? tasteThemes,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Location branding &amp; taste</DialogTitle>
            <DialogDescription>
              Edit how guests see your venue on mobile. Taste summary is generated from published
              reviews and cannot be edited.
            </DialogDescription>
          </DialogHeader>

            <div className="grid gap-6 py-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="branding-name">Display name</Label>
                  <Input
                    id="branding-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="branding-tagline">Tagline</Label>
                  <Input
                    id="branding-tagline"
                    value={tagline}
                    onChange={(event) => setTagline(event.target.value)}
                    placeholder="One line about your place"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="branding-cover">Cover image URL</Label>
                  <Input
                    id="branding-cover"
                    value={coverImageUrl}
                    onChange={(event) => setCoverImageUrl(event.target.value)}
                    placeholder="https://…"
                  />
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="m-0 text-sm font-medium">Guests describe you as…</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {tasteSummary ?? "Published reviews will build this summary automatically."}
                  </p>
                  {tasteThemes.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tasteThemes.map((theme) => (
                        <span
                          key={theme}
                          className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Mobile preview</p>
                {previewMatch ? (
                  <div className="mx-auto max-w-sm">
                    <VenueMatchCard match={previewMatch} />
                  </div>
                ) : null}
              </div>
            </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save branding"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
