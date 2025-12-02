"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getIcon } from "@/utils/icon-map";

interface DynamicIconProps {
  name: string;
  className?: string;
}

export default function DynamicIcon({ name, className }: DynamicIconProps) {
  const IconComponent: LucideIcon = getIcon(name);

  return <IconComponent className={cn("h-4 w-4", className)} />;
}


