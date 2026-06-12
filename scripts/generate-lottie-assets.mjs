#!/usr/bin/env node
/**
 * Minimal valid Lottie JSON for PulseDrop product narrative.
 * Fallback when LottieFiles CDN downloads are unavailable.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "lottie");
mkdirSync(outDir, { recursive: true });

/** @param {number} t @param {number} a @param {number} b */
function lerp(t, a, b) {
  return a + (b - a) * t;
}

const qrScan = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "qr-scan",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "frame",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [120, 120] },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 8 },
            },
            {
              ty: "st",
              c: { a: 0, k: [0.18, 0.18, 0.2, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 4 },
              lc: 2,
              lj: 2,
            },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: "qr-frame",
        },
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "scan-line",
      sr: 1,
      ks: {
        o: { a: 0, k: 85 },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [100, 55, 0], e: [100, 145, 0], i: { x: [0.42], y: [0] }, o: { x: [0.58], y: [1] } },
            { t: 45, s: [100, 145, 0], e: [100, 55, 0], i: { x: [0.42], y: [0] }, o: { x: [0.58], y: [1] } },
            { t: 90, s: [100, 55, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [100, 4] },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 2 },
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.45, 0.72, 0.95, 1] },
              o: { a: 0, k: 100 },
            },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: "beam",
        },
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0,
    },
  ],
};

const voicePulse = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "voice-pulse",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "ring-outer",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [60], e: [0] },
            { t: 30, s: [0], e: [60] },
            { t: 60, s: [60] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [80, 80, 100], e: [140, 140, 100] },
            { t: 30, s: [140, 140, 100], e: [80, 80, 100] },
            { t: 60, s: [80, 80, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", d: 1, s: { a: 0, k: [80, 80] }, p: { a: 0, k: [0, 0] } },
            { ty: "st", c: { a: 0, k: [0.55, 0.82, 0.55, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: "ring",
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "mic",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 96, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "rc", d: 1, s: { a: 0, k: [28, 44] }, p: { a: 0, k: [0, -6] }, r: { a: 0, k: 14 } },
            { ty: "fl", c: { a: 0, k: [0.22, 0.22, 0.24, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: "mic-body",
        },
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              ks: {
                a: 0,
                k: {
                  c: false,
                  v: [
                    [-14, 18],
                    [-14, 30],
                    [14, 30],
                    [14, 18],
                  ],
                  i: [[0, 0], [0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0], [0, 0]],
                },
              },
            },
            { ty: "st", c: { a: 0, k: [0.22, 0.22, 0.24, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 4 }, lc: 2 },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
          nm: "mic-stand",
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
  ],
};

writeFileSync(join(outDir, "qr-scan.json"), JSON.stringify(qrScan, null, 2));
writeFileSync(join(outDir, "voice-pulse.json"), JSON.stringify(voicePulse, null, 2));
console.log("Wrote public/lottie/qr-scan.json and voice-pulse.json");
