"use client";

import { Suspense, lazy, useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import { AnimatedCounter } from "@/features/tweaks/components/animated-counter";
import { TweakReportsPanel } from "@/features/tweaks/components/tweak-reports-panel";
import { useTheme } from "next-themes";
import type { TweakReport } from "@/features/tweaks/types/tweak-report.types";

// UI Components
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

// Icons
import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
  InformationCircleIcon,
  CommandLineIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";

type SyntaxHighlighterProps = {
  language: string;
  customStyle?: React.CSSProperties;
  wrapLongLines?: boolean;
  children: string;
  theme: "dark" | "light";
};

const SyntaxHighlighter = lazy(async () => {
  const [{ Prism }, prismStyles] = await Promise.all([
    import("react-syntax-highlighter"),
    import("react-syntax-highlighter/dist/esm/styles/prism"),
  ]);

  function LazySyntaxHighlighter({ theme, children, ...props }: SyntaxHighlighterProps) {
    return (
      <Prism {...props} style={theme === "dark" ? prismStyles.vscDarkPlus : prismStyles.vs}>
        {children}
      </Prism>
    );
  }

  return { default: LazySyntaxHighlighter };
});

interface TweakDetailsPanelProps {
  selectedTweaks: Tweak[];
  activeTweakId: string | null;
  categories: TweakCategory[];
  userReports?: TweakReport[];
  allReports?: TweakReport[];
}

export function TweakDetailsPanel({
  selectedTweaks,
  activeTweakId,
  isAdmin,
  userReports = [],
  allReports = [],
}: TweakDetailsPanelProps & { isAdmin?: boolean }) {
  const [activeTab, setActiveTab] = useState("details");
  const { resolvedTheme } = useTheme();

  const activeTweak = useMemo(
    () => selectedTweaks.find((t) => t.id === activeTweakId) || selectedTweaks[0] || null,
    [selectedTweaks, activeTweakId]
  );

  const displayDownloadCount = activeTweak?.download_count ?? 0;
  const displayFavoriteCount = activeTweak?.favorite_count ?? 0;

  if (!selectedTweaks.length) {
    return (
      <motion.div
        className="flex h-full flex-col items-center justify-center gap-5 border border-dashed border-border/40 bg-background/30 p-8 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="relative flex items-center justify-center rounded-2xl border border-border/50 bg-background/80 p-4"
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/assets/Aplication-logo.png"
              alt="BetterPerformance logo"
              width={80}
              height={80}
              className="rounded-[var(--radius-lg)] shadow-lg"
            />
          </motion.div>
        </div>
        <div className="space-y-2 max-w-sm mx-auto">
          <h3 className="font-medium text-foreground">No tweaks selected</h3>
          <p className="text-sm text-muted-foreground">
            Choose one or more tweaks from the explorer on the left to preview the PowerShell script,
            read the description, and manage reports.
          </p>
        </div>
      </motion.div>
    );
  }

  if (!activeTweak) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-transparent">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="px-6 xl:px-8 pt-8 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  {activeTweak.title}
                </h2>
                {!activeTweak.is_visible && !isAdmin && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground">
                    Disabled
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ArrowDownTrayIcon className="h-3 w-3" />
                  <AnimatedCounter value={displayDownloadCount} />
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BookmarkIcon className="h-3 w-3" />
                  <AnimatedCounter value={displayFavoriteCount} />
                </span>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-6 xl:px-8 shrink-0">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border/20 rounded-none gap-8">
              <TabTrigger value="details" icon={<InformationCircleIcon className="h-4 w-4" />}>
                Details
              </TabTrigger>
              <TabTrigger value="reports" icon={<FlagIcon className="h-4 w-4" />}>
                Reports
              </TabTrigger>
              <TabTrigger value="comments" icon={<ChatBubbleLeftRightIcon className="h-4 w-4" />}>
                Comments
              </TabTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden min-h-0 bg-background/50">
            <TabsContent value="details" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="px-6 xl:px-8 py-6 max-w-4xl mx-auto space-y-10 pb-16">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground uppercase tracking-wider">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {activeTweak.description || "No description provided."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/40 pb-2 uppercase tracking-wider">
                      <CommandLineIcon className="h-4 w-4 text-muted-foreground" />
                      PowerShell Script
                    </h4>
                    <div className="rounded-md overflow-hidden bg-black/5 dark:bg-black/40 border border-border/20 text-xs">
                      {activeTweak.code ? (
                        <Suspense fallback={<pre className="p-4 text-xs">{activeTweak.code}</pre>}>
                          <SyntaxHighlighter
                            language="powershell"
                            theme={resolvedTheme === "dark" ? "dark" : "light"}
                            customStyle={{
                              margin: 0,
                              padding: "1.5rem",
                              background: "transparent",
                              fontSize: "0.85rem",
                              lineHeight: "1.6",
                            }}
                            wrapLongLines={true}
                          >
                            {activeTweak.code}
                          </SyntaxHighlighter>
                        </Suspense>
                      ) : (
                        <p className="text-muted-foreground italic p-4"># No code provided for this tweak.</p>
                      )}
                    </div>
                  </div>

                  {activeTweak.tweak_comment && (
                    <div className="space-y-2 mt-6">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/40 pb-2 uppercase tracking-wider">
                        <DocumentTextIcon className="h-4 w-4 text-primary" />
                        Author Notes
                      </h4>
                      <div className="pl-4 border-l-2 border-primary/30 py-1">
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          {activeTweak.tweak_comment}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex items-center gap-6 border-t border-border/40 pt-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tweak ID</span>
                      <p className="text-[11px] font-mono text-muted-foreground break-all">{activeTweak.id}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Category ID</span>
                      <p className="text-[11px] font-mono text-muted-foreground break-all">{activeTweak.category_id}</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

              <TabsContent value="reports" className="h-full m-0">
                <TweakReportsPanel
                  activeTweakId={activeTweak.id}
                  userReports={userReports}
                  allReports={allReports}
                />
              </TabsContent>

            <TabsContent value="comments" className="h-full m-0">
              <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-background/5">
                <div className="rounded-full bg-muted/30 p-4 mb-3">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <h3 className="font-medium text-foreground">Comments coming soon</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Join the discussion and share your experience with this tweak in a future update.
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function TabTrigger({ value, icon, children }: { value: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground"
    >
      <div className="flex items-center gap-2">
        {icon}
        {children}
      </div>
    </TabsTrigger>
  );
}
