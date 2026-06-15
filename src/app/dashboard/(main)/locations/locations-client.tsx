"use client";

import { useState, useCallback, type FormEvent } from "react";
import QRCode from "react-qr-code";
import { Plus, MoreHorizontal, Download, Trash2, Palette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Location } from "@/lib/types";
import { LocationBrandingDialog } from "./location-branding-dialog";

type LocationsTableClientProps = {
  initialLocations: Location[];
  appUrl: string;
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
    link.download = `kaisa-laga-qr-${name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  img.src = "data:image/svg+xml;base64," + btoa(svgData);
};

export function LocationsTableClient({ initialLocations, appUrl }: LocationsTableClientProps) {
  const [tableState, setTableState] = useState({
    locations: initialLocations,
    newName: "",
    loading: false,
    isAddOpen: false,
    brandingLocation: null as Location | null,
  });
  const { locations, newName, loading, isAddOpen, brandingLocation } = tableState;

  const setLocations = useCallback((locs: Location[] | ((curr: Location[]) => Location[])) => {
    setTableState((prev) => ({ ...prev, locations: typeof locs === "function" ? locs(prev.locations) : locs }));
  }, []);
  const setNewName = useCallback((n: string) => setTableState((prev) => ({ ...prev, newName: n })), []);
  const setLoading = useCallback((l: boolean) => setTableState((prev) => ({ ...prev, loading: l })), []);
  const setIsAddOpen = useCallback((o: boolean) => setTableState((prev) => ({ ...prev, isAddOpen: o })), []);
  const setBrandingLocation = useCallback((loc: Location | null) => setTableState((prev) => ({ ...prev, brandingLocation: loc })), []);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    setLoading(true);

    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.location) {
        toast.success("Location created");
        setLocations((current) => {
          const next = [...current, data.location as Location];
          next.sort((a, b) => a.name.localeCompare(b.name));
          return next;
        });
        setNewName("");
        setIsAddOpen(false);
      } else {
        toast.error(data.error ?? "Failed to create location");
      }
    } catch {
      toast.error("Failed to create location");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/locations?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Location deleted");
      setLocations((current) => current.filter((location) => location.id !== id));
    } else {
      toast.error("Failed to delete location");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="mt-1 text-muted-foreground">
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
                  {loading ? "Creating..." : "Create location"}
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
              <TableHead className="w-[132px]">QR Code</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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
                      <a
                        href={feedbackUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-muted-foreground hover:underline"
                      >
                        {feedbackUrl}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center justify-center rounded-2xl border bg-background p-3 shadow-sm">
                        <QRCode
                          id={`qr-${loc.id}`}
                          value={feedbackUrl}
                          size={88}
                          aria-label={`QR code for ${loc.name}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" className="size-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => downloadQr(loc.id, loc.name)}>
                              <Download className="mr-2 size-4" />
                              Download QR
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setBrandingLocation(loc)}>
                              <Palette className="mr-2 size-4" />
                              Branding &amp; taste
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleDelete(loc.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
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

      <LocationBrandingDialog
        key={brandingLocation?.id ?? "none"}
        location={brandingLocation}
        open={Boolean(brandingLocation)}
        onOpenChange={(open) => {
          if (!open) {
            setBrandingLocation(null);
          }
        }}
        onSaved={(updated) => {
          setLocations((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
        }}
      />
    </div>
  );
}
