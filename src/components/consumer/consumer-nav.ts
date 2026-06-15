import { QrCode, Search, UserRound, type LucideIcon } from "lucide-react";

export type ConsumerTab = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const consumerTabs: ConsumerTab[] = [
  { href: "/", label: "Search", icon: Search },
  { href: "/capture", label: "Capture", icon: QrCode },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function isConsumerTabActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
