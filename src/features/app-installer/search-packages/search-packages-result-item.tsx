"use client";

import { Card } from "@/shared/components/ui/card";
import { Check, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { WingetPackage } from "@/features/app-installer/types/winget-package";
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
        "group cursor-pointer rounded-[var(--radius-md)] border border-border/20 bg-card/80 transition-colors",
        "hover:bg-secondary/40",
        isSelected && "border-primary/40 bg-primary/10 ring-1 ring-primary/20"
      )}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-border/30 bg-background/50">
          {pkg.IconUrl ? (
            <Image
              src={pkg.IconUrl}
              alt={pkg.Latest.Name}
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              unoptimized
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-sm font-semibold text-primary select-none">
              {pkg.Latest.Name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {pkg.Latest.Name}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {pkg.Latest.Publisher}
          </p>
          <div className="mt-1 inline-flex max-w-full rounded-[var(--radius-md)] border border-border/30 bg-background/60 px-2 py-0.5">
            <span className="truncate font-mono text-xs text-muted-foreground">{pkg.Id}</span>
          </div>
        </div>

        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border transition-colors",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground group-hover:bg-secondary"
          )}
        >
          {isSelected ? (
            <Check className="h-4 w-4" strokeWidth={3} />
          ) : (
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          )}
        </div>
      </div>
    </Card>
  );
}
