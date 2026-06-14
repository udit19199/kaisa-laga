import type { Metadata } from "next";
import { CaptureHubPage } from "@/components/consumer/capture-hub-page";

export const metadata: Metadata = {
  title: "Capture — Kaisa Laga",
  description: "Scan a venue QR after your visit and answer Kaisa laga?",
};

export default function Page() {
  return <CaptureHubPage />;
}
