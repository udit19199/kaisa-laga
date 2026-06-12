import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auris — Customer Feedback for Local Service Businesses",
  description:
    "A better way for local service businesses to collect customer feedback with quick voice notes instead of ignored surveys.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
