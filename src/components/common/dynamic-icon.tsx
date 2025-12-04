"use client";

import type { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicIconProps {
  name?: string | null;
  className?: string;
}

const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;

const toPascalCase = (value?: string | null) => {
  if (!value) return "";
  return value
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
};

const stripNumericSuffix = (value?: string | null) =>
  value?.replace(/[-_\s]*\d+$/g, "") ?? value ?? "";

export default function DynamicIcon({ name, className }: DynamicIconProps) {
  const candidates = [
    name ?? "",
    toPascalCase(name),
    toPascalCase(stripNumericSuffix(name)),
  ].filter(Boolean);

  const IconComponent =
    candidates.reduce<LucideIcon | undefined>(
      (found, candidate) => found ?? icons[candidate],
      undefined
    ) ?? icons["Square"] ?? (() => null);

  return <IconComponent className={cn("h-4 w-4", className)} />;
}


