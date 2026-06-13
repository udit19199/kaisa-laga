# Mobbin references — customer capture (`/f/[locationId]`)

Kaisa Laga serves **any physical location** (retail, clinics, hotels, venues, etc.), not restaurants only. Capture UI follows **Clubhouse** for the mic control; other apps are secondary.

## Primary: Clubhouse (mic + label)

| Screen | Mobbin link | What we use |
|--------|-------------|-------------|
| Voice prompt | [Clubhouse — hold and say](https://mobbin.com/screens/50df12fc-147c-4fca-b1bf-b5c3a7644c95) | Instruction + quoted prompt above mic |
| Private room | [Clubhouse — hold to talk](https://mobbin.com/screens/6d57c7e1-6c0c-4373-bb9c-2e03a483da4c) | **Large circular mic**, **"hold to talk" label below** |

## Secondary: voice recording mechanics

| App | Mobbin screen | Borrowed |
|-----|---------------|----------|
| [LINE](https://mobbin.com/screens/57a66704-bde7-434b-8ca6-5c28a19138a7) | Voice message | Timer + progress ring while recording |
| [Family](https://mobbin.com/screens/3364e482-5c22-4203-ad9f-770b1baf7a03) | Chat voice | Waveform while recording |

## Not used for capture copy (food-delivery bias)

Zomato, Swiggy, Grab, Keeta, DoorDash flows are useful for **post-transaction rating forms**, not voice-at-location feedback. Kept for operator dashboard inspiration only; do not mirror their restaurant-specific language on `/f/*`.

## QR scan flows (operator deployment)

| App | Mobbin screen | Notes |
|-----|---------------|-------|
| [Philips Hue](https://mobbin.com/screens/7ecd51b4-082e-4005-a505-3386320ed0ac) | QR scanner | Clear CTA after scan |
| [Lyft](https://mobbin.com/screens/3b468deb-4a48-4a29-b5e9-a35573729ddd) | Scan QR | Minimal single-task screen |

## Applied in Kaisa Laga capture

1. Clubhouse layout: instruction → quoted prompt → **152px mic** → lowercase **hold to talk**
2. Location pill (venue-agnostic; any business name)
3. Progress ring + waveform during recording (LINE, Family)
4. Privacy footer: recording stays with the location team

## MCP

Server: `user-Mobbin` · Config in `~/.cursor/mcp.json`
