"use client";

export function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span>Safe, opinionated tweaks for Windows power users</span>
    </div>
  );
}


