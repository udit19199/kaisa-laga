"use client";

import { useEffect, useRef, useState } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { cn } from "@/lib/utils";

export interface LottiePlayerProps {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  onComplete?: () => void;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
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
