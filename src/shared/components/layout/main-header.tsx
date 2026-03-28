"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserCard from "@/features/home/components/user-card";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { HomeIcon, WrenchScrewdriverIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, WrenchScrewdriverIcon as WrenchScrewdriverIconSolid, Cog6ToothIcon as Cog6ToothIconSolid } from "@heroicons/react/24/solid";
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

  return (
    <header className="sticky top-0 z-30 w-full bg-background/50 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Image
            src="/assets/Aplication-logo.png"
            alt="BetterPerformance logo"
            width={28}
            height={28}
            className="rounded-[var(--radius-sm)] shadow-sm"
          />
          <span className="text-[15px] font-medium tracking-tight">
            BetterPerformance
          </span>
        </div>

        {/* Nav & Right side */}
        <div className="ml-auto flex items-center gap-4">
          <nav className="hidden items-center gap-1.5 md:flex">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/home" &&
                  pathname.startsWith(item.href) &&
                  item.href !== "/");

              const IconComponent = active ? item.iconSolid : item.icon;

              return (
                <TooltipProvider key={item.href}>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center justify-center rounded-md h-9 w-9 transition-all duration-200",
                          active 
                            ? "bg-secondary/80 text-foreground shadow-sm" 
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        )}
                      >
                        <IconComponent 
                          className={cn(
                            "h-5 w-5 transition-all duration-200",
                            active ? "text-primary scale-105" : "text-muted-foreground"
                          )} 
                        />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs font-medium">{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </nav>

          <div className="hidden md:block w-[1px] h-5 bg-border/50" />
          
          <UserCard />
        </div>
      </div>
    </header>
  );
}



