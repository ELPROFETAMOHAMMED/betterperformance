"use client";

import Link from "next/link";
import { History, RocketIcon, Users } from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import AnimatedHero from "@/shared/components/layout/animated-hero";

interface HomeContentProps {
  children?: React.ReactNode;
}

export default function HomeContent({ children }: HomeContentProps) {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] w-full flex-col items-center justify-center gap-8 px-4 py-8">
      <div className="grid w-full max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Left: hero content */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Safe, opinionated tweaks for Windows power users</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              Tune your PC performance{" "}
              <span className="text-primary">the right way</span>.
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              BetterPerformance guides you through curated, reversible tweaks so
              you can optimise Windows without hunting through obscure forums or
              risky scripts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              asChild
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium"
            >
              <Link href="/tweaks">
                <RocketIcon className="h-4 w-4" />
                Start tweaking
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border-border/60 bg-background/80 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent/50"
            >
              <Link href="/history-tweaks">
                <History className="h-3.5 w-3.5" />
                View history
              </Link>
            </Button>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <span className="inline-block">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border-border/60 bg-background/80 px-3 py-2 text-xs font-medium text-muted-foreground cursor-not-allowed opacity-60 pointer-events-none"
                    >
                      <Users className="h-3.5 w-3.5" />
                      Community Tweaks
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-sm">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold">Coming Soon: Community Tweaks</p>
                    <p className="text-xs">
                      A new feature where users can upload and share their own tweaks. This will allow you to discover and download community-created tweaks.
                    </p>
                    <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-2 mt-2">
                      <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-500 mb-1">
                        ⚠️ Important Warning
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        Community tweaks will <strong>NOT</strong> be verified or reviewed by BetterPerformance. Files may be corrupt, contain viruses, or not work as expected. Use at your own risk.
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid gap-3 rounded-lg border border-dashed border-border/50 bg-card/80 p-4 text-xs text-muted-foreground md:grid-cols-2">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                New to system tweaks?
              </p>
              <p>
                Start on the Tweaks page. Each category explains what it does,
                why it is safe, and how to undo it.
              </p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Prefer to read first?
              </p>
              <p>
                Our documentation walks through each step so you always know
                what you are changing.
              </p>
            </div>
          </div>
        </section>

        {/* Right: logo / ambient visual */}
        <section className="flex flex-col items-center justify-center gap-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-[var(--radius-lg)] bg-primary/15 blur-3xl" />
            <AnimatedHero className="absolute h-48 w-48" />
            <Image
              src="/assets/Aplication-logo.png"
              className="relative h-32 w-32 rounded-[var(--radius-lg)] md:h-40 md:w-40"
              alt="BetterPerformance logo"
              width={160}
              height={160}
            />
          </div>
          <div className="flex flex-col items-center gap-1 text-center text-xs text-muted-foreground">
            <p>
              Designed for people who want a faster machine without turning into
              a full-time sysadmin.
            </p>
          </div>
        </section>
      </div>

      {/* Favorites Carousel - shown at bottom if user has favorites */}
      {children}
    </main>
  );
}



