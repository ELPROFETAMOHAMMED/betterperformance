"use client";

import Link from "next/link";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import { cn } from "@/shared/lib/utils";

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className }: AppFooterProps) {
  return (
    <footer className={cn("border-t border-border/40 bg-background/50 backdrop-blur-sm", className)}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
            <p className="text-xs text-muted-foreground">
              BetterPerformance is <strong className="text-foreground">100% free</strong> and{" "}
              <strong className="text-foreground">open source</strong>
            </p>
            <p className="text-[10px] text-muted-foreground/70">
              © {new Date().getFullYear()} BetterPerformance. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/ELPROFETAMOHAMMED/betterperformance"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
            >
              <CodeBracketIcon className="h-4 w-4" />
              <span>View on GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

