import { Shield, Zap, RotateCcw, Code, Download } from "lucide-react";
import Image from "next/image";
import LandingLoginButton from "./landing-login-button";
import LandingErrorHandler from "./landing-error-handler";
import AnimatedHero from "@/shared/components/layout/animated-hero";

const features = [
  {
    icon: Shield,
    title: "Safe & Reversible",
    description:
      "All tweaks are carefully curated and can be easily undone. No risky scripts or permanent changes.",
  },
  {
    icon: Zap,
    title: "Performance Boost",
    description:
      "Optimize your Windows system with proven tweaks that actually improve performance.",
  },
  {
    icon: RotateCcw,
    title: "Easy Rollback",
    description:
      "Every change is documented. Revert any tweak with a single click if needed.",
  },
  {
    icon: Code,
    title: "Transparent Code",
    description:
      "See exactly what each tweak does. No hidden scripts or mysterious changes.",
  },
  {
    icon: Download,
    title: "Manual Control",
    description:
      "Download and review tweaks before applying. You're always in control.",
  },
];

export default function LandingPage() {
  return (
    <>
      <LandingErrorHandler />
      <div className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="flex min-h-[90vh] items-center justify-center px-4 py-20">
          <div className="grid w-full max-w-6xl items-center gap-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            {/* Left: Hero Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Safe, opinionated tweaks for Windows power users</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                  Windows 10 & 11 Performance Tweaks{" "}
                  <span className="text-primary">Made Simple</span>
                </h1>
                <p className="text-base text-muted-foreground sm:text-lg md:text-xl max-w-2xl">
                  Optimize Windows 10 and Windows 11 performance with safe, reversible tweaks. 
                  Get better performance with curated PowerShell scripts for Windows optimization. 
                  Free Windows tweaks for Twix for Windows, Windows 10, and Windows 11.
                </p>
              </div>

              {/* Login CTA */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <LandingLoginButton />
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Free to use • No credit card required
                </p>
              </div>

              {/* Trust indicators */}
              <div className="grid gap-3 rounded-lg border border-dashed border-border/50 bg-card/80 p-4 text-xs text-muted-foreground md:grid-cols-2">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    New to system tweaks?
                  </p>
                  <p>
                    Start on the Tweaks page. Each category explains what it
                    does, why it is safe, and how to undo it.
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
            </div>

            {/* Right: Logo / Visual */}
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-[var(--radius-lg)] bg-primary/15 blur-3xl" />
                <AnimatedHero className="absolute h-48 w-48 md:h-64 md:w-64" />
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
                  Designed for people who want a faster machine without turning
                  into a full-time sysadmin.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border/40 bg-muted/30 py-20 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                Windows 10 & 11 Performance{" "}
                <span className="text-primary">Optimization Tools</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Free Windows tweaks for better performance. Optimize Windows 10 and Windows 11 with safe PowerShell scripts.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group rounded-lg border border-border/40 bg-background/80 p-6 backdrop-blur transition-all hover:border-border hover:bg-background"
                  >
                    <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="border-t border-border/40 py-20 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              Ready to Optimize Windows 10 & 11 Performance?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of users who have improved their Windows 10 and Windows 11 performance 
              with our free tweaks and optimization tools
            </p>
            <div className="mt-8">
              <LandingLoginButton className="px-8" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}



