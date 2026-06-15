import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { palette } from "../theme";

const bars = 7;

export const VoiceWave = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.canvas,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 120 }}>
        {Array.from({ length: bars }).map((_, index) => {
          const phase = frame * 0.22 + index * 0.85;
          const height = interpolate(
            Math.sin(phase) * 0.5 + 0.5,
            [0, 1],
            [28, 96],
          );

          return (
            <div
              key={index}
              style={{
                width: 14,
                height,
                borderRadius: 8,
                background:
                  index % 2 === 0
                    ? palette.terracotta
                    : palette.indigo,
                opacity: 0.92,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 56,
          width: 88,
          height: 88,
          borderRadius: "50%",
          border: `3px solid ${palette.line}`,
          background: palette.white,
          boxShadow: `0 0 0 6px ${palette.terracottaSoft}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 78,
          width: 44,
          height: 44,
          borderRadius: 12,
          background: palette.ink,
        }}
      />
    </AbsoluteFill>
  );
};
