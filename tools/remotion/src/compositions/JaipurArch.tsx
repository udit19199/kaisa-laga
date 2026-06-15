import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { palette } from "../theme";

export const JaipurArch = () => {
  const frame = useCurrentFrame();
  const shimmer = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.15, 0.35]);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <svg width="400" height="500" viewBox="0 0 400 500" aria-hidden>
        <defs>
          <linearGradient id="archFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={palette.terracottaSoft} />
            <stop offset="100%" stopColor={palette.rose} stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* Main jharokha arch */}
        <path
          d="M60 420 L60 180 Q60 60 200 60 Q340 60 340 180 L340 420 Z"
          fill="url(#archFill)"
          opacity={0.85}
        />
        <path
          d="M90 420 L90 190 Q90 95 200 95 Q310 95 310 190 L310 420 Z"
          fill={palette.canvas}
          opacity={0.92}
        />
        <path
          d="M120 420 L120 205 Q120 130 200 130 Q280 130 280 205 L280 420 Z"
          fill="url(#archFill)"
          opacity={0.45 + shimmer}
        />

        {/* Crenellations */}
        {Array.from({ length: 9 }).map((_, index) => (
          <rect
            key={index}
            x={68 + index * 30}
            y={48}
            width={18}
            height={22}
            rx={4}
            fill={palette.terracotta}
            opacity={0.7}
          />
        ))}

        {/* Detail line */}
        <path
          d="M130 250 Q200 220 270 250"
          fill="none"
          stroke={palette.indigo}
          strokeWidth="2.5"
          opacity={0.5 + shimmer}
        />
      </svg>
    </AbsoluteFill>
  );
};
