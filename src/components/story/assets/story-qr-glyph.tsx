import { cn } from "@/lib/utils";

/** Version-1 style grid (21×21). Decorative only, not scannable. */
const SIZE = 21;
const QUIET = 2;

const FINDER_BITMAP = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1],
] as const;

const FINDER_ORIGINS: [number, number][] = [
  [0, 0],
  [14, 0],
  [0, 14],
];

/** Fixed format-info strip modules (mimics real QR metadata bands). */
const FORMAT_MODULES: [number, number, boolean][] = [
  [8, 0, true], [8, 1, false], [8, 2, true], [8, 3, true], [8, 4, false], [8, 5, true], [8, 7, false],
  [0, 8, true], [1, 8, false], [2, 8, true], [3, 8, true], [4, 8, false], [5, 8, true], [7, 8, false],
  [20, 8, true], [19, 8, false], [18, 8, true], [17, 8, false], [16, 8, true], [15, 8, true], [13, 8, false],
  [8, 20, true], [8, 19, false], [8, 18, true], [8, 17, true], [8, 16, false], [8, 15, true], [8, 13, false],
];

function buildGrid(): boolean[][] {
  const grid = Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false));
  const reserved = Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false));

  const markReserved = (row: number, col: number) => {
    if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) {
      reserved[row][col] = true;
    }
  };

  for (const [ox, oy] of FINDER_ORIGINS) {
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (FINDER_BITMAP[row][col]) {
          grid[oy + row][ox + col] = true;
        }
      }
    }
    for (let row = oy - 1; row <= oy + 7; row++) {
      for (let col = ox - 1; col <= ox + 7; col++) {
        markReserved(row, col);
      }
    }
  }

  for (let col = 8; col <= 12; col++) {
    markReserved(6, col);
    grid[6][col] = (col - 8) % 2 === 0;
  }
  for (let row = 8; row <= 12; row++) {
    markReserved(row, 6);
    grid[row][6] = (row - 8) % 2 === 0;
  }

  for (const [col, row, on] of FORMAT_MODULES) {
    markReserved(row, col);
    grid[row][col] = on;
  }

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (reserved[row][col]) continue;
      grid[row][col] = ((row * 19 + col * 37 + (row ^ col) * 11) % 10) < 6;
    }
  }

  return grid;
}

const GRID = buildGrid();

const MODULES: [number, number][] = [];
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    if (GRID[row][col]) {
      MODULES.push([col, row]);
    }
  }
}

/** Decorative QR motif for story illustrations. Not encoded for scanning. */
export function StoryQrGlyph({
  size = 104,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const unit = 1;
  const gap = 0;
  const cell = unit + gap;
  const matrix = SIZE * cell;
  const canvas = matrix + QUIET * 2 * cell;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${canvas} ${canvas}`}
      className={cn("block", className)}
      aria-hidden
      data-story-qr
    >
      {MODULES.map(([col, row]) => (
        <rect
          key={`${col}-${row}`}
          x={QUIET * cell + col * cell}
          y={QUIET * cell + row * cell}
          width={unit}
          height={unit}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
