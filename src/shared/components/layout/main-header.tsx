"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserCard from "@/features/home/components/user-card";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { HomeIcon, WrenchScrewdriverIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, WrenchScrewdriverIcon as WrenchScrewdriverIconSolid, Cog6ToothIcon as Cog6ToothIconSolid } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

const NAV_ITEMS = [
  { 
    href: "/home", 
    label: "Home",
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
  { 
    href: "/tweaks", 
    label: "Tweaks",
    icon: WrenchScrewdriverIcon,
    iconSolid: WrenchScrewdriverIconSolid,
  },
  { 
    href: "/settings", 
    label: "Settings",
    icon: Cog6ToothIcon,
    iconSolid: Cog6ToothIconSolid,
  },
];

export default function MainHeader() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  const activeIndex = NAV_ITEMS.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href !== "/home" && pathname.startsWith(item.href) && item.href !== "/")
  );

  useEffect(() => {
    if (navRef.current && indicatorRef.current && activeIndex >= 0) {
      const navItems = navRef.current.querySelectorAll("a");
      const activeItem = navItems[activeIndex] as HTMLElement;
      
      if (activeItem) {
        const navRect = navRef.current.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        
        setIndicatorStyle({
          left: itemRect.left - navRect.left,
          width: itemRect.width,
        });
      }
    }
  }, [pathname, activeIndex]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Image
            src="/assets/Aplication-logo.png"
            alt="BetterPerformance logo"
            width={28}
            height={28}
            className="rounded-[var(--radius-sm)]"
          />
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight">
                BetterPerformance
              </span>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center rounded bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/5">
                      BETA
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-xs">
                      This application is in beta. Some features may not work as expected. 
                      Please report any bugs or issues you encounter.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Windows Performance Tweaks
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav 
          ref={navRef}
          className="relative ml-6 hidden flex-1 items-center gap-0.5 text-sm font-medium md:flex"
        >
          {/* Animated indicator */}
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out rounded-full"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
          
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/home" &&
                pathname.startsWith(item.href) &&
                item.href !== "/");

            const IconComponent = active ? item.iconSolid : item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  "hover:bg-muted/50",
                  active 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <IconComponent 
                  className={cn(
                    "h-4 w-4 transition-all duration-200",
                    active 
                      ? "text-primary scale-110" 
                      : "group-hover:scale-105"
                  )} 
                />
                <span className="relative z-10">{item.label}</span>
                
                {/* Hover glow effect */}
                {!active && (
                  <span className="absolute inset-0 rounded-lg bg-primary/0 group-hover:bg-primary/5 transition-colors duration-200" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <UserCard />
        </div>
      </div>
    </header>
  );
}



