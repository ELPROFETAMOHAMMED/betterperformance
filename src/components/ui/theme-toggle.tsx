"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

type ThemeOption = "system" | "light" | "dark";

interface ThemeToggleProps {
  className?: string;
}

const options: {
  value: ThemeOption;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "system", label: "System", icon: <Monitor className="h-3.5 w-3.5" /> },
  { value: "light", label: "Light", icon: <Sun className="h-3.5 w-3.5" /> },
  { value: "dark", label: "Dark", icon: <Moon className="h-3.5 w-3.5" /> },
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
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={cn(
              "inline-flex items-center gap-1 rounded-[calc(var(--radius-md)-2px)] px-2 py-1 transition-colors",
              "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              active && "bg-primary/10 text-foreground ring-1 ring-primary/40"
            )}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
