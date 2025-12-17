import { ShieldCheckIcon, BoltIcon, ArrowUturnLeftIcon, CodeBracketIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import LandingLoginButton from "./landing-login-button";
import LandingErrorHandler from "./landing-error-handler";
import AnimatedHero from "@/shared/components/layout/animated-hero";
import { OnboardingHints } from "@/shared/components/layout/onboarding-hints";
import { HeroBadge } from "@/shared/components/layout/hero-badge";
import { AppFooter } from "@/shared/components/layout/app-footer";

const features = [
  {
    icon: ShieldCheckIcon,
    title: "Safe & Reversible",
    description:
      "All tweaks are carefully curated and can be easily undone. No risky scripts or permanent changes.",
  },
  {
    icon: BoltIcon,
    title: "Performance Boost",
    description:
      "Optimize your Windows system with proven tweaks that actually improve performance.",
  },
  {
    icon: ArrowUturnLeftIcon,
    title: "Easy Rollback",
    description:
      "Every change is documented. Revert any tweak with a single click if needed.",
  },
  {
    icon: CodeBracketIcon,
    title: "Transparent Code",
    description:
      "See exactly what each tweak does. No hidden scripts or mysterious changes.",
  },
  {
    icon: ArrowDownTrayIcon,
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
              <HeroBadge />

              <div className="space-y-4">
                <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                  Windows Performance Tweaks{" "}
                  <span className="text-primary">Made Simple</span>
                </h1>
                <p className="text-base text-muted-foreground sm:text-lg md:text-xl max-w-2xl">
                  Optimize Windows systems (Windows 7, 8, 10, 11) with safe, reversible tweaks. 
                  Get better performance with curated PowerShell scripts for Windows optimization. 
                  Free Windows tweaks for all Windows versions.
                </p>
              </div>

              {/* Login CTA */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <LandingLoginButton />
                <p className="text-xs text-muted-foreground sm:text-sm">
                  <strong className="text-foreground">100% Free</strong> • <strong className="text-foreground">Open Source</strong> • No credit card required
                </p>
              </div>
              
              {/* Open Source Badge */}
              <div className="flex items-center gap-2">
                <Link
                  href="https://github.com/ELPROFETAMOHAMMED/betterperformance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/80 px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
                >
                  <CodeBracketIcon className="h-3.5 w-3.5" />
                  <span>View source code on GitHub</span>
                </Link>
              </div>

              {/* Trust indicators */}
              <OnboardingHints />
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
                  style={{ width: "auto", height: "auto" }}
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
                Windows Performance{" "}
                <span className="text-primary">Optimization Tools</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                <strong className="text-foreground">100% Free</strong> and <strong className="text-foreground">Open Source</strong> Windows tweaks for better performance. Optimize Windows systems (Windows 7, 8, 10, 11) with safe PowerShell scripts.
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
              Ready to Optimize Windows Performance?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of users who have improved their Windows performance 
              with our free tweaks and optimization tools for all Windows versions
            </p>
            <div className="mt-8">
              <LandingLoginButton className="px-8" />
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <AppFooter />
      </div>
    </>
  );
}



