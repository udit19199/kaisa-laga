import Image from "next/image";
import { cn } from "@/lib/utils";

/** macOS pointing-hand cursor (cursor.in asset). */
export function StoryMacosHand({ className }: { className?: string }) {
  return (
    <Image
      src="/story/pointinghand.svg"
      alt=""
      width={44}
      height={44}
      className={cn("story-macos-hand", className)}
      aria-hidden
      unoptimized
    />
  );
}
