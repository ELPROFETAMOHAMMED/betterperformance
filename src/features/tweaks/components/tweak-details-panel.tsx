"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import { useTweakReports } from "@/features/tweaks/hooks/use-tweak-reports";
import { AnimatedCounter } from "@/features/tweaks/components/animated-counter";
import { cn } from "@/shared/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/shared/hooks/use-user";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";

// UI Components
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

// Icons
import {
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
  ClipboardIcon,
  InformationCircleIcon,
  ClockIcon,
  CommandLineIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { 
  CheckCircleIcon as CheckCircleIconSolid, 
  ExclamationCircleIcon as ExclamationCircleIconSolid,
  StarIcon as StarIconSolid 
} from "@heroicons/react/24/solid";

interface TweakDetailsPanelProps {
  selectedTweaks: Tweak[];
  activeTweakId: string | null;
  onTweakChange: (tweakId: string) => void;
  categories: TweakCategory[];
  onReport: () => void;
  onDownload: () => void;
  onCopy: () => void;
  onSaveFavorite: () => void;
  onSaveSingleFavorite: (tweak: Tweak) => void;
  isDownloading: boolean;
  isCopying: boolean;
  isSavingFavorite: boolean;
  onEditTweak?: (tweak: Tweak) => void;
}

export function TweakDetailsPanel({
  selectedTweaks,
  activeTweakId,
  onTweakChange,
  categories,
  onReport,
  onDownload,
  onCopy,
  onSaveFavorite,
  onSaveSingleFavorite,
  isDownloading,
  isCopying,
  isSavingFavorite,
  onEditTweak,
}: TweakDetailsPanelProps) {
  const { user } = useUser();
  const isAdmin = user?.user_metadata?.role === "admin";
  const [activeTab, setActiveTab] = useState("details");
  const { resolvedTheme } = useTheme();

  const activeTweak = useMemo(
    () => selectedTweaks.find((t) => t.id === activeTweakId) || selectedTweaks[0] || null,
    [selectedTweaks, activeTweakId]
  );

  const activeCategory = useMemo(
    () =>
      activeTweak
        ? categories.find((c) => c.id === activeTweak.category_id)
        : null,
    [activeTweak, categories]
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
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-6 xl:px-8 pt-8 pb-4">
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
            <div className="flex items-center gap-1">
              {isAdmin && onEditTweak && activeTweak && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => onEditTweak(activeTweak)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit tweak</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={onReport}
                    >
                      <FlagIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Report issue</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 xl:px-8">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border/20 rounded-none gap-8">
              <TabTrigger value="details" icon={<InformationCircleIcon className="h-4 w-4" />}>
                Details
              </TabTrigger>
              <TabTrigger value="reports" icon={<ExclamationTriangleIcon className="h-4 w-4" />}>
                Reports
              </TabTrigger>
              <TabTrigger value="comments" icon={<ChatBubbleLeftRightIcon className="h-4 w-4" />}>
                Comments
              </TabTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden bg-background/50">
            <TabsContent value="details" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="px-6 xl:px-8 py-6 max-w-4xl mx-auto space-y-10">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {activeTweak.description || "No description provided."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                      <CommandLineIcon className="h-4 w-4 text-muted-foreground" />
                      PowerShell Script
                    </h4>
                    <div className="rounded-md overflow-hidden bg-black/5 dark:bg-black/40 border border-border/20 text-xs">
                      {activeTweak.code ? (
                        <SyntaxHighlighter
                          language="powershell"
                          style={resolvedTheme === "dark" ? vscDarkPlus : vs}
                          customStyle={{
                            margin: 0,
                            padding: "1rem",
                            background: "transparent",
                            fontSize: "0.85rem",
                            lineHeight: "1.5",
                          }}
                          wrapLongLines={true}
                        >
                          {activeTweak.code}
                        </SyntaxHighlighter>
                      ) : (
                        <p className="text-muted-foreground italic p-4"># No code provided for this tweak.</p>
                      )}
                    </div>
                  </div>

                  {activeTweak.tweak_comment && (
                    <div className="space-y-2 mt-6">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
                        <DocumentTextIcon className="h-4 w-4 text-primary" />
                        Author Notes
                      </h4>
                      <div className="pl-3 border-l-2 border-primary/30 py-1">
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
              <ReportsList tweakId={activeTweak.id} />
            </TabsContent>

            <TabsContent value="comments" className="h-full m-0">
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">Comments coming soon</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Join the discussion and share your experience with this tweak in a future update.
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border/40 bg-transparent">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => onSaveSingleFavorite(activeTweak)}
                    disabled={isSavingFavorite}
                  >
                    <StarIconSolid className="h-4 w-4 text-yellow-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save this tweak to favorites</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={onSaveFavorite}
                    disabled={isSavingFavorite}
                  >
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save current selection to history</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={onCopy}
                    disabled={isCopying}
                  >
                    <ClipboardIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy script</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onDownload}
              disabled={isDownloading}
              className="min-w-[120px]"
            >
              {isDownloading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
        </div>
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

function ReportsList({ tweakId }: { tweakId: string }) {
  const { data: reports, isLoading } = useTweakReports(tweakId);

  if (isLoading) {
    return (
      <div className="p-5 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reports?.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <CheckCircleIcon className="h-10 w-10 mb-2 opacity-20" />
        <p className="text-sm">No reports found.</p>
        <p className="text-xs opacity-70">This tweak seems to be working well!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="flex gap-3 items-start p-3 rounded-lg bg-card border border-border/40">
            <div className={cn(
              "mt-0.5 rounded-full p-1.5",
              report.status === "resolved" ? "bg-emerald-500/10 text-emerald-500" :
              report.risk_level === "high" ? "bg-red-500/10 text-red-500" :
              report.risk_level === "medium" ? "bg-amber-500/10 text-amber-500" :
              "bg-blue-500/10 text-blue-500"
            )}>
              {report.status === "resolved" ? (
                <CheckCircleIconSolid className="h-4 w-4" />
              ) : (
                <ExclamationCircleIconSolid className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-foreground">{report.title}</h5>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {report.description}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="outline" className={cn(
                  "text-[10px] px-1.5 py-0 h-5 font-normal",
                  report.status === "resolved" ? "border-emerald-500/30 text-emerald-500" :
                  report.status === "pending" ? "border-amber-500/30 text-amber-500" :
                  "border-muted text-muted-foreground"
                )}>
                  {report.status}
                </Badge>
                {report.risk_level && (
                   <span className="text-[10px] text-muted-foreground px-1.5 border-l border-border/50">
                     Risk: <span className={cn(
                       report.risk_level === "high" ? "text-red-500" :
                       report.risk_level === "medium" ? "text-amber-500" :
                       "text-emerald-500"
                     )}>{report.risk_level}</span>
                   </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
