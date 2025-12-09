"use client";

import { Card } from "@/shared/components/ui/card";
import { ReactNode } from "react";

interface SettingCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingCard({
  title,
  description,
  children,
  className = "",
}: SettingCardProps) {
  return (
    <Card
      className={`space-y-4 border-border/60 bg-card/80 p-5 ${className}`}
    >
      {title && (
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      )}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
    </Card>
  );
}

