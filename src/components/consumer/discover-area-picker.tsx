"use client";

import { useEffect, useState } from "react";
import { Loader2, LocateFixed, MapPin, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { filterDiscoverAreas, findNearestDiscoverArea } from "@/lib/discover/geo";
import type { DiscoverAreaOption } from "@/lib/discover/areas";
import { cn } from "@/lib/utils";

type DiscoverAreaPickerProps = {
  area: DiscoverAreaOption;
  options: DiscoverAreaOption[];
  inferredFromGeo: boolean;
  onSelect: (area: DiscoverAreaOption) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
};

const cityOrder = ["Jaipur", "Bengaluru", "Mumbai"] as const;

function locationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "Location access was blocked. Allow it in browser settings, or pick an area below.";
    case 2:
      return "Could not determine your position. Pick an area below.";
    case 3:
      return "Location took too long. Try again or pick an area below.";
    default:
      return "Could not use your location. Pick an area below.";
  }
}

export function DiscoverAreaPicker({
  area,
  options,
  inferredFromGeo,
  onSelect,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: DiscoverAreaPickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const open = controlledOpen ?? internalOpen;

  function setOpen(next: boolean) {
    if (onOpenChange) {
      onOpenChange(next);
    } else {
      setInternalOpen(next);
    }
  }

  useEffect(() => {
    if (!open) {
      setFilter("");
      setLocError(null);
      setLocating(false);
    }
  }, [open]);

  function handleSelect(option: DiscoverAreaOption) {
    onSelect(option);
    setOpen(false);
  }

  function useCurrentLocation() {
    setLocError(null);

    if (!navigator.geolocation) {
      setLocError("Your browser does not support location. Pick an area below.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = findNearestDiscoverArea(
          position.coords.latitude,
          position.coords.longitude,
        );
        onSelect(nearest);
        setLocating(false);
        setOpen(false);
      },
      (error) => {
        setLocating(false);
        setLocError(locationErrorMessage(error.code));
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 300_000 },
    );
  }

  const filteredOptions = filterDiscoverAreas(options, filter);
  const filterTerm = filter.trim().toLowerCase();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger ? (
        <DialogTrigger
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-marketing-line bg-white/80 px-3.5 py-2",
            "text-sm text-marketing-ink transition-colors hover:bg-white",
          )}
        >
          <MapPin className="size-4 shrink-0 text-marketing-accent" strokeWidth={2} aria-hidden />
          <span>
            Near <span className="font-medium">{area.label}</span>
          </span>
          <span className="text-marketing-muted">· Change</span>
        </DialogTrigger>
      ) : null}

      <DialogContent className="font-marketing-ui sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-marketing-display text-xl font-normal">
            Where are you looking?
          </DialogTitle>
          <DialogDescription>
            {inferredFromGeo
              ? "We guessed from your connection. Use your location, search, or pick from the list."
              : "Use your location, search for a neighbourhood, or pick from the list."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl border border-marketing-line bg-white px-3 py-3",
              "text-[15px] font-medium text-marketing-ink transition-colors",
              "hover:bg-marketing-card disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {locating ? (
              <Loader2 className="size-4 animate-spin text-marketing-accent" aria-hidden />
            ) : (
              <LocateFixed className="size-4 text-marketing-accent" aria-hidden />
            )}
            {locating ? "Finding your area…" : "Use current location"}
          </button>

          {locError ? (
            <p className="m-0 text-sm leading-relaxed text-marketing-accent" role="alert">
              {locError}
            </p>
          ) : null}

          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-marketing-muted"
              aria-hidden
            />
            <input
              type="search"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Type neighbourhood or city"
              autoComplete="off"
              className={cn(
                "h-11 w-full rounded-xl border border-marketing-line bg-white pr-3 pl-10",
                "text-[15px] text-marketing-ink outline-none placeholder:text-marketing-muted",
                "focus:border-marketing-accent/45 focus:shadow-[0_0_0_3px_rgb(229_107_60/0.12)]",
              )}
            />
          </div>
        </div>

        <div className="flex max-h-[min(50vh,280px)] flex-col gap-5 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <p className="m-0 text-sm text-marketing-muted">
              No match for “{filter.trim()}”. Try another spelling or pick a city below.
            </p>
          ) : (
            cityOrder.map((city) => {
              const cityOptions = filteredOptions.filter((option) => option.city === city);
              if (cityOptions.length === 0) {
                return null;
              }

              return (
                <div key={city}>
                  {!filterTerm ? (
                    <p className="m-0 text-sm font-medium text-marketing-ink">{city}</p>
                  ) : null}
                  <ul className={cn("m-0 flex list-none flex-col gap-1 p-0", !filterTerm && "mt-2")}>
                    {cityOptions.map((option) => {
                      const selected = option.id === area.id;

                      return (
                        <li key={option.id}>
                          <button
                            type="button"
                            onClick={() => handleSelect(option)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[15px]",
                              "transition-colors hover:bg-marketing-card",
                              selected
                                ? "bg-marketing-card font-medium text-marketing-ink"
                                : "text-marketing-ink",
                            )}
                          >
                            <span>
                              {filterTerm ? (
                                <>
                                  <span className="text-marketing-muted">{option.city} · </span>
                                  {option.label}
                                </>
                              ) : (
                                option.label
                              )}
                            </span>
                            {selected ? (
                              <span className="text-xs text-marketing-accent">Selected</span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
