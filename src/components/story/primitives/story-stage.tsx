import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Open stage on sky — no boxed frame, vessel floats on the gradient */
export function StoryStage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("story-stage-open", className)} data-story-stage>
      {children}
    </div>
  );
}
