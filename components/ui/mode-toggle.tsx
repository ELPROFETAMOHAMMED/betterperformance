"use client";

import * as React from "react";
import { Moon, Sun, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Evitar error de hidratación: solo renderizar el tema después de montar
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Renderizar placeholder simple en el servidor para evitar problemas de hidratación con Radix UI
  if (!mounted) {
    return (
      <Button variant="outline" className={cn(className)} disabled>
        <SunMoonIcon className="h-5 w-5" />
        <Separator orientation={"vertical"} />
        <span className="w-20 inline-block" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn(className)}>
          <SunMoonIcon className="h-5 w-5" />
          <Separator orientation={"vertical"} />
          {theme === "light" ? (
            <span>Light Mode</span>
          ) : (
            <span>Dark Mode</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
