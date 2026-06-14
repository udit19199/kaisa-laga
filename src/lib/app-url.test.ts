import { afterEach, describe, expect, it } from "vitest";
import { buildCaptureUrl, getAppUrl, CANONICAL_APP_URL } from "./app-url";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("getAppUrl", () => {
  it("prefers NEXT_PUBLIC_APP_URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com/";
    delete process.env.VERCEL_URL;
    expect(getAppUrl()).toBe("https://example.com");
  });

  it("falls back to VERCEL_URL", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_URL = "preview-abc.vercel.app";
    expect(getAppUrl()).toBe("https://preview-abc.vercel.app");
  });

  it("uses request host when env vars are absent", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;

    const headers = new Headers({
      host: "kaisa-laga.vercel.app",
      "x-forwarded-proto": "https",
    });
    expect(getAppUrl(headers)).toBe("https://kaisa-laga.vercel.app");
  });

  it("defaults to localhost in development", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
    process.env.NODE_ENV = "development";
    expect(getAppUrl()).toBe("http://localhost:3000");
  });

  it("defaults to canonical production URL in production without env", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
    process.env.NODE_ENV = "production";
    expect(getAppUrl()).toBe(CANONICAL_APP_URL);
  });
});

describe("buildCaptureUrl", () => {
  it("builds the guest capture path", () => {
    expect(
      buildCaptureUrl("550e8400-e29b-41d4-a716-446655440000", "https://kaisa-laga.vercel.app"),
    ).toBe("https://kaisa-laga.vercel.app/f/550e8400-e29b-41d4-a716-446655440000");
  });
});
