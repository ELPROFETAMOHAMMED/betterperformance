"use client";

import React from "react";

export function OnboardingHints() {
  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-border/50 bg-card/80 p-4 text-xs text-muted-foreground md:grid-cols-2">
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          New to system tweaks?
        </p>
        <p>
          Start on the Tweaks page. Each category explains what it does, why it
          is safe, and how to undo it.
        </p>
      </div>
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Prefer to read first?
        </p>
        <p>
          Our documentation walks through each step so you always know what you
          are changing.
        </p>
      </div>
    </div>
  );
}


