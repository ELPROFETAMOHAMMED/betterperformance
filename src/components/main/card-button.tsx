"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface CardButtonProps {
  mTitle: string;
  mDescription: string;
  mIcon: LucideIcon;
  mColor?: string;
  mSize?: number;
}

export default function CardButton({
  mTitle,
  mDescription,
  mIcon: Icon,
  mSize = 24,
  mColor = "text-primary",
}: CardButtonProps) {
  const router = useRouter();
  return (
    <Button
      className={cn(
        "group relative flex items-center gap-4 p-5 h-28 w-[400px]",
        "hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.02]",
        "transition-all duration-300 ease-out",
        "border-2 border-border/50 hover:border-primary/40",
        "bg-background/50 hover:bg-accent/30",
        "backdrop-blur-sm",
        "overflow-hidden"
      )}
      variant={"outline"}
      onClick={() => router.push("/tweaks")}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/3 group-hover:to-primary/0 transition-all duration-500" />

      {/* LEFT SIDE - Icon with hover effect */}
      <div className="relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-accent/30 group-hover:bg-primary/10 transition-all duration-300 group-hover:scale-110">
        <Icon
          className={cn(
            mColor,
            "transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          )}
          size={mSize}
          strokeWidth={1.5}
        />
      </div>

      {/* Separator with animation */}
      <div className="relative h-14 w-px bg-border/60 group-hover:bg-primary/30 transition-colors duration-300">
        <div className="absolute inset-0 w-full bg-primary/0 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-y-110" />
      </div>

      {/* RIGHT SIDE - Content */}
      <div className="relative flex flex-col items-start justify-center flex-1 min-w-0 text-left gap-1.5 overflow-hidden">
        <h3 className="text-base font-semibold text-foreground leading-tight w-full truncate group-hover:text-foreground transition-colors duration-200">
          {mTitle}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 w-full break-words group-hover:text-muted-foreground/90 transition-colors duration-200">
          {mDescription}
        </p>
      </div>

      {/* Arrow indicator on hover */}
      <div className="absolute right-4 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-primary"
        >
          <path
            d="M6 12L10 8L6 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Button>
  );
}
