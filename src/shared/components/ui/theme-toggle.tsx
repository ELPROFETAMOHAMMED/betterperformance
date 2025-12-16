"use client";

import * as React from "react";
import { ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { Button } from "@/shared/components/ui/button";

import { cn } from "@/shared/lib/utils";

type ThemeOption = "system" | "light" | "dark";

interface ThemeToggleProps {
  className?: string;
}

const options: {
  value: ThemeOption;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "system", label: "System", icon: <ComputerDesktopIcon className="h-3.5 w-3.5" /> },
  { value: "light", label: "Light", icon: <SunIcon className="h-3.5 w-3.5" /> },
  { value: "dark", label: "Dark", icon: <MoonIcon className="h-3.5 w-3.5" /> },
];

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const current: ThemeOption =
    mounted && theme && ["system", "light", "dark"].includes(theme)
      ? (theme as ThemeOption)
      : "system";

  if (!mounted) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-border/60 bg-background/80 px-1.5 py-1 text-[11px] text-muted-foreground",
          className
        )}
      >
        <div className="h-6 w-16 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-border/60 bg-background/80 p-1 text-[11px] backdrop-blur",
        className
      )}
    >
      {options.map((opt) => {
        const active = current === opt.value;
        return (
          <Button
            key={opt.value}
            type="button"
            variant={active ? "default" : "ghost"}
            size="sm"
            onClick={() => setTheme(opt.value)}
            className={cn(
              "h-7 gap-1 rounded-[calc(var(--radius-md)-2px)] px-2 text-[11px]",
              !active && "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              active && "bg-primary/10 text-foreground ring-1 ring-primary/40"
            )}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
          </Button>
        );
      })}
    </div>
  );
}



