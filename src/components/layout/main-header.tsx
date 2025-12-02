"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserCard from "@/components/main/user-card";
import Image from "next/image";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home" },
  { href: "/tweaks", label: "Tweaks" },
  { href: "/history-tweaks", label: "History" },
  { href: "/settings", label: "Settings" },
];

export default function MainHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Image
            src="/assets/Aplication-logo.png"
            alt="BetterPerformance logo"
            width={28}
            height={28}
            className="rounded-md shadow-sm"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">
              BetterPerformance
            </span>
            <span className="text-[11px] text-muted-foreground">
              Tweak your PC with confidence
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="ml-6 hidden flex-1 items-center gap-1 text-sm font-medium md:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/home" &&
                pathname.startsWith(item.href) &&
                item.href !== "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-3 py-1.5 text-xs transition-all",
                  "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                  active &&
                    "bg-accent/80 text-foreground shadow-sm border border-border/60"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-1 h-px rounded-full bg-primary/50" />
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
