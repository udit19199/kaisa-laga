"use client";

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, useUser } from "@clerk/nextjs"
import { clerkDashboardAppearance } from "@/lib/clerk-appearance"
import {
  LayoutDashboard,
  Inbox,
  MapPin,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { BrandMark } from "@/components/brand-mark"

const navItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inbox",
    url: "/dashboard/inbox",
    icon: Inbox,
  },
  {
    title: "Locations",
    url: "/dashboard/locations",
    icon: MapPin,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <BrandMark className="size-8" imageClassName="h-5 w-5" />
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Kaisa Laga</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<Link href={item.url} />} isActive={pathname === item.url} tooltip={item.title}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <UserButton appearance={clerkDashboardAppearance} />
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-semibold">{user?.fullName ?? "User"}</span>
                <span className="truncate text-xs">{user?.primaryEmailAddress?.emailAddress ?? ""}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarSeparator />
    </Sidebar>
  )
}
