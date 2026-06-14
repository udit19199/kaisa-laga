import { Compass, QrCode, Sparkles, UserRound, type LucideIcon } from "lucide-react";

export type ConsumerTab = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const consumerTabs: ConsumerTab[] = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/for-you", label: "For you", icon: Sparkles },
  { href: "/capture", label: "Capture", icon: QrCode },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function isConsumerTabActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
