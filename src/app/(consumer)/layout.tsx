import { DM_Sans, Tiro_Devanagari_Hindi } from "next/font/google";
import { ConsumerBottomNav } from "@/components/consumer/consumer-bottom-nav";
import { MarketingThemeProvider } from "@/components/marketing/marketing-theme-provider";
import { defaultMarketingTheme } from "@/lib/marketing/tokens";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const tiroDevanagari = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-tiro-devanagari",
  display: "swap",
});

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSans.variable} ${tiroDevanagari.variable} min-h-dvh bg-white`}
      data-marketing-theme={defaultMarketingTheme}
    >
      <MarketingThemeProvider>
        <div className="flex min-h-dvh min-w-0 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </div>
        <ConsumerBottomNav />
      </MarketingThemeProvider>
    </div>
  );
}
