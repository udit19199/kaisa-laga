# Marketing illustration renders

Local-only Remotion workspace. Dependencies stay in this folder — not in the main app.

## Generate assets

From the repo root:

```bash
bun run render:illustrations
```

Outputs WebM loops and PNG posters to `public/marketing/animations/`.

## Preview in Remotion Studio

```bash
cd tools/remotion
bun install
bun run studio
```

## Theme variants (consumer shell)

Append `?theme=cobalt` or `?theme=forest` to any consumer route. Default is `paper` (white + zinc + warm accent).
