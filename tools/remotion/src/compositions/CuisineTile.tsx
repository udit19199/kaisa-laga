import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { palette } from "../theme";

export type CuisineVariant =
  | "korean"
  | "japanese"
  | "modern-indian"
  | "levantine"
  | "southeast-asian"
  | "bakery";

type CuisineTileProps = {
  variant: CuisineVariant;
};

const configs: Record<
  CuisineVariant,
  { primary: string; secondary: string; draw: (frame: number) => ReactNode }
> = {
  korean: {
    primary: palette.indigo,
    secondary: palette.terracotta,
    draw: (frame) => {
      const bounce = interpolate(Math.sin(frame * 0.15), [-1, 1], [-4, 4]);
      return (
        <>
          <ellipse cx="160" cy="200" rx="70" ry="28" fill={palette.white} stroke={palette.line} strokeWidth="2" />
          <ellipse cx="160" cy="188" rx="58" ry="18" fill="#c0392b" opacity="0.85" />
          <circle cx="130" cy="176" r="10" fill="#f1c40f" transform={`translate(0 ${bounce})`} />
          <circle cx="160" cy="170" r="10" fill="#27ae60" transform={`translate(0 ${bounce * 0.8})`} />
          <circle cx="190" cy="176" r="10" fill="#f39c12" transform={`translate(0 ${bounce * 1.1})`} />
        </>
      );
    },
  },
  japanese: {
    primary: palette.indigo,
    secondary: palette.terracottaSoft,
    draw: (frame) => {
      const steam = interpolate(frame % 40, [0, 40], [0, -18]);
      return (
        <>
          <ellipse cx="160" cy="210" rx="78" ry="22" fill={palette.ink} opacity="0.88" />
          <path d="M120 198 Q160 170 200 198" fill={palette.terracottaSoft} />
          <path
            d={`M150 178 Q155 ${168 + steam} 160 178`}
            fill="none"
            stroke={palette.muted}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d={`M170 178 Q175 ${168 + steam} 180 178`}
            fill="none"
            stroke={palette.muted}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </>
      );
    },
  },
  "modern-indian": {
    primary: palette.terracotta,
    secondary: palette.sage,
    draw: (frame) => {
      const pulse = interpolate(Math.sin(frame * 0.12), [-1, 1], [0.9, 1.05]);
      return (
        <>
          <circle cx="160" cy="195" r={64 * pulse} fill="none" stroke={palette.terracottaSoft} strokeWidth="3" />
          <circle cx="160" cy="195" r={42 * pulse} fill={palette.terracotta} opacity="0.25" />
          <circle cx="140" cy="185" r="14" fill={palette.sage} />
          <circle cx="180" cy="188" r="12" fill={palette.terracotta} />
          <circle cx="160" cy="210" r="10" fill={palette.indigo} opacity="0.7" />
        </>
      );
    },
  },
  levantine: {
    primary: palette.sage,
    secondary: palette.terracotta,
    draw: (frame) => {
      const rot = interpolate(frame, [0, 90], [0, 8]);
      return (
        <g transform={`rotate(${rot} 160 195)`}>
          <ellipse cx="160" cy="210" rx="80" ry="24" fill={palette.white} stroke={palette.line} strokeWidth="2" />
          <ellipse cx="130" cy="198" rx="22" ry="14" fill={palette.sage} opacity="0.8" />
          <ellipse cx="160" cy="192" rx="20" ry="12" fill={palette.terracotta} opacity="0.75" />
          <ellipse cx="190" cy="198" rx="22" ry="14" fill="#d4ac6e" opacity="0.85" />
        </g>
      );
    },
  },
  "southeast-asian": {
    primary: palette.terracotta,
    secondary: palette.sage,
    draw: (frame) => {
      const wave = Math.sin(frame * 0.2) * 3;
      return (
        <>
          <path
            d={`M110 210 Q160 ${190 + wave} 210 210 L210 230 Q160 ${250 - wave} 110 230 Z`}
            fill={palette.white}
            stroke={palette.line}
            strokeWidth="2"
          />
          <path d="M125 205 Q160 188 195 205" fill="#e67e22" opacity="0.8" />
          <circle cx="145" cy="200" r="6" fill={palette.sage} />
          <circle cx="175" cy="202" r="5" fill="#f1c40f" />
        </>
      );
    },
  },
  bakery: {
    primary: palette.rose,
    secondary: palette.terracottaSoft,
    draw: (frame) => {
      const rise = interpolate(Math.sin(frame * 0.1), [-1, 1], [0, -5]);
      return (
        <>
          <rect x="108" y="215" width="104" height="18" rx="6" fill={palette.line} />
          <ellipse cx="160" cy={200 + rise} rx="52" ry="30" fill={palette.terracottaSoft} />
          <path
            d={`M118 ${205 + rise} Q160 ${165 + rise} 202 ${205 + rise}`}
            fill="none"
            stroke={palette.terracotta}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      );
    },
  },
};

export const CuisineTile = ({ variant }: CuisineTileProps) => {
  const frame = useCurrentFrame();
  const config = configs[variant];

  return (
    <AbsoluteFill style={{ backgroundColor: palette.canvas }}>
      <svg width="320" height="320" viewBox="0 0 320 320" aria-hidden>
        <circle cx="160" cy="160" r="118" fill={config.secondary} opacity="0.22" />
        {config.draw(frame)}
      </svg>
    </AbsoluteFill>
  );
};
