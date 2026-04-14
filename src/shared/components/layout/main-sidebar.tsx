"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

import { cn } from "@/shared/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import UserCard from "@/features/home/components/user-card";
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
  FireIcon,
  StarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CommandLineIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  FireIcon as FireIconSolid,
  StarIcon as StarIconSolid,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  CommandLineIcon as CommandLineIconSolid,
  PhotoIcon as PhotoIconSolid
} from "@heroicons/react/24/solid";

const TOP_GROUPS = [
  {
    label: null,
    items: [
      {
        title: "Home",
        url: "/home",
        icon: HomeIcon,
        iconSolid: HomeIconSolid,
      }
    ]
  },
  {
    label: "Optimization",
    items: [
      {
        title: "Tweaks",
        url: "/tweaks/library",
        icon: WrenchScrewdriverIcon,
        iconSolid: WrenchScrewdriverIconSolid,
      },
      {
        title: "Popular",
        url: "/tweaks/popular",
        icon: FireIcon,
        iconSolid: FireIconSolid,
      }
    ]
  },
  {
    label: "Software",
    items: [
      {
        title: "Apps Store",
        url: "/tweaks/apps",
        icon: CommandLineIcon,
        iconSolid: CommandLineIconSolid,
      }
    ]
  },
  {
    label: "Media",
    items: [
      {
        title: "Wallpapers",
        url: "/tweaks/wallpapers",
        icon: PhotoIcon,
        iconSolid: PhotoIconSolid,
      }
    ]
  }
];

const BOTTOM_GROUPS = [
  {
    label: "My Workspace",
    items: [
      {
        title: "Favorites",
        url: "/tweaks/favorites",
        icon: StarIcon,
        iconSolid: StarIconSolid,
      },
      {
        title: "History",
        url: "/tweaks/history",
        icon: ClockIcon,
        iconSolid: ClockIconSolid,
      },
      {
        title: "Reported",
        url: "/tweaks/reported",
        icon: ExclamationTriangleIcon,
        iconSolid: ExclamationTriangleIconSolid,
      }
    ]
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Cog6ToothIcon,
        iconSolid: Cog6ToothIconSolid,
      }
    ]
  }
];

export function MainSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props} className="border-r border-border/40 bg-sidebar/60 backdrop-blur-xl">
      <SidebarHeader className="flex h-14 items-center border-b border-border/40 px-4 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center transition-all duration-300">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex shrink-0 items-center justify-center">
            <Image
              src="/assets/Aplication-logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[state=collapsed]:hidden transition-all duration-300">
            <span className="font-bold text-sm tracking-tight">BetterPerformance</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium opacity-70">Optimization Suite</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 flex flex-col h-full">
        <div className="flex flex-col gap-4">
          {TOP_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col gap-1">
              {group.label && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1 group-data-[state=collapsed]:hidden">
                  {group.label}
                </span>
              )}
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = pathname === item.url;
                  const IconComponent = active ? item.iconSolid : item.icon;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className={cn(
                          "group/button relative h-9 w-full transition-all duration-200",
                          active
                            ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20 shadow-sm"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                        )}
                      >
                        <Link href={item.url} className="flex items-center gap-3 w-full relative">
                          {active && (
                            <motion.div
                              layoutId="active-indicator"
                              className="absolute -left-1.5 w-1 h-4.5 bg-primary rounded-full transition-all"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                          <IconComponent className={cn(
                            "h-4.5 w-4.5 shrink-0 transition-all duration-200",
                            active ? "scale-105" : "group-hover/button:scale-105"
                          )} />
                          <span className="text-[13px] tracking-tight">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          ))}
        </div>

        <div className="mt-auto mb-2 flex flex-col gap-4">
          {BOTTOM_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col gap-1">
              {group.label && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1 group-data-[state=collapsed]:hidden">
                  {group.label}
                </span>
              )}
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = pathname === item.url;
                  const IconComponent = active ? item.iconSolid : item.icon;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className={cn(
                          "group/button relative h-9 w-full transition-all duration-200",
                          active
                            ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20 shadow-sm"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                        )}
                      >
                        <Link href={item.url} className="flex items-center gap-3 w-full relative">
                          {active && (
                            <motion.div
                              layoutId="active-indicator"
                              className="absolute -left-1.5 w-1 h-4.5 bg-primary rounded-full transition-all"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                          <IconComponent className={cn(
                            "h-4.5 w-4.5 shrink-0 transition-all duration-200",
                            active ? "scale-105" : "group-hover/button:scale-105"
                          )} />
                          <span className="text-[13px] tracking-tight">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border/40">
        <UserCard />
      </SidebarFooter>
    </Sidebar>
  );
}
