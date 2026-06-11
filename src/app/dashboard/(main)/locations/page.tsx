"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Location {
  id: string;
  name: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const fetchLocations = async () => {
    const res = await fetch("/api/locations");
    if (res.ok) {
      const data = await res.json();
      setLocations(data.locations ?? []);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);

    const res = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });

    if (res.ok) {
      toast.success("Location created");
      setNewName("");
      fetchLocations();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Failed to create location");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/locations?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Location deleted");
      fetchLocations();
    } else {
      toast.error("Failed to delete location");
    }
  };

  const downloadQr = (locationId: string, name: string) => {
    const svg = document.getElementById(`qr-${locationId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `pulse-drop-qr-${name.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Locations</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Location</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="name">Location name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Downtown Store"
              />
            </div>
            <Button type="submit" disabled={loading}>
              Add location
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {locations.map((loc) => {
          const feedbackUrl = `${appUrl}/f/${loc.id}`;
          return (
            <Card key={loc.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{loc.name}</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(loc.id)}
                >
                  Delete
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="rounded-lg bg-white p-4">
                  <QRCode id={`qr-${loc.id}`} value={feedbackUrl} size={160} />
                </div>
                <p className="break-all text-center text-xs text-muted-foreground">
                  {feedbackUrl}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadQr(loc.id, loc.name)}
                >
                  Download QR
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
