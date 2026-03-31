"use client";

import { Card } from "@/shared/components/ui/card";
import { Check, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { WingetPackage } from "../types/winget-package";
import Image from "next/image";

interface SearchPackagesResultItemProps {
  pkg: WingetPackage;
  isSelected: boolean;
  onToggle: () => void;
}

/**
 * A selectable card representing a winget package.
 * Optimized for Windows 11 aesthetics.
 */
export function SearchPackagesResultItem({
  pkg,
  isSelected,
  onToggle,
}: SearchPackagesResultItemProps) {
  return (
    <Card
      className={cn(
        "group cursor-pointer relative overflow-hidden transition-all duration-300",
        "border-border/40 hover:border-primary/40 bg-card/40 backdrop-blur-sm",
        "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
        isSelected && "border-primary/60 bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/10"
      )}
      onClick={onToggle}
    >
      <div className="p-5 flex items-center gap-5">
        {/* App Icon Container */}
        <div className="relative h-14 w-14 shrink-0 rounded-2xl bg-secondary/50 flex items-center justify-center overflow-hidden border border-border/10 shadow-inner">
          {pkg.IconUrl ? (
            <Image
              src={pkg.IconUrl}
              alt={pkg.Latest.Name}
              width={36}
              height={36}
              className="h-9 w-9 object-contain transition-transform duration-500 group-hover:scale-110"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              <span>No</span>
              <span>Icon</span>
            </div>
          )}
          
          {/* Subtle Glow Effect on Selection */}
          {isSelected && (
            <div className="absolute inset-0 bg-primary/10 animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground text-lg truncate leading-none">
              {pkg.Latest.Name}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground/80 font-medium truncate mb-2">
            {pkg.Latest.Publisher}
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex text-[10px] font-mono font-bold uppercase py-0.5 px-2 bg-muted/50 rounded-md text-muted-foreground border border-border/10">
              {pkg.Id}
            </span>
          </div>
        </div>

        {/* Selection Indicator */}
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 transform",
            isSelected
              ? "bg-primary text-primary-foreground scale-100 rotate-0 shadow-md shadow-primary/20"
              : "bg-secondary/50 text-muted-foreground scale-90 -rotate-45 group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-100"
          )}
        >
          {isSelected ? (
            <Check className="h-6 w-6" strokeWidth={3} />
          ) : (
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          )}
        </div>
      </div>
      
      {/* Background Accent Gradient */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none",
          isSelected ? "opacity-100" : "group-hover:opacity-40"
        )} 
      />
    </Card>
  );
}
