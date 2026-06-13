import type { Metadata } from "next";
import "@/components/story/story-tokens.css";

export const metadata: Metadata = {
  title: "Story assets — Kaisa Laga",
  description: "Preview narrative story scenes for Kaisa Laga marketing",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
