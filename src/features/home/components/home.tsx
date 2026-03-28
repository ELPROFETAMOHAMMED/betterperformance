"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { RocketLaunchIcon, ShieldCheckIcon, CodeBracketIcon, SquaresPlusIcon, InformationCircleIcon, ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { toast } from "sonner";
import AnimatedHero from "@/shared/components/layout/animated-hero";
import { OnboardingHints } from "@/shared/components/layout/onboarding-hints";
import { HeroBadge } from "@/shared/components/layout/hero-badge";

interface HomeContentProps {
  children?: React.ReactNode;
}

export default function HomeContent({ children }: HomeContentProps) {
  const [copied, setCopied] = useState(false);
  const command = "Set-ExecutionPolicy Unrestricted";
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      toast.success("Command copied to clipboard");
      
      // Clear any existing timeout before setting a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout and store its ID
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy command");
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-5rem)] w-full flex-col items-center gap-8 px-4 py-8">
      {/* Hero Section */}
      <div className="grid w-full items-center gap-12 md:grid-cols-[1.3fr_1fr]">
        {/* Left: Hero Content */}
        <section className="space-y-6">
          <HeroBadge />
          
          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Optimize Windows{" "}
              <span className="text-primary">safely</span>
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Curated, reversible tweaks for Windows 7, 8, 10, and 11. 
              No risky scripts or shady tools—just transparent performance improvements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              asChild
              className="inline-flex items-center gap-2"
            >
              <Link href="/tweaks">
                <RocketLaunchIcon className="h-4 w-4" />
                Get Started
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
                      className="cursor-not-allowed opacity-60 pointer-events-none"
                    >
                      <SquaresPlusIcon className="h-3.5 w-3.5" />
                      Community Tweaks
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-sm">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold">Coming Soon</p>
                    <p className="text-xs">
                      Share and discover community-created tweaks. 
                      <strong className="block mt-2 text-yellow-600 dark:text-yellow-500">
                        ⚠️ Warning: Community tweaks are not verified.
                      </strong>
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <OnboardingHints />
        </section>

        {/* Right: Visual */}
        <section className="flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-[var(--radius-lg)] bg-primary/10 blur-3xl" />
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
        </section>
      </div>

      {/* PowerShell Execution Policy Info - Informational Dialog Style */}
      <section className="w-full">
        <div className="flex items-start gap-4 rounded-lg border border-border/60 bg-card/50 p-4 shadow-sm">
          <InformationCircleIcon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">PowerShell Execution Policy Required</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                To run PowerShell scripts, execute this command in PowerShell (as Administrator):
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-2 bg-background/80 border border-border/40 rounded-md text-sm font-mono text-foreground">
                {command}
              </code>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="shrink-0 h-9 px-3"
                    >
                      {copied ? (
                        <CheckIcon className="h-4 w-4 text-primary" />
                      ) : (
                        <ClipboardIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? "Copied!" : "Copy command"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground/80">
              Windows restricts script execution by default for security. This enables local scripts.{" "}
              <Link
                href="https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-7.5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Learn more
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Flat Design */}
      <section className="w-full">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-primary">
              <ShieldCheckIcon className="h-5 w-5" />
              <h3 className="text-base font-semibold">Safe & Reversible</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Every tweak includes clear explanations and undo instructions. 
              Stay in control of your system.
            </p>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-primary">
              <CodeBracketIcon className="h-5 w-5" />
              <h3 className="text-base font-semibold">Clean PowerShell</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Generate readable, version-controlled scripts. 
              Export, review, and reuse your performance profiles.
            </p>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-primary">
              <SquaresPlusIcon className="h-5 w-5" />
              <h3 className="text-base font-semibold">Organized by Category</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Optimize gaming, productivity, or general performance. 
              Find what you need without breaking core features.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section - Flat Design */}
      <section className="w-full">
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Performance optimization made simple
            </h2>
            
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                BetterPerformance helps you optimize Windows without reinstalling or using 
                untrustworthy tools. Our tweaks target services, visual effects, scheduled tasks, 
                and more—all with transparent explanations and easy reversibility.
              </p>
              <p>
                Because every tweak is stored as a PowerShell script, you can export exactly what
                you are going to run, version it in Git, and reuse the same performance profile on
                multiple machines. This makes BetterPerformance ideal for gamers, creators, and
                IT professionals who manage several Windows devices.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/40">
            <Link
              href="https://github.com/ELPROFETAMOHAMMED/betterperformance"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <CodeBracketIcon className="h-4 w-4" />
              View on GitHub
            </Link>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">100% Free</strong> and <strong className="text-foreground">Open Source</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Favorites Carousel */}
      {children}
    </main>
  );
}
