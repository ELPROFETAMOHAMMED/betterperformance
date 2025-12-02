import Link from "next/link";
import { History, RocketIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import LottieIllustration from "@/components/layout/lottie-illustration";
import heroAnimation from "@/data/lottie/hero-loop.json";

export default function HomeContent() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center px-4">
      <div className="grid w-full max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Left: hero content */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/80 px-3 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
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
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium shadow-sm"
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
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border-border/60 bg-background/80 px-3 py-2 text-xs font-medium text-foreground shadow-sm hover:bg-accent/50"
            >
              <Link href="/history-tweaks">
                <History className="h-3.5 w-3.5" />
                View history
              </Link>
            </Button>
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
            <LottieIllustration
              animationData={heroAnimation}
              className="absolute h-48 w-48 opacity-60"
            />
            <Image
              src="/assets/Aplication-logo.png"
              className="relative h-32 w-32 rounded-[var(--radius-lg)] shadow-2xl shadow-primary/25 md:h-40 md:w-40"
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
    </main>
  );
}
