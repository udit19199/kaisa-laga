"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Plus, MoreHorizontal, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Location {
  id: string;
  name: string;
}

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

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
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
      setIsAddOpen(false);
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



  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="text-muted-foreground mt-1">
            Manage your physical locations and generate feedback QR codes.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button>
              <Plus className="mr-2 size-4" />
              Add Location
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Location</DialogTitle>
                <DialogDescription>
                  Create a new location to receive its unique feedback link and QR code.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Location name</Label>
                  <Input
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Downtown Store"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Feedback Link</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No locations found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              locations.map((loc) => {
                const feedbackUrl = `${appUrl}/f/${loc.id}`;
                return (
                  <TableRow key={loc.id}>
                    <TableCell className="font-medium">{loc.name}</TableCell>
                    <TableCell>
                      <a href={feedbackUrl} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:underline">
                        {feedbackUrl}
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="hidden">
                        <QRCode id={`qr-${loc.id}`} value={feedbackUrl} size={160} />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" className="size-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => downloadQr(loc.id, loc.name)}>
                            <Download className="mr-2 size-4" />
                            Download QR
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={() => handleDelete(loc.id)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
