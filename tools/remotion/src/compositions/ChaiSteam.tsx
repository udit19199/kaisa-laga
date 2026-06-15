import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { palette } from "../theme";

export const ChaiSteam = () => {
  const frame = useCurrentFrame();

  const steamPaths = [0, 1, 2].map((index) => {
    const sway = Math.sin(frame * 0.08 + index * 1.4) * 8;
    const rise = interpolate((frame + index * 12) % 60, [0, 60], [0, -52]);
    const opacity = interpolate((frame + index * 12) % 60, [0, 10, 50, 60], [0, 0.7, 0.5, 0]);
    return { sway, rise, opacity, x: 118 + index * 22 };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: palette.canvas }}>
      <svg width="320" height="320" viewBox="0 0 320 320" aria-hidden>
        {/* Kulhad */}
        <path
          d="M108 198 L108 248 Q108 268 160 268 Q212 268 212 248 L212 198 Z"
          fill={palette.terracotta}
        />
        <path
          d="M100 198 L220 198 Q224 198 224 192 L224 186 Q224 180 218 180 L102 180 Q96 180 96 186 L96 192 Q96 198 100 198 Z"
          fill={palette.terracottaSoft}
        />
        <ellipse cx="160" cy="186" rx="58" ry="10" fill={palette.white} opacity="0.35" />
        {/* Chai surface */}
        <ellipse cx="160" cy="198" rx="48" ry="8" fill="#8b5a3c" opacity="0.55" />

        {steamPaths.map((steam, index) => (
          <path
            key={index}
            d={`M ${steam.x} 176 Q ${steam.x + steam.sway} ${176 + steam.rise / 2} ${steam.x + steam.sway * 0.6} ${176 + steam.rise}`}
            fill="none"
            stroke={palette.muted}
            strokeWidth="3"
            strokeLinecap="round"
            opacity={steam.opacity}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
