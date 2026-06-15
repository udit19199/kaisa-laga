import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { palette } from "../theme";

const plates = [
  { color: palette.terracotta, angle: 0 },
  { color: palette.indigo, angle: 72 },
  { color: palette.sage, angle: 144 },
  { color: palette.rose, angle: 216 },
  { color: palette.muted, angle: 288 },
];

const basePlateStyle: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: 52,
  height: 52,
  borderRadius: "50%",
};

const centerCircleStyle: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: 36,
  height: 36,
  marginLeft: -18,
  marginTop: -18,
  borderRadius: "50%",
  background: palette.white,
  border: `2px solid ${palette.line}`,
};

export const CuisineOrbit = () => {
  const frame = useCurrentFrame();
  const orbit = frame * 0.04;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.canvas,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", width: 220, height: 220 }}>
        {plates.map((plate, index) => {
          const angle = plate.angle * (Math.PI / 180) + orbit;
          const radius = 78 + Math.sin(frame * 0.08 + index) * 6;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const scale = interpolate(Math.sin(frame * 0.1 + index * 1.2), [-1, 1], [0.88, 1.05]);

          return (
            <div
              key={index}
              style={{
                ...basePlateStyle,
                marginLeft: x - 26,
                marginTop: y - 26,
                background: plate.color,
                transform: `scale(${scale})`,
                boxShadow: `inset 0 -4px 0 ${palette.white}55`,
              }}
            />
          );
        })}
        <div style={centerCircleStyle} />
      </div>
    </AbsoluteFill>
  );
};
