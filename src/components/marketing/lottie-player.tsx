"use client";

import { useEffect, useRef } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface LottiePlayerProps {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  onComplete?: () => void;
}

export function LottiePlayer({
  animationData,
  loop = true,
  autoplay = true,
  className,
  onComplete,
}: LottiePlayerProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const instance = lottieRef.current;
    if (!instance) return;

    if (reducedMotion) {
      instance.goToAndStop(0, true);
      instance.pause();
      return;
    }

    if (autoplay) {
      instance.play();
    } else {
      instance.pause();
    }
  }, [autoplay, reducedMotion]);

  if (reducedMotion) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        aria-hidden
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={false}
          autoplay={false}
          className="size-full opacity-80"
        />
      </div>
    );
  }

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      onComplete={onComplete}
      className={cn("size-full", className)}
      aria-hidden
    />
  );
}
