import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(__dirname, "src", "index.ts");
const outDir = path.join(__dirname, "..", "..", "public", "marketing", "animations");

const jobs = [
  { id: "VoiceWave", webm: "voice-wave.webm", poster: "voice-wave-poster.png", posterFrame: 20 },
  { id: "ChaiSteam", webm: "chai-steam.webm", poster: "chai-steam-poster.png", posterFrame: 40 },
  { id: "JaipurArch", webm: "jaipur-arch.webm", poster: "jaipur-arch-poster.png", posterFrame: 45 },
  { id: "CuisineOrbit", webm: "cuisine-orbit.webm", poster: "cuisine-orbit-poster.png", posterFrame: 30 },
  {
    id: "CuisineKorean",
    webm: "cuisine-korean.webm",
    poster: "cuisine-korean-poster.png",
    posterFrame: 25,
  },
  {
    id: "CuisineJapanese",
    webm: "cuisine-japanese.webm",
    poster: "cuisine-japanese-poster.png",
    posterFrame: 25,
  },
  {
    id: "CuisineModernIndian",
    webm: "cuisine-modern-indian.webm",
    poster: "cuisine-modern-indian-poster.png",
    posterFrame: 25,
  },
  {
    id: "CuisineLevantine",
    webm: "cuisine-levantine.webm",
    poster: "cuisine-levantine-poster.png",
    posterFrame: 25,
  },
  {
    id: "CuisineSoutheastAsian",
    webm: "cuisine-southeast-asian.webm",
    poster: "cuisine-southeast-asian-poster.png",
    posterFrame: 25,
  },
  {
    id: "CuisineBakery",
    webm: "cuisine-bakery.webm",
    poster: "cuisine-bakery-poster.png",
    posterFrame: 25,
  },
];

async function main() {
  console.log("Bundling Remotion project…");
  const bundled = await bundle({ entryPoint: entry });

  for (const job of jobs) {
    const composition = await selectComposition({
      serveUrl: bundled,
      id: job.id,
    });

    const webmPath = path.join(outDir, job.webm);
    const posterPath = path.join(outDir, job.poster);

    console.log(`Rendering ${job.id} → ${job.webm}`);
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "vp8",
      outputLocation: webmPath,
      imageFormat: "png",
    });

    console.log(`Still ${job.id} → ${job.poster}`);
    await renderStill({
      composition,
      serveUrl: bundled,
      output: posterPath,
      frame: job.posterFrame ?? 0,
      imageFormat: "png",
    });
  }

  console.log(`Done. Assets written to ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
