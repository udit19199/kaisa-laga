import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Frosted orb with accent-blue icon — shared morph target for mic / mail. */
export function StoryAccentIcon({
  icon: Icon,
  className,
  iconClassName,
  size = "md",
  ...props
}: {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  size?: "md" | "sm";
} & ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "story-accent-icon story-mic-orb flex items-center justify-center rounded-full",
        size === "md" ? "size-[5.5rem]" : "size-[4.25rem]",
        className,
      )}
    >
      <Icon
        className={cn(
          "stroke-[1.65] text-[var(--brand-accent)]",
          size === "md" ? "size-10" : "size-8",
          iconClassName,
        )}
        aria-hidden
      />
    </div>
  );
}
