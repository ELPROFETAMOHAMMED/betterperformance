"use client";

import Link from "next/link";
import { RocketLaunchIcon, UsersIcon, CodeBracketIcon, LinkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import AnimatedHero from "@/shared/components/layout/animated-hero";
import { OnboardingHints } from "@/shared/components/layout/onboarding-hints";
import { HeroBadge } from "@/shared/components/layout/hero-badge";

interface HomeContentProps {
  children?: React.ReactNode;
}

export default function HomeContent({ children }: HomeContentProps) {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] w-full flex-col items-center gap-10 px-4 py-10">
      <div className="grid w-full max-w-7xl items-center gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Left: hero content */}
        <section className="space-y-6">
          <HeroBadge />

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
                <RocketLaunchIcon className="h-4 w-4" />
                Start tweaking
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
                      <UsersIcon className="h-3.5 w-3.5" />
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

          <OnboardingHints />
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
              style={{ width: "auto", height: "auto" }}
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

      {/* SEO / Feature content */}
      <section className="w-full max-w-7xl space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border/40 bg-card/70 p-4 shadow-sm">
            <h3 className="text-sm font-semibold">Safe Windows tweaks</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Every Windows tweak includes a plain‑language explanation,
              recommended usage, and how to undo the change so you always stay in control.
            </p>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/70 p-4 shadow-sm">
            <h3 className="text-sm font-semibold">PowerShell scripts you can trust</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Generate clean, readable PowerShell scripts instead of copying random commands
              from forums. Keep a history of your favorite performance presets.
            </p>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/70 p-4 shadow-sm">
            <h3 className="text-sm font-semibold">Focus on performance, not guesswork</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              BetterPerformance groups tweaks by category so you can quickly optimise gaming,
              productivity, or general Windows responsiveness without breaking core features.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">
              Windows performance optimisation without risk
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              BetterPerformance is built for people who want a faster Windows PC (Windows 7, 8, 10, 11)
              without reinstalling the operating system or installing shady &quot;optimizer&quot; tools.
              Our library of tweaks focuses on transparent, reversible performance improvements:
              services you can safely disable, visual effects that impact FPS, scheduled tasks that
              slow down boot time, and more.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Because every tweak is stored as a PowerShell script, you can export exactly what
              you are going to run, version it in Git, and reuse the same performance profile on
              multiple machines. This makes BetterPerformance ideal for gamers, creators, and
              IT professionals who manage several Windows devices.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Link
                href="https://github.com/ELPROFETAMOHAMMED/betterperformance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border/40 bg-background/80 px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
              >
                <CodeBracketIcon className="h-3.5 w-3.5" />
                <span>Open source on GitHub</span>
              </Link>
              <span className="text-[10px] text-muted-foreground/70">•</span>
              <span className="text-[10px] text-muted-foreground/70">
                <strong className="text-foreground">100% Free</strong> and <strong className="text-foreground">Open Source</strong>
              </span>
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-dashed border-border/50 bg-card/70 p-4 text-xs text-muted-foreground">
            <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
              Why BetterPerformance ranks for Windows tweaks
            </h3>
            <p>
              This dashboard focuses on long‑term{" "}
              <strong>Windows performance tweaks</strong> rather than short‑lived “registry hacks”.
              That means clear descriptions, safe defaults, and the ability to revert changes at
              any time.
            </p>
            <p>
              Search phrases like <strong>Windows performance tweaks</strong>,{" "}
              <strong>PowerShell Windows optimisation</strong>, and{" "}
              <strong>safe tweaks for Windows</strong> are built into our help content so you
              can easily rediscover the app when you need it again.
            </p>
          </div>
        </div>
      </section>

      {/* Contributors Section */}
      <section className="w-full max-w-7xl space-y-4">
        <div className="rounded-xl border border-border/40 bg-card/70 p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">Contributors</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Special thanks to these creators who have contributed to BetterPerformance through their tweaks and insights.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="https://www.youtube.com/@FR33THY"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border/40 bg-background/80 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>fr33thy</span>
            </Link>
            <Link
              href="https://www.youtube.com/@ChrisTitusTech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border/40 bg-background/80 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Chris Titus Tech</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Favorites Carousel - shown at bottom if user has favorites */}
      {children}
    </main>
  );
}



